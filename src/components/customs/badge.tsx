import { clsx } from 'clsx'

export function Badge({
  children,
  variant
}: {
  children: React.ReactNode
  variant?: 'feature' | 'fix' | 'chore'
}) {
  return <span className={clsx('tag', variant && `tag-${variant}`)}>{children}</span>
}
