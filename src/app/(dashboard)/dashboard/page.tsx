import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/features/dashboard/StatsGrid'
import type { DashboardStats } from '@/components/features/dashboard/StatsGrid'

async function obtenerStatsServidor(): Promise<DashboardStats> {
  const supabase = await createClient()

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: perfil }, stats] = await Promise.all([
    supabase
      .from('usuarios')
      .select('nombre_completo')
      .eq('id', user!.id)
      .single(),
    obtenerStatsServidor(),
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Bienvenido, {perfil?.nombre_completo ?? 'Administrador'}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Panel de administración de la Biblioteca Virtual.
      </p>
      <div className="mt-8">
        <StatsGrid initialStats={stats} />
      </div>
    </div>
  )
}
