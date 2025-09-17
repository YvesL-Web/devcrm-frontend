'use client'
import { Section } from '@/components/customs/card'
import { Alert, FormError, Input, Label } from '@/components/customs/form'
import { apiFetch } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({ email: z.string().email({ message: 'Enter a valid email' }) })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (data: FormData) =>
      apiFetch('/auth/forgot-password', { method: 'POST', json: data })
  })

  const onSubmit = async (data: FormData) => {
    await mutateAsync(data)
    setDone(true) // API is silent even if email does not exist
  }

  return (
    <div className="space-y-6">
      <h1>Reset your password</h1>
      <Section>
        {done ? (
          <Alert tone="success">If this email exists, a reset link has been sent.</Alert>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
              <FormError error={errors.email} />
            </div>
            <button className="btn" disabled={isSubmitting || isPending}>
              {isSubmitting || isPending ? 'Sending…' : 'Send reset link'}
            </button>
            {isError && <Alert>{(error as Error).message}</Alert>}
          </form>
        )}
        <p className="text-sm muted mt-3">
          <Link className="text-sky-700 hover:underline" href="/login">
            Back to login
          </Link>
        </p>
      </Section>
    </div>
  )
}
