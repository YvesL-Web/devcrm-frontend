'use client'
import { Input, Textarea } from '@/components/customs/form'
import PlanGate from '@/components/plan/PlanGate'
import { getAuth } from '@/lib/auth'
import type { Plan } from '@/lib/planClient'
import { useMe, useOrgMembers, useUpdateTask } from '@/lib/queries'
import type { Task } from '@/lib/types'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function TaskDetailsDrawer({
  open,
  onClose,
  task
}: {
  open: boolean
  onClose: () => void
  task: Task
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState<Task['status']>(task.status)
  const [priority, setPriority] = useState<Task['priority']>(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [labels, setLabels] = useState<string[]>(task.labels || [])
  const [assigneeId, setAssigneeId] = useState<string | ''>(task.assigneeId || '')

  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate || '')
      setLabels(task.labels || [])
      setAssigneeId(task.assigneeId || '')
    }
  }, [open, task])

  const update = useUpdateTask(task.id, task.projectId)

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

  async function save() {
    try {
      await update.mutateAsync({
        title: title.trim() || task.title,
        description: description.trim() ? description : null,
        status,
        priority,
        dueDate: dueDate.trim() ? dueDate : null,
        labels: labels.length ? labels : null,
        assigneeId: assigneeId || null
      })
      toast.success('Task updated')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update')
    }
  }

  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l))
  }
  function addLabels(s: string) {
    const parts = s
      .split(/[,\n]/g)
      .map((x) => x.trim())
      .filter(Boolean)
    if (!parts.length) return
    setLabels(Array.from(new Set([...(labels || []), ...parts])).slice(0, 20))
  }

  return (
    <div className={`fixed inset-0 z-[110] ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white border-l shadow-xl
                        transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-12 border-b flex items-center justify-between px-3">
          <div className="font-medium">Task details</div>
          <button className="p-1 rounded hover:bg-slate-100" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="label">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="label">Description</label>
            <Textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Status</label>
              <select
                className="border rounded-lg h-9 px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
              >
                <option>OPEN</option>
                <option>IN_PROGRESS</option>
                <option>DONE</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
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
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Due date</label>
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
          </div>

          <div>
            <label className="label">Labels</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {labels.map((l) => (
                <span
                  key={l}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 flex items-center gap-1"
                >
                  {l}
                  <button className="text-[11px]" onClick={() => removeLabel(l)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type labels, comma to add…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addLabels((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" onClick={save} disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
