/* eslint-disable @typescript-eslint/no-explicit-any */
export type JwtPayload = { exp?: number; iat?: number; [k: string]: any }

function b64urlToJson(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const json = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '='))
  return JSON.parse(json)
}

export function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return b64urlToJson(parts[1]) as T
  } catch {
    return null
  }
}

export function getExp(token: string): number | null {
  const payload = decodeJwt(token)
  return payload?.exp ?? null
}

export function msUntilExpiry(token: string, bufferMs = 60_000): number | null {
  const exp = getExp(token)
  if (!exp) return null
  const ms = exp * 1000 - Date.now() - bufferMs
  return ms
}
