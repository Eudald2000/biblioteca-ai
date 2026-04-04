'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { eliminarCategoria } from '@/app/actions/categorias'

type CategoriaFila = {
  id: string
  nombre: string
  descripcion: string | null
  creado_en: string
  numLibros: number
}

type Filtros = {
  busqueda: string
  pagina: number
  orden: string
  direccion: 'asc' | 'desc'
}

type Props = {
  categorias: CategoriaFila[]
  total: number
  porPagina: number
  filtros: Filtros
}

const POR_PAGINA = 15

const COLUMNAS_ORDENABLES = [
  { campo: 'nombre', label: 'Nombre' },
  { campo: 'creado_en', label: 'Fecha añadido' },
]

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

export function CategoriasTabla({ categorias, total, porPagina, filtros }: Props) {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

  const actualizarUrl = useCallback(
    (cambios: Partial<Filtros & { pagina: number }>) => {
      const merged = { ...filtros, ...cambios }
      const params = new URLSearchParams()
      if (merged.busqueda) params.set('busqueda', merged.busqueda)
      if (merged.pagina > 1) params.set('pagina', String(merged.pagina))
      if (merged.orden !== 'nombre') params.set('orden', merged.orden)
      if (merged.direccion !== 'asc') params.set('direccion', merged.direccion)
      const qs = params.toString()
      router.push(`/dashboard/categorias${qs ? `?${qs}` : ''}`)
    },
    [filtros, router],
  )

  function manejarBusqueda(valor: string) {
    setBusquedaLocal(valor)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      actualizarUrl({ busqueda: valor, pagina: 1 })
    }, 300)
  }

  function manejarOrden(campo: string) {
    const nuevaDireccion =
      filtros.orden === campo && filtros.direccion === 'asc' ? 'desc' : 'asc'
    actualizarUrl({ orden: campo, direccion: nuevaDireccion, pagina: 1 })
  }

  function IconoOrden({ campo }: { campo: string }) {
    if (filtros.orden !== campo)
      return <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>
    return (
      <span className="ml-1 text-blue-500">
        {filtros.direccion === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la categoría "${nombre}"? Esta acción no se puede deshacer.`)) return
    setErrorEliminar(null)
    const resultado = await eliminarCategoria(id)
    if (resultado?.error) {
      setErrorEliminar(resultado.error)
    }
  }

  return (
    <div>
      {/* Cabecera: búsqueda + botón nuevo */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={busquedaLocal}
            onChange={(e) => manejarBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
            )}
          />
        </div>

        <div className="ml-auto">
          <Link href="/dashboard/categorias/nuevo">
            <Button size="sm">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva categoría
            </Button>
          </Link>
        </div>
      </div>

      {/* Error al eliminar */}
      {errorEliminar && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" role="alert">
          {errorEliminar}
          <button
            onClick={() => setErrorEliminar(null)}
            className="ml-3 underline hover:no-underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Resultado y total */}
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {total} {total === 1 ? 'categoría' : 'categorías'} encontradas
        {filtros.busqueda ? ' con los filtros aplicados' : ''}
      </p>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              {COLUMNAS_ORDENABLES.map(({ campo, label }) => (
                <th
                  key={campo}
                  onClick={() => manejarOrden(campo)}
                  className="cursor-pointer select-none px-4 py-3 text-left font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {label}
                  <IconoOrden campo={campo} />
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Descripción
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Libros
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                  No se encontraron categorías
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr
                  key={categoria.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {categoria.nombre}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatFecha(categoria.creado_en)}
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                    {categoria.descripcion ? (
                      <span className="line-clamp-1">{categoria.descripcion}</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>

                  {/* Nº libros */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        categoria.numLibros === 0
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      )}
                    >
                      {categoria.numLibros} {categoria.numLibros === 1 ? 'libro' : 'libros'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/categorias/${categoria.id}/editar`}
                        className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                        className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {filtros.pagina} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={filtros.pagina <= 1}
              onClick={() => actualizarUrl({ pagina: filtros.pagina - 1 })}
            >
              ← Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={filtros.pagina >= totalPaginas}
              onClick={() => actualizarUrl({ pagina: filtros.pagina + 1 })}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { POR_PAGINA }
