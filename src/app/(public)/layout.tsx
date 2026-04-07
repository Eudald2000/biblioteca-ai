import type { ReactNode } from 'react'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
})

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`flex min-h-screen flex-col bg-[#0d0b08] text-[#f5efe6] ${cormorant.variable} ${dmSans.variable}`}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
