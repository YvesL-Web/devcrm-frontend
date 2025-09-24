'use client'
import { Input, Textarea } from '@/components/customs/form'
import {
  useClients,
  useDeleteInvoice,
  useInvoice,
  useProjects,
  useUpdateInvoice
} from '@/lib/queries'
import { type InvoiceDto } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type ItemForm = {
  id?: string
  description: string
  quantity: string
  unitPrice: string
  sortOrder?: number
}

export default function InvoiceEditor({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useInvoice(invoiceId)
  const update = useUpdateInvoice(invoiceId)
  const del = useDeleteInvoice(invoiceId)

  // selects data
  const { data: clients } = useClients({ page: 1, pageSize: 200 })
  const { data: projects } = useProjects?.({ page: 1, pageSize: 200 } as any) || { data: undefined }

  // form state
  const [number, setNumber] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<InvoiceDto['status']>('DRAFT')
  const [clientId, setClientId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')

  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  const [items, setItems] = useState<ItemForm[]>([])

  // hydrate on load
  useEffect(() => {
    if (!data) return
    setNumber(data.number || '')
    setCurrency(data.currency || 'USD')
    setIssueDate(data.issueDate || '')
    setDueDate(data.dueDate || '')
    setStatus(data.status)
    setClientId(data.clientId || '')
    setProjectId(data.projectId || '')
    setNotes(data.notes || '')
    setTerms(data.terms || '')
    setItems(
      (data.items || [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((it) => ({
          id: it.id,
          description: it.description,
          quantity: String(Number(it.quantity)),
          unitPrice: String(Number(it.unitPrice)),
          sortOrder: it.sortOrder
        }))
    )
  }, [data])

  const parsedItems = useMemo(() => {
    return items.map((it) => ({
      id: it.id,
      description: it.description,
      quantity: Math.max(0, parseFloat(it.quantity || '0')),
      unitPrice: Math.max(0, parseFloat(it.unitPrice || '0')),
      sortOrder: it.sortOrder
    }))
  }, [items])

  const subtotal = parsedItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
  const total = subtotal // tax handled server-side via PATCH when you add tax controls (optional)

  function addRow() {
    setItems((arr) => [
      ...arr,
      { description: '', quantity: '1', unitPrice: '0', sortOrder: arr.length }
    ])
  }
  function removeRow(idx: number) {
    setItems((arr) => arr.filter((_, i) => i !== idx).map((r, i) => ({ ...r, sortOrder: i })))
  }
  function updateRow(idx: number, patch: Partial<ItemForm>) {
    setItems((arr) => arr.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  async function save() {
    if (!number.trim()) {
      toast.error('Number is required')
      return
    }
    if (parsedItems.length === 0 || !parsedItems.some((i) => i.description.trim())) {
      toast.error('Add at least one line item')
      return
    }
    try {
      const payload = {
        number: number.trim(),
        currency: currency.trim().toUpperCase(),
        issueDate,
        dueDate: dueDate || null,
        status,
        clientId: clientId || null,
        projectId: projectId || null,
        notes: notes.trim() ? notes : null,
        terms: terms.trim() ? terms : null,
        items: parsedItems.map((it, i) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          sortOrder: i
        }))
      }
      await update.mutateAsync(payload)
      toast.success('Invoice updated')
      refetch()
      router.push(`/invoices/${invoiceId}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update invoice')
    }
  }

  async function remove() {
    if (!confirm('Delete this invoice?')) return
    try {
      await del.mutateAsync()
      toast.success('Invoice deleted')
      router.push('/invoices')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  if (isLoading) return <div className="text-sm text-slate-500">Loading…</div>
  if (error) return <div className="text-sm text-rose-700">{(error as Error).message}</div>
  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-3 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-lg font-medium">Edit invoice</div>
          <div className="text-sm text-slate-600">#{data.number}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 text-sm rounded-lg border bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={remove}
          >
            Delete
          </button>
          <button className="btn" onClick={() => router.push(`/invoices/${invoiceId}`)}>
            Cancel
          </button>
          <button className="btn" onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Number</label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div>
            <label className="label">Currency</label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
          </div>
          <div>
            <label className="label">Issue date</label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Due date</label>
            <Input type="date" value={dueDate || ''} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="border rounded-lg h-9 px-2 text-sm w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option>DRAFT</option>
              <option>SENT</option>
              <option>PAID</option>
              <option>OVERDUE</option>
              <option>CANCELED</option>
            </select>
          </div>
          <div />
          <div>
            <label className="label">Client</label>
            <select
              className="border rounded-lg h-9 px-2 text-sm w-full"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">—</option>
              {(clients?.rows ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Project</label>
            <select
              className="border rounded-lg h-9 px-2 text-sm w-full"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">—</option>
              {(projects?.rows ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Items</div>
            <button className="btn" onClick={addRow}>
              + Add line
            </button>
          </div>
          <div className="border rounded mt-2 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left">Description</th>
                  <th className="px-2 py-2 text-right" style={{ width: 120 }}>
                    Qty
                  </th>
                  <th className="px-2 py-2 text-right" style={{ width: 160 }}>
                    Unit price
                  </th>
                  <th className="px-2 py-2 text-right" style={{ width: 160 }}>
                    Amount
                  </th>
                  <th className="px-2 py-2" style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const q = parseFloat(it.quantity || '0') || 0
                  const u = parseFloat(it.unitPrice || '0') || 0
                  const amount = q * u
                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-2">
                        <Input
                          value={it.description}
                          onChange={(e) => updateRow(idx, { description: e.target.value })}
                          placeholder="Description…"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          value={it.quantity}
                          onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          value={it.unitPrice}
                          onChange={(e) => updateRow(idx, { unitPrice: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">{amount.toFixed(2)}</td>
                      <td className="px-2 py-2 text-center">
                        <button
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => removeRow(idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid mt-3" style={{ gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div className="space-y-3">
              <div>
                <label className="label">Notes</label>
                <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div>
                <label className="label">Terms</label>
                <Textarea rows={4} value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 font-medium">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
