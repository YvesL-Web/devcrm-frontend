'use client'
import { Section } from '@/components/customs/card'
import { Input } from '@/components/customs/form'
import { useDeleteProject, useProjects, useUpdateProject } from '@/lib/queries'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProjectList() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED' | ''>('')
  const { data, isLoading, error, refetch } = useProjects({
    q: q || undefined,
    status: status || undefined,
    page: 1,
    pageSize: 20
  })

  return (
    <Section title="Projects">
      <div className="flex items-center gap-2 mb-3">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="border rounded-lg px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className="btn" onClick={() => refetch()}>
          Filter
        </button>
      </div>

      {isLoading && <div className="muted">Loading…</div>}
      {error && (
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {(error as Error).message}
        </div>
      )}

      <ul className="space-y-2">
        {data?.rows.map((p) => (
          <ProjectListItem key={p.id} project={p} />
        ))}
      </ul>
    </Section>
  )
}

function ProjectListItem({ project }: { project: any }) {
  const update = useUpdateProject(project.id)
  const del = useDeleteProject(project.id)

  async function toggleArchive() {
    await update.mutateAsync({ status: project.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' })
    toast.success(project.status === 'ACTIVE' ? 'Archived' : 'Unarchived')
  }

  async function onDelete() {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await del.mutateAsync()
    toast.success('Project deleted')
  }

  return (
    <li className="flex items-center justify-between border rounded-xl p-3">
      <div>
        <div className="font-medium">
          <Link className="hover:underline" href={`/projects/${project.id}`}>
            {project.name}
          </Link>
          {project.status === 'ARCHIVED' ? (
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#f1f5f9' }}
            >
              archived
            </span>
          ) : null}
        </div>
        <div className="text-xs muted">
          Slug: <code>{project.portalSlug}</code> • Portal:{' '}
          {project.portalPublic ? 'Public' : 'Private'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn" onClick={toggleArchive}>
          {project.status === 'ACTIVE' ? 'Archive' : 'Unarchive'}
        </button>
        <button className="btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  )
}
