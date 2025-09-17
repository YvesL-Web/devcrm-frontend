'use client'
import { useAuth } from '@/components/auth/AuthProvider'

export default function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button className="btn" onClick={() => logout()}>
      Logout
    </button>
  )
}
