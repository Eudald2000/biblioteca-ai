'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavbarPerfil } from '@/components/features/auth/NavbarPerfil'
import { RUTAS } from '@/constants'

interface Props {
  user: { email: string } | null
  perfil: { nombre_completo: string | null; rol: string } | null
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

export function SiteHeaderClient({ user, perfil }: Props) {
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
