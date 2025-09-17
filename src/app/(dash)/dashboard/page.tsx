'use client'
import RequireAuth from '@/components/auth/RequireAuth'
import BillingBanner from '@/components/BillingBanner'
import { Section } from '@/components/customs/card'
import { apiFetch } from '@/lib/api'
import { setAuth } from '@/lib/auth'
import { useQuery } from '@tanstack/react-query'

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

export default function DashboardPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['auth/me'],
    queryFn: () => apiFetch<MeResponse>('/auth/me')
  })

  return (
    <RequireAuth>
      <div className="space-y-6">
        <h1>Dashboard</h1>
        <BillingBanner />
        <Section title="Organizations">
          {isLoading && <div className="muted">Loading…</div>}
          {error && (
            <div
              className="text-sm"
              style={{
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '8px 12px'
              }}
            >
              {(error as Error).message}
            </div>
          )}
          {data ? (
            <ul className="space-y-2">
              {data.orgs.map((o) => (
                <li
                  key={o.orgId}
                  className="flex items-center justify-between"
                  style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px' }}
                >
                  <div>
                    <div className="font-medium">{o.orgName}</div>
                    <div className="text-xs muted">
                      Role: {o.role} • Plan: {o.plan}
                      {o.planStatus ? ` (${o.planStatus})` : ''}
                    </div>
                  </div>
                  <button
                    className="btn"
                    onClick={() => {
                      setAuth({ orgId: o.orgId })
                      location.reload()
                    }}
                  >
                    Use this org
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      </div>
    </RequireAuth>
  )
}
