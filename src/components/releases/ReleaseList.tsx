'use client'
import { Input } from '@/components/customs/form'
import { useAddChangeItem, useDeleteChangeItem, useDeleteRelease, useReleases } from '@/lib/queries'
import { useState } from 'react'
import { toast } from 'sonner'

function AddItemRow({ releaseId, projectId }: { releaseId: string; projectId: string }) {
  const add = useAddChangeItem(releaseId, projectId)
  const [type, setType] = useState<'FEATURE' | 'FIX' | 'CHORE'>('FEATURE')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  async function onAdd() {
    if (!title.trim()) return
    await add.mutateAsync({ type, title: title.trim(), url: url || undefined })
    setTitle('')
    setUrl('')
    toast.success('Item added')
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded-lg px-2 py-2 text-sm"
        value={type}
        onChange={(e) => setType(e.target.value as any)}
      >
        <option value="FEATURE">Feature</option>
        <option value="FIX">Fix</option>
        <option value="CHORE">Chore</option>
      </select>
      <Input
        placeholder="Add change title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className="btn" onClick={onAdd} disabled={add.isPending}>
        {add.isPending ? 'Adding…' : 'Add'}
      </button>
    </div>
  )
}

function ChangeItemRow({ item, projectId }: { item: any; projectId: string }) {
  const delItem = useDeleteChangeItem(item.id, projectId)
  return (
    <li className="flex items-center justify-between border rounded-lg px-2 py-1">
      <div className="text-sm">
        <span className="text-xs mr-2 px-1.5 py-0.5 rounded" style={{ background: '#eef2ff' }}>
          {item.type}
        </span>
        {item.title}
        {item.url ? (
          <>
            {' '}
            —{' '}
            <a
              className="text-sky-700 hover:underline"
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              link
            </a>
          </>
        ) : null}
      </div>
      <button
        className="btn"
        onClick={async () => {
          await delItem.mutateAsync()
          toast.success('Item deleted')
        }}
      >
        Delete
      </button>
    </li>
  )
}

function ReleaseCard({ release, projectId }: { release: any; projectId: string }) {
  const delRelease = useDeleteRelease(release.id, projectId)

  return (
    <div className="border rounded-xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">
            {release.title}{' '}
            {release.version ? (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9' }}>
                {release.version}
              </span>
            ) : null}
          </div>
          <div className="text-xs muted">{new Date(release.createdAt).toLocaleString()}</div>
        </div>
        <button
          className="btn"
          onClick={async () => {
            if (confirm('Delete release?')) {
              await delRelease.mutateAsync()
              toast.success('Release deleted')
            }
          }}
        >
          Delete
        </button>
      </div>

      {release.bodyMd ? (
        <pre className="text-sm mt-2" style={{ whiteSpace: 'pre-wrap' }}>
          {release.bodyMd}
        </pre>
      ) : null}

      <div className="mt-3">
        <div className="font-medium mb-1">Changes</div>
        <ul className="space-y-1">
          {release.items?.map((it: any) => (
            <ChangeItemRow key={it.id} item={it} projectId={projectId} />
          ))}
        </ul>
        <div className="mt-2">
          <AddItemRow releaseId={release.id} projectId={projectId} />
        </div>
      </div>
    </div>
  )
}

export default function ReleaseList({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useReleases(projectId)
  if (isLoading) return <div className="muted">Loading releases…</div>
  if (error)
    return (
      <div className="text-sm" style={{ color: '#b91c1c' }}>
        {(error as Error).message}
      </div>
    )
  if (!data?.rows.length) return <div className="muted">No releases yet.</div>

  return (
    <div className="space-y-4">
      {data.rows.map((r) => (
        <ReleaseCard key={r.id} release={r} projectId={projectId} />
      ))}
    </div>
  )
}
