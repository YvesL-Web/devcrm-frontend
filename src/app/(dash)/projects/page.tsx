'use client'
import PlanBadge from '@/components/plan/PlanBadge'
import ProjectQuickCreate from '@/components/projects/ProjectQuickCreate'
import { getAuth } from '@/lib/auth'
import { useMe, useProjects } from '@/lib/queries'

export default function ProjectsIndexPage() {
  const { data, isLoading, error } = useProjects({ page: 1, pageSize: 50 })
  const { orgId } = getAuth()
  const me = useMe()
  const plan = me.data?.orgs?.find((o) => o.orgId === orgId)?.plan

  return (
    <div className=" p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <PlanBadge plan={plan as any} />
      </div>

      <ProjectQuickCreate />

      {isLoading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {(error as Error).message}
        </div>
      ) : !data?.rows.length ? (
        <div className="muted">No projects yet.</div>
      ) : (
        <ul
          className="grid"
          style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '1rem' }}
        >
          {data.rows.map((p) => (
            <li key={p.id} className="border rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                <span className="text-xs text-slate-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Slug: {p.portalSlug}</div>
              <div className="flex items-center gap-2 mt-2">
                <a className="btn" href={`/projects/${p.id}`}>
                  Open
                </a>
                <button
                  className="btn"
                  onClick={() =>
                    navigator.clipboard.writeText(`${location.origin}/p/${p.portalSlug}`)
                  }
                >
                  Copy public link
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
