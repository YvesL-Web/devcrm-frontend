'use client'
import { Input } from '@/components/customs/form'
import { useClient, useSearchClients } from '@/lib/queries'
import type { Client } from '@/lib/types'
import { useEffect, useMemo, useState } from 'react'

export default function ClientSelect({
  value,
  onChange
}: {
  value: string | null | undefined
  onChange: (clientId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { data: current } = useClient(value || undefined)
  const { data: search } = useSearchClients(q)

  // fermeture auto du menu si on a choisi
  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  const choices = useMemo(() => search?.rows ?? [], [search])

  return (
    <div className="relative">
      <label className="label">Client</label>
      <div className="flex items-center gap-2">
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>
          {current ? current.name || current.company || 'Client' : 'Select client'}
        </button>
        {current ? (
          <button type="button" className="btn" onClick={() => onChange(null)}>
            Clear
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="absolute z-20 mt-2 w-[28rem] border rounded-xl bg-white p-3 shadow">
          <Input
            autoFocus
            placeholder="Type to search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-2 max-h-64 overflow-auto">
            {(choices.length ? choices : []).map((c: Client) => (
              <div
                key={c.id}
                className="px-2 py-2 rounded hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  onChange(c.id)
                  setOpen(false)
                }}
              >
                <div className="text-sm">{c.name}</div>
                <div className="text-xs text-slate-500">
                  {c.company ? `${c.company} • ` : ''}
                  {c.email || 'no email'}
                </div>
              </div>
            ))}
            {q.trim().length >= 2 && !choices.length ? (
              <div className="text-sm text-slate-500 px-2 py-2">No results</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
