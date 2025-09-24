'use client'

import { Input } from '@/components/customs/form'
import PlanGate from '@/components/plan/PlanGate'
import { getAuth } from '@/lib/auth'
import type { Plan } from '@/lib/planClient'
import { useMe, useOrgMembers } from '@/lib/queries'
import { useEffect, useMemo, useState } from 'react'
import NewTaskModal from './NewTaskModal'

export type BoardFilters = {
  q?: string
  priority?: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigneeId?: 'ALL' | string
  label?: 'ALL' | string
}

export type Swimlane = 'none' | 'priority' | 'assignee'

export default function BoardToolbar({
  projectId,
  value,
  onChange,
  swimlane,
  onSwimlaneChange,
  labels = []
}: {
  projectId: string
  value: BoardFilters
  onChange: (f: BoardFilters) => void
  swimlane: Swimlane
  onSwimlaneChange: (s: Swimlane) => void
  /** options facultatives pour le select des labels */
  labels?: string[]
}) {
  const [q, setQ] = useState(value.q || '')
  const [priority, setPriority] = useState<BoardFilters['priority']>(value.priority || 'ALL')
  const [assigneeId, setAssigneeId] = useState<BoardFilters['assigneeId']>(
    value.assigneeId || 'ALL'
  )
  const [label, setLabel] = useState<BoardFilters['label']>(value.label || 'ALL')
  const [openNew, setOpenNew] = useState(false)

  const { orgId } = getAuth()
  const me = useMe()
  const plan = me.data?.orgs?.find((o) => o.orgId === orgId)?.plan as Plan | undefined
  const { data: members } = useOrgMembers(orgId || undefined)

  useEffect(() => {
    const t = setTimeout(() => onChange({ q, priority, assigneeId, label }), 250)
    return () => clearTimeout(t)
  }, [q, priority, assigneeId, label]) // eslint-disable-line

  const assigneeOptions = useMemo(
    () =>
      members?.rows?.map((m) => ({
        id: m.userId,
        label: m.name || m.email || m.userId.slice(0, 8)
      })) ?? [],
    [members]
  )

  const labelOptions = useMemo(() => {
    // labels passés en props (déduits côté parent du set de tasks)
    return Array.from(new Set(labels)).sort((a, b) => a.localeCompare(b))
  }, [labels])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[220px]">
          <Input placeholder="Search tasks…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <select
          className="h-9 px-2 border rounded-lg text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          title="Filter by priority"
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <PlanGate currentPlan={plan} min="PRO" fallback={null}>
          <select
            className="h-9 px-2 border rounded-lg text-sm"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value as any)}
            title="Filter by assignee"
          >
            <option value="ALL">All assignees</option>
            {assigneeOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </PlanGate>

        <select
          className="h-9 px-2 border rounded-lg text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value as any)}
          title="Filter by label"
        >
          <option value="ALL">All labels</option>
          {labelOptions.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="px-2.5 h-9 rounded-lg border text-sm hover:bg-slate-50"
            onClick={() => setOpenNew(true)}
          >
            + New task
          </button>
          <button
            className={`px-2.5 h-9 rounded-lg border text-sm ${
              swimlane === 'none' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
            onClick={() => onSwimlaneChange('none')}
            title="No swimlanes"
          >
            No lanes
          </button>
          <button
            className={`px-2.5 h-9 rounded-lg border text-sm ${
              swimlane === 'priority' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
            }`}
            onClick={() => onSwimlaneChange('priority')}
            title="Group by priority"
          >
            Priority
          </button>
          <PlanGate
            currentPlan={plan}
            min="PRO"
            fallback={
              <button className="px-2.5 h-9 rounded-lg border text-sm opacity-60 cursor-not-allowed">
                Assignee
              </button>
            }
          >
            <button
              className={`px-2.5 h-9 rounded-lg border text-sm ${
                swimlane === 'assignee' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
              }`}
              onClick={() => onSwimlaneChange('assignee')}
              title="Group by assignee"
            >
              Assignee
            </button>
          </PlanGate>
        </div>
      </div>

      <NewTaskModal open={openNew} onClose={() => setOpenNew(false)} projectId={projectId} />
    </>
  )
}
