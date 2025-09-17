'use client'
export default function PlanBadge({ plan }: { plan?: 'FREE' | 'PRO' | 'TEAM' }) {
  if (!plan) return null
  const bg = plan === 'FREE' ? '#e2e8f0' : plan === 'PRO' ? '#dbeafe' : '#ede9fe'
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: bg }}>
      {plan}
    </span>
  )
}
