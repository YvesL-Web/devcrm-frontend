'use client'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { useAuth } from './auth/AuthProvider'

export default function Nav() {
  const { ready, isLoggedIn, auth, me } = useAuth()

  return (
    <nav style={{ borderBottom: '1px solid #e2e8f0' }}>
      <div
        className="container"
        style={{
          padding: '.75rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="font-semibold">
            DevCRM
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">
            Dashboard
          </Link>
          <Link href="/settings" className="text-sm text-slate-600 hover:underline">
            Dev Settings
          </Link>
          <Link href="/projects" className="text-sm text-slate-600 hover:underline">
            Projects
          </Link>
          {!isLoggedIn && (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-sm text-slate-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
        <div
          className="text-xs muted"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {!ready ? null : isLoggedIn ? (
            <>
              <span>{me?.user?.id ? `User: ${me.user.id.slice(0, 8)}…` : 'Signed in'}</span>
              {auth.orgId ? (
                <span>
                  • Org: <code>{auth.orgId}</code>
                </span>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </div>
    </nav>
  )
}
