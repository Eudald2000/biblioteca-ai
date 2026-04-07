'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { iniciarSesion, type AuthState } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RUTAS } from '@/constants'

export function LoginForm({ mensajeBaneo = false }: { mensajeBaneo?: boolean }) {
  const [estado, accion, pendiente] = useActionState<AuthState, FormData>(iniciarSesion, null)

  return (
    <form action={accion} noValidate className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#f5efe6]">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-[rgba(245,239,230,0.5)]">
          Accede a tu cuenta de la biblioteca
        </p>
      </div>

      {mensajeBaneo && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" role="alert">
          Tu cuenta ha sido suspendida. Contacta con el administrador.
        </div>
      )}

      {estado?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" role="alert">
          {estado.error}
        </div>
      )}

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
        autoComplete="current-password"
        required
        disabled={pendiente}
      />

      <Button type="submit" loading={pendiente} className="w-full">
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-[rgba(245,239,230,0.5)]">
        ¿No tienes cuenta?{' '}
        <Link href={RUTAS.REGISTRO} className="font-medium text-[#f0b445] hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
