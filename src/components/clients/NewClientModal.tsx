'use client'
import { Input, Textarea } from '@/components/customs/form'
import { useCreateClient } from '@/lib/queries'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function NewClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateClient()
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
    if (open) {
      setName('')
      setEmail('')
      setCompany('')
      setPhone('')
      setAddressLine1('')
      setAddressLine2('')
      setCity('')
      setState('')
      setPostalCode('')
      setCountry('')
      setNotes('')
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

  if (!open) return null

  async function save() {
    if (!name.trim()) return
    try {
      await create.mutateAsync({
        name: name.trim(),
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
      toast.success('Client created')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create client')
    }
  }

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-12 -translate-x-1/2 w-[92%] sm:w-[680px] bg-white border rounded-xl shadow-xl p-4">
        <div className="text-base font-medium">New client</div>
        <div className="mt-3 space-y-3">
          <div>
            <label className="label">Name</label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
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
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" onClick={save} disabled={create.isPending}>
              {create.isPending ? 'Saving…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
