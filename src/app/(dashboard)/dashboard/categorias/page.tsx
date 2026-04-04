import { createClient } from '@/lib/supabase/server'
import { CategoriasTabla } from '@/components/features/categorias/CategoriasTabla'

const POR_PAGINA = 15

type SearchParams = Promise<{
  busqueda?: string
  pagina?: string
  orden?: string
  direccion?: string
}>

type CategoriaFila = {
  id: string
  nombre: string
  descripcion: string | null
  creado_en: string
  numLibros: number
}

export default async function CategoriasAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const busqueda = params.busqueda?.trim() ?? ''
  const pagina = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const orden = params.orden ?? 'nombre'
  const direccion = (params.direccion === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  const desde = (pagina - 1) * POR_PAGINA
  const hasta = pagina * POR_PAGINA - 1

  const supabase = await createClient()

  const columnaOrden = ['nombre', 'creado_en'].includes(orden) ? orden : 'nombre'

  let query = supabase
    .from('categorias')
    .select('id, nombre, descripcion, creado_en', { count: 'exact' })

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }

  const { data: categorias, count } = await query
    .order(columnaOrden, { ascending: direccion === 'asc' })
    .range(desde, hasta)

  // Obtener conteo de libros por categoría
  const { data: conteos } = await supabase.from('libros_categorias').select('categoria_id')

  const conteoPorCategoria: Record<string, number> = {}
  for (const fila of conteos ?? []) {
    conteoPorCategoria[fila.categoria_id] = (conteoPorCategoria[fila.categoria_id] ?? 0) + 1
  }

  const filas: CategoriaFila[] = (categorias ?? []).map((cat) => ({
    id: cat.id,
    nombre: cat.nombre,
    descripcion: cat.descripcion ?? null,
    creado_en: cat.creado_en,
    numLibros: conteoPorCategoria[cat.id] ?? 0,
  }))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestión de categorías del catálogo.
        </p>
      </div>

      <CategoriasTabla
        categorias={filas}
        total={count ?? 0}
        porPagina={POR_PAGINA}
        filtros={{ busqueda, pagina, orden: columnaOrden, direccion }}
      />
    </div>
  )
}
