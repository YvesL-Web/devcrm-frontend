/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuth } from './auth'
import { refreshAccessToken } from './refresh'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  json?: any
  token?: string | null
  orgId?: string | null
  next?: RequestInit['next']
}

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const makeReq = async () => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (opts.json) headers['Content-Type'] = 'application/json'

    const auth = getAuth()
    const token = opts.token ?? auth.accessToken
    const orgId = opts.orgId ?? auth.orgId
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (orgId) headers['X-Org-Id'] = orgId

    return fetch(`${API_URL}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.json ? JSON.stringify(opts.json) : undefined,
      cache: 'no-store',
      next: opts.next
    })
  }

  let res = await makeReq()

  // Retry 1x après refresh si 401 et si ce n'est pas la route refresh elle-même
  if (res.status === 401 && !path.startsWith('/auth/refresh') && getAuth().refreshToken) {
    try {
      await refreshAccessToken()
      res = await makeReq()
    } catch {
      // refresh a échoué → on tombera dans le handler d’erreur ci-dessous
    }
  }

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`
    try {
      const detail = await res.json()
      msg = detail?.error?.message || msg
    } catch {}
    throw new Error(msg)
  }

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  return (await res.text()) as unknown as T
}
