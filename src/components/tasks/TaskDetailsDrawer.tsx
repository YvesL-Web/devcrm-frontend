'use client'
import { useEffect, useState } from 'react'
import TaskActivity from './TaskActivity'
import TaskAttachments from './TaskAttachments'
import TaskComments from './TaskComments'

type TabKey = 'comments' | 'attachments' | 'activity'

export default function TaskDetailsDrawer({
  open,
  onClose,
  task
}: {
  open: boolean
  onClose: () => void
  task: { id: string; title: string; status: string; priority?: string; dueDate?: string | null }
}) {
  const [tab, setTab] = useState<TabKey>('comments')

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) setTab('comments')
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[800px] bg-white border-l shadow-xl p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">{task.title}</div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="text-sm text-slate-600 mt-1">
          Status: {task.status} {task.priority ? `• ${task.priority}` : ''}{' '}
          {task.dueDate ? `• Due ${task.dueDate}` : ''}
        </div>

        <div className="mt-4 border-b flex items-center gap-2">
          <TabButton active={tab === 'comments'} onClick={() => setTab('comments')}>
            Comments
          </TabButton>
          <TabButton active={tab === 'attachments'} onClick={() => setTab('attachments')}>
            Attachments
          </TabButton>
          <TabButton active={tab === 'activity'} onClick={() => setTab('activity')}>
            Activity
          </TabButton>
        </div>

        <div className="mt-4">
          {tab === 'comments' && <TaskComments taskId={task.id} />}
          {tab === 'attachments' && <TaskAttachments taskId={task.id} />}
          {tab === 'activity' && <TaskActivity taskId={task.id} />}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className={`px-3 py-2 text-sm border-b-2 -mb-px ${
        active
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-600 hover:text-slate-900'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
