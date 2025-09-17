import { API_URL } from './api'
import { clearAuth, getAuth, setAuth } from './auth'

let inFlight: Promise<void> | null = null

export function isRefreshing() {
  return !!inFlight
}

export async function refreshAccessToken(): Promise<void> {
  if (inFlight) return inFlight

  const { refreshToken } = getAuth()
  if (!refreshToken) {
    clearAuth()
    throw new Error('NO_REFRESH_TOKEN')
  }

  inFlight = (async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) {
      clearAuth()
      throw new Error('REFRESH_FAILED')
    }
    const data = await res.json()
    setAuth({
      accessToken: data.accessToken ?? data.access ?? null,
      refreshToken: data.refreshToken ?? data.refresh ?? null
    })
  })()

  try {
    await inFlight
  } finally {
    inFlight = null
  }
}
