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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(212,149,42,0.15)] text-2xl font-bold text-[#f0b445]">
          {iniciales(usuario?.nombre_completo ?? null)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#f5efe6]">
            {usuario?.nombre_completo ?? 'Usuario'}
          </h2>
          <p className="text-sm text-[rgba(245,239,230,0.5)]">{user.email}</p>
          <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            esAdmin
              ? 'bg-[rgba(212,149,42,0.1)] text-[#f0b445]'
              : 'bg-[rgba(255,255,255,0.05)] text-[rgba(245,239,230,0.5)]'
          }`}>
            {esAdmin ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="rounded-xl border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.03)] p-6 shadow-sm">
        <h3 className="mb-5 text-base font-semibold text-[#f5efe6]">
          Editar información
        </h3>

        <div className="mb-5 flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[rgba(245,239,230,0.5)]">Email</span>
          <p className="rounded-lg border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[rgba(245,239,230,0.4)]">
            {user.email}
          </p>
          <p className="text-xs text-[rgba(245,239,230,0.3)]">El email no se puede cambiar desde aquí.</p>
        </div>

        <PerfilForm nombreActual={usuario?.nombre_completo ?? null} />
      </div>

      {/* Zona peligrosa */}
      <div className="mt-6 rounded-xl border border-red-900/30 bg-[rgba(255,255,255,0.03)] p-6 shadow-sm">
        <h3 className="mb-1 text-base font-semibold text-[#f5efe6]">Sesión</h3>
        <p className="mb-4 text-sm text-[rgba(245,239,230,0.5)]">
          Cierra tu sesión en este dispositivo.
        </p>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="rounded-lg border border-red-800/50 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
