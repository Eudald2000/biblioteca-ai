'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registrarse, type AuthState } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RUTAS } from '@/constants'

export function RegisterForm() {
  const [estado, accion, pendiente] = useActionState<AuthState, FormData>(registrarse, null)

  return (
    <form action={accion} noValidate className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#f5efe6]">Crear cuenta</h2>
        <p className="mt-1 text-sm text-[rgba(245,239,230,0.5)]">
          Únete a la biblioteca virtual
        </p>
      </div>

      {estado?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" role="alert">
          {estado.error}
        </div>
      )}

      <Input
        label="Nombre completo"
        name="nombre"
        type="text"
        placeholder="Ana García"
        autoComplete="name"
        required
        disabled={pendiente}
        helper="Mínimo 2 caracteres"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        required
        disabled={pendiente}
      />

      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        disabled={pendiente}
        helper="Mínimo 6 caracteres"
      />

      <Input
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        disabled={pendiente}
      />

      <Button type="submit" loading={pendiente} className="w-full">
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-[rgba(245,239,230,0.5)]">
        ¿Ya tienes cuenta?{' '}
        <Link href={RUTAS.LOGIN} className="font-medium text-[#f0b445] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
