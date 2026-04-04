'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { marcarDevuelto } from '@/app/actions/prestamos'

type PrestamoFila = {
  id: string
  estado: 'activo' | 'devuelto' | 'vencido'
  fecha_prestamo: string
  fecha_vencimiento: string
  fecha_devolucion: string | null
  precio_prestamo: number
  creado_en: string
  usuarios: { id: string; nombre_completo: string | null } | null
  libros: { id: string; titulo: string; autor: string } | null
}

type Props = {
  prestamos: PrestamoFila[]
  total: number
  porPagina: number
  filtros: { estado: string; pagina: number }
}

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

const estadoBadge = {
  activo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  devuelto: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  vencido: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
} as const

export function PrestamosTabla({ prestamos, total, porPagina, filtros }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [estado, setEstado] = useState(filtros.estado)
  const [feedback, setFeedback] = useState<{ id: string; mensaje: string; tipo: 'ok' | 'err' } | null>(null)

  const totalPaginas = Math.ceil(total / porPagina)

  function navegar(overrides: Partial<typeof filtros> = {}) {
    const params = new URLSearchParams(window.location.search)
    const e = overrides.estado ?? estado
    const p = overrides.pagina ?? 1
    if (e) params.set('estado', e); else params.delete('estado')
    if (p > 1) params.set('pagina_p', String(p)); else params.delete('pagina_p')
    startTransition(() => router.push(`/dashboard/operaciones?${params.toString()}`))
  }

  function handleDevuelto(id: string) {
    startTransition(async () => {
      const res = await marcarDevuelto(id)
      setFeedback({ id, mensaje: res?.exito ?? res?.error ?? 'Error.', tipo: res?.exito ? 'ok' : 'err' })
      setTimeout(() => setFeedback(null), 4000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Préstamos <span className="ml-1 text-sm font-normal text-gray-500">({total})</span>
        </h3>
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); navegar({ estado: e.target.value }) }}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="devuelto">Devuelto</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900">
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Usuario</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Libro</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Préstamo</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Vencimiento</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Devolución</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Precio</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {prestamos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  No hay préstamos.
                </td>
              </tr>
            ) : (
              prestamos.map((p) => {
                const fb = feedback?.id === p.id ? feedback : null
                const pendiente = p.estado === 'activo' || p.estado === 'vencido'
                return (
                  <tr key={p.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3">
                      {p.usuarios ? (
                        <Link
                          href={`/dashboard/usuarios/${p.usuarios.id}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {p.usuarios.nombre_completo ?? '—'}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {p.libros?.titulo ?? '—'}
                      {p.libros?.autor && (
                        <p className="text-xs font-normal text-gray-400">{p.libros.autor}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        estadoBadge[p.estado],
                      )}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatFecha(p.fecha_prestamo)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatFecha(p.fecha_vencimiento)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {p.fecha_devolucion ? formatFecha(p.fecha_devolucion) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatEuros(p.precio_prestamo)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        {pendiente && (
                          <button
                            disabled={isPending}
                            onClick={() => handleDevuelto(p.id)}
                            className="rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            ✓ Devuelto
                          </button>
                        )}
                        {fb && (
                          <p className={cn(
                            'text-xs',
                            fb.tipo === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                          )}>
                            {fb.mensaje}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {filtros.pagina} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <button
              disabled={filtros.pagina <= 1}
              onClick={() => navegar({ pagina: filtros.pagina - 1 })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <button
              disabled={filtros.pagina >= totalPaginas}
              onClick={() => navegar({ pagina: filtros.pagina + 1 })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
