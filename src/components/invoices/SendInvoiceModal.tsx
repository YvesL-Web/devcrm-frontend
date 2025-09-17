'use client'
import { Input, Textarea } from '@/components/customs/form'
import { useSendInvoiceEmail } from '@/lib/queries'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SendInvoiceModal({
  open,
  onClose,
  invoiceId,
  defaultTo,
  defaultSubject
}: {
  open: boolean
  onClose: () => void
  invoiceId: string
  defaultTo?: string
  defaultSubject?: string
}) {
  const send = useSendInvoiceEmail(invoiceId)
  const [to, setTo] = useState(defaultTo || '')
  const [subject, setSubject] = useState(defaultSubject || 'Your invoice')
  const [message, setMessage] = useState('Please find attached your invoice.')

  useEffect(() => {
    if (open) {
      setTo(defaultTo || '')
      setSubject(defaultSubject || 'Your invoice')
      setMessage('Please find attached your invoice.')
    }
  }, [open, defaultTo, defaultSubject])

  if (!open) return null

  async function submit() {
    try {
      await send.mutateAsync({
        to: to.trim() || undefined,
        subject: subject.trim() || undefined,
        message
      })
      toast.success('Invoice sent')
      onClose()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send')
    }
  }

  return (
    <div className="fixed inset-0 z-[140]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-16 -translate-x-1/2 w-[92%] sm:w-[560px] bg-white border rounded-xl shadow-xl p-4">
        <div className="text-base font-medium">Send invoice</div>
        <div className="mt-3 space-y-3">
          <div>
            <label className="label">To</label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="client@example.com (optional if client has email)"
            />
          </div>
          <div>
            <label className="label">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="label">Message</label>
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={submit} disabled={send.isPending}>
            {send.isPending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
