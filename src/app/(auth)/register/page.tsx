'use client'
import RedirectIfAuthed from '@/components/auth/RedirectIfAuthed'
import { Section } from '@/components/customs/card'
import { Alert, FormError, Input, Label } from '@/components/customs/form'
import { apiFetch } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  name: z.string().optional(),
  orgName: z.string().optional(),
  email: z.email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'At least 8 characters' })
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [serverMsg, setServerMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', orgName: '' }
  })

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (data: FormData) => apiFetch('/auth/register', { method: 'POST', json: data })
  })

  const onSubmit = async (data: FormData) => {
    setServerMsg(null)
    await mutateAsync(data)
    setServerMsg('Account created. Check your inbox to verify your email.')
    toast.success('Account created', { description: 'Please verify your email to sign in.' })
  }

  return (
    <RedirectIfAuthed>
      <div className="space-y-6">
        <h1>Create your account</h1>
        <Section>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="Your name" {...register('name')} />
            </div>
            <div className="grid gap-2">
              <Label>Organization name</Label>
              <Input placeholder="Acme Inc." {...register('orgName')} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
              <FormError error={errors.email} />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" placeholder="********" {...register('password')} />
              <FormError error={errors.password} />
            </div>

            <button className="btn" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? 'Creating…' : 'Create account'}
            </button>

            {isError && <Alert>{(error as Error).message}</Alert>}
            {serverMsg && <Alert tone="success">{serverMsg}</Alert>}

            <p className="text-sm muted">
              Already have an account?{' '}
              <Link className="text-sky-700 hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        </Section>
      </div>
    </RedirectIfAuthed>
  )
}
