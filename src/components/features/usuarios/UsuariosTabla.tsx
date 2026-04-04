'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { cambiarRolUsuario, toggleBaneoUsuario } from '@/app/actions/usuarios-admin'
import type { RolUsuario } from '@/types'

type UsuarioFila = {
  id: string
  nombre_completo: string | null
  rol: RolUsuario
  baneado: boolean
  creado_en: string
  email: string | null
}

type Filtros = {
  busqueda: string
  rol: string
  pagina: number
}

type Props = {
  usuarios: UsuarioFila[]
  total: number
  porPagina: number
  filtros: Filtros
  adminId: string
}

const formatFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' }).format(new Date(iso))

export function UsuariosTabla({ usuarios, total, porPagina, filtros, adminId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: string; mensaje: string; tipo: 'ok' | 'err' } | null>(null)
  const [busqueda, setBusqueda] = useState(filtros.busqueda)
  const [rol, setRol] = useState(filtros.rol)

  const totalPaginas = Math.ceil(total / porPagina)

  function aplicarFiltros(overrides: Partial<Filtros> = {}) {
    const params = new URLSearchParams()
    const b = overrides.busqueda ?? busqueda
    const r = overrides.rol ?? rol
    const p = overrides.pagina ?? 1
    if (b) params.set('busqueda', b)
    if (r) params.set('rol', r)
    if (p > 1) params.set('pagina', String(p))
    router.push(`/dashboard/usuarios?${params.toString()}`)
  }

  async function handleCambiarRol(id: string, rolActual: RolUsuario, nombre: string | null) {
    const nuevoRol: RolUsuario = rolActual === 'admin' ? 'usuario' : 'admin'
    const accion = nuevoRol === 'admin' ? 'hacer administrador' : 'quitar permisos de administrador'
    if (!window.confirm(`¿Seguro que quieres ${accion} a ${nombre ?? 'este usuario'}?`)) return
    startTransition(async () => {
      const res = await cambiarRolUsuario(id, nuevoRol)
      if (res?.error) setFeedback({ id, mensaje: res.error, tipo: 'err' })
      else setFeedback({ id, mensaje: res?.exito ?? 'Actualizado.', tipo: 'ok' })
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  async function handleToggleBaneo(id: string, baneado: boolean, nombre: string | null) {
    const accion = baneado ? 'levantar el baneo de' : 'banear a'
    if (!window.confirm(`¿Seguro que quieres ${accion} ${nombre ?? 'este usuario'}?`)) return
    startTransition(async () => {
      const res = await toggleBaneoUsuario(id, !baneado)
      if (res?.error) setFeedback({ id, mensaje: res.error, tipo: 'err' })
      else setFeedback({ id, mensaje: res?.exito ?? 'Actualizado.', tipo: 'ok' })
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
          className="h-9 w-72 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <select
          value={rol}
          onChange={(e) => { setRol(e.target.value); aplicarFiltros({ rol: e.target.value }) }}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="usuario">Usuario</option>
        </select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => aplicarFiltros()}
        >
          Buscar
        </Button>
        {(busqueda || rol) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setBusqueda(''); setRol(''); router.push('/dashboard/usuarios') }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Total */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {total} {total === 1 ? 'usuario' : 'usuarios'}
      </p>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-900">
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Usuario</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Rol</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Registrado</th>
              <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => {
                const esPropioAdmin = u.id === adminId
                const fb = feedback?.id === u.id ? feedback : null

                return (
                  <tr key={u.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/usuarios/${u.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {u.nombre_completo ?? '—'}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{u.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        u.rol === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                      )}>
                        {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        u.baneado
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                      )}>
                        {u.baneado ? 'Baneado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatFecha(u.creado_en)}
                    </td>
                    <td className="px-4 py-3">
                      {fb && (
                        <p className={cn(
                          'mb-1 text-xs',
                          fb.tipo === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                        )}>
                          {fb.mensaje}
                        </p>
                      )}
                      {esPropioAdmin ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500">(tú)</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isPending}
                            onClick={() => handleCambiarRol(u.id, u.rol, u.nombre_completo)}
                            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleToggleBaneo(u.id, u.baneado, u.nombre_completo)}
                            className={cn(
                              'rounded px-2 py-1 text-xs disabled:opacity-50',
                              u.baneado
                                ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                                : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
                            )}
                          >
                            {u.baneado ? 'Desbanear' : 'Banear'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {filtros.pagina} de {totalPaginas}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={filtros.pagina <= 1}
              onClick={() => aplicarFiltros({ pagina: filtros.pagina - 1 })}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={filtros.pagina >= totalPaginas}
              onClick={() => aplicarFiltros({ pagina: filtros.pagina + 1 })}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
