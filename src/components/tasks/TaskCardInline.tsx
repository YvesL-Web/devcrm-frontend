'use client'
import { Input } from '@/components/customs/form'
import PlanGate from '@/components/plan/PlanGate'
import { getAuth } from '@/lib/auth'
import type { Plan } from '@/lib/planClient'
import { useDeleteTask, useMe, useOrgMembers, useUpdateTask } from '@/lib/queries'
import type { Task } from '@/lib/types'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import TaskActionMenu from './TaskActionMenu'
import TaskDetailsDrawer from './TaskDetailsDrawer'

export default function TaskCardInline({ task, dragging }: { task: Task; dragging?: boolean }) {
  const [editing, setEditing] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)

  const update = useUpdateTask(task.id, task.projectId)
  const del = useDeleteTask(task.id)

  // members for PRO features (assignee in inline if you want later)
  const { orgId } = getAuth()
  const me = useMe()
  const plan = me.data?.orgs?.find((o) => o.orgId === orgId)?.plan as Plan | undefined
  const { data: members } = useOrgMembers(orgId || undefined)
  const assignees = useMemo(
    () =>
      members?.rows?.map((m) => ({
        id: m.userId,
        label: m.name || m.email || m.userId.slice(0, 8)
      })) ?? [],
    [members]
  )

  async function savePartial(partial: Partial<Task>) {
    try {
      await update.mutateAsync(partial as any)
      toast.success('Task updated')
      setEditing(false)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update task')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      await del.mutateAsync()
      toast.success('Task deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete task')
    }
  }

  return (
    <div className={`group border rounded-lg p-2 bg-white ${dragging ? 'opacity-70' : ''}`}>
      {!editing ? (
        <>
          <div className="flex items-start justify-between">
            <button
              className="text-sm font-medium text-left hover:underline"
              onClick={() => setOpenDrawer(true)}
            >
              {task.title}
            </button>
            <TaskActionMenu
              onOpen={() => setOpenDrawer(true)}
              onEdit={() => setEditing(true)}
              onDelete={handleDelete}
              disabled={del.isPending}
            />
          </div>
          <div className="text-xs flex items-center gap-2 mt-1">
            <PriorityBadge priority={task.priority} />
            <span className="text-slate-500">•</span>
            <span className="text-slate-600">{task.dueDate || 'No due'}</span>
          </div>
          {task.labels?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {task.labels.map((l) => (
                <span key={l} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100">
                  {l}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <InlineEditor
          task={task}
          assignees={assignees}
          plan={plan}
          onCancel={() => setEditing(false)}
          onSave={(partial) => savePartial(partial)}
        />
      )}

      <TaskDetailsDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} task={task} />
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const map: Record<Task['priority'], string> = {
    LOW: 'bg-slate-100 text-slate-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    URGENT: 'bg-rose-100 text-rose-700'
  }
  return <span className={`px-2 py-0.5 rounded-full ${map[priority]} text-[11px]`}>{priority}</span>
}

function InlineEditor({
  task,
  assignees,
  plan,
  onCancel,
  onSave
}: {
  task: Task
  assignees: { id: string; label: string }[]
  plan?: Plan
  onCancel: () => void
  onSave: (partial: Partial<Task>) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<Task['priority']>(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [labels, setLabels] = useState<string[]>(task.labels || [])
  const [assigneeId, setAssigneeId] = useState<string | ''>(task.assigneeId || '')

  function addLabel(l: string) {
    const v = l.trim()
    if (!v) return
    setLabels((prev) => Array.from(new Set([...prev, v])).slice(0, 20))
  }
  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l))
  }

  return (
    <div className="space-y-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <select
          className="border rounded-lg h-9 px-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
          <option>URGENT</option>
        </select>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <PlanGate currentPlan={plan} min="PRO" fallback={<div />}>
        <div>
          <label className="label">Assignee</label>
          <select
            className="border rounded-lg h-9 px-2 text-sm"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </PlanGate>

      <div>
        <LabelInput
          labels={labels}
          onAdd={(s) => addLabel(s)}
          onRemove={(l) => removeLabel(l)}
          placeholder="Type label and press Enter"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn"
          onClick={() =>
            onSave({
              title: title.trim() || task.title,
              priority,
              dueDate: dueDate || null,
              labels: labels.length ? labels : null,
              assigneeId: assigneeId || null
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  )
}

function LabelInput({
  labels,
  onAdd,
  onRemove,
  placeholder
}: {
  labels: string[]
  onAdd: (v: string) => void
  onRemove: (v: string) => void
  placeholder?: string
}) {
  const [v, setV] = useState('')
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {labels.map((l) => (
          <span
            key={l}
            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 flex items-center gap-1"
          >
            {l}
            <button className="text-[11px]" onClick={() => onRemove(l)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            onAdd(v)
            setV('')
          }
        }}
      />
    </div>
  )
}
