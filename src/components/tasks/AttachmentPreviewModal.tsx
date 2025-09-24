'use client'
import { API_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AttachmentPreviewModal({
  open,
  onClose,
  attachment
}: {
  open: boolean
  onClose: () => void
  attachment?: { id: string; filename: string; mimeType: string }
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !attachment) return
    let aborted = false
    ;(async () => {
      try {
        const { accessToken, orgId } = getAuth()
        const res = await fetch(`${API_URL}/tasks/attachments/${attachment.id}/view`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(orgId ? { 'X-Org-Id': orgId } : {})
          }
        })
        if (!res.ok) throw new Error('Preview failed')
        const blob = await res.blob()
        if (!aborted) setUrl(URL.createObjectURL(blob))
      } catch (e: any) {
        toast.error(e?.message || 'Preview failed')
      }
    })()
    return () => {
      aborted = true
      if (url) URL.revokeObjectURL(url)
      setUrl(null)
    }
  }, [open, attachment?.id])

  if (!open || !attachment) return null
  const isImage = /^image\//.test(attachment.mimeType)
  const isPdf = attachment.mimeType === 'application/pdf'

  return (
    <div className="fixed inset-0 z-[140]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[96%] max-w-[960px] bg-white border rounded-xl shadow-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-medium">{attachment.filename}</div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="border rounded overflow-hidden" style={{ height: '70vh' }}>
          {!url ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-600">
              Loading preview…
            </div>
          ) : isImage ? (
            <img src={url} alt={attachment.filename} className="w-full h-full object-contain" />
          ) : isPdf ? (
            <iframe src={url} className="w-full h-full" />
          ) : (
            <div className="p-4 text-sm text-slate-600">No inline preview for this file type.</div>
          )}
        </div>
      </div>
    </div>
  )
}
