'use client'
import InvoiceEditor from '@/components/invoices/InvoiceEditor'
import { useParams, useRouter } from 'next/navigation'

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        <button className="underline" onClick={() => router.push('/invoices')}>
          ← Back to invoices
        </button>
      </div>
      <InvoiceEditor invoiceId={id} />
    </div>
  )
}
