'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { EditorialFormState } from '@/app/actions/editoriales'

type Editorial = {
  id: string
  nombre: string
  pais: string | null
  sitio_web: string | null
  logo_url: string | null
}

type Props = {
  editorial?: Editorial
  action: (prev: EditorialFormState, data: FormData) => Promise<EditorialFormState>
}

export function EditorialForm({ editorial, action }: Props) {
  const [estado, accion, pendiente] = useActionState<EditorialFormState, FormData>(action, null)
  const [logoUrl, setLogoUrl] = useState(editorial?.logo_url ?? '')

  const esEdicion = !!editorial

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {esEdicion ? 'Editar editorial' : 'Nueva editorial'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {esEdicion
            ? `Editando: ${editorial.nombre}`
            : 'Completa los campos para añadir una editorial al catálogo.'}
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Columna izquierda */}
          <div className="space-y-5">
            <Input
              label="Nombre"
              name="nombre"
              defaultValue={editorial?.nombre}
              required
              disabled={pendiente}
              placeholder="Penguin Random House"
            />
            <Input
              label="País"
              name="pais"
              defaultValue={editorial?.pais ?? ''}
              disabled={pendiente}
              placeholder="España"
            />
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            <Input
              label="Sitio web"
              name="sitio_web"
              type="url"
              defaultValue={editorial?.sitio_web ?? ''}
              disabled={pendiente}
              placeholder="https://www.penguinrandomhouse.com"
              helper="URL completa incluyendo https://"
            />

            {/* URL logo + preview */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="URL del logo"
                name="logo_url"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={pendiente}
                placeholder="https://…"
                helper="Enlace directo a la imagen del logo"
              />
              {logoUrl && (
                <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Vista previa del logo"
                    className="h-24 w-full object-contain bg-gray-50 dark:bg-gray-800"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    onLoad={(e) => (e.currentTarget.style.display = 'block')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <Link
            href="/dashboard/editoriales"
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </Link>
          <Button type="submit" loading={pendiente}>
            {esEdicion ? 'Guardar cambios' : 'Crear editorial'}
          </Button>
        </div>
      </form>
    </div>
  )
}
