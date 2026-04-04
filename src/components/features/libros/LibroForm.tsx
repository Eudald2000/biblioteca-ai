'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { LibroFormState } from '@/app/actions/libros'
import { RUTAS } from '@/constants'

type EditorialMin = { id: string; nombre: string }
type CategoriaMin = { id: string; nombre: string }

type LibroConCategorias = {
  id: string
  titulo: string
  autor: string
  isbn: string | null
  descripcion: string | null
  portada_url: string | null
  stock: number
  precio_compra: number
  precio_prestamo: number
  editorial_id: string
  libros_categorias: { categoria_id: string }[]
}

type Props = {
  editoriales: EditorialMin[]
  categorias: CategoriaMin[]
  libro?: LibroConCategorias
  action: (prev: LibroFormState, data: FormData) => Promise<LibroFormState>
}

export function LibroForm({ editoriales, categorias, libro, action }: Props) {
  const [estado, accion, pendiente] = useActionState<LibroFormState, FormData>(action, null)
  const [portadaUrl, setPortadaUrl] = useState(libro?.portada_url ?? '')

  const categoriasSeleccionadas = libro?.libros_categorias.map((lc) => lc.categoria_id) ?? []
  const esEdicion = !!libro

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {esEdicion ? 'Editar libro' : 'Nuevo libro'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {esEdicion ? `Editando: ${libro.titulo}` : 'Completa los campos para añadir un libro al catálogo.'}
        </p>
      </div>

      <form action={accion} noValidate>
        {estado?.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" role="alert">
            {estado.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Columna izquierda */}
          <div className="space-y-5">
            <Input
              label="Título"
              name="titulo"
              defaultValue={libro?.titulo}
              required
              disabled={pendiente}
              placeholder="El nombre del viento"
            />
            <Input
              label="Autor"
              name="autor"
              defaultValue={libro?.autor}
              required
              disabled={pendiente}
              placeholder="Patrick Rothfuss"
            />
            <Input
              label="ISBN"
              name="isbn"
              defaultValue={libro?.isbn ?? ''}
              disabled={pendiente}
              placeholder="9788401352836"
              helper="10 o 13 dígitos, sin guiones"
            />

            {/* Editorial */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="editorial_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Editorial <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="editorial_id"
                name="editorial_id"
                required
                disabled={pendiente}
                defaultValue={libro?.editorial_id ?? ''}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition',
                  'border-gray-300 bg-white text-gray-900',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                  'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
                  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
                  'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
                )}
              >
                <option value="">Selecciona una editorial…</option>
                {editoriales.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="descripcion" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                disabled={pendiente}
                defaultValue={libro?.descripcion ?? ''}
                placeholder="Sinopsis o descripción del libro…"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition',
                  'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                  'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
                  'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
                  'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
                )}
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            {/* URL portada + preview */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="URL de portada"
                name="portada_url"
                type="url"
                value={portadaUrl}
                onChange={(e) => setPortadaUrl(e.target.value)}
                disabled={pendiente}
                placeholder="https://…"
                helper="Enlace directo a la imagen de portada"
              />
              {portadaUrl && (
                <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portadaUrl}
                    alt="Vista previa de portada"
                    className="h-40 w-full object-contain bg-gray-50 dark:bg-gray-800"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    onLoad={(e) => (e.currentTarget.style.display = 'block')}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={libro?.stock ?? 0}
                disabled={pendiente}
              />
              <Input
                label="Precio compra (€)"
                name="precio_compra"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={libro?.precio_compra ?? 0}
                disabled={pendiente}
              />
              <Input
                label="Precio préstamo (€)"
                name="precio_prestamo"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={libro?.precio_prestamo ?? 0}
                disabled={pendiente}
              />
            </div>

            {/* Categorías */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Categorías
              </span>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                {categorias.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      name="categorias"
                      value={cat.id}
                      defaultChecked={categoriasSeleccionadas.includes(cat.id)}
                      disabled={pendiente}
                      className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                    />
                    {cat.nombre}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href={RUTAS.LIBROS_ADMIN}
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </Link>
          <Button type="submit" loading={pendiente}>
            {esEdicion ? 'Guardar cambios' : 'Crear libro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
