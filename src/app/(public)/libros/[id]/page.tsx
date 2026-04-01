import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LibroPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: libro } = await supabase
    .from('libros')
    .select(`
      id, titulo, autor, isbn, descripcion, portada_url, precio, stock, creado_en,
      editoriales (nombre, pais, sitio_web),
      libros_categorias (
        categorias (nombre)
      )
    `)
    .eq('id', id)
    .is('eliminado_en', null)
    .single()

  if (!libro) notFound()

  const categorias = (libro.libros_categorias as unknown as { categorias: { nombre: string } | null }[])
    ?.map((lc) => lc.categorias?.nombre)
    .filter((nombre): nombre is string => typeof nombre === 'string')

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={RUTAS.CATALOGO}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al catálogo
      </Link>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Portada */}
        <div className="mx-auto w-48 shrink-0 md:mx-0 md:w-56">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-gray-100 shadow-lg dark:bg-gray-800">
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
          {/* Categorías */}
          {categorias.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {categorias.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {libro.titulo}
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">{libro.autor}</p>
          </div>

          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Number(libro.precio).toFixed(2)} €
          </p>

          {/* Disponibilidad */}
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${libro.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {libro.stock > 0 ? `${libro.stock} unidades disponibles` : 'Sin stock'}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              disabled
              title="Disponible próximamente"
              className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white opacity-80 transition hover:opacity-100 disabled:cursor-not-allowed"
            >
              Pedir préstamo
            </button>
            <button
              disabled
              title="Disponible próximamente"
              className="flex-1 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              🛒 Añadir al carrito
            </button>
          </div>

          {/* Metadatos */}
          <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {libro.editoriales && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Editorial</dt>
                  <dd className="text-gray-900 dark:text-white">{(libro.editoriales as { nombre: string }).nombre}</dd>
                </>
              )}
              {libro.isbn && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">ISBN</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">{libro.isbn}</dd>
                </>
              )}
              {categorias.length > 0 && (
                <>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Categorías</dt>
                  <dd className="flex flex-wrap gap-1">
                    {categorias.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
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
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Sinopsis</h2>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">{libro.descripcion}</p>
        </div>
      )}
    </div>
  )
}
