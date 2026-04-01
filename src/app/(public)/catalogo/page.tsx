import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function CatalogoPage() {
  const supabase = await createClient()
  const { data: libros } = await supabase
    .from('libros')
    .select('id, titulo, autor, portada_url, precio, stock')
    .is('eliminado_en', null)
    .order('titulo')

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogo de libros</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {libros?.length ?? 0} libros disponibles
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {libros?.map((libro) => (
          <div
            key={libro.id}
            className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Portada clicable */}
            <Link href={`/libros/${libro.id}`} className="block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-700">
                {libro.portada_url ? (
                  <Image
                    src={libro.portada_url}
                    alt={`Portada de ${libro.titulo}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">📖</div>
                )}
              </div>
            </Link>

            {/* Info y botones */}
            <div className="flex flex-1 flex-col gap-1 p-3">
              <Link href={`/libros/${libro.id}`} className="block">
                <p className="line-clamp-2 text-xs font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  {libro.titulo}
                </p>
              </Link>
              <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{libro.autor}</p>
              <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                {libro.precio.toFixed(2)} €
              </p>

              {/* Botones de acción */}
              <div className="mt-2 flex flex-col gap-1.5">
                <button
                  disabled
                  title="Disponible próximamente"
                  className="w-full rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white opacity-80 transition hover:opacity-100 disabled:cursor-not-allowed"
                >
                  Pedir préstamo
                </button>
                <button
                  disabled
                  title="Disponible próximamente"
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  🛒 Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
