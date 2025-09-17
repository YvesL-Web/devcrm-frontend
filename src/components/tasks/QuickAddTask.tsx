'use client'
import { Input, Textarea } from '@/components/customs/form'
import { useCreateTask } from '@/lib/queries'
import { useState } from 'react'
import { toast } from 'sonner'

export default function QuickAddTask({
  projectId,
  status
}: {
  projectId: string
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
}) {
  const [v, setV] = useState('')
  const [openDesc, setOpenDesc] = useState(false)
  const [desc, setDesc] = useState('')
  const create = useCreateTask()

  async function submit() {
    const title = v.trim()
    if (!title) return
    try {
      await create.mutateAsync({
        projectId,
        title,
        status,
        priority: 'MEDIUM',
        description: desc.trim() ? desc : null
      })
      setV('')
      setDesc('')
      setOpenDesc(false)
      toast.success('Task created')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create')
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <Input
        placeholder={`Quick add to ${status.replace('_', ' ').toLowerCase()}… (Enter)`}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
      />
      {openDesc ? (
        <Textarea
          rows={3}
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      ) : (
        <button
          className="text-xs text-slate-500 hover:underline"
          onClick={() => setOpenDesc(true)}
        >
          + Add description
        </button>
      )}
    </div>
  )
}
