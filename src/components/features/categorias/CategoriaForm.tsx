'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CategoriaFormState } from '@/app/actions/categorias'

type Categoria = {
  id: string
  nombre: string
  descripcion: string | null
}

type Props = {
  categoria?: Categoria
  action: (prev: CategoriaFormState, data: FormData) => Promise<CategoriaFormState>
}

export function CategoriaForm({ categoria, action }: Props) {
  const [estado, accion, pendiente] = useActionState<CategoriaFormState, FormData>(action, null)

  const esEdicion = !!categoria

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {esEdicion ? 'Editar categoría' : 'Nueva categoría'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {esEdicion
            ? `Editando: ${categoria.nombre}`
            : 'Completa los campos para añadir una nueva categoría.'}
        </p>
      </div>

      <form action={accion} noValidate>
        {estado?.error && (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
          >
            {estado.error}
          </div>
        )}

        <div className="space-y-5">
          <Input
            label="Nombre"
            name="nombre"
            defaultValue={categoria?.nombre}
            required
            disabled={pendiente}
            placeholder="Ciencia ficción"
          />

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="descripcion"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              disabled={pendiente}
              defaultValue={categoria?.descripcion ?? ''}
              placeholder="Descripción opcional de la categoría…"
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

        {/* Acciones */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href="/dashboard/categorias"
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </Link>
          <Button type="submit" loading={pendiente}>
            {esEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      </form>
    </div>
  )
}
