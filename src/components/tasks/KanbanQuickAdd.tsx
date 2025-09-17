'use client'

import { Input } from '@/components/customs/form'
import { useCreateTask } from '@/lib/queries'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type ColKey = 'OPEN' | 'IN_PROGRESS' | 'DONE'

export default function KanbanQuickAdd({
  projectId,
  column
}: {
  projectId: string
  column: ColKey
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<{ title: string }>({ defaultValues: { title: '' } })
  const create = useCreateTask()

  const onSubmit = async (data: { title: string }) => {
    const title = data.title.trim()
    if (!title) return
    await create.mutateAsync({
      projectId,
      title,
      status: column, // 👈 direct dans la colonne
      priority: 'MEDIUM' // défaut sympa
    } as any)
    reset({ title: '' })
    toast.success('Task created')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex items-center gap-2">
      <Input placeholder="Quick add…" {...register('title')} />
      <button className="btn" disabled={isSubmitting || create.isPending}>
        {isSubmitting || create.isPending ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
