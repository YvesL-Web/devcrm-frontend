'use client'

import ProjectClientBadge from '@/components/projects/ProjectClientBadge'
import ReleaseList from '@/components/releases/ReleaseList'
import BoardToolbar, { type BoardFilters, type Swimlane } from '@/components/tasks/BoardToolbar'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import { Skeleton } from '@/components/ui/skeleton'
import { useProject } from '@/lib/queries'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, isLoading, error } = useProject(id)

  const [tab, setTab] = useState<'board' | 'releases'>('board')
  const [filters, setFilters] = useState<BoardFilters>({
    q: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  })
  const [swimlane, setSwimlane] = useState<Swimlane>('none')

  if (isLoading) return <ProjectPageSkeleton />
  if (error)
    return (
      <div className="text-sm" style={{ color: '#b91c1c' }}>
        {(error as Error).message}
      </div>
    )
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{data.name}</h1>
            <div className="text-xs text-slate-500">Slug: {data.portalSlug}</div>
          </div>
          <div className="flex items-center gap-2">
            <ProjectClientBadge clientId={(data as any).clientId ?? null} projectId={data.id} />
            <a className="btn" href={`/projects/${data.id}/settings`}>
              Settings
            </a>
            <button
              className="btn"
              onClick={() =>
                navigator.clipboard.writeText(`${location.origin}/p/${data.portalSlug}`)
              }
            >
              Copy public link
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === 'board' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
            }`}
            onClick={() => setTab('board')}
          >
            Board
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === 'releases' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
            }`}
            onClick={() => setTab('releases')}
          >
            Releases
          </button>
        </div>
      </div>

      {/* Content area: FULL WIDTH */}
      {tab === 'board' ? (
        <section className="bg-white border rounded-xl p-3">
          <BoardToolbar
            projectId={data.id}
            value={filters}
            onChange={setFilters}
            swimlane={swimlane}
            onSwimlaneChange={setSwimlane}
          />
          <div className="mt-3">
            <KanbanBoard projectId={data.id} filters={filters} swimlane={swimlane} />
          </div>
        </section>
      ) : (
        <section className="bg-white border rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Releases</h2>
            <a
              className="text-sm text-sky-700 hover:underline"
              href={`/projects/${data.id}/releases`}
            >
              Manage
            </a>
          </div>
          <ReleaseList projectId={data.id} />
        </section>
      )}
    </div>
  )
}

function ProjectPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3 w-40 mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="bg-white border rounded-xl p-3">
        <Skeleton className="h-9 w-full mb-3" />
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-xl p-2">
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
