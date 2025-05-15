import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './polyfills'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forest Dining - Solana Bill Split',
  description: 'Split restaurant bills easily using Solana blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="forest">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 