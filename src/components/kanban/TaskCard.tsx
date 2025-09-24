'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TaskCard({ task, dragging = false }: { task: any; dragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dragging || isDragging ? 0.6 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-white p-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium leading-snug">{task.title}</div>
        {/* handle de drag (grip) */}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="shrink-0 px-1 py-0.5 text-slate-500 hover:text-slate-700 cursor-grab"
          title="Drag"
          aria-label="Drag task"
          type="button"
        >
          ⋮⋮
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {task.priority && (
          <span className="text-[11px] px-1.5 py-0.5 rounded border bg-slate-50">
            {task.priority}
          </span>
        )}
        {(task.labels || []).map((l: string) => (
          <span key={l} className="text-[11px] px-1.5 py-0.5 rounded border bg-slate-50" title={l}>
            {l}
          </span>
        ))}
        {task.dueDate && (
          <span className="ml-auto text-[11px] text-slate-500">Due {task.dueDate}</span>
        )}
      </div>
    </div>
  )
}
