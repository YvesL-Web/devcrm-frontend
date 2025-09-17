'use client'
import { Input, Textarea } from '@/components/customs/form'
import { useClient, useDeleteClient, useUpdateClient } from '@/lib/queries'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ClientDetailsDrawer({
  open,
  clientId,
  onClose
}: {
  open: boolean
  clientId: string | null
  onClose: () => void
}) {
  const id = clientId || undefined
  const { data, isLoading, error, refetch } = useClient(id)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && data) {
      setName(data.name || '')
      setEmail(data.email || '')
      setCompany(data.company || '')
      setPhone(data.phone || '')
      setAddressLine1(data.addressLine1 || '')
      setAddressLine2(data.addressLine2 || '')
      setCity(data.city || '')
      setState(data.state || '')
      setPostalCode(data.postalCode || '')
      setCountry(data.country || '')
      setNotes(data.notes || '')
    }
  }, [open, data])

  const update = useUpdateClient(id || '')
  const del = useDeleteClient(id || '')

  async function save() {
    if (!id) return
    try {
      await update.mutateAsync({
        name: name.trim() || data?.name,
        email: email.trim() ? email : null,
        company: company.trim() ? company : null,
        phone: phone.trim() ? phone : null,
        addressLine1: addressLine1.trim() ? addressLine1 : null,
        addressLine2: addressLine2.trim() ? addressLine2 : null,
        city: city.trim() ? city : null,
        state: state.trim() ? state : null,
        postalCode: postalCode.trim() ? postalCode : null,
        country: country.trim() ? country : null,
        notes: notes.trim() ? notes : null
      })
      toast.success('Client updated')
      refetch()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update client')
    }
  }

  async function remove() {
    if (!id) return
    if (!confirm('Delete this client? Projects will be detached.')) return
    try {
      await del.mutateAsync()
      toast.success('Client deleted')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete client')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white border-l shadow-xl">
        <div className="h-12 border-b flex items-center justify-between px-3">
          <div className="font-medium">Client details</div>
          <button className="p-1 rounded hover:bg-slate-100" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-rose-700">{(error as Error).message}</div>
          ) : (
            <>
              <div>
                <label className="label">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label">Company</label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div>
                <label className="label">Address line 1</label>
                <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
              </div>
              <div>
                <label className="label">Address line 2</label>
                <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="label">State/Province</label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} />
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Postal code</label>
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
                <div>
                  <label className="label">Country</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  className="px-3 py-2 text-sm rounded-lg border bg-rose-50 text-rose-700 hover:bg-rose-100"
                  onClick={remove}
                >
                  Delete client
                </button>
                <div className="flex gap-2">
                  <button className="btn" onClick={onClose}>
                    Close
                  </button>
                  <button className="btn" onClick={save} disabled={update.isPending}>
                    {update.isPending ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
