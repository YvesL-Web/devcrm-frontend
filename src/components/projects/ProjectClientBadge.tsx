'use client'
import { Input } from '@/components/customs/form'
import { useAssignProjectClient, useClient, useClients } from '@/lib/queries'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ProjectClientBadge({
  clientId,
  projectId
}: {
  clientId?: string | null
  projectId: string
}) {
  const { data: client } = useClient(clientId || undefined)
  const [open, setOpen] = useState(false)

  const label = client ? client.name : 'No client'
  const title = client
    ? [client.name, client.company, client.email].filter(Boolean).join(' • ')
    : 'Assign client'

  return (
    <>
      <button
        className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50"
        onClick={() => setOpen(true)}
        title={title}
      >
        {label}
      </button>
      <ClientPickerModal
        open={open}
        onClose={() => setOpen(false)}
        projectId={projectId}
        currentClientId={clientId || null}
      />
    </>
  )
}

function ClientPickerModal({
  open,
  onClose,
  projectId,
  currentClientId
}: {
  open: boolean
  onClose: () => void
  projectId: string
  currentClientId: string | null
}) {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const { data, isLoading, error } = useClients({ q: debouncedQ, page, pageSize })
  const assign = useAssignProjectClient(projectId)

  if (!open) return null

  async function selectClient(id: string | null) {
    try {
      await assign.mutateAsync(id)
      toast.success(id ? 'Client assigned' : 'Client cleared')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to assign client')
    }
  }

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[92%] sm:w-[560px] bg-white border rounded-xl shadow-xl p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Assign client</div>
          <button
            className="text-xs underline"
            onClick={() => selectClient(null)}
            disabled={assign.isPending || currentClientId === null}
          >
            Clear
          </button>
        </div>
        <div className="mt-2">
          <Input placeholder="Search clients…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="mt-2 border rounded">
          <div className="max-h-72 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-slate-500">Loading…</div>
            ) : error ? (
              <div className="p-3 text-sm text-rose-700">{(error as Error).message}</div>
            ) : (data?.rows ?? []).length === 0 ? (
              <div className="p-3 text-sm text-slate-500">
                No clients. Create one from Clients page.
              </div>
            ) : (
              <ul>
                {data!.rows.map((c) => (
                  <li key={c.id} className="border-t first:border-t-0">
                    <button
                      className={`w-full px-3 py-2 text-left hover:bg-slate-50 ${
                        currentClientId === c.id ? 'bg-slate-50' : ''
                      }`}
                      onClick={() => selectClient(c.id)}
                      disabled={assign.isPending}
                    >
                      <div className="text-sm">{c.name}</div>
                      <div className="text-xs text-slate-500">
                        {[c.company, c.email].filter(Boolean).join(' • ') || '—'}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* pagination simple */}
          <div className="px-2 py-1 flex items-center justify-between border-t text-xs text-slate-600">
            <span>{data?.total ?? 0} total</span>
            <div className="flex items-center gap-1">
              <button
                className="btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={(data?.page ?? 1) <= 1}
              >
                Prev
              </button>
              <button
                className="btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={(data?.page ?? 1) * (data?.pageSize ?? pageSize) >= (data?.total ?? 0)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
