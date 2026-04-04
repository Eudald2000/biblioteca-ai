import { createClient } from '@/lib/supabase/server'
import { UsuariosTabla } from '@/components/features/usuarios/UsuariosTabla'

const POR_PAGINA = 20

type SearchParams = Promise<{
  busqueda?: string
  rol?: string
  pagina?: string
}>

export default async function UsuariosAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const busqueda = params.busqueda?.trim() ?? ''
  const rol = params.rol ?? ''
  const pagina = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (pagina - 1) * POR_PAGINA

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase.rpc('listar_usuarios_admin', {
    p_busqueda: busqueda,
    p_rol: rol,
    p_limite: POR_PAGINA,
    p_offset: offset,
  })

  const usuarios = (data ?? []).map((u) => ({
    id: u.id,
    nombre_completo: u.nombre_completo,
    rol: u.rol,
    baneado: u.baneado,
    creado_en: u.creado_en,
    email: u.email,
  }))

  const total = data?.[0]?.total ? Number(data[0].total) : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestión de cuentas de usuario.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Error al cargar usuarios: {error.message}
        </p>
      )}

      <UsuariosTabla
        usuarios={usuarios}
        total={total}
        porPagina={POR_PAGINA}
        filtros={{ busqueda, rol, pagina }}
        adminId={user?.id ?? ''}
      />
    </div>
  )
}
