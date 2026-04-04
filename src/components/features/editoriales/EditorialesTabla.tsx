'use client'

import { useRef, useState, useCallback, useActionState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { eliminarEditorial } from '@/app/actions/editoriales'
import type { EditorialFormState } from '@/app/actions/editoriales'

type EditorialFila = {
  id: string
  nombre: string
  pais: string | null
  sitio_web: string | null
  logo_url: string | null
  creado_en: string
  num_libros: number
}

type Filtros = {
  busqueda: string
  pagina: number
  orden: string
  direccion: 'asc' | 'desc'
}

type Props = {
  editoriales: EditorialFila[]
  total: number
  porPagina: number
  filtros: Filtros
}

const COLUMNAS_ORDENABLES = [
  { campo: 'nombre', label: 'Nombre' },
  { campo: 'pais', label: 'País' },
  { campo: 'creado_en', label: 'Añadido' },
]

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

// Subcomponente de fila con useActionState para gestionar el error de eliminación
function FilaEditorial({ editorial }: { editorial: EditorialFila }) {
  const [estado, accion, pendiente] = useActionState<EditorialFormState, FormData>(
    async (_prev: EditorialFormState, _fd: FormData) => {
      return eliminarEditorial(editorial.id)
    },
    null,
  )

  return (
    <Fragment>
      <tr className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {/* Logo */}
        <td className="px-4 py-2">
          {editorial.logo_url ? (
            <div className="relative size-10 overflow-hidden rounded border border-gray-200 dark:border-gray-700">
              <Image
                src={editorial.logo_url}
                alt={editorial.nombre}
                fill
                className="object-contain p-1"
                sizes="40px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded border border-gray-200 bg-gray-100 text-lg dark:border-gray-700 dark:bg-gray-800">
              🏢
            </div>
          )}
        </td>

        {/* Nombre */}
        <td className="px-4 py-2">
          <span className="font-medium text-gray-900 dark:text-white">{editorial.nombre}</span>
        </td>

        {/* País */}
        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
          {editorial.pais ?? '—'}
        </td>

        {/* Sitio web */}
        <td className="px-4 py-2">
          {editorial.sitio_web ? (
            <a
              href={editorial.sitio_web}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400 text-sm truncate max-w-[180px] inline-block"
            >
              {editorial.sitio_web.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>

        {/* Nº libros */}
        <td className="px-4 py-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              editorial.num_libros === 0
                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            )}
          >
            {editorial.num_libros} {editorial.num_libros === 1 ? 'libro' : 'libros'}
          </span>
        </td>

        {/* Fecha */}
        <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
          {formatFecha(editorial.creado_en)}
        </td>

        {/* Acciones */}
        <td className="px-4 py-2">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/dashboard/editoriales/${editorial.id}/editar`}
              className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Editar
            </Link>
            <form action={accion}>
              <button
                type="submit"
                disabled={pendiente}
                onClick={(e) => {
                  if (!confirm(`¿Eliminar "${editorial.nombre}"? Esta acción no se puede deshacer.`))
                    e.preventDefault()
                }}
                className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {pendiente ? 'Eliminando…' : 'Eliminar'}
              </button>
            </form>
          </div>
        </td>
      </tr>
      {/* Fila de error si la editorial tiene libros asociados */}
      {estado?.error && (
        <tr>
          <td colSpan={7} className="px-4 py-2">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {estado.error}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}

export function EditorialesTabla({ editoriales, total, porPagina, filtros }: Props) {
  const router = useRouter()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda)

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
      router.push(`/dashboard/editoriales${qs ? `?${qs}` : ''}`)
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
      <span className="ml-1 text-blue-500">{filtros.direccion === 'asc' ? '↑' : '↓'}</span>
    )
  }

  return (
    <div>
      {/* Cabecera: filtros + botón nuevo */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
          <Link href="/dashboard/editoriales/nuevo">
            <Button size="sm">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva editorial
            </Button>
          </Link>
        </div>
      </div>

      {/* Resultado y total */}
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {total} {total === 1 ? 'editorial' : 'editoriales'} encontradas
        {filtros.busqueda ? ' con los filtros aplicados' : ''}
      </p>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-12">
                Logo
              </th>
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
                Sitio web
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
            {editoriales.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
                >
                  No se encontraron editoriales
                </td>
              </tr>
            ) : (
              editoriales.map((editorial) => (
                <FilaEditorial key={editorial.id} editorial={editorial} />
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
