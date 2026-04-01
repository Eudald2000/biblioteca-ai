import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Bienvenido, {perfil?.nombre_completo ?? 'Administrador'} 👋
      </h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Panel de administración de la Biblioteca Virtual.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Libros en catálogo', valor: '—', icono: '📖' },
          { label: 'Préstamos activos', valor: '—', icono: '📋' },
          { label: 'Usuarios registrados', valor: '—', icono: '👥' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="text-2xl">{stat.icono}</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.valor}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
