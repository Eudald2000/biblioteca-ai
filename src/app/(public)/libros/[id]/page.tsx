import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'
import { BotonesAccionLibro } from '@/components/features/libros/BotonesAccionLibro'
import { LibrosRelacionados } from '@/components/features/libros/LibrosRelacionados'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LibroPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: libro }, { data: { user } }] = await Promise.all([
    supabase
      .from('libros')
      .select(`
        id, titulo, autor, isbn, descripcion, portada_url, precio_compra, precio_prestamo, stock, creado_en,
        editoriales (nombre, pais, sitio_web),
        libros_categorias (
          categoria_id,
          categorias (nombre)
        )
      `)
      .eq('id', id)
      .is('eliminado_en', null)
      .eq('visible', true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!libro) notFound()

  const categorias = (libro.libros_categorias as unknown as { categoria_id: string; categorias: { nombre: string } | null }[])
    ?.map((lc) => lc.categorias?.nombre)
    .filter((nombre): nombre is string => typeof nombre === 'string')

  const categoriaIds = (libro.libros_categorias as unknown as { categoria_id: string; categorias: { nombre: string } | null }[])
    ?.map((lc) => lc.categoria_id)
    .filter((id): id is string => typeof id === 'string') ?? []

  const loginNext = `${RUTAS.LOGIN}?next=/libros/${id}`

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={RUTAS.CATALOGO}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[rgba(245,239,230,0.4)] hover:text-[#f5efe6]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al catálogo
      </Link>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Portada */}
        <div className="mx-auto w-48 shrink-0 md:mx-0 md:w-56">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.06)] shadow-lg">
            {libro.portada_url ? (
              <Image
                src={libro.portada_url}
                alt={`Portada de ${libro.titulo}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 224px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">📖</div>
            )}
          </div>
        </div>

        {/* Información */}
        <div className="flex flex-1 flex-col gap-4">

          <div>
            <h1 className="text-2xl font-bold text-[#f5efe6] md:text-3xl">
              {libro.titulo}
            </h1>
            <p className="mt-1 text-base text-[rgba(245,239,230,0.5)]">{libro.autor}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold text-[#f0b445]">
              Préstamo: {Number(libro.precio_prestamo).toFixed(2)} €
            </p>
            <p className="text-xl font-bold text-[rgba(245,239,230,0.7)]">
              Compra: {Number(libro.precio_compra).toFixed(2)} €
            </p>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${libro.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-[rgba(245,239,230,0.5)]">
              {libro.stock > 0 ? `${libro.stock} unidades disponibles` : 'Sin stock'}
            </span>
          </div>

          {/* Botones de acción */}
          {user ? (
            <BotonesAccionLibro libroId={libro.id} stock={libro.stock} />
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-[rgba(212,149,42,0.2)] bg-[rgba(212,149,42,0.06)] p-4">
              <p className="text-sm text-[rgba(245,239,230,0.6)]">
                Inicia sesión para pedir préstamos o comprar libros.
              </p>
              <div className="flex gap-2">
                <Link
                  href={loginNext}
                  className="rounded-lg bg-[#d4952a] px-4 py-2 text-sm font-semibold text-[#0d0b08] transition hover:bg-[#f0b445]"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href={`${RUTAS.REGISTRO}?next=/libros/${id}`}
                  className="rounded-lg border border-[rgba(212,149,42,0.3)] px-4 py-2 text-sm font-semibold text-[#f0b445] transition hover:border-[rgba(212,149,42,0.6)] hover:bg-[rgba(212,149,42,0.1)]"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}

          {/* Metadatos */}
          <div className="mt-2 rounded-xl border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {libro.editoriales && (
                <>
                  <dt className="font-medium text-[rgba(245,239,230,0.4)]">Editorial</dt>
                  <dd className="text-[#f5efe6]">{(libro.editoriales as { nombre: string }).nombre}</dd>
                </>
              )}
              {libro.isbn && (
                <>
                  <dt className="font-medium text-[rgba(245,239,230,0.4)]">ISBN</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">{libro.isbn}</dd>
                </>
              )}
              {categorias.length > 0 && (
                <>
                  <dt className="font-medium text-[rgba(245,239,230,0.4)]">Categorías</dt>
                  <dd className="flex flex-wrap gap-1">
                    {categorias.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full border border-[rgba(212,149,42,0.2)] bg-[rgba(212,149,42,0.1)] px-2 py-0.5 text-xs font-medium text-[#f0b445]"
                      >
                        {cat}
                      </span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Descripción / Sinopsis */}
      {libro.descripcion && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-[#f5efe6]">Sinopsis</h2>
          <p className="leading-relaxed text-[rgba(245,239,230,0.6)]">{libro.descripcion}</p>
        </div>
      )}

      <LibrosRelacionados
        libroActualId={libro.id}
        autor={libro.autor}
        categoriaIds={categoriaIds}
      />
    </div>
  )
}
