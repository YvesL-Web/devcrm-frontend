'use client'
import { Input } from '@/components/customs/form'
import { useDeleteTask, useTasks, useUpdateTask } from '@/lib/queries'
import type { Task } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'

export default function TaskList({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<Task['status'] | ''>('')
  const [q, setQ] = useState('')
  const { data, isLoading, error, refetch } = useTasks({
    projectId,
    status: status || undefined,
    q: q || undefined,
    page: 1,
    pageSize: 50
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="border rounded-lg px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="">All</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
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

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Priority</th>
              <th className="text-left p-2">Due</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.rows.map((t) => (
              <Row key={t.id} task={t} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ task }: { task: Task }) {
  const update = useUpdateTask(task.id, task.projectId)
  const del = useDeleteTask(task.id, task.projectId)

  async function toggleStatus() {
    const next = task.status === 'DONE' ? 'OPEN' : 'DONE'
    await update.mutateAsync({ status: next })
    toast.success(`Marked ${next}`)
  }
  async function onDelete() {
    if (!confirm('Delete this task?')) return
    await del.mutateAsync()
    toast.success('Task deleted')
  }
  return (
    <tr className="border-t">
      <td className="p-2">{task.title}</td>
      <td className="p-2">{task.status}</td>
      <td className="p-2">{task.priority}</td>
      <td className="p-2">{task.dueDate || '—'}</td>
      <td className="p-2 text-right">
        <button className="btn" onClick={toggleStatus}>
          {task.status === 'DONE' ? 'Reopen' : 'Complete'}
        </button>{' '}
        <button className="btn" onClick={onDelete}>
          Delete
        </button>
      </td>
    </tr>
  )
}
