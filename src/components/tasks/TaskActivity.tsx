'use client'
import { useTaskEvents } from '@/lib/queries'

export default function TaskActivity({ taskId }: { taskId: string }) {
  const { data, isLoading, error } = useTaskEvents(taskId)
  if (isLoading) return <div className="text-sm text-slate-500">Loading activity…</div>
  if (error) return <div className="text-sm text-rose-700">{(error as Error).message}</div>

  const rows = data?.rows ?? []
  if (!rows.length) return <div className="text-sm text-slate-500">No activity yet</div>

  return (
    <ul className="space-y-2">
      {rows.map((e) => (
        <li key={e.id} className="border rounded-xl p-2">
          <div className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleString()}</div>
          <div className="text-sm mt-1">{renderEvent(e)}</div>
        </li>
      ))}
    </ul>
  )
}

function renderEvent(e: any) {
  switch (e.type) {
    case 'TASK_CREATED':
      return <>Task created ({e.data?.title})</>
    case 'STATUS_CHANGED':
      return (
        <>
          Status changed: <b>{e.data?.from}</b> → <b>{e.data?.to}</b>
        </>
      )
    case 'ASSIGNEE_CHANGED':
      return <>Assignee changed</>
    case 'COMMENT_ADDED':
      return <>Comment added</>
    case 'ATTACHMENT_ADDED':
      return <>Attachment added: {e.data?.filename}</>
    case 'ATTACHMENT_REMOVED':
      return <>Attachment removed: {e.data?.filename}</>
    default:
      return <>{e.type}</>
  }
}
