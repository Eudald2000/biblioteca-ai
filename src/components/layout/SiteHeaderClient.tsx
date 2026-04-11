'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavbarPerfil } from '@/components/features/auth/NavbarPerfil'
import { RUTAS } from '@/constants'

interface Props {
  user: { email: string } | null
  perfil: { nombre_completo: string | null; rol: string } | null
  carritoCount: number
}

function iniciales(nombre: string | null): string {
  if (!nombre) return '?'
  const partes = nombre.trim().split(' ').filter(Boolean)
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: RUTAS.CATALOGO, label: 'Catálogo' },
]

export function SiteHeaderClient({ user, perfil, carritoCount }: Props) {
  const pathname = usePathname()
  const esAdmin = perfil?.rol === 'admin'

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="sh-nav">
        <div className="sh-inner">
          {/* Logo — izquierda */}
          <Link href="/" className="sh-logo">
            <span>❧</span> Biblioteca <span>Virtual</span>
          </Link>

          {/* Nav links — centro */}
          <div className="sh-center">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`sh-link${isActive(href) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth — derecha */}
          <div className="sh-right">
            {user ? (
              <>
                {esAdmin && (
                  <Link href={RUTAS.DASHBOARD} className="sh-btn-ghost">
                    Dashboard
                  </Link>
                )}
                <Link
                  href={RUTAS.CARRITO}
                  className="relative p-1.5 text-[rgba(245,239,230,0.5)] transition hover:text-[#f5efe6]"
                  aria-label="Carrito"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {carritoCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d4952a] text-[10px] font-bold text-[#0d0b08]">
                      {carritoCount > 9 ? '9+' : carritoCount}
                    </span>
                  )}
                </Link>
                <NavbarPerfil
                  iniciales={iniciales(perfil?.nombre_completo ?? null)}
                  nombre={perfil?.nombre_completo ?? null}
                  email={user.email ?? ''}
                />
              </>
            ) : (
              <>
                <Link href={RUTAS.LOGIN} className="sh-btn-ghost">Iniciar sesión</Link>
                <Link href={RUTAS.REGISTRO} className="sh-btn-primary">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
