'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { marcarDevuelto } from '@/app/actions/prestamos'

type PrestamoFila = {
  id: string
  estado: 'activo' | 'devuelto' | 'vencido'
  fecha_prestamo: string
  fecha_vencimiento: string
  fecha_devolucion: string | null
  precio_prestamo: number
  libros: { titulo: string } | null
}

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(iso))

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

const estadoBadge = {
  activo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  devuelto: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  vencido: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
} as const

export function PrestamosUsuarioTabla({ prestamos }: { prestamos: PrestamoFila[] }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: string; mensaje: string; tipo: 'ok' | 'err' } | null>(null)

  function showFeedback(id: string, mensaje: string, tipo: 'ok' | 'err') {
    setFeedback({ id, mensaje, tipo })
    setTimeout(() => setFeedback(null), 4000)
  }

  function handleDevuelto(id: string) {
    startTransition(async () => {
      const res = await marcarDevuelto(id)
      showFeedback(id, res?.exito ?? res?.error ?? 'Error.', res?.exito ? 'ok' : 'err')
    })
  }

  if (prestamos.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">Sin préstamos registrados.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900">
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
          {prestamos.map((p) => {
            const fb = feedback?.id === p.id ? feedback : null
            const pendiente = p.estado === 'activo' || p.estado === 'vencido'
            return (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {p.libros?.titulo ?? '—'}
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
          })}
        </tbody>
      </table>
    </div>
  )
}
