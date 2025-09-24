'use client'
import { useEffect, useState } from 'react'

export default function Lightbox({
  src,
  alt,
  onClose
}: {
  src: string
  alt?: string
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const next = Math.min(4, Math.max(0.5, zoom + (e.deltaY < 0 ? 0.1 : -0.1)))
    setZoom(next)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/80" onClick={onClose} onWheel={onWheel}>
      <div className="w-full h-full flex items-center justify-center p-4">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full select-none"
          style={{ transform: `scale(${zoom})`, transition: 'transform .1s' }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <button
        className="absolute top-4 right-4 text-white bg-black/40 px-3 py-1 rounded-lg border border-white/20"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  )
}
