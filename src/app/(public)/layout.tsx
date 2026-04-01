import type { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarPerfil } from '@/components/features/auth/NavbarPerfil'
import { RUTAS } from '@/constants'

function iniciales(nombre: string | null): string {
  if (!nombre) return '?'
  const partes = nombre.trim().split(' ').filter(Boolean)
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let perfil: { nombre_completo: string | null; rol: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('usuarios')
      .select('nombre_completo, rol')
      .eq('id', user.id)
      .single()
    perfil = data
  }

  const esAdmin = perfil?.rol === 'admin'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href={RUTAS.CATALOGO} className="text-lg font-bold text-gray-900 dark:text-white">
            📚 Biblioteca Virtual
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {esAdmin && (
                  <Link
                    href={RUTAS.DASHBOARD}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
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
              <Link
                href={RUTAS.LOGIN}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
