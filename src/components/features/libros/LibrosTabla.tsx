'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { toggleVisibilidad, eliminarLibroPermanente } from '@/app/actions/libros'
import { RUTAS } from '@/constants'

type LibroFila = {
  id: string
  titulo: string
  autor: string
  isbn: string | null
  stock: number
  precio_compra: number
  precio_prestamo: number
  portada_url: string | null
  creado_en: string
  editorial_id: string
  visible: boolean
  editoriales: { nombre: string } | null
}

type EditorialMin = { id: string; nombre: string }
type CategoriaMin = { id: string; nombre: string }

type Filtros = {
  busqueda: string
  editorial: string
  categoria: string
  pagina: number
  orden: string
  direccion: 'asc' | 'desc'
}

type Props = {
  libros: LibroFila[]
  total: number
  editoriales: EditorialMin[]
  categorias: CategoriaMin[]
  porPagina: number
  filtros: Filtros
}

const COLUMNAS_ORDENABLES = [
  { campo: 'titulo', label: 'Título' },
  { campo: 'autor', label: 'Autor' },
  { campo: 'stock', label: 'Stock' },
  { campo: 'precio_compra', label: 'P. Compra' },
  { campo: 'creado_en', label: 'Añadido' },
]

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

export function LibrosTabla({ libros, total, editoriales, categorias, porPagina, filtros }: Props) {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda)

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

  const actualizarUrl = useCallback(
    (cambios: Partial<Filtros & { pagina: number }>) => {
      const merged = { ...filtros, ...cambios }
      const params = new URLSearchParams()
      if (merged.busqueda) params.set('busqueda', merged.busqueda)
      if (merged.editorial) params.set('editorial', merged.editorial)
      if (merged.categoria) params.set('categoria', merged.categoria)
      if (merged.pagina > 1) params.set('pagina', String(merged.pagina))
      if (merged.orden !== 'titulo') params.set('orden', merged.orden)
      if (merged.direccion !== 'asc') params.set('direccion', merged.direccion)
      const qs = params.toString()
      router.push(`${RUTAS.LIBROS_ADMIN}${qs ? `?${qs}` : ''}`)
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

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={busquedaLocal}
            onChange={(e) => manejarBusqueda(e.target.value)}
            placeholder="Buscar por título o autor…"
            className={cn(
              'w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
            )}
          />
        </div>

        <select
          value={filtros.editorial}
          onChange={(e) => actualizarUrl({ editorial: e.target.value, pagina: 1 })}
          className={cn(
            'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          )}
        >
          <option value="">Todas las editoriales</option>
          {editoriales.map((ed) => (
            <option key={ed.id} value={ed.id}>{ed.nombre}</option>
          ))}
        </select>

        <select
          value={filtros.categoria}
          onChange={(e) => actualizarUrl({ categoria: e.target.value, pagina: 1 })}
          className={cn(
            'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          )}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>

        <div className="ml-auto">
          <Link href={RUTAS.LIBROS_NUEVO}>
            <Button size="sm">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo libro
            </Button>
          </Link>
        </div>
      </div>

      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {total} {total === 1 ? 'libro' : 'libros'}
        {filtros.busqueda || filtros.editorial || filtros.categoria ? ' con los filtros aplicados' : ''}
      </p>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-12">Portada</th>
              {COLUMNAS_ORDENABLES.map(({ campo, label }) => (
                <th
                  key={campo}
                  onClick={() => manejarOrden(campo)}
                  className="cursor-pointer select-none px-4 py-3 text-left font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {label}<IconoOrden campo={campo} />
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Editorial</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">P. Préstamo</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Mostrar</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {libros.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                  No se encontraron libros
                </td>
              </tr>
            ) : (
              libros.map((libro) => (
                <tr
                  key={libro.id}
                  className={cn(
                    'transition hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    !libro.visible && 'opacity-50',
                  )}
                >
                  <td className="px-4 py-2">
                    {libro.portada_url ? (
                      <div className="relative size-10 overflow-hidden rounded">
                        <Image src={libro.portada_url} alt={libro.titulo} fill className="object-cover" sizes="40px" unoptimized />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded bg-gray-100 text-lg dark:bg-gray-800">📖</div>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{libro.titulo}</span>
                  </td>

                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{libro.autor}</td>

                  <td className="px-4 py-2">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      libro.stock === 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : libro.stock <= 3
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    )}>
                      {libro.stock === 0 ? 'Sin stock' : `${libro.stock} uds.`}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{formatEuros(libro.precio_compra)}</td>
                  <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{formatFecha(libro.creado_en)}</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{libro.editoriales?.nombre ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{formatEuros(libro.precio_prestamo)}</td>

                  {/* Toggle visible */}
                  <td className="px-4 py-2 text-center">
                    <form action={toggleVisibilidad.bind(null, libro.id, !libro.visible)}>
                      <button
                        type="submit"
                        title={libro.visible ? 'Ocultar del catálogo' : 'Mostrar en el catálogo'}
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-full transition',
                          libro.visible
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700',
                        )}
                      >
                        {libro.visible ? (
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </form>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/libros/${libro.id}/editar`}
                        className="inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Editar
                      </Link>
                      <form action={eliminarLibroPermanente.bind(null, libro.id)}>
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE "${libro.titulo}"?\n\nEsta acción es IRREVERSIBLE.`))
                              e.preventDefault()
                          }}
                          className="inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Eliminar
                        </button>
                      </form>
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
            <Button variant="secondary" size="sm" disabled={filtros.pagina <= 1}
              onClick={() => actualizarUrl({ pagina: filtros.pagina - 1 })}>
              ← Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={filtros.pagina >= totalPaginas}
              onClick={() => actualizarUrl({ pagina: filtros.pagina + 1 })}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
