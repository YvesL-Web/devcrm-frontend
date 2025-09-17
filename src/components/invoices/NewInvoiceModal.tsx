'use client'
import { Input, Textarea } from '@/components/customs/form'
import { useClients, useCreateInvoice, useProjects } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

function today() {
  return new Date().toISOString().slice(0, 10)
}
function defaultNumber() {
  const y = new Date().getFullYear()
  return `INV-${y}-${Math.floor(Date.now() % 100000)}` // simple; tu pourras améliorer
}

export default function NewInvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const create = useCreateInvoice()
  const [number, setNumber] = useState(defaultNumber())
  const [currency, setCurrency] = useState('USD')
  const [issueDate, setIssueDate] = useState(today())
  const [dueDate, setDueDate] = useState('')
  const [clientId, setClientId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')

  const [taxRatePct, setTaxRatePct] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  type ItemForm = { description: string; quantity: string; unitPrice: string }
  const [items, setItems] = useState<ItemForm[]>([
    { description: '', quantity: '1', unitPrice: '0' }
  ])

  useEffect(() => {
    if (open) {
      setNumber(defaultNumber())
      setCurrency('USD')
      setIssueDate(today())
      setDueDate('')
      setClientId('')
      setProjectId('')
      setTaxRatePct(0)
      setNotes('')
      setTerms('')
      setItems([{ description: '', quantity: '1', unitPrice: '0' }])
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const { data: clients } = useClients({ page: 1, pageSize: 100 })
  const { data: projects } = useProjects?.({ page: 1, pageSize: 100 } as any) || { data: undefined } // si tu as déjà un hook useProjects

  const parsedItems = useMemo(() => {
    return items.map((it) => ({
      description: it.description,
      quantity: Math.max(0, parseFloat(it.quantity || '0')),
      unitPrice: Math.max(0, parseFloat(it.unitPrice || '0'))
    }))
  }, [items])

  const subtotal = parsedItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
  const tax = subtotal * (taxRatePct / 100)
  const total = subtotal + tax

  if (!open) return null

  function addRow() {
    setItems((arr) => [...arr, { description: '', quantity: '1', unitPrice: '0' }])
  }
  function removeRow(idx: number) {
    setItems((arr) => arr.filter((_, i) => i !== idx))
  }
  function updateRow(idx: number, patch: Partial<ItemForm>) {
    setItems((arr) => arr.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  async function save() {
    if (!number.trim()) return
    if (parsedItems.length === 0 || !parsedItems.some((i) => i.description.trim())) {
      toast.error('Add at least one line item')
      return
    }
    try {
      const inv = await create.mutateAsync({
        number: number.trim(),
        currency: currency.trim().toUpperCase(),
        issueDate,
        dueDate: dueDate || null,
        status: 'DRAFT',
        clientId: clientId || null,
        projectId: projectId || null,
        notes: notes.trim() ? notes : null,
        terms: terms.trim() ? terms : null,
        items: parsedItems.map((it, i) => ({ ...it, sortOrder: i })),
        taxRatePct
      })
      toast.success('Invoice created')
      onClose()
      router.push(`/invoices/${inv.id}`)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create invoice')
    }
  }

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[96%] xl:w-[960px] bg-white border rounded-xl shadow-xl p-4">
        <div className="text-base font-medium">New invoice</div>

        <div className="mt-3 grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
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
              <div className="flex items-center justify-between mt-2">
                <span>Tax (%)</span>
                <Input
                  value={String(taxRatePct)}
                  onChange={(e) => setTaxRatePct(Number(e.target.value || 0))}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span>Tax</span>
                <span>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(tax)}
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

        <div className="flex justify-end gap-2 pt-3">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={save} disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}
