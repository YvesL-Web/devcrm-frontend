export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // côté portal, on veut SSR + revalidation modérée (SEO + perf)
    // si tu préfères no-store, remplace par: cache: 'no-store'
    next: { revalidate: 60 },
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {})
    }
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data?.message) msg = data.message
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}
