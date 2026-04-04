'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type CompraFila = {
  id: string
  precio_compra: number
  creado_en: string
  usuarios: { id: string; nombre_completo: string | null } | null
  libros: { id: string; titulo: string; autor: string } | null
}

type Props = {
  compras: CompraFila[]
  total: number
  porPagina: number
  filtros: { pagina: number }
}

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export function ComprasTabla({ compras, total, porPagina, filtros }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const totalPaginas = Math.ceil(total / porPagina)

  function navegar(pagina: number) {
    const params = new URLSearchParams(window.location.search)
    if (pagina > 1) params.set('pagina_c', String(pagina)); else params.delete('pagina_c')
    startTransition(() => router.push(`/dashboard/operaciones?${params.toString()}`))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Compras <span className="ml-1 text-sm font-normal text-gray-500">({total})</span>
        </h3>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900">
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Usuario</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Libro</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Fecha</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Precio pagado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {compras.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  No hay compras.
                </td>
              </tr>
            ) : (
              compras.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="px-4 py-3">
                    {c.usuarios ? (
                      <Link
                        href={`/dashboard/usuarios/${c.usuarios.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {c.usuarios.nombre_completo ?? '—'}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {c.libros?.titulo ?? '—'}
                    {c.libros?.autor && (
                      <p className="text-xs font-normal text-gray-400">{c.libros.autor}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatFecha(c.creado_en)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatEuros(c.precio_compra)}</td>
                </tr>
              ))
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
              onClick={() => navegar(filtros.pagina - 1)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <button
              disabled={filtros.pagina >= totalPaginas}
              onClick={() => navegar(filtros.pagina + 1)}
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
