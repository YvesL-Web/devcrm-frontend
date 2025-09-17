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

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardInline task={task} />
    </div>
  )
}

// Remplace l’ancienne version
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
    <div ref={setNodeRef} style={style} className="relative">
      {/* Poignée à GAUCHE, pour libérer le coin haut-droit */}
      <button
        className="absolute left-1 top-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing text-sm leading-none px-1"
        aria-label="Drag"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>

      {/* Réserve 20px à gauche pour la poignée */}
      <div className="pl-5">
        <TaskCardInline task={task} />
      </div>
    </div>
  )
}


<div
  className="
    absolute left-0 top-0 bottom-0 w-7 rounded-l-lg
    transition-colors
    bg-[radial-gradient(theme(colors.slate.300)_1px,transparent_1px)]
    bg-[length:6px_6px]
    opacity-60 group-hover:opacity-100
    pointer-events-none
  "
  aria-hidden
/>

// original
<div
        className="
          absolute left-0 top-0 bottom-0 w-7 rounded-l-lg
          bg-transparent group-hover:bg-slate-50
          transition-colors
          pointer-events-none
        "
        aria-hidden
      />
