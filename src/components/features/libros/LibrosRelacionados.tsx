import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type LibroCard = {
  id: string
  titulo: string
  autor: string
  portada_url: string | null
  precio_compra: number
  precio_prestamo: number
  stock: number
}

interface Props {
  libroActualId: string
  autor: string
  categoriaIds: string[]
}

export async function LibrosRelacionados({ libroActualId, autor, categoriaIds }: Props) {
  const supabase = await createClient()

  // Por categorías
  const { data: porCategorias } = categoriaIds.length > 0
    ? await supabase
        .from('libros_categorias')
        .select('libro_id')
        .in('categoria_id', categoriaIds)
    : { data: [] }

  const idsPorCategoria = (porCategorias ?? [])
    .map(r => r.libro_id)
    .filter(id => id !== libroActualId)

  let relacionados: LibroCard[] = []

  if (idsPorCategoria.length > 0) {
    const { data } = await supabase
      .from('libros')
      .select('id, titulo, autor, portada_url, precio_compra, precio_prestamo, stock')
      .in('id', idsPorCategoria)
      .is('eliminado_en', null)
      .eq('visible', true)
      .limit(4)
    relacionados = data ?? []
  }

  // Completar con mismo autor si faltan
  if (relacionados.length < 4) {
    const yaEncontrados = [libroActualId, ...relacionados.map(l => l.id)]
    const { data } = await supabase
      .from('libros')
      .select('id, titulo, autor, portada_url, precio_compra, precio_prestamo, stock')
      .eq('autor', autor)
      .not('id', 'in', `(${yaEncontrados.join(',')})`)
      .is('eliminado_en', null)
      .eq('visible', true)
      .limit(4 - relacionados.length)
    relacionados = [...relacionados, ...(data ?? [])]
  }

  // Completar con libros recientes si aún faltan
  if (relacionados.length < 4) {
    const yaEncontrados = [libroActualId, ...relacionados.map(l => l.id)]
    const { data } = await supabase
      .from('libros')
      .select('id, titulo, autor, portada_url, precio_compra, precio_prestamo, stock')
      .not('id', 'in', `(${yaEncontrados.join(',')})`)
      .is('eliminado_en', null)
      .eq('visible', true)
      .order('creado_en', { ascending: false })
      .limit(4 - relacionados.length)
    relacionados = [...relacionados, ...(data ?? [])]
  }

  if (relacionados.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-[#f5efe6]">También te puede interesar</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {relacionados.map((libro) => (
          <Link
            key={libro.id}
            href={`/libros/${libro.id}`}
            className="group flex flex-col rounded-xl border border-[rgba(212,149,42,0.15)] bg-[rgba(255,255,255,0.04)] transition hover:border-[rgba(212,149,42,0.3)] hover:bg-[rgba(212,149,42,0.06)]"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-[rgba(255,255,255,0.06)]">
              {libro.portada_url ? (
                <Image
                  src={libro.portada_url}
                  alt={libro.titulo}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">📖</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="line-clamp-2 text-xs font-semibold text-[#f5efe6] group-hover:text-[#f0b445]">
                {libro.titulo}
              </p>
              <p className="line-clamp-1 text-xs text-[rgba(245,239,230,0.4)]">{libro.autor}</p>
              <p className="mt-1 text-xs font-medium text-[#f0b445]">
                {Number(libro.precio_prestamo).toFixed(2)} € préstamo
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
