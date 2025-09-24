'use client'
import NewInvoiceModal from '@/components/invoices/NewInvoiceModal'
import { downloadInvoicePdf, useInvoices, useProject } from '@/lib/queries'
import Link from 'next/link'
import { useState } from 'react'

export default function ProjectInvoicesPanel({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading, error } = useInvoices({ projectId, page, pageSize })
  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const [openNew, setOpenNew] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-medium">Invoices</div>
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
              <th className="px-3 py-2 w-32"></th>
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
                  No invoices for this project
                </td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
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
                  <td className="px-3 py-2 text-right">
                    <button className="btn" onClick={() => downloadInvoicePdf(inv.id)}>
                      PDF
                    </button>
                  </td>
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

      {/* create with project preselected (and client if project has one) */}
      <NewInvoiceModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        initialProjectId={projectId}
        initialClientId={project?.clientId || undefined}
      />
    </div>
  )
}
