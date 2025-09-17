import { clsx } from 'clsx'
import * as React from 'react'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card', className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card-body', className)} {...props} />
}

export function Section({
  className,
  children,
  title
}: React.PropsWithChildren<{ className?: string; title?: React.ReactNode }>) {
  return (
    <div className={clsx('section', className)}>
      {title ? <div className="title">{title}</div> : null}
      <div className="content">{children}</div>
    </div>
  )
}
