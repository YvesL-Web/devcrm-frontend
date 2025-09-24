'use client'
import Lightbox from '@/components/lightbox/Lightbox'
import { API_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import {
  downloadTaskAttachment,
  useDeleteTaskAttachment,
  useTaskAttachments,
  useUploadTaskAttachments
} from '@/lib/queries'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function TaskAttachments({ taskId }: { taskId: string }) {
  const { data, isLoading, error } = useTaskAttachments(taskId)
  const upload = useUploadTaskAttachments(taskId)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFiles(files: FileList | File[]) {
    try {
      await upload.mutateAsync(files)
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed')
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`border rounded-xl p-4 text-sm text-center ${dragOver ? 'bg-slate-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
      >
        <div>
          <strong>Drag & drop</strong> files here, or click to select
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && onFiles(e.target.files)}
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Loading attachments…</div>
      ) : error ? (
        <div className="text-sm text-rose-700">{(error as Error).message}</div>
      ) : (
        <ul className="space-y-2">
          {(data?.rows ?? []).map((a) => (
            <AttachmentRow key={a.id} att={a} />
          ))}
        </ul>
      )}
    </div>
  )
}

function AttachmentRow({ att }: { att: any }) {
  const del = useDeleteTaskAttachment(att.id, att.taskId)
  const [showPreview, setShowPreview] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const size = Number(att.size || 0)
  const kb = Math.round(size / 102.4) / 10
  const isImage = /^image\//.test(att.mimeType)
  const isPdf = att.mimeType === 'application/pdf'

  function openPreview() {
    setShowPreview((v) => !v)
  }
  function openLightbox(url: string) {
    setLightboxUrl(url)
  }

  return (
    <li className="border rounded-xl p-2">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium">{att.filename}</div>
          <div className="text-xs text-slate-500">
            {att.mimeType} • {kb} KB • {new Date(att.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isImage || isPdf) && (
            <button className="btn" onClick={openPreview}>
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          )}
          <button className="btn" onClick={() => downloadTaskAttachment(att.id, att.filename)}>
            Download
          </button>
          <button
            className="px-3 py-2 text-sm rounded-lg border bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={() => del.mutate()}
          >
            Delete
          </button>
        </div>
      </div>

      {showPreview && <AttachmentPreview att={att} onOpenLightbox={openLightbox} />}

      {lightboxUrl && (
        <Lightbox src={lightboxUrl} alt={att.filename} onClose={() => setLightboxUrl(null)} />
      )}
    </li>
  )
}

function AttachmentPreview({
  att,
  onOpenLightbox
}: {
  att: any
  onOpenLightbox: (url: string) => void
}) {
  const { accessToken, orgId } = getAuth()
  const src = useMemo(() => {
    const url = new URL(`${API_URL}/tasks/attachments/${att.id}/download`)
    url.searchParams.set('inline', '1')
    return url.toString()
  }, [att.id])

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const isImage = /^image\//.test(att.mimeType)
  const isPdf = att.mimeType === 'application/pdf'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(src, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(orgId ? { 'X-Org-Id': orgId } : {}),
            Accept: '*/*'
          }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (!cancelled) {
          const url = URL.createObjectURL(blob)
          setBlobUrl(url)
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Preview failed')
      }
    })()
    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, accessToken, orgId])

  if (err) return <div className="text-xs text-rose-700 mt-2">{err}</div>
  if (!blobUrl) return <div className="text-xs text-slate-500 mt-2">Loading preview…</div>

  return (
    <div className="mt-2">
      {isImage && (
        <div className="space-y-2">
          <img
            src={blobUrl}
            alt={att.filename}
            className="max-h-80 rounded-lg border cursor-zoom-in"
            onClick={() => onOpenLightbox(blobUrl)}
          />
          <div className="text-xs text-slate-500">Click image to open lightbox</div>
        </div>
      )}
      {isPdf && <iframe src={blobUrl} className="w-full h-80 rounded-lg border" />}
    </div>
  )
}
