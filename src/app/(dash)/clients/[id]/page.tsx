'use client'
import ClientForm from '@/components/clients/ClientForm'
import { useClient, useDeleteClient } from '@/lib/queries'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, isLoading, error } = useClient(id)
  const del = useDeleteClient(id)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return
    try {
      await del.mutateAsync()
      toast.success('Client deleted')
      router.push('/clients')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className=" p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Client</h1>
        <button className="btn" onClick={handleDelete} disabled={del.isPending}>
          {del.isPending ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {isLoading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {(error as Error).message}
        </div>
      ) : data ? (
        <ClientForm
          initial={data}
          onSaved={() => {
            /* keep page, data will refetch via invalidation */
          }}
        />
      ) : null}
    </div>
  )
}
