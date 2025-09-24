'use client'
import { useReorderKanban, useTasks } from '@/lib/queries'
import { useMemo, useState } from 'react'
import BoardToolbar, { BoardFilters } from './BoardToolbar'

import KanbanColumn from '@/components/kanban/kanbanColumn'
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const COLS = [
  { key: 'OPEN', title: 'Open' },
  { key: 'IN_PROGRESS', title: 'In Progress' },
  { key: 'DONE', title: 'Done' }
] as const

type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE'
type ColKey = Status

function isColKey(x: any): x is ColKey {
  return x === 'OPEN' || x === 'IN_PROGRESS' || x === 'DONE'
}

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const [filters, setFilters] = useState<BoardFilters>({})
  const { data, isLoading, error } = useTasks({
    projectId,
    page: 1,
    pageSize: 50,
    sort: 'kanbanOrder',
    order: 'ASC',
    q: filters.q,
    assigneeId: filters.assigneeId,
    label: filters.label
  })

  const tasks = data?.rows ?? []

  const columns = useMemo(() => {
    const m: Record<ColKey, any[]> = { OPEN: [], IN_PROGRESS: [], DONE: [] }
    for (const t of tasks) {
      if (t.status === 'OPEN') m.OPEN.push(t)
      else if (t.status === 'IN_PROGRESS') m.IN_PROGRESS.push(t)
      else m.DONE.push(t)
    }
    ;(Object.keys(m) as ColKey[]).forEach((k) => {
      m[k].sort((a, b) => (a.kanbanOrder || 0) - (b.kanbanOrder || 0))
    })
    return m
  }, [tasks])

  const idToCol = useMemo(() => {
    const map = new Map<string, ColKey>() // <-- ; important
    ;(Object.keys(columns) as ColKey[]).forEach((k) => {
      for (const t of columns[k]) map.set(t.id, k)
    })
    return map
  }, [columns])

  const reorder = useReorderKanban()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [activeTask, setActiveTask] = useState<any | null>(null)

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id)
    const t = tasks.find((x) => x.id === activeId)
    setActiveTask(t || null)
  }

  function resolveTargetColumn(overId: UniqueIdentifier | null): ColKey | null {
    if (!overId) return null
    const s = String(overId)
    if (isColKey(s)) return s
    const col = idToCol.get(s)
    return col ?? null
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const fromColRaw = idToCol.get(activeId)
    const toCol = resolveTargetColumn(overId)

    if (!fromColRaw || !toCol) return
    if (!isColKey(fromColRaw)) return
    const fromCol: ColKey = fromColRaw

    // Construire des listes d’IDs par colonne
    const lists: Record<ColKey, string[]> = {
      OPEN: columns.OPEN.map((t) => t.id),
      IN_PROGRESS: columns.IN_PROGRESS.map((t) => t.id),
      DONE: columns.DONE.map((t) => t.id)
    }

    const fromList = lists[fromCol]
    const toList = lists[toCol]

    const fromIndex = fromList.indexOf(activeId)
    let toIndex: number
    if (isColKey(overId)) {
      // drop sur la zone colonne (pas sur une carte)
      toIndex = toList.length
    } else {
      const overIndex = toList.indexOf(overId)
      toIndex = overIndex === -1 ? toList.length : overIndex
    }

    if (fromCol === toCol) {
      lists[toCol] = arrayMove(toList, fromIndex, toIndex)
    } else {
      if (fromIndex > -1) fromList.splice(fromIndex, 1)
      toList.splice(toIndex, 0, activeId)
    }

    try {
      await reorder.mutateAsync({
        projectId,
        columns: {
          OPEN: lists.OPEN,
          IN_PROGRESS: lists.IN_PROGRESS,
          DONE: lists.DONE
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) return <div className="muted">Loading board…</div>
  if (error)
    return (
      <div className="text-sm" style={{ color: '#b91c1c' }}>
        {(error as Error).message}
      </div>
    )

  return (
    <div className="space-y-3">
      <BoardToolbar tasks={tasks} onChange={setFilters} />

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
          <KanbanColumn id="OPEN" title="Open" items={columns.OPEN} />
          <KanbanColumn id="IN_PROGRESS" title="In Progress" items={columns.IN_PROGRESS} />
          <KanbanColumn id="DONE" title="Done" items={columns.DONE} />
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
