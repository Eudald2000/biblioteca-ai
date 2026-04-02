'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type DashboardStats = {
  totalLibros: number
  librosDisponibles: number
  prestamosActivos: number
  prestamosVencidos: number
  totalVentas: number
  totalUsuarios: number
  ingresosPorVentas: number
  valorEnPrestamos: number
}

const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(n)

const formatNumero = (n: number) => new Intl.NumberFormat('es-ES').format(n)

async function obtenerStats(
  supabase: ReturnType<typeof createClient>,
): Promise<DashboardStats> {
  const [
    totalLibrosRes,
    librosDisponiblesRes,
    prestamosActivosRes,
    prestamosVencidosRes,
    usuariosRes,
    ventasRes,
    ventasPrecioRes,
    prestamosConPrecioRes,
  ] = await Promise.all([
    supabase
      .from('libros')
      .select('*', { count: 'exact', head: true })
      .is('eliminado_en', null),
    supabase
      .from('libros')
      .select('*', { count: 'exact', head: true })
      .is('eliminado_en', null)
      .gt('stock', 0),
    supabase
      .from('prestamos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo'),
    supabase
      .from('prestamos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'vencido'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('compras').select('*', { count: 'exact', head: true }),
    supabase.from('compras').select('precio_compra'),
    supabase.from('prestamos').select('precio_prestamo').eq('estado', 'activo'),
  ])

  const ingresosPorVentas =
    ventasPrecioRes.data?.reduce((s, c) => s + Number(c.precio_compra), 0) ?? 0

  const valorEnPrestamos =
    prestamosConPrecioRes.data?.reduce((s, p) => s + Number(p.precio_prestamo), 0) ?? 0

  return {
    totalLibros: totalLibrosRes.count ?? 0,
    librosDisponibles: librosDisponiblesRes.count ?? 0,
    prestamosActivos: prestamosActivosRes.count ?? 0,
    prestamosVencidos: prestamosVencidosRes.count ?? 0,
    totalUsuarios: usuariosRes.count ?? 0,
    totalVentas: ventasRes.count ?? 0,
    ingresosPorVentas,
    valorEnPrestamos,
  }
}

type StatCardProps = {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className={`inline-flex rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
      <div className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  )
}

export function StatsGrid({ initialStats }: { initialStats: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [actualizando, setActualizando] = useState(false)

  const refetch = useCallback(async () => {
    const supabase = createClient()
    setActualizando(true)
    try {
      const nuevasStats = await obtenerStats(supabase)
      setStats(nuevasStats)
    } finally {
      setActualizando(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const canal = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'libros' },
        refetch,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prestamos' },
        refetch,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'compras' },
        refetch,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usuarios' },
        refetch,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [refetch])

  const tarjetas: StatCardProps[] = [
    {
      label: 'Libros en catálogo',
      value: formatNumero(stats.totalLibros),
      iconBg:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: 'Libros disponibles (stock > 0)',
      value: formatNumero(stats.librosDisponibles),
      iconBg:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Usuarios registrados',
      value: formatNumero(stats.totalUsuarios),
      iconBg:
        'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Ventas realizadas',
      value: formatNumero(stats.totalVentas),
      iconBg:
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      label: 'Préstamos activos',
      value: formatNumero(stats.prestamosActivos),
      iconBg:
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: 'Préstamos vencidos',
      value: formatNumero(stats.prestamosVencidos),
      iconBg:
        stats.prestamosVencidos > 0
          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      label: 'Ingresos por ventas',
      value: formatEuros(stats.ingresosPorVentas),
      iconBg:
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Valor en préstamos activos',
      value: formatEuros(stats.valorEnPrestamos),
      iconBg:
        'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`inline-flex size-2 rounded-full animate-pulse ${
            actualizando ? 'bg-yellow-400' : 'bg-green-500'
          }`}
        />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {actualizando ? 'Actualizando…' : 'Datos en tiempo real'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <StatCard key={t.label} {...t} />
        ))}
      </div>
    </div>
  )
}
