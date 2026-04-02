import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cerrarSesion } from '@/app/actions/auth'
import { RUTAS } from '@/constants'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(RUTAS.LOGIN)
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol, nombre_completo')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') {
    redirect(RUTAS.CATALOGO)
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="flex w-52 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <Link href={RUTAS.DASHBOARD} className="text-base font-bold text-gray-900 dark:text-white">
            📚 Biblioteca
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          <Link
            href={RUTAS.DASHBOARD}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            📊 Inicio
          </Link>
          <Link
            href="/dashboard/libros"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            📖 Libros
          </Link>
          <Link
            href="/dashboard/editoriales"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            🏢 Editoriales
          </Link>
          <Link
            href="/dashboard/categorias"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            🏷️ Categorías
          </Link>
          <Link
            href="/dashboard/usuarios"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            👥 Usuarios
          </Link>
          <Link
            href="/dashboard/prestamos"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            📋 Préstamos
          </Link>
        </nav>
        <div className="border-t border-gray-200 px-3 py-4 dark:border-gray-800">
          <div className="mb-2 px-3 text-xs text-gray-500 dark:text-gray-400">
            {perfil?.nombre_completo ?? user.email}
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      {/* Contenido principal */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
