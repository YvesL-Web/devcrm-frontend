'use client'

import { getAuth } from '@/lib/auth'
import { useOrgMembers, useReorderKanban, useTasks } from '@/lib/queries'
import type { Task } from '@/lib/types'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { BoardFilters, Swimlane } from './BoardToolbar'
import TaskCardInline from './TaskCardInline'

const COLS = [
  { key: 'OPEN' as const, title: 'Open' },
  { key: 'IN_PROGRESS' as const, title: 'In progress' },
  { key: 'DONE' as const, title: 'Done' }
]

// === Sortable wrapper for each task ===
function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative'
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Left rail (drag handle area) */}
      <div
        className="
          absolute left-0 top-0 bottom-0 w-7 rounded-l-lg
          bg-transparent group-hover:bg-slate-50
          transition-colors
          pointer-events-none
        "
        aria-hidden
      />

      {/* The actual handle button (only draggable area) */}
      <button
        className="
          absolute left-0 top-1/2 -translate-y-1/2
          w-7 h-7 flex items-center justify-center
          text-slate-400 hover:text-slate-600
          cursor-grab active:cursor-grabbing
          touch-none
          pointer-events-auto
        "
        aria-label="Drag card"
        title="Drag to move"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* Reserve space for the rail/handle */}
      <div className="pl-8">
        <TaskCardInline task={task} />
      </div>
    </div>
  )
}

// Droppable container for a column (so we can drop to end of column)
function ColumnDroppable({
  id,
  children
}: {
  id: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id })
  return <div ref={setNodeRef}>{children}</div>
}

export default function KanbanBoard({
  projectId,
  filters,
  swimlane = 'none'
}: {
  projectId: string
  filters?: BoardFilters
  swimlane?: Swimlane
}) {
  const { data, isLoading, error } = useTasks({
    projectId,
    sort: 'kanbanOrder',
    order: 'ASC',
    page: 1,
    pageSize: 100
  })
  const reorder = useReorderKanban()
  const { orgId } = getAuth()
  const { data: members } = useOrgMembers(orgId || undefined)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const membersMap = useMemo(() => {
    const map = new Map<string, string>()
    members?.rows?.forEach((m: any) => {
      map.set(m.userId, m.name || m.email || m.userId.slice(0, 8))
    })
    return map
  }, [members])

  const all = data?.rows ?? []

  // Client-side filters
  const filtered = useMemo(() => {
    return all.filter((t) => {
      if (filters?.q) {
        const q = filters.q.toLowerCase()
        const txt = [t.title, t.description || '', (t.labels || []).join(' ')]
          .join(' ')
          .toLowerCase()
        if (!txt.includes(q)) return false
      }
      if (filters?.priority && filters.priority !== 'ALL') {
        if (t.priority !== filters.priority) return false
      }
      if (filters?.assigneeId && filters.assigneeId !== 'ALL') {
        if ((t.assigneeId || '') !== filters.assigneeId) return false
      }
      if (filters?.label && filters.label !== 'ALL') {
        const labels = t.labels || []
        if (!labels.includes(filters.label)) return false
      }
      return true
    })
  }, [all, filters])

  // Full split by status (unfiltered) used for correct ordering on server
  const fullByStatus = useMemo(() => {
    const m: Record<'OPEN' | 'IN_PROGRESS' | 'DONE', Task[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      DONE: []
    }
    for (const t of all) m[t.status].push(t)
    return m
  }, [all])

  // Visible split by status (filtered)
  const byStatus = useMemo(() => {
    const m: Record<'OPEN' | 'IN_PROGRESS' | 'DONE', Task[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      DONE: []
    }
    for (const t of filtered) m[t.status].push(t)
    return m
  }, [filtered])

  // Swimlanes inside each column (on visible set)
  function lanes(status: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    if (swimlane === 'priority') {
      const order: Task['priority'][] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
      const groups: Record<string, Task[]> = { URGENT: [], HIGH: [], MEDIUM: [], LOW: [] }
      byStatus[status].forEach((t) => groups[t.priority].push(t))
      return order.map((k) => ({ key: k, label: k, items: groups[k] }))
    }
    if (swimlane === 'assignee') {
      const groups = new Map<string, Task[]>()
      byStatus[status].forEach((t) => {
        const k = t.assigneeId || '__unassigned__'
        if (!groups.has(k)) groups.set(k, [])
        groups.get(k)!.push(t)
      })
      const entries = Array.from(groups.entries()).sort((a, b) => {
        const la = a[0] === '__unassigned__' ? 'Unassigned' : membersMap.get(a[0]) || a[0]
        const lb = b[0] === '__unassigned__' ? 'Unassigned' : membersMap.get(b[0]) || b[0]
        return la.localeCompare(lb)
      })
      return entries.map(([k, items]) => ({
        key: k,
        label: k === '__unassigned__' ? 'Unassigned' : membersMap.get(k) || k,
        items
      }))
    }
    return [{ key: 'all', label: null as any, items: byStatus[status] }]
  }

  function handleDragStart(e: any) {
    const id = String(e.active?.id || '')
    const t = all.find((x) => x.id === id) || null
    setActiveTask(t)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = e
    if (!active || !over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    // Determine from/to status using full list (not filtered)
    const fromStatus = all.find((t) => t.id === activeId)?.status as
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'DONE'
      | undefined
    let toStatus: 'OPEN' | 'IN_PROGRESS' | 'DONE' | undefined

    if (overId === 'OPEN' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      toStatus = overId as any
    } else {
      toStatus = all.find((t) => t.id === overId)?.status as any
    }
    if (!fromStatus || !toStatus) return

    // Build arrays from FULL list
    const OPEN = fullByStatus.OPEN.map((t) => t.id)
    const IN_PROGRESS = fullByStatus.IN_PROGRESS.map((t) => t.id)
    const DONE = fullByStatus.DONE.map((t) => t.id)

    const getArr = (s: 'OPEN' | 'IN_PROGRESS' | 'DONE') =>
      s === 'OPEN' ? OPEN : s === 'IN_PROGRESS' ? IN_PROGRESS : DONE

    // remove active from its original
    const src = getArr(fromStatus)
    const srcIdx = src.indexOf(activeId)
    if (srcIdx >= 0) src.splice(srcIdx, 1)

    // insert into destination
    const dst = getArr(toStatus)
    if (overId === 'OPEN' || overId === 'IN_PROGRESS' || overId === 'DONE') {
      // dropped on empty column area -> append
      dst.push(activeId)
    } else {
      const overIdx = dst.indexOf(overId)
      if (overIdx >= 0) {
        dst.splice(overIdx, 0, activeId)
      } else {
        dst.push(activeId)
      }
    }

    await reorder.mutateAsync({
      projectId,
      columns: { OPEN, IN_PROGRESS, DONE }
    })
  }

  if (isLoading) return <div className="muted">Loading board…</div>
  if (error)
    return (
      <div className="text-sm" style={{ color: '#b91c1c' }}>
        {(error as Error).message}
      </div>
    )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}
      >
        {COLS.map((col) => {
          const groups = lanes(col.key)
          const count = byStatus[col.key].length

          return (
            <div key={col.key} className="border rounded-xl bg-white flex flex-col">
              <div className="px-3 py-2 border-b sticky top-0 bg-white z-10">
                <div className="text-sm font-medium">{col.title}</div>
                <div className="text-xs text-slate-500">{count} tasks</div>
              </div>

              {/* scrollable column; height adaptative */}
              <ColumnDroppable id={col.key}>
                <div
                  className="p-2 space-y-3 overflow-auto"
                  style={{ maxHeight: 'calc(100vh - 260px)' }}
                >
                  {groups.map((lane) => (
                    <div key={lane.key}>
                      {swimlane !== 'none' && (
                        <div className="text-[11px] font-medium text-slate-600 px-1 mb-1">
                          {lane.label}
                        </div>
                      )}

                      <SortableContext
                        items={lane.items.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {lane.items.map((t) => (
                            <SortableTask key={t.id} task={t} />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  ))}
                </div>
              </ColumnDroppable>
            </div>
          )
        })}
      </div>
      <DragOverlay>{activeTask ? <TaskCardInline task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  )
}
