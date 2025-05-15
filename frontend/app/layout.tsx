import type { Metadata } from 'next'
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import './polyfills'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AA Go - Solana Bill Split',
  description: 'Split restaurant bills easily using Solana blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="forest">
      <body className={`${inter.className} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 