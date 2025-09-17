export type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  orgId: string | null
  userId?: string | null
}

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const ORG_KEY = 'org_id'
const USER_KEY = 'user_id'

export function getAuth(): AuthState {
  if (typeof window === 'undefined')
    return { accessToken: null, refreshToken: null, orgId: null, userId: null }
  return {
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
    orgId: localStorage.getItem(ORG_KEY),
    userId: localStorage.getItem(USER_KEY)
  }
}

export function setAuth(partial: Partial<AuthState>) {
  if (typeof window === 'undefined') return
  const current = getAuth()
  const next: AuthState = { ...current, ...partial }
  writeKey(ACCESS_KEY, next.accessToken)
  writeKey(REFRESH_KEY, next.refreshToken)
  writeKey(ORG_KEY, next.orgId)
  writeKey(USER_KEY, next.userId ?? null)
  notify()
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(ORG_KEY)
  localStorage.removeItem(USER_KEY)
  notify()
}

function writeKey(key: string, val: string | null) {
  if (val == null) localStorage.removeItem(key)
  else localStorage.setItem(key, val)
}

type Listener = (auth: AuthState) => void
const listeners = new Set<Listener>()

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify() {
  const s = getAuth()
  listeners.forEach((l) => l(s))
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if ([ACCESS_KEY, REFRESH_KEY, ORG_KEY, USER_KEY].includes(e.key || '')) notify()
  })
}
