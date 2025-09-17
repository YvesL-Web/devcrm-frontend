'use client'
import { FormError, Input, Label, Textarea } from '@/components/customs/form'
import Modal from '@/components/customs/modal'
import { useCreateProject } from '@/lib/queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  portalPublic: z.boolean().default(true),
  portalShowChangelog: z.boolean().default(true),
  portalShowInvoices: z.boolean().default(true),
  portalWelcome: z.string().max(10_000).optional()
})

// 👉 Entrée vs Sortie
type FormInput = z.input<typeof schema> // ce que RHF manipule (booléens optionnels car default)
type FormOutput = z.output<typeof schema> // ce que tu envoies (booléens toujours définis)

export default function ProjectCreateModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const create = useCreateProject()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      portalPublic: true,
      portalShowChangelog: true,
      portalShowInvoices: true,
      name: '',
      portalWelcome: ''
    }
  })

  const onSubmit: SubmitHandler<FormInput> = async (raw) => {
    // Normalise avec les defaults (booléens toujours définis côté sortie)
    const data: FormOutput = schema.parse(raw)
    await create.mutateAsync(data)
    toast.success('Project created')
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a new project">
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input placeholder="Website Redesign" {...register('name')} />
          <FormError error={errors.name} />
        </div>

        <div className="grid gap-2">
          <Label>Portal welcome (optional)</Label>
          <Textarea
            rows={4}
            placeholder="Short welcome text for the public portal…"
            {...register('portalWelcome')}
          />
          <FormError error={errors.portalWelcome as any} />
        </div>

        <div className="grid gap-1">
          <label className="text-sm">
            <input
              type="checkbox"
              checked={!!watch('portalPublic')}
              onChange={(e) => setValue('portalPublic', e.target.checked)}
            />{' '}
            Portal is public
          </label>
          <label className="text-sm">
            <input
              type="checkbox"
              checked={!!watch('portalShowChangelog')}
              onChange={(e) => setValue('portalShowChangelog', e.target.checked)}
            />{' '}
            Show changelog on portal
          </label>
          <label className="text-sm">
            <input
              type="checkbox"
              checked={!!watch('portalShowInvoices')}
              onChange={(e) => setValue('portalShowInvoices', e.target.checked)}
            />{' '}
            Show invoices on portal
          </label>
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
