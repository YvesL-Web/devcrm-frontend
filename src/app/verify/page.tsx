'use client'
import { apiFetch } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Section } from '@/components/customs/card'
import { Alert } from '@/components/customs/form'
import Link from 'next/link'

export default function VerifyPage() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const router = useRouter()
  const [done, setDone] = useState<'idle' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState<string>('Verifying…')

  const verify = useMutation({
    mutationFn: (t: string) =>
      apiFetch('/auth/verify-email', { method: 'POST', json: { token: t } })
  })

  useEffect(() => {
    if (!token) {
      setDone('err')
      setMsg('Missing token')
      return
    }
    verify
      .mutateAsync(token)
      .then(() => {
        setDone('ok')
        setMsg('Email verified! You can now sign in.')
      })
      .catch((e: any) => {
        setDone('err')
        setMsg(String(e?.message || 'Verification failed'))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="space-y-6">
      <h1>Email verification</h1>
      <Section>
        {done === 'idle' && <div className="muted">Verifying…</div>}
        {done === 'ok' && <Alert tone="success">{msg}</Alert>}
        {done === 'err' && <Alert>{msg}</Alert>}

        <div className="mt-3">
          <Link className="btn" href="/login">
            Go to login
          </Link>
        </div>
      </Section>
    </div>
  )
}
