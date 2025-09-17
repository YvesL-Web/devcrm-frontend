'use client'
import { apiFetch } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import { useQuery } from '@tanstack/react-query'

type BillingStatus = {
  plan: 'FREE' | 'PRO' | 'TEAM'
  planStatus: string | null
  planRenewsAt: string | null
  limits: { projects: { max: number; used: number; remaining: number } }
  features: Record<string, boolean>
}

export default function BillingBanner() {
  const { accessToken, orgId } = getAuth()

  const enabled = Boolean(accessToken && orgId)

  const { data, error, isLoading } = useQuery({
    queryKey: ['billing/status', orgId],
    queryFn: () => apiFetch<BillingStatus>('/billing/status', { token: accessToken, orgId }),
    enabled,
    staleTime: 60_000 // un peu plus long pour limiter les hits
  })

  if (!enabled) {
    return <div className="mt-3 text-sm muted">Set token + org in Settings</div>
  }
  if (isLoading) return <div className="mt-3 text-sm muted">Loading billing status…</div>
  if (error) {
    return (
      <div
        className="mt-3 text-sm"
        style={{
          color: '#92400e',
          background: '#fff7ed',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '8px 12px'
        }}
      >
        Billing error: {(error as Error).message}
      </div>
    )
  }

  const d = data!
  return (
    <div
      className="mt-3"
      style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: 12 }}
    >
      <div className="text-sm">
        Plan: <b>{d.plan}</b>{' '}
        {d.planStatus ? <span className="muted">({d.planStatus})</span> : null}
      </div>
      <div className="text-xs muted">
        Projects: {d.limits.projects.used}/{d.limits.projects.max} (remaining{' '}
        {d.limits.projects.remaining})
      </div>
    </div>
  )
}
