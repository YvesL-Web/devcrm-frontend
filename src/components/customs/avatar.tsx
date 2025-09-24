'use client'

export default function Avatar({
  name,
  email,
  size = 28
}: {
  name?: string | null
  email: string | null
  size?: number
}) {
  const label = (name || email || '?').trim()
  const initials =
    label
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || '?'
  return (
    <div
      className="rounded-full bg-slate-200 text-slate-700 grid place-items-center font-medium"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.4)) }}
      title={label}
    >
      {initials}
    </div>
  )
}
