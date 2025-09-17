import { clsx } from 'clsx'
import React from 'react'

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx('btn', className)} {...props} />
}
