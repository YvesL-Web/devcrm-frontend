'use client'
import { useOrgMembers } from '@/lib/queries'
import { useMemo, useState } from 'react'

export type BoardFilters = {
  assigneeId?: string
  label?: string
  q?: string
}

export default function BoardToolbar({
  tasks,
  onChange
}: {
  tasks: { labels?: string[] | null }[]
  onChange: (f: BoardFilters) => void
}) {
  const { data: mem } = useOrgMembers()
  const members = mem?.rows ?? []

  const labels = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach((t) => (t.labels ?? []).forEach((l) => set.add(l)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [tasks])

  const [assigneeId, setAssigneeId] = useState<string | ''>('')
  const [label, setLabel] = useState<string | ''>('')
  const [q, setQ] = useState('')

  function apply() {
    onChange({
      assigneeId: assigneeId || undefined,
      label: label || undefined,
      q: q || undefined
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="border rounded-lg px-2 py-1 text-sm"
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') apply()
        }}
      />
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
      >
        <option value="">All assignees</option>
        {members.map((m: any) => (
          <option key={m.userId} value={m.userId}>
            {m.name || m.email || m.userId}
          </option>
        ))}
      </select>
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      >
        <option value="">All labels</option>
        {labels.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <button className="btn" onClick={apply}>
        Apply
      </button>
    </div>
  )
}
