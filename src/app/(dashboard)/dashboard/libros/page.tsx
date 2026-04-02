import { createClient } from '@/lib/supabase/server'
import { LibrosTabla } from '@/components/features/libros/LibrosTabla'

const POR_PAGINA = 15

type SearchParams = Promise<{
  busqueda?: string
  editorial?: string
  categoria?: string
  pagina?: string
  orden?: string
  direccion?: string
}>

type LibroFila = {
  id: string
  titulo: string
  autor: string
  isbn: string | null
  stock: number
  precio_compra: number
  precio_prestamo: number
  portada_url: string | null
  creado_en: string
  editorial_id: string
  visible: boolean
  editoriales: { nombre: string } | null
}

export default async function LibrosAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const busqueda = params.busqueda?.trim() ?? ''
  const editorial = params.editorial ?? ''
  const categoria = params.categoria ?? ''
  const pagina = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const orden = params.orden ?? 'titulo'
  const direccion = (params.direccion === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'

  const desde = (pagina - 1) * POR_PAGINA
  const hasta = pagina * POR_PAGINA - 1

  const supabase = await createClient()

  // Si hay filtro de categoría, primero obtenemos los IDs
  let libroIdsPorCategoria: string[] | null = null
  if (categoria) {
    const { data } = await supabase
      .from('libros_categorias')
      .select('libro_id')
      .eq('categoria_id', categoria)
    libroIdsPorCategoria = data?.map((r) => r.libro_id) ?? []
  }

  let query = supabase
    .from('libros')
    .select(
      'id, titulo, autor, isbn, stock, precio_compra, precio_prestamo, portada_url, creado_en, editorial_id, visible, editoriales(nombre)',
      { count: 'exact' },
    )
    .is('eliminado_en', null)

  if (busqueda) {
    query = query.or(`titulo.ilike.%${busqueda}%,autor.ilike.%${busqueda}%`)
  }
  if (editorial) {
    query = query.eq('editorial_id', editorial)
  }
  if (libroIdsPorCategoria !== null) {
    // Si no hay resultados para la categoría, forzamos array vacío
    const ids = libroIdsPorCategoria.length > 0 ? libroIdsPorCategoria : ['00000000-0000-0000-0000-000000000000']
    query = query.in('id', ids)
  }

  const columnaOrden = ['titulo', 'autor', 'stock', 'precio_compra', 'creado_en'].includes(orden)
    ? orden
    : 'titulo'

  const { data: libros, count } = await query
    .order(columnaOrden, { ascending: direccion === 'asc' })
    .range(desde, hasta)

  const [editorialesRes, categoriasRes] = await Promise.all([
    supabase.from('editoriales').select('id, nombre').order('nombre'),
    supabase.from('categorias').select('id, nombre').order('nombre'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Libros</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestión del catálogo de libros.
        </p>
      </div>

      <LibrosTabla
        libros={(libros ?? []) as LibroFila[]}
        total={count ?? 0}
        editoriales={editorialesRes.data ?? []}
        categorias={categoriasRes.data ?? []}
        porPagina={POR_PAGINA}
        filtros={{ busqueda, editorial, categoria, pagina, orden: columnaOrden, direccion }}
      />
    </div>
  )
}
