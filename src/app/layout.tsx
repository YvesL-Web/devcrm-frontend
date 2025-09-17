import Providers from '@/app/provider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DevCRM',
  description: 'Lightweight CRM for devs',
  icons: { icon: [{ url: '/favicon.ico' }] },
  other: { 'theme-color': '#ffffff' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <main style={{ paddingBlock: '1.5rem' }}>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
