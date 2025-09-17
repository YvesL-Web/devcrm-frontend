'use client'
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function TaskActionMenu({
  onEdit,
  onDelete,
  onOpen,
  disabled
}: {
  onEdit: () => void
  onDelete: () => void
  onOpen: () => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-slate-700 p-1 rounded"
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
        disabled={disabled}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow z-50 py-1
            max-h-56 overflow-auto overscroll-contain
          "
          role="menu"
          aria-orientation="vertical"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            onClick={() => {
              setOpen(false)
              onOpen()
            }}
            role="menuitem"
          >
            <Eye size={14} /> Open
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            onClick={() => {
              setOpen(false)
              onEdit()
            }}
            role="menuitem"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-rose-50 text-rose-700 flex items-center gap-2"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            role="menuitem"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
