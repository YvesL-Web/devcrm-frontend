'use client'
import { Input } from '@/components/customs/form'
import { useClients, useCreateClient } from '@/lib/queries'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ClientsIndexPage() {
  const [q, setQ] = useState('')
  const { data, isLoading, error } = useClients({ page: 1, pageSize: 50, q })
  const create = useCreateClient()
  const [quickName, setQuickName] = useState('')
  const [quickEmail, setQuickEmail] = useState('')

  const quickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickName.trim()) return
    try {
      await create.mutateAsync({ name: quickName.trim(), email: quickEmail.trim() || undefined })
      setQuickName('')
      setQuickEmail('')
      toast.success('Client created')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create')
    }
  }

  return (
    <div className=" p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search (name, company, email, phone)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="border rounded-xl p-3 bg-white">
        <div className="font-medium mb-2">Quick add</div>
        <form
          onSubmit={quickAdd}
          className="grid"
          style={{ gridTemplateColumns: '2fr 2fr 1fr', gap: 12 }}
        >
          <Input
            placeholder="Name"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
          />
          <Input
            placeholder="Email (optional)"
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
          />
          <button className="btn" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Add'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="muted">Loading…</div>
      ) : error ? (
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {(error as Error).message}
        </div>
      ) : !data?.rows.length ? (
        <div className="muted">No clients yet.</div>
      ) : (
        <ul
          className="grid"
          style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1rem' }}
        >
          {data.rows.map((c) => (
            <li key={c.id} className="border rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.name}</div>
                <Link className="btn" href={`/clients/${c.id}`}>
                  Open
                </Link>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {c.company ? `${c.company} • ` : ''}
                {c.email || 'no email'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
