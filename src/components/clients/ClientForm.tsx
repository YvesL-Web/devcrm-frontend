'use client'

import { Input, Textarea } from '@/components/customs/form'
import { useCreateClient, useUpdateClient } from '@/lib/queries'
import type { Client } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  company: z.string().max(200).optional().or(z.literal('')),
  email: z.email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional().or(z.literal('')),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: z.string().max(120).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(120).optional().or(z.literal('')),
  notes: z.string().max(10000).optional().or(z.literal(''))
})
type FormData = z.infer<typeof schema>

export default function ClientForm({
  initial,
  onSaved
}: {
  initial?: Partial<Client>
  onSaved?: (c: Client) => void
}) {
  const isEdit = !!initial?.id
  const create = useCreateClient()
  const update = useUpdateClient(initial?.id || '')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name || '',
      company: initial?.company || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      addressLine1: initial?.addressLine1 || '',
      addressLine2: initial?.addressLine2 || '',
      city: initial?.city || '',
      state: initial?.state || '',
      postalCode: initial?.postalCode || '',
      country: initial?.country || '',
      notes: initial?.notes || ''
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      const payload: any = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
      )
      const saved = isEdit ? await update.mutateAsync(payload) : await create.mutateAsync(payload)
      toast.success(isEdit ? 'Client updated' : 'Client created')
      onSaved?.(saved as Client)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save client')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Name</label>
          <Input {...register('name')} />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Company</label>
          <Input {...register('company')} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Email</label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <Input {...register('phone')} />
        </div>
      </div>

      <div>
        <label className="label">Address line 1</label>
        <Input {...register('addressLine1')} />
      </div>
      <div>
        <label className="label">Address line 2</label>
        <Input {...register('addressLine2')} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">City</label>
          <Input {...register('city')} />
        </div>
        <div>
          <label className="label">State</label>
          <Input {...register('state')} />
        </div>
        <div>
          <label className="label">Postal code</label>
          <Input {...register('postalCode')} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Country</label>
          <Input {...register('country')} />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <Textarea rows={4} {...register('notes')} />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          className="btn"
          type="submit"
          disabled={isSubmitting || create.isPending || update.isPending}
        >
          {isSubmitting || create.isPending || update.isPending
            ? 'Saving…'
            : isEdit
            ? 'Save changes'
            : 'Create client'}
        </button>
      </div>
    </form>
  )
}
