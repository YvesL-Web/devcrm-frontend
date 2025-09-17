'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (!isLoggedIn) router.replace('/login')
  }, [ready, isLoggedIn, router])

  if (!ready) return null // attendre l’hydratation client
  if (!isLoggedIn) return null // redirection en cours
  return <>{children}</>
}
