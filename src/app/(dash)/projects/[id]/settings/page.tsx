'use client'
import ClientSelect from '@/components/projects/ClientSelect'
import { useDeleteProject, useProject, useUpdateProject } from '@/lib/queries'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProjectSettingsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, isLoading, error } = useProject(id)
  const update = useUpdateProject(id)
  const deleteProject = useDeleteProject(id)
  const router = useRouter()

  async function setClient(clientId: string | null) {
    try {
      await update.mutateAsync({ clientId })
      toast.success('Project updated')
    } catch (e: any) {
      toast.error(e?.message || 'Update failed')
    }
  }

  async function handleDeleteProject() {
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return
    try {
      await deleteProject.mutateAsync()
      toast.success('Project deleted')
      router.push('/projects')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete project')
    }
  }

  if (isLoading) return <div className="muted">Loading…</div>
  if (error)
    return (
      <div className="text-sm" style={{ color: '#b91c1c' }}>
        {(error as Error).message}
      </div>
    )
  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Project settings</h1>

      <div className="border rounded-xl p-3 bg-white space-y-3">
        <ClientSelect value={(data as any).clientId ?? null} onChange={setClient} />
      </div>
      <div className="border rounded-xl p-3 bg-white">
        <div className="text-sm font-medium text-rose-700">Danger zone</div>
        <p className="text-sm text-slate-600 mt-1">
          Deleting a project will remove all its tasks. This action cannot be undone.
        </p>
        <div className="mt-2">
          <button
            className="px-3 py-2 text-sm rounded-lg border bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={handleDeleteProject}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </div>
    </div>
  )
}
