'use client'

import { Input } from '@/components/customs/form'
import NewInvoiceModal from '@/components/invoices/NewInvoiceModal'
import { useInvoices } from '@/lib/queries'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function InvoicesPage() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [status, setStatus] = useState<string>('') // all
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const { data, isLoading, error } = useInvoices({
    q: debouncedQ || undefined,
    status: (status || undefined) as any,
    page,
    pageSize
  })
  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const [openNew, setOpenNew] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-3 flex items-center gap-2">
        <Input placeholder="Search by number…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="border rounded-lg h-9 px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option>DRAFT</option>
          <option>SENT</option>
          <option>PAID</option>
          <option>OVERDUE</option>
          <option>CANCELED</option>
        </select>
        <div className="flex-1" />
        <button className="btn" onClick={() => setOpenNew(true)}>
          + New invoice
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Number</th>
              <th className="px-3 py-2 text-left">Issue</th>
              <th className="px-3 py-2 text-left">Due</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-rose-700">
                  {(error as Error).message}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  No invoices
                </td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link className="hover:underline" href={`/invoices/${inv.id}`}>
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{inv.issueDate}</td>
                  <td className="px-3 py-2">{inv.dueDate ?? '—'}</td>
                  <td className="px-3 py-2">{inv.status}</td>
                  <td className="px-3 py-2 text-right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: inv.currency
                    }).format(Number(inv.total))}
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-slate-600">
          <span>{total} total</span>
          <div className="flex items-center gap-1">
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="btn"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <NewInvoiceModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  )
}
