'use client'
import { Input, Textarea } from '@/components/customs/form'
import PlanGate from '@/components/plan/PlanGate'
import { getAuth } from '@/lib/auth'
import type { Plan } from '@/lib/planClient'
import { useCreateTask, useMe, useOrgMembers } from '@/lib/queries'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const DURATION = 180 // ms

export default function NewTaskModal({
  open,
  onClose,
  projectId,
  defaultStatus = 'OPEN'
}: {
  open: boolean
  onClose: () => void
  projectId: string
  defaultStatus?: 'OPEN' | 'IN_PROGRESS' | 'DONE'
}) {
  const create = useCreateTask()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(defaultStatus)
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [assigneeId, setAssigneeId] = useState<string>('')

  // --- mount control for exit animation ---
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  // Reset fields on open
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setStatus(defaultStatus)
      setPriority('MEDIUM')
      setDueDate('')
      setLabels([])
      setAssigneeId('')
    }
  }, [open, defaultStatus])

  // Esc-to-close + lock body scroll while mounted
  useEffect(() => {
    if (!mounted) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [mounted, onClose])

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
    if (!title.trim()) return
    try {
      await create.mutateAsync({
        projectId,
        title: title.trim(),
        description: description.trim() ? description : null,
        status,
        priority,
        dueDate: dueDate.trim() ? dueDate : null,
        labels: labels.length ? labels : null,
        assigneeId: assigneeId || null
      })
      toast.success('Task created')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create task')
    }
  }

  function addLabels(s: string) {
    const parts = s
      .split(/[,\n]/g)
      .map((x) => x.trim())
      .filter(Boolean)
    if (!parts.length) return
    setLabels(Array.from(new Set([...(labels || []), ...parts])).slice(0, 20))
  }
  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l))
  }

  // Unmount after exit animation completes
  function handleModalTransitionEnd(e: React.TransitionEvent) {
    if (e.target !== e.currentTarget) return
    if (!open) {
      // wait a tiny bit to be safe (should already be done by duration)
      setTimeout(() => setMounted(false), 0)
    }
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-${DURATION} ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* modal */}
      <div
        className={`
          absolute left-1/2 top-12 -translate-x-1/2
          w-[92%] sm:w-[640px] bg-white border rounded-xl shadow-xl
          transition-[opacity,transform] duration-${DURATION}
          ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'}
          p-4
        `}
        onTransitionEnd={handleModalTransitionEnd}
      >
        <div className="text-base font-medium">New task</div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="label">Title</label>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
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
                onChange={(e) => setStatus(e.target.value as any)}
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
                onChange={(e) => setPriority(e.target.value as any)}
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
            <button className="btn" onClick={save} disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
