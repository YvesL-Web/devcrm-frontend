'use client'
import Avatar from '@/components/customs/avatar'
import { Textarea } from '@/components/customs/form'
import {
  useAddTaskComment,
  useDeleteTaskComment,
  useEditTaskComment,
  useOrgMembers,
  useTaskComments
} from '@/lib/queries'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type MentionCandidate = { email: string; name?: string | null }

export default function TaskComments({ taskId }: { taskId: string }) {
  const { data, isLoading, error } = useTaskComments(taskId)
  const create = useAddTaskComment(taskId)

  const [draft, setDraft] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  // mentions
  const { data: memData } = useOrgMembers()
  const candidates: MentionCandidate[] = (memData?.rows ?? [])
    .filter((m) => !!m.email)
    .map((m) => ({ email: m.email!, name: m.name || null }))

  const [openMentions, setOpenMentions] = useState(false)
  const [query, setQuery] = useState('')
  const [selIdx, setSelIdx] = useState(0)

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!openMentions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelIdx((i) => Math.min(i + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelIdx((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selIdx]) applyMention(filtered[selIdx])
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpenMentions(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setDraft(val)
    const caret = e.target.selectionStart || 0
    const trigger = findMentionTrigger(val, caret)
    if (trigger) {
      setQuery(trigger.query)
      setOpenMentions(true)
      setSelIdx(0)
    } else {
      setOpenMentions(false)
    }
  }

  const filtered = openMentions
    ? candidates
        .filter(
          (c) =>
            c.email.toLowerCase().includes(query.toLowerCase()) ||
            (c.name || '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : []

  function applyMention(m: MentionCandidate) {
    if (!taRef.current) return
    const el = taRef.current
    const caret = el.selectionStart || 0
    const trig = findMentionTrigger(draft, caret)
    if (!trig) return
    const before = draft.slice(0, trig.start)
    const after = draft.slice(caret)
    const insert = `@${m.email}`
    const next = before + insert + after
    setDraft(next)
    requestAnimationFrame(() => {
      el.focus()
      const p = (before + insert).length
      el.setSelectionRange(p, p)
    })
    setOpenMentions(false)
  }

  async function submit() {
    const body = draft.trim()
    if (!body) return
    try {
      await create.mutateAsync(body)
      setDraft('')
      setOpenMentions(false)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add comment')
    }
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!openMentions) return
      if (!(e.target as HTMLElement).closest('#mentions-popover')) setOpenMentions(false)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [openMentions])

  if (isLoading) return <div className="text-sm text-slate-500">Loading comments…</div>
  if (error) return <div className="text-sm text-rose-700">{(error as Error).message}</div>

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {(data?.rows ?? []).map((c) => (
          <CommentRow
            key={c.id}
            taskId={taskId}
            id={c.id}
            body={c.body}
            createdAt={c.createdAt}
            editedAt={c.editedAt}
          />
        ))}
      </div>

      <div className="border rounded-xl p-2 relative">
        <Textarea
          ref={taRef}
          rows={3}
          placeholder="Write a comment… (type @ to mention)"
          value={draft}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        {openMentions && filtered.length > 0 && (
          <div
            id="mentions-popover"
            className="absolute z-[60] bg-white border rounded-lg shadow-lg p-1 w-80 max-h-64 overflow-auto left-2 bottom-0 translate-y-full"
          >
            {filtered.map((m, i) => (
              <button
                key={m.email}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 ${
                  i === selIdx ? 'bg-slate-100' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  applyMention(m)
                }}
              >
                <Avatar name={m.name} email={m.email} />
                <div>
                  <div className="text-sm">{m.name || m.email}</div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button className="btn" onClick={submit}>
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

function CommentRow({
  taskId,
  id,
  body,
  createdAt,
  editedAt
}: {
  taskId: string
  id: string
  body: string
  createdAt: string
  editedAt: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(body)
  const edit = useEditTaskComment(taskId, id)
  const del = useDeleteTaskComment(taskId, id)

  async function save() {
    try {
      await edit.mutateAsync(text.trim())
      setEditing(false)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to edit')
    }
  }
  async function remove() {
    if (!confirm('Delete this comment?')) return
    try {
      await del.mutateAsync()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  return (
    <div className="border rounded-xl p-2">
      <div className="text-xs text-slate-500">
        {new Date(createdAt).toLocaleString()} {editedAt ? '• edited' : ''}
      </div>
      {editing ? (
        <>
          <Textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1"
          />
          <div className="flex gap-2 justify-end pt-2">
            <button className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn" onClick={save}>
              Save
            </button>
          </div>
        </>
      ) : (
        <div className="mt-1 whitespace-pre-wrap text-sm">{body}</div>
      )}
      {!editing && (
        <div className="flex gap-3 pt-2 text-xs">
          <button className="underline" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className="underline text-rose-700" onClick={remove}>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// /** Trouve un trigger @... en fonction de la position du caret */
// function findMentionTrigger(text: string, caret: number): { start: number; query: string } | null {
//   const left = text.slice(0, caret)
//   // cherche le dernier séparateur (espace, newline, début)
//   const m = /(^|\s)@([^\s@]{0,60})$/.exec(left)
//   if (!m) return null
//   const full = m[0]
//   const query = m[2] || ''
//   const start = caret - (query.length + 1) // +1 pour '@'
//   return { start, query }
// }

function findMentionTrigger(text: string, caret: number): { start: number; query: string } | null {
  const left = text.slice(0, caret)
  const m = /(^|\s)@([^\s@]{0,60})$/.exec(left)
  if (!m) return null
  const query = m[2] || ''
  const start = caret - (query.length + 1)
  return { start, query }
}
