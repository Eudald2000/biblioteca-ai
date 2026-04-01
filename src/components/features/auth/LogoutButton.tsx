'use client'

import { useTransition } from 'react'
import { cerrarSesion } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [pendiente, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await cerrarSesion()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={pendiente}
      onClick={handleLogout}
      className={className}
    >
      Cerrar sesión
    </Button>
  )
}
