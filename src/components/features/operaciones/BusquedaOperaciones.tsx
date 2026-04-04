'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  libroInicial: string
  usuarioInicial: string
}

export function BusquedaOperaciones({ libroInicial, usuarioInicial }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [libro, setLibro] = useState(libroInicial)
  const [usuario, setUsuario] = useState(usuarioInicial)

  function aplicar(l = libro, u = usuario) {
    const params = new URLSearchParams(window.location.search)
    params.delete('pagina_p')
    params.delete('pagina_c')
    if (l.trim()) params.set('libro', l.trim()); else params.delete('libro')
    if (u.trim()) params.set('usuario', u.trim()); else params.delete('usuario')
    startTransition(() => router.push(`/dashboard/operaciones?${params.toString()}`))
  }

  const hayFiltros = libroInicial || usuarioInicial

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Libro / Autor</label>
        <input
          type="search"
          placeholder="Título o autor..."
          value={libro}
          onChange={(e) => setLibro(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aplicar()}
          className="h-9 w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Usuario</label>
        <input
          type="search"
          placeholder="Nombre de usuario..."
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aplicar()}
          className="h-9 w-64 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <button
        onClick={() => aplicar()}
        className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Filtrar
      </button>
      {hayFiltros && (
        <button
          onClick={() => { setLibro(''); setUsuario(''); aplicar('', '') }}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
