'use client'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/lib/queries'
import Link from 'next/link'

export default function HomeDashboard() {
  const { data, isLoading, error } = useProjects({ page: 1, pageSize: 6 })

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4">
        <h1 className="text-xl font-semibold">Welcome back 👋</h1>
        <p className="text-sm text-slate-500">Pick up where you left off.</p>
      </div>

      <section className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent projects</h2>
          <Link className="text-sm text-sky-700 hover:underline" href="/projects">
            View all
          </Link>
        </div>
        <div
          className="grid mt-3"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : error ? (
            <div className="text-sm" style={{ color: '#b91c1c' }}>
              {(error as Error).message}
            </div>
          ) : !data?.rows.length ? (
            <div className="text-sm text-slate-500">
              No projects yet. Create your first project.
            </div>
          ) : (
            data.rows.map((p) => (
              <div key={p.id} className="border rounded-xl p-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-slate-500">Slug: {p.portalSlug}</div>
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
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
