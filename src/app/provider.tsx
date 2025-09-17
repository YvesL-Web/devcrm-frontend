'use client'

import AuthProvider from '@/components/auth/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s: évite les refetchs agressifs
            gcTime: 5 * 60_000, // 5 min: garbage collect du cache
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="bottom-right" />
      </AuthProvider>
      {process.env.NODE_ENV !== 'production' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}
