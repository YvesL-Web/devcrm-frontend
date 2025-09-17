'use client'

import { apiFetch } from '@/lib/api'
import {
  getAuth as readStorage,
  subscribeAuth,
  clearAuth as wipeStorage,
  setAuth as writeStorage,
  type AuthState
} from '@/lib/auth'
import { msUntilExpiry } from '@/lib/jwt'
import { refreshAccessToken } from '@/lib/refresh'
import { useMutation } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type MeResponse = {
  user: { id: string }
  orgs: Array<{
    orgId: string
    orgName: string
    role: 'OWNER' | 'MEMBER' | 'CLIENT_VIEWER'
    plan: 'FREE' | 'PRO' | 'TEAM'
    planStatus: string | null
  }>
}

type Ctx = {
  ready: boolean
  auth: AuthState
  isLoggedIn: boolean
  setAuth: (partial: Partial<AuthState>) => void
  logout: () => Promise<void>
  me?: MeResponse | null
}

const AuthCtx = createContext<Ctx | undefined>(undefined)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1er render = identique au SSR (déconnecté) => pas de mismatch
  const [auth, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    orgId: null,
    userId: null
  })
  const [ready, setReady] = useState(false)
  const isLoggedIn = !!auth.accessToken

  const refreshTimer = useRef<number | null>(null)

  function clearRefreshTimer() {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
      refreshTimer.current = null
    }
  }

  function scheduleRefresh(token: string) {
    const DEFAULT_MS = 45 * 60 * 1000 // 45 minutes
    const MIN_MS = 5_000 // 5 seconds
    // Refresh 1 minute before expiry
    const ms = msUntilExpiry(token, 60_000)
    const delay = ms == null ? DEFAULT_MS : Math.min(DEFAULT_MS, Math.max(MIN_MS, ms))
    clearRefreshTimer()
    refreshTimer.current = window.setTimeout(async () => {
      try {
        await refreshAccessToken()
      } catch {
        /* user might be logged out */
      }
    }, delay)
  }

  // Charger depuis localStorage APRÈS le mount
  useEffect(() => {
    setAuthState(readStorage()) // hydrate depuis storage
    setReady(true)
    return subscribeAuth(setAuthState) // sync inter-onglets
  }, [])

  useEffect(() => {
    if (!ready) return
    clearRefreshTimer()
    if (auth.accessToken) scheduleRefresh(auth.accessToken)
    return clearRefreshTimer
  }, [ready, auth.accessToken])

  // /auth/me une fois ready + loggé
  const [me, setMe] = useState<MeResponse | null>(null)
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!ready || !isLoggedIn) {
        setMe(null)
        return
      }
      try {
        const data = await apiFetch<MeResponse>('/auth/me')
        if (!cancelled) setMe(data)
        if (!readStorage().orgId && data.orgs[0]?.orgId) {
          writeStorage({ orgId: data.orgs[0].orgId })
          toast('Organization selected', { description: data.orgs[0].orgName })
        }
      } catch {
        if (!cancelled) setMe(null)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [ready, isLoggedIn])

  const revoke = useMutation({
    mutationFn: async () => {
      const rt = readStorage().refreshToken
      if (rt) await apiFetch('/auth/logout', { method: 'POST', json: { refreshToken: rt } })
    }
  })

  const ctx = useMemo<Ctx>(
    () => ({
      ready,
      auth,
      isLoggedIn,
      setAuth: (p) => writeStorage(p),
      logout: async () => {
        await revoke.mutateAsync()
        wipeStorage()
        toast('Signed out')
        location.href = '/login'
      },
      me
    }),
    [ready, auth, isLoggedIn, revoke, me]
  )

  return <AuthCtx.Provider value={ctx}>{children}</AuthCtx.Provider>

  // Keep in sync with storage changes (other tabs, login page, etc.)
  // useEffect(() => subscribeAuth(setAuthState), [])

  // useEffect(() => {
  //   const unsubscribe = subscribeAuth(setAuthState)
  //   return () => {
  //     if (typeof unsubscribe === 'function') {
  //       unsubscribe()
  //     }
  //   }
  // }, [])
}

export function useAuth() {
  const v = useContext(AuthCtx)
  if (!v) throw new Error('useAuth must be used within <AuthProvider>')
  return v
}
