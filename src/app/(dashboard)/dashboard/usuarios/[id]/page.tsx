import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'
import { PrestamosUsuarioTabla } from '@/components/features/usuarios/PrestamosUsuarioTabla'

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(iso))

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

type Params = Promise<{ id: string }>

export default async function DetalleUsuarioPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const [usuarioRes, emailRes, prestamosRes, comprasRes] = await Promise.all([
    supabase
      .from('usuarios')
      .select('id, nombre_completo, rol, baneado, creado_en, actualizado_en')
      .eq('id', id)
      .single(),
    supabase.rpc('detalle_usuario_admin', { p_usuario_id: id }),
    supabase
      .from('prestamos')
      .select('id, estado, fecha_prestamo, fecha_vencimiento, fecha_devolucion, precio_prestamo, libros(titulo)')
      .eq('usuario_id', id)
      .order('fecha_prestamo', { ascending: false }),
    supabase
      .from('compras')
      .select('id, creado_en, precio_compra, libros(titulo)')
      .eq('usuario_id', id)
      .order('creado_en', { ascending: false }),
  ])

  if (!usuarioRes.data) notFound()

  const usuario = usuarioRes.data
  const email = emailRes.data?.[0]?.email ?? null
  const prestamos = prestamosRes.data ?? []
  const compras = comprasRes.data ?? []

  const prestamosActivos = prestamos.filter((p) => p.estado === 'activo').length
  const prestamosVencidos = prestamos.filter((p) => p.estado === 'vencido').length
  const totalDineroPrestamos = prestamos.reduce((acc, p) => acc + p.precio_prestamo, 0)
  const totalDineroCompras = compras.reduce((acc, c) => acc + c.precio_compra, 0)

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={RUTAS.USUARIOS_ADMIN}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Volver a usuarios
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {usuario.nombre_completo ?? 'Sin nombre'}
          </h2>
          {email && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{email}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            usuario.rol === 'admin'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
          </span>
          {usuario.baneado && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
              Baneado
            </span>
          )}
        </div>
      </div>

      {/* Ficha */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Información de cuenta</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Registrado</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{formatFecha(usuario.creado_en)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Préstamos activos</dt>
            <dd className="mt-1 font-medium text-blue-600 dark:text-blue-400">{prestamosActivos}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Total préstamos</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{prestamos.length}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Total compras</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{compras.length}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Gasto en préstamos</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{formatEuros(totalDineroPrestamos)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Gasto en compras</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{formatEuros(totalDineroCompras)}</dd>
          </div>
        </dl>
        {prestamosVencidos > 0 && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠ {prestamosVencidos} préstamo{prestamosVencidos > 1 ? 's' : ''} vencido{prestamosVencidos > 1 ? 's' : ''} sin devolver.
          </p>
        )}
      </div>

      {/* Préstamos */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Préstamos ({prestamos.length})
        </h3>
        <PrestamosUsuarioTabla prestamos={prestamos as Parameters<typeof PrestamosUsuarioTabla>[0]['prestamos']} />
      </div>

      {/* Compras */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Compras ({compras.length})
        </h3>
        {compras.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Sin compras registradas.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900">
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Libro</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Precio pagado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {compras.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {(c.libros as { titulo: string } | null)?.titulo ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatFecha(c.creado_en)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatEuros(c.precio_compra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
