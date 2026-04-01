'use client'

import { useActionState } from 'react'
import { actualizarPerfil, type UsuarioState } from '@/app/actions/usuario'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface PerfilFormProps {
  nombreActual: string | null
}

export function PerfilForm({ nombreActual }: PerfilFormProps) {
  const [estado, accion, pendiente] = useActionState<UsuarioState, FormData>(
    actualizarPerfil,
    null,
  )

  return (
    <form action={accion} noValidate className="flex flex-col gap-5">
      {estado?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" role="alert">
          {estado.error}
        </div>
      )}
      {estado?.exito && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400" role="status">
          {estado.exito}
        </div>
      )}

      <Input
        label="Nombre completo"
        name="nombre_completo"
        type="text"
        defaultValue={nombreActual ?? ''}
        required
        disabled={pendiente}
      />

      <Button type="submit" loading={pendiente} className="w-full sm:w-auto">
        Guardar cambios
      </Button>
    </form>
  )
}
