'use client'
import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  children,
  title
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.35)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(640px, 92vw)',
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        {children}
      </div>
    </div>
  )
}
