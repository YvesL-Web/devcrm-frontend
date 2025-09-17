'use client'
import { useUpdateProject } from '@/lib/queries'
import { toast } from 'sonner'

export default function ProjectHeader({ project }: { project: any }) {
  const update = useUpdateProject(project.id)
  async function togglePortal() {
    await update.mutateAsync({ portalPublic: !project.portalPublic })
    toast.success(`Portal ${project.portalPublic ? 'hidden' : 'made public'}`)
  }
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 style={{ margin: 0 }}>{project.name}</h2>
        <div className="text-xs muted">
          Slug: <code>{project.portalSlug}</code> • Status: {project.status}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn" onClick={togglePortal}>
          {project.portalPublic ? 'Make Private' : 'Make Public'}
        </button>
      </div>
    </div>
  )
}
