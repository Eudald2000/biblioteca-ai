import { createClient } from '@/lib/supabase/server'
import { EditorialesTabla } from '@/components/features/editoriales/EditorialesTabla'

const POR_PAGINA = 15

type SearchParams = Promise<{
  busqueda?: string
  pagina?: string
  orden?: string
  direccion?: string
}>

export default async function EditorialesAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const busqueda = params.busqueda?.trim() ?? ''
  const pagina = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const orden = params.orden ?? 'nombre'
  const direccion = (params.direccion === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  const desde = (pagina - 1) * POR_PAGINA
  const hasta = pagina * POR_PAGINA - 1

  const supabase = await createClient()

  const columnaOrden = ['nombre', 'pais', 'creado_en'].includes(orden) ? orden : 'nombre'

  let query = supabase
    .from('editoriales')
    .select('id, nombre, pais, sitio_web, logo_url, creado_en', { count: 'exact' })

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }

  const { data: editoriales, count } = await query
    .order(columnaOrden, { ascending: direccion === 'asc' })
    .range(desde, hasta)

  // Conteo de libros por editorial (sólo libros no eliminados)
  const { data: conteos } = await supabase
    .from('libros')
    .select('editorial_id')
    .is('eliminado_en', null)

  const conteoPorEditorial = (conteos ?? []).reduce<Record<string, number>>((acc, libro) => {
    if (libro.editorial_id) {
      acc[libro.editorial_id] = (acc[libro.editorial_id] ?? 0) + 1
    }
    return acc
  }, {})

  const editorialesConConteo = (editoriales ?? []).map((ed) => ({
    ...ed,
    num_libros: conteoPorEditorial[ed.id] ?? 0,
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editoriales</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestión del catálogo de editoriales.
        </p>
      </div>

      <EditorialesTabla
        editoriales={editorialesConConteo}
        total={count ?? 0}
        porPagina={POR_PAGINA}
        filtros={{ busqueda, pagina, orden: columnaOrden, direccion }}
      />
    </div>
  )
}
