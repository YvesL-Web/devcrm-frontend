'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from './AuthProvider'

export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { ready, isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    if (isLoggedIn) router.replace('/dashboard')
  }, [ready, isLoggedIn, router])

  if (!ready) return null
  return <>{children}</>
}
