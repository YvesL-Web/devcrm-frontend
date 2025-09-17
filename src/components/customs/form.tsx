'use client'
import { FieldError } from 'react-hook-form'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm" style={{ color: '#334155' }}>
      {children}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="border rounded-lg px-3 py-2 text-sm w-full" />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="border rounded-lg px-3 py-2 text-sm w-full" />
}

export function FormError({ error }: { error?: FieldError }) {
  if (!error) return null
  return (
    <p className="text-xs" style={{ color: '#b91c1c' }}>
      {error.message}
    </p>
  )
}

export function Alert({
  tone = 'error',
  children
}: {
  tone?: 'error' | 'warn' | 'success'
  children: React.ReactNode
}) {
  const styles =
    tone === 'success'
      ? { color: '#166534', background: '#ecfdf5', border: '#bbf7d0' }
      : tone === 'warn'
      ? { color: '#92400e', background: '#fff7ed', border: '#fde68a' }
      : { color: '#b91c1c', background: '#fef2f2', border: '#fecaca' }
  return (
    <div
      className="text-sm rounded-xl px-3 py-2"
      style={{
        color: styles.color,
        background: styles.background,
        border: `1px solid ${styles.border}`
      }}
    >
      {children}
    </div>
  )
}
