import { API_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'

export async function apiFetchBlob(path: string, init?: RequestInit) {
  const { accessToken, orgId } = getAuth()
  const res = await fetch(`${API_URL}${path}`, {
    method: init?.method || 'GET',
    headers: {
      ...(init?.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(orgId ? { 'X-Org-Id': orgId } : {}),
      Accept: 'application/pdf'
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PDF download failed: ${res.status} ${text}`)
  }
  return await res.blob()
}
