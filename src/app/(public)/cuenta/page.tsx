import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cerrarSesion } from '@/app/actions/auth'
import { PerfilForm } from '@/components/features/auth/PerfilForm'
import { RUTAS } from '@/constants'

export const metadata = { title: 'Mi perfil — Biblioteca Virtual' }

function iniciales(nombre: string | null): string {
  if (!nombre) return '?'
  const partes = nombre.trim().split(' ').filter(Boolean)
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(RUTAS.LOGIN)

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol, creado_en')
    .eq('id', user.id)
    .single()

  const esAdmin = usuario?.rol === 'admin'

  return (
    <div className="mx-auto max-w-lg">
      {/* Avatar y datos principales */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          {iniciales(usuario?.nombre_completo ?? null)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {usuario?.nombre_completo ?? 'Usuario'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            esAdmin
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {esAdmin ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
          Editar información
        </h3>

        <div className="mb-5 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {user.email}
          </p>
          <p className="text-xs text-gray-400">El email no se puede cambiar desde aquí.</p>
        </div>

        <PerfilForm nombreActual={usuario?.nombre_completo ?? null} />
      </div>

      {/* Zona peligrosa */}
      <div className="mt-6 rounded-xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-gray-900">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Sesión</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Cierra tu sesión en este dispositivo.
        </p>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
