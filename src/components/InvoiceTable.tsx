import { Section } from '@/components/customs/card'

export type InvoiceRow = {
  id: string
  number: string
  total: number
  currency: string
  status: string
  issuedAt?: string
  pdfUrl?: string
}
function money(n: number, currency: string, locale?: string) {
  try {
    return new Intl.NumberFormat(locale || 'en', { style: 'currency', currency }).format(n / 100)
  } catch {
    return `${(n / 100).toFixed(2)} ${currency}`
  }
}
export default function InvoiceTable({ rows, locale }: { rows: InvoiceRow[]; locale?: string }) {
  return (
    <Section title="Invoices">
      {rows.length === 0 ? (
        <div className="muted">No invoices to show.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Status</th>
              <th className="num">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.number}</td>
                <td>{r.issuedAt || '—'}</td>
                <td>{r.status}</td>
                <td className="num">{money(r.total, r.currency, locale)}</td>
                <td>
                  {r.pdfUrl ? (
                    <a
                      className="text-sky-700 hover:underline"
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noopener"
                    >
                      PDF
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  )
}
