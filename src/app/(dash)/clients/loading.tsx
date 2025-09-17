import { Skeleton } from '@/components/customs/skeleton'
export default function Loading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '1rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
