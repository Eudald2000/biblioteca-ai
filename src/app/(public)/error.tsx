'use client'

import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      {/* Icono decorativo */}
      <p className="text-5xl" aria-hidden="true">
        📚
      </p>

      <h2
        className="mt-6 text-3xl font-bold text-[#d4952a]"
        style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
      >
        Algo salió mal
      </h2>

      <p className="mt-3 max-w-md text-sm text-[rgba(245,239,230,0.55)]">
        Se produjo un error inesperado al cargar esta página. Puedes intentarlo de nuevo o volver al
        catálogo.
      </p>

      {error.message && (
        <p className="mt-3 max-w-md rounded-lg border border-[rgba(212,149,42,0.15)] bg-[rgba(212,149,42,0.05)] px-4 py-2.5 font-mono text-xs text-[rgba(245,239,230,0.4)]">
          {error.message}
          {error.digest && (
            <span className="ml-2 opacity-60">#{error.digest}</span>
          )}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-lg bg-[#d4952a] px-6 py-2.5 text-sm font-semibold text-[#0d0b08] transition hover:bg-[#f0b445] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b445]"
        >
          Intentar de nuevo
        </button>

        <Link
          href="/catalogo"
          className="rounded-lg border border-[rgba(212,149,42,0.3)] px-6 py-2.5 text-sm font-semibold text-[#f5efe6] transition hover:border-[rgba(212,149,42,0.6)] hover:text-[#f0b445] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b445]"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  )
}
