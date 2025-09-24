'use client'
import { apiFetch } from '@/lib/api'
import { useOrgMembers, useTasks } from '@/lib/queries'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

export default function ProjectOverviewPanel({ projectId }: { projectId: string }) {
  const { data: members } = useOrgMembers()
  // derive labels from current tasks (simple)
  const { data: taskList } = useTasks({ projectId, page: 1, pageSize: 100 })
  const labels = Array.from(new Set((taskList?.rows ?? []).flatMap((t) => t.labels || []))).sort(
    (a, b) => a.localeCompare(b)
  )

  const [assigneeId, setAssigneeId] = useState<string | ''>('')
  const [label, setLabel] = useState<string | ''>('')

  const q = useQuery({
    queryKey: ['project-overview', projectId, assigneeId || '', label || ''],
    queryFn: () =>
      apiFetch<{
        stats: any
        createdPerDay: { date: string; count: number }[]
        burndown: { date: string; open: number }[]
      }>(
        `/projects/${projectId}/overview${buildQuery({
          assigneeId: assigneeId || undefined,
          label: label || undefined
        })}`
      )
  })
  if (q.isLoading) return <div className="text-sm text-slate-500">Loading overview…</div>
  if (q.error) return <div className="text-sm text-rose-700">{(q.error as Error).message}</div>
  const stats = q.data!.stats
  const created = q.data!.createdPerDay
  const burndown = q.data!.burndown

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <select
          className="border rounded-lg px-2 py-1 text-sm"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">All assignees</option>
          {(members?.rows ?? []).map((m: any) => (
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
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gap: 12 }}>
        <Kpi title="Total" value={stats.total} />
        <Kpi title="Open" value={stats.open} />
        <Kpi title="In progress" value={stats.inProgress} />
        <Kpi title="Done" value={stats.done} />
        <Kpi title="Overdue" value={stats.overdue} warn />
        <Kpi title="Lead time (days)" value={stats.leadTimeDays ?? 0} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="bg-white border rounded-xl p-3 h-64">
          <div className="text-sm text-slate-600 mb-2">Tasks created (last 30 days)</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={created}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-xl p-3 h-64">
          <div className="text-sm text-slate-600 mb-2">Burndown (open tasks)</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burndown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="open" strokeWidth={2} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Kpi({ title, value, warn }: { title: string; value: number; warn?: boolean }) {
  return (
    <div className={`border rounded-xl p-3 ${warn ? 'bg-rose-50 border-rose-200' : 'bg-white'}`}>
      <div className="text-xs text-slate-600">{title}</div>
      <div className={`text-2xl font-semibold mt-1 ${warn ? 'text-rose-700' : 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  )
}

function buildQuery(q: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  Object.entries(q).forEach(([k, v]) => {
    if (v) sp.set(k, v)
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}
