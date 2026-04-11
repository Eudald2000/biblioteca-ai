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

  const [{ data: usuario }, { data: prestamos }, { data: compras }] = await Promise.all([
    supabase.from('usuarios').select('nombre_completo, rol, creado_en').eq('id', user.id).single(),
    supabase
      .from('prestamos')
      .select('id, estado, fecha_prestamo, fecha_vencimiento, fecha_devolucion, precio_prestamo, libros(titulo, autor, portada_url)')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false })
      .limit(20),
    supabase
      .from('compras')
      .select('id, precio_compra, creado_en, libros(titulo, autor, portada_url)')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false })
      .limit(20),
  ])

  const esAdmin = usuario?.rol === 'admin'

  return (
    <div className="mx-auto max-w-2xl">
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
      {/* Historial de préstamos */}
      <div className="mt-6 rounded-xl border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.03)] p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#f5efe6]">Mis préstamos</h3>
        {!prestamos || prestamos.length === 0 ? (
          <p className="text-sm text-[rgba(245,239,230,0.4)]">Aún no tienes préstamos.</p>
        ) : (
          <ul className="divide-y divide-[rgba(212,149,42,0.08)]">
            {prestamos.map((p) => {
              const libro = p.libros as { titulo: string; autor: string; portada_url: string | null } | null
              const estadoClases = {
                activo: 'bg-blue-900/30 text-blue-400',
                devuelto: 'bg-green-900/30 text-green-400',
                vencido: 'bg-red-900/30 text-red-400',
              }[p.estado] ?? 'bg-[rgba(255,255,255,0.05)] text-[rgba(245,239,230,0.4)]'
              return (
                <li key={p.id} className="flex items-start gap-3 py-3">
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <p className="truncate text-sm font-medium text-[#f5efe6]">{libro?.titulo ?? '—'}</p>
                    <p className="truncate text-xs text-[rgba(245,239,230,0.4)]">{libro?.autor ?? '—'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[rgba(245,239,230,0.4)]">
                      <span>Desde {new Date(p.fecha_prestamo).toLocaleDateString('es-ES')}</span>
                      <span>·</span>
                      <span>Vence {new Date(p.fecha_vencimiento).toLocaleDateString('es-ES')}</span>
                      {p.fecha_devolucion && (
                        <>
                          <span>·</span>
                          <span>Devuelto {new Date(p.fecha_devolucion).toLocaleDateString('es-ES')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoClases}`}>
                      {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    </span>
                    <span className="text-xs font-medium text-[#f0b445]">{Number(p.precio_prestamo).toFixed(2)} €</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Historial de compras */}
      <div className="mt-6 rounded-xl border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.03)] p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#f5efe6]">Mis compras</h3>
        {!compras || compras.length === 0 ? (
          <p className="text-sm text-[rgba(245,239,230,0.4)]">Aún no tienes compras.</p>
        ) : (
          <ul className="divide-y divide-[rgba(212,149,42,0.08)]">
            {compras.map((c) => {
              const libro = c.libros as { titulo: string; autor: string; portada_url: string | null } | null
              return (
                <li key={c.id} className="flex items-start gap-3 py-3">
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <p className="truncate text-sm font-medium text-[#f5efe6]">{libro?.titulo ?? '—'}</p>
                    <p className="truncate text-xs text-[rgba(245,239,230,0.4)]">{libro?.autor ?? '—'}</p>
                    <p className="mt-1 text-xs text-[rgba(245,239,230,0.4)]">
                      {new Date(c.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[rgba(245,239,230,0.8)]">
                    {Number(c.precio_compra).toFixed(2)} €
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
