import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0b08] px-4">
      <div className="mb-8 text-center">
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-tight text-[#f5efe6] hover:text-[#f0b445] transition-colors">
            📚 Biblioteca Virtual
          </h1>
        </Link>
        <p className="mt-1 text-sm text-[rgba(245,239,230,0.5)]">
          Tu biblioteca digital de confianza
        </p>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-[rgba(212,149,42,0.12)] bg-[rgba(255,255,255,0.04)] p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
