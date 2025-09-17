'use client'
import SendInvoiceModal from '@/components/invoices/SendInvoiceModal'
import PlanGate from '@/components/plan/PlanGate'
import type { Plan } from '@/lib/planClient'
import { downloadInvoicePdf, useInvoice, useMe } from '@/lib/queries'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function InvoicePage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data, isLoading, error } = useInvoice(id)
  const me = useMe()
  const plan = useMemo(() => {
    const orgId = (typeof window !== 'undefined' && localStorage.getItem('org_id')) || undefined
    return me.data?.orgs?.find((o) => o.orgId === orgId)?.plan as Plan | undefined
  }, [me.data])

  const [openSend, setOpenSend] = useState(false)

  useEffect(() => {
    if (error && (error as any).status === 404) notFound()
  }, [error])

  if (isLoading) return <div className="text-sm text-slate-500">Loading…</div>
  if (error) return <div className="text-sm text-rose-700">{(error as Error).message}</div>
  if (!data) return null

  const money = (n: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(Number(n))

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-lg font-medium">Invoice {data.number}</div>
          <div className="text-sm text-slate-600">
            Issue {data.issueDate} • Due {data.dueDate ?? '—'} • Status {data.status}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => downloadInvoicePdf(data.id)}>
            Download PDF
          </button>
          <PlanGate currentPlan={plan} min="PRO" fallback={<div />}>
            <button className="btn" onClick={() => setOpenSend(true)}>
              Send
            </button>
          </PlanGate>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right" style={{ width: 120 }}>
                Qty
              </th>
              <th className="px-3 py-2 text-right" style={{ width: 160 }}>
                Unit
              </th>
              <th className="px-3 py-2 text-right" style={{ width: 160 }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {(data.items ?? []).map((it) => (
              <tr key={it.id} className="border-t">
                <td className="px-3 py-2">{it.description}</td>
                <td className="px-3 py-2 text-right">{Number(it.quantity)}</td>
                <td className="px-3 py-2 text-right">{money(it.unitPrice)}</td>
                <td className="px-3 py-2 text-right">{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="bg-white border rounded-xl p-3 space-y-4">
          <div>
            <div className="font-medium">Notes</div>
            <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
              {data.notes || '—'}
            </div>
          </div>
          <div>
            <div className="font-medium">Terms</div>
            <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
              {data.terms || '—'}
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{money(data.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>{money(data.tax)}</span>
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>Total</span>
            <span>{money(data.total)}</span>
          </div>
        </div>
      </div>

      <SendInvoiceModal
        open={openSend}
        onClose={() => setOpenSend(false)}
        invoiceId={data.id}
        defaultTo={undefined}
        defaultSubject={`Invoice ${data.number}`}
      />
    </div>
  )
}
