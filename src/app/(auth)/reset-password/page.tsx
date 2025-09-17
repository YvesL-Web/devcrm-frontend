'use client'
import { Section } from '@/components/customs/card'
import { Alert, FormError, Input, Label } from '@/components/customs/form'
import { apiFetch } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z
  .object({
    password: z.string().min(8, { message: 'At least 8 characters' }),
    confirm: z.string().min(8, { message: 'Confirm your password' })
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const router = useRouter()
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      apiFetch('/auth/reset-password', { method: 'POST', json: payload })
  })

  const onSubmit = async (data: FormData) => {
    if (!token) return
    await mutateAsync({ token, newPassword: data.password })
    setDone(true)
  }

  const disabled = useMemo(
    () => !token || isSubmitting || isPending,
    [token, isSubmitting, isPending]
  )

  return (
    <div className="space-y-6">
      <h1>Choose a new password</h1>
      <Section>
        {!token && <Alert>Missing or invalid token.</Alert>}
        {done ? (
          <>
            <Alert tone="success">Password updated. You can now sign in.</Alert>
            <div className="mt-3">
              <Link className="btn" href="/login">
                Go to login
              </Link>
            </div>
          </>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label>New password</Label>
              <Input type="password" placeholder="********" {...register('password')} />
              <FormError error={errors.password} />
            </div>
            <div className="grid gap-2">
              <Label>Confirm</Label>
              <Input type="password" placeholder="********" {...register('confirm')} />
              <FormError error={errors.confirm} />
            </div>
            <button className="btn" disabled={disabled}>
              {disabled ? 'Saving…' : 'Save password'}
            </button>
            {isError && <Alert>{(error as Error).message}</Alert>}
          </form>
        )}
      </Section>
    </div>
  )
}
