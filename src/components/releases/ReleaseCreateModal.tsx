'use client'
import { FormError, Input, Label, Textarea } from '@/components/customs/form'
import Modal from '@/components/customs/modal'
import { useCreateRelease } from '@/lib/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  version: z.string().max(50).optional(),
  title: z.string().min(1).max(200),
  bodyMd: z.string().min(1).max(50000)
})
type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function ReleaseCreateModal({
  projectId,
  open,
  onClose
}: {
  projectId: string
  open: boolean
  onClose: () => void
}) {
  const create = useCreateRelease()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormInput, any, FormOutput>({ resolver: zodResolver(schema) })

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    await create.mutateAsync({ projectId, ...data })
    toast.success('Release created')
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New release">
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label>Version (optional)</Label>
          <Input placeholder="1.2.0" {...register('version')} />
          <FormError error={errors.version as any} />
        </div>
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input placeholder="September update" {...register('title')} />
          <FormError error={errors.title} />
        </div>
        <div className="grid gap-2">
          <Label>Body (Markdown)</Label>
          <Textarea rows={8} placeholder="- Feature A\n- Fix B\n" {...register('bodyMd')} />
          <FormError error={errors.bodyMd} />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" disabled={isSubmitting || create.isPending}>
            {isSubmitting || create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
