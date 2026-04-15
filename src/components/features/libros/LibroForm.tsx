'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const categoriasSeleccionadas = libro?.libros_categorias.map((lc) => lc.categoria_id) ?? []
  const esEdicion = !!libro

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('portadas')
        .upload(fileName, file, { upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('portadas')
        .getPublicUrl(fileName)

      setPortadaUrl(publicUrl)
    } catch {
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
  }

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
            {/* Portada — subida de archivo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Portada
              </span>

              {/* Preview */}
              {portadaUrl && (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portadaUrl}
                    alt="Vista previa de portada"
                    className="h-48 w-full object-contain bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              )}

              {/* Drop zone */}
              <div className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition',
                uploading
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
                (pendiente || uploading) && 'cursor-not-allowed opacity-60',
              )}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={pendiente || uploading}
                  className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  aria-label="Subir imagen de portada"
                />
                <svg className="size-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {uploading
                    ? 'Subiendo imagen…'
                    : portadaUrl
                      ? 'Haz clic para cambiar la portada'
                      : 'Haz clic para subir una portada'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG o WebP · máx. 5 MB</p>
              </div>

              {uploadError && (
                <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>
              )}

              {/* Campo oculto con la URL resultante */}
              <input type="hidden" name="portada_url" value={portadaUrl} />
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
          <Button type="submit" loading={pendiente} disabled={uploading}>
            {esEdicion ? 'Guardar cambios' : 'Crear libro'}
          </Button>
        </div>
      </form>
    </div>
  )
}
