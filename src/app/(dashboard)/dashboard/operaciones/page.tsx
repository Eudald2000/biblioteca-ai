import { createClient } from '@/lib/supabase/server'
import { PrestamosTabla } from '@/components/features/operaciones/PrestamosTabla'
import { ComprasTabla } from '@/components/features/operaciones/ComprasTabla'
import { BusquedaOperaciones } from '@/components/features/operaciones/BusquedaOperaciones'
import type { EstadoPrestamo } from '@/types'

const POR_PAGINA = 20

type SearchParams = Promise<{
  libro?: string
  usuario?: string
  estado?: string
  pagina_p?: string
  pagina_c?: string
}>

export default async function OperacionesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const busquedaLibro = params.libro?.trim() ?? ''
  const busquedaUsuario = params.usuario?.trim() ?? ''
  const estado = params.estado ?? ''
  const paginaP = Math.max(1, parseInt(params.pagina_p ?? '1', 10))
  const paginaC = Math.max(1, parseInt(params.pagina_c ?? '1', 10))

  const supabase = await createClient()

  // Resolver IDs según los filtros activos
  const [librosRes, usuariosRes] = await Promise.all([
    busquedaLibro
      ? supabase.from('libros').select('id').or(`titulo.ilike.%${busquedaLibro}%,autor.ilike.%${busquedaLibro}%`)
      : Promise.resolve({ data: null }),
    busquedaUsuario
      ? supabase.from('usuarios').select('id').ilike('nombre_completo', `%${busquedaUsuario}%`)
      : Promise.resolve({ data: null }),
  ])

  const libroIds = librosRes.data?.map((l) => l.id) ?? null
  const usuarioIds = usuariosRes.data?.map((u) => u.id) ?? null

  // Sin resultados si algún filtro activo no encuentra coincidencias
  const sinResultados =
    (busquedaLibro && libroIds?.length === 0) ||
    (busquedaUsuario && usuarioIds?.length === 0)

  let prestamosQuery = supabase
    .from('prestamos')
    .select(
      'id, estado, fecha_prestamo, fecha_vencimiento, fecha_devolucion, precio_prestamo, creado_en, usuarios(id, nombre_completo), libros(id, titulo, autor)',
      { count: 'exact' },
    )
    .order('creado_en', { ascending: false })
    .range((paginaP - 1) * POR_PAGINA, paginaP * POR_PAGINA - 1)

  let comprasQuery = supabase
    .from('compras')
    .select(
      'id, precio_compra, creado_en, usuarios(id, nombre_completo), libros(id, titulo, autor)',
      { count: 'exact' },
    )
    .order('creado_en', { ascending: false })
    .range((paginaC - 1) * POR_PAGINA, paginaC * POR_PAGINA - 1)

  if (estado) prestamosQuery = prestamosQuery.eq('estado', estado as EstadoPrestamo)
  if (libroIds) {
    prestamosQuery = prestamosQuery.in('libro_id', libroIds)
    comprasQuery = comprasQuery.in('libro_id', libroIds)
  }
  if (usuarioIds) {
    prestamosQuery = prestamosQuery.in('usuario_id', usuarioIds)
    comprasQuery = comprasQuery.in('usuario_id', usuarioIds)
  }

  const [prestamosRes, comprasRes] = sinResultados
    ? [{ data: [], count: 0, error: null }, { data: [], count: 0, error: null }]
    : await Promise.all([prestamosQuery, comprasQuery])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operaciones</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Historial de préstamos y compras.
        </p>
      </div>

      <BusquedaOperaciones libroInicial={busquedaLibro} usuarioInicial={busquedaUsuario} />

      <PrestamosTabla
        prestamos={(prestamosRes.data ?? []) as Parameters<typeof PrestamosTabla>[0]['prestamos']}
        total={prestamosRes.count ?? 0}
        porPagina={POR_PAGINA}
        filtros={{ estado, pagina: paginaP }}
      />

      <ComprasTabla
        compras={(comprasRes.data ?? []) as Parameters<typeof ComprasTabla>[0]['compras']}
        total={comprasRes.count ?? 0}
        porPagina={POR_PAGINA}
        filtros={{ pagina: paginaC }}
      />
    </div>
  )
}
