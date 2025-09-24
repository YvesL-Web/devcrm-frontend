'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

export default function KanbanColumn({
  id,
  title,
  items
}: {
  id: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  title: string
  items: any[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold tracking-wide">
          {title} <span className="text-xs text-slate-500">({items.length})</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`rounded-xl border p-2 min-h-[200px] bg-slate-50/50 ${
          isOver ? 'ring-2 ring-slate-300' : ''
        }`}
      >
        <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
