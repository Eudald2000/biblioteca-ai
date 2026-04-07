import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d0b08] text-[#f5efe6]">
      {/* Header mínimo */}
      <header className="border-b border-[rgba(212,149,42,0.15)] px-6 py-4">
        <Link
          href="/"
          className="font-[var(--font-cormorant),Georgia,serif] text-xl font-semibold tracking-wide text-[#d4952a] hover:text-[#f0b445] transition-colors"
        >
          Biblioteca Virtual
        </Link>
      </header>

      {/* Contenido centrado */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p
          className="text-[clamp(6rem,20vw,12rem)] font-bold leading-none text-[#d4952a] select-none"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-[#f5efe6] sm:text-3xl">
          Página no encontrada
        </h1>

        <p className="mt-3 max-w-sm text-sm text-[rgba(245,239,230,0.55)] sm:text-base">
          La página que buscas no existe o ha sido movida. Comprueba la URL o vuelve al inicio.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-[#d4952a] px-6 py-2.5 text-sm font-semibold text-[#0d0b08] transition hover:bg-[#f0b445] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b445]"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  )
}
