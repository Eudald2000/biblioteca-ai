'use client'

import Link from 'next/link'
import { cerrarSesion } from '@/app/actions/auth'
import { RUTAS } from '@/constants'
import { useTransition } from 'react'

interface NavbarPerfilProps {
  iniciales: string
  nombre: string | null
  email: string
}

export function NavbarPerfil({ iniciales, nombre, email }: NavbarPerfilProps) {
  const [pendiente, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await cerrarSesion()
    })
  }

  return (
    <div className="group relative">
      {/* Botón con iniciales */}
      <button
        aria-label="Menú de perfil"
        aria-haspopup="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 transition hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
      >
        {pendiente ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : iniciales}
      </button>

      {/* Dropdown — visible on hover or focus-within */}
      <div
        role="menu"
        className="invisible absolute right-0 top-full z-20 mt-2 w-52 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {/* Triángulo decorativo */}
        <div className="ml-auto mr-3 h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" />
        <div className="-mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Cabecera con info del usuario */}
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {nombre ?? 'Usuario'}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{email}</p>
          </div>

          {/* Opciones */}
          <div className="py-1">
            <Link
              href={RUTAS.CUENTA}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Mi perfil
            </Link>

            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={pendiente}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
