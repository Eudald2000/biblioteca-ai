import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { RUTAS } from '@/constants'
import FiltrosCatalogo from '@/components/features/books/FiltrosCatalogo'
import { BotonesAccionLibro } from '@/components/features/libros/BotonesAccionLibro'

interface CatalogoPageProps {
  searchParams: Promise<{ titulo?: string; autor?: string; editorial_id?: string; categoria_id?: string }>
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const { titulo, autor, editorial_id, categoria_id } = await searchParams

  const supabase = await createClient()

  // Construir query de libros con filtros
  let query = supabase
    .from('libros')
    .select('id, titulo, autor, portada_url, precio_compra, precio_prestamo, stock')
    .is('eliminado_en', null)
    .eq('visible', true)

  if (titulo) {
    query = query.ilike('titulo', `%${titulo}%`)
  }

  if (autor) {
    query = query.ilike('autor', `%${autor}%`)
  }

  if (editorial_id) {
    query = query.eq('editorial_id', editorial_id)
  }

  if (categoria_id) {
    const { data: librosCat } = await supabase
      .from('libros_categorias')
      .select('libro_id')
      .eq('categoria_id', categoria_id)

    const ids = librosCat?.map((lc) => lc.libro_id) ?? []
    // Si no hay libros con esa categoría, forzar resultado vacío
    query = query.in('id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'])
  }

  query = query.order('titulo')

  const [{ data: libros }, { data: editoriales }, { data: categorias }, { data: { user } }] =
    await Promise.all([
      query,
      supabase.from('editoriales').select('id, nombre').order('nombre'),
      supabase.from('categorias').select('id, nombre').order('nombre'),
      supabase.auth.getUser(),
    ])

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#f5efe6]">Catálogo de libros</h2>
      <p className="mt-1 text-sm text-[rgba(245,239,230,0.5)]">
        {libros?.length ?? 0} libros disponibles
      </p>

      <div className="mt-4">
        <FiltrosCatalogo
          editoriales={editoriales ?? []}
          categorias={categorias ?? []}
          valorTitulo={titulo ?? ''}
          valorAutor={autor ?? ''}
          valorEditorialId={editorial_id ?? ''}
          valorCategoriaId={categoria_id ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {libros?.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[rgba(245,239,230,0.4)]">
            No se han encontrado libros con los filtros seleccionados.
          </p>
        )}
        {libros?.map((libro) => (
          <div
            key={libro.id}
            className="group flex flex-col rounded-xl border border-[rgba(212,149,42,0.15)] bg-[rgba(255,255,255,0.04)] shadow-sm transition hover:border-[rgba(212,149,42,0.3)] hover:bg-[rgba(212,149,42,0.06)]"
          >
            {/* Portada clicable */}
            <Link href={`/libros/${libro.id}`} className="block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-[rgba(255,255,255,0.06)]">
                {libro.portada_url ? (
                  <Image
                    src={libro.portada_url}
                    alt={`Portada de ${libro.titulo}`}
                    fill
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${libro.stock === 0 ? 'opacity-50' : ''}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className={`flex h-full items-center justify-center text-4xl ${libro.stock === 0 ? 'opacity-40' : ''}`}>📖</div>
                )}
                {libro.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-400">
                      Agotado
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* Info y botones */}
            <div className="flex flex-1 flex-col gap-1 p-3">
              <Link href={`/libros/${libro.id}`} className="block">
                <p className="line-clamp-2 text-xs font-semibold text-[#f5efe6] hover:text-[#f0b445]">
                  {libro.titulo}
                </p>
              </Link>
              <p className="line-clamp-1 text-xs text-[rgba(245,239,230,0.5)]">{libro.autor}</p>
              <div className="mt-1 flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-[#f0b445]">
                  Préstamo: {Number(libro.precio_prestamo).toFixed(2)} €
                </p>
                <p className="text-xs font-semibold text-[rgba(245,239,230,0.7)]">
                  Compra: {Number(libro.precio_compra).toFixed(2)} €
                </p>
              </div>

              {/* Botones de acción */}
              <div className="mt-2">
                {user ? (
                  <BotonesAccionLibro libroId={libro.id} stock={libro.stock} compact />
                ) : (
                  <Link
                    href={`${RUTAS.LOGIN}?next=/libros/${libro.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-2 py-1.5 text-center text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
