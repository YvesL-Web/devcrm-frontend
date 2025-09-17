'use client'
import Link from 'next/link'

export type Crumb = { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="text-sm text-slate-500 flex items-center gap-2">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {c.href ? (
            <Link href={c.href} className="hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className="text-slate-700">{c.label}</span>
          )}
          {i < items.length - 1 ? <span>/</span> : null}
        </span>
      ))}
    </div>
  )
}
