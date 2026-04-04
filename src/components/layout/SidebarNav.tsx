'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const enlaces = [
  { href: '/dashboard', label: '📊 Inicio', exact: true },
  { href: '/dashboard/libros', label: '📖 Libros', exact: false },
  { href: '/dashboard/editoriales', label: '🏢 Editoriales', exact: false },
  { href: '/dashboard/categorias', label: '🏷️ Categorías', exact: false },
  { href: '/dashboard/usuarios', label: '👥 Usuarios', exact: false },
  { href: '/dashboard/operaciones', label: '📋 Operaciones', exact: false },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-0.5 px-2 py-3">
      {enlaces.map(({ href, label, exact }) => {
        const activo = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              activo
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
