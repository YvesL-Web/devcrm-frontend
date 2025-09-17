'use client'
import RedirectIfAuthed from '@/components/auth/RedirectIfAuthed'
import { Section } from '@/components/customs/card'
import { Alert, FormError, Input, Label } from '@/components/customs/form'
import { apiFetch } from '@/lib/api'
import { setAuth } from '@/lib/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z.object({
  email: z.email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Required' })
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const login = useMutation({
    mutationFn: (data: FormData) => apiFetch('/auth/login', { method: 'POST', json: data })
  })

  const resend = useMutation({
    mutationFn: (email: string) =>
      apiFetch('/auth/resend-verification', { method: 'POST', json: { email } })
  })

  const onSubmit = async (data: FormData) => {
    setEmailNotVerified(null)
    try {
      const res = (await login.mutateAsync(data)) as any
      setAuth({
        accessToken: res.accessToken || null,
        refreshToken: res.refreshToken || null,
        orgId: res.orgId || null,
        userId: res.userId || null
      })
      toast.success('Welcome back!')
      router.replace('/dashboard')
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(data.email)
        toast.warning('Please verify your email first.')
      } else {
        // handled below by Alert
      }
    }
  }

  return (
    <RedirectIfAuthed>
      <div className="space-y-6">
        <h1>Sign in</h1>
        <Section>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
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

            <button className="btn" disabled={isSubmitting || login.isPending}>
              {isSubmitting || login.isPending ? 'Signing in…' : 'Sign in'}
            </button>

            {login.isError && !emailNotVerified && <Alert>{(login.error as Error).message}</Alert>}

            {emailNotVerified && (
              <div className="space-y-2">
                <Alert tone="warn">Your email is not verified.</Alert>
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    await resend.mutateAsync(emailNotVerified)
                    toast('Verification email sent (if the account exists).')
                  }}
                >
                  Resend verification link
                </button>
              </div>
            )}

            <div className="text-sm muted">
              <Link className="text-sky-700 hover:underline" href="/forgot-password">
                Forgot your password?
              </Link>
            </div>
            <p className="text-sm muted">
              No account?{' '}
              <Link className="text-sky-700 hover:underline" href="/register">
                Create one
              </Link>
            </p>
          </form>
        </Section>
      </div>
    </RedirectIfAuthed>
  )
}
