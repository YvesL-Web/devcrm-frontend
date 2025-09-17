'use client'
import { FormError, Input, Label, Textarea } from '@/components/customs/form'
import { useCreateTask } from '@/lib/queries'
import type { Task } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  // '' -> undefined ; keep input as unknown (from preprocess), output as string | undefined
  dueDate: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'YYYY-MM-DD' })
      .optional()
  )
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function TaskCreateForm({
  projectId,
  onCreated
}: {
  projectId: string
  onCreated?: () => void
}) {
  const create = useCreateTask()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM'
      // don't set dueDate default to avoid TS complaining about unknown; leave it omitted
    } as any
  })

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    const payload: Partial<Task> & { projectId: string; title: string } = {
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate // string YYYY-MM-DD or undefined
    }
    await create.mutateAsync(payload)
    reset()
    onCreated?.()
    toast.success('Task created')
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label>Title</Label>
        <Input placeholder="Implement login flow" {...register('title')} />
        <FormError error={errors.title} />
      </div>
      <div className="grid gap-2">
        <Label>Description (optional)</Label>
        <Textarea rows={3} {...register('description')} />
        <FormError error={errors.description as any} />
      </div>
      <div className="flex items-center gap-2">
        <div className="grid gap-1">
          <Label>Priority</Label>
          <select className="border rounded-lg px-2 py-2 text-sm" {...register('priority')}>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
          <FormError error={errors.priority as any} />
        </div>
        <div className="grid gap-1">
          <Label>Due date</Label>
          <Input type="date" {...register('dueDate' as any)} />
          <FormError error={errors.dueDate as any} />
        </div>
        <div className="flex-1" />
        <button className="btn" disabled={isSubmitting || create.isPending}>
          {isSubmitting || create.isPending ? 'Adding…' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
