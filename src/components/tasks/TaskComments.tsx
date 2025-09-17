'use client'
import { FormError, Label, Textarea } from '@/components/customs/form'
import { useAddComment, useTaskComments } from '@/lib/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({ body: z.string().min(1) })
type FormData = z.infer<typeof schema>

export default function TaskComments({ taskId }: { taskId: string }) {
  const { data, isLoading, error } = useTaskComments(taskId)
  const add = useAddComment(taskId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(d: FormData) {
    await add.mutateAsync({ body: d.body })
    reset()
    toast.success('Comment added')
  }

  return (
    <div className="space-y-3">
      <h3 style={{ marginBottom: 0 }}>Comments</h3>
      {isLoading && <div className="muted">Loading…</div>}
      {error && (
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {(error as Error).message}
        </div>
      )}
      <ul className="space-y-2">
        {data?.rows.map((c) => (
          <li key={c.id} className="border rounded-xl p-2">
            <div className="text-xs muted">{new Date(c.createdAt).toLocaleString()}</div>
            <div>{c.body}</div>
          </li>
        ))}
      </ul>
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-1">
          <Label>Add a comment</Label>
          <Textarea rows={3} {...register('body')} />
          <FormError error={errors.body} />
        </div>
        <button className="btn" disabled={isSubmitting || add.isPending}>
          {isSubmitting || add.isPending ? 'Posting…' : 'Post comment'}
        </button>
      </form>
    </div>
  )
}
