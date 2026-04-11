import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EliminarItemBtn } from '@/components/features/carrito/EliminarItemBtn'
import { ConfirmarSeccionBtn } from '@/components/features/carrito/ConfirmarSeccionBtn'
import { RUTAS } from '@/constants'

type LibroEnCarrito = {
  titulo: string
  autor: string
  portada_url: string | null
  precio_prestamo: number
  precio_compra: number
  stock: number
} | null

type ItemCarrito = {
  id: string
  libro_id: string
  cantidad: number
  libros: LibroEnCarrito
}

function formatPrecio(precio: number) {
  return precio.toFixed(2) + ' €'
}

export default async function CarritoPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`${RUTAS.LOGIN}?next=/carrito`)

  const [{ data: prestamosCarrito }, { data: comprasCarrito }] = await Promise.all([
    supabase
      .from('carrito')
      .select('id, libro_id, cantidad, libros(titulo, autor, portada_url, precio_prestamo, precio_compra, stock)')
      .eq('usuario_id', user.id)
      .eq('tipo', 'prestamo')
      .order('creado_en'),
    supabase
      .from('carrito')
      .select('id, libro_id, cantidad, libros(titulo, autor, portada_url, precio_prestamo, precio_compra, stock)')
      .eq('usuario_id', user.id)
      .eq('tipo', 'compra')
      .order('creado_en'),
  ])

  const prestamos = (prestamosCarrito ?? []) as ItemCarrito[]
  const compras = (comprasCarrito ?? []) as ItemCarrito[]

  const totalPrestamos = prestamos.reduce((acc, item) => acc + (item.libros?.precio_prestamo ?? 0), 0)
  const totalCompras = compras.reduce((acc, item) => acc + (item.libros?.precio_compra ?? 0), 0)

  const prestamosConSinStock = prestamos.some((item) => (item.libros?.stock ?? 0) <= 0)
  const comprasConSinStock = compras.some((item) => (item.libros?.stock ?? 0) <= 0)
  const carritoVacio = prestamos.length === 0 && compras.length === 0

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-[#f5efe6]">Mi carrito</h1>

      {carritoVacio ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">🛒</span>
          <p className="text-[rgba(245,239,230,0.5)]">Tu carrito está vacío.</p>
          <Link
            href={RUTAS.CATALOGO}
            className="rounded-xl bg-[#d4952a] px-6 py-2.5 text-sm font-semibold text-[#0d0b08] transition hover:bg-[#f0b445]"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">

          {/* ── Sección Préstamos ── */}
          <section className="rounded-2xl border border-[rgba(212,149,42,0.15)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#f5efe6]">📚 Préstamos</h2>
            </div>
            <p className="mb-4 text-xs text-[rgba(245,239,230,0.4)]">Los libros se prestan por 15 días.</p>

            {prestamos.length === 0 ? (
              <p className="text-sm text-[rgba(245,239,230,0.4)]">
                No tienes libros para préstamo.{' '}
                <Link href={RUTAS.CATALOGO} className="text-[#f0b445] hover:underline">Explorar catálogo</Link>
              </p>
            ) : (
              <>
                <ul className="divide-y divide-[rgba(212,149,42,0.08)]">
                  {prestamos.map((item) => {
                    const libro = item.libros
                    const sinStock = (libro?.stock ?? 0) <= 0
                    return (
                      <li key={item.id} className="flex items-center gap-4 py-3">
                        {/* Portada */}
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.06)]">
                          {libro?.portada_url ? (
                            <Image
                              src={libro.portada_url}
                              alt={libro.titulo}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-lg">📖</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                          <p className="truncate text-sm font-medium text-[#f5efe6]">{libro?.titulo ?? '—'}</p>
                          <p className="truncate text-xs text-[rgba(245,239,230,0.4)]">{libro?.autor ?? '—'}</p>
                          {sinStock && (
                            <span className="mt-0.5 w-fit rounded-full bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              Sin stock
                            </span>
                          )}
                        </div>

                        {/* Precio */}
                        <p className="shrink-0 text-sm font-semibold text-[#f0b445]">
                          {formatPrecio(libro?.precio_prestamo ?? 0)}
                        </p>

                        {/* Eliminar */}
                        <EliminarItemBtn itemId={item.id} />
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[rgba(212,149,42,0.1)] pt-4">
                  <p className="text-sm text-[rgba(245,239,230,0.5)]">
                    Total préstamos:{' '}
                    <span className="text-base font-bold text-[#f0b445]">{formatPrecio(totalPrestamos)}</span>
                  </p>
                  <ConfirmarSeccionBtn tipo="prestamo" disabled={prestamosConSinStock} />
                </div>
              </>
            )}
          </section>

          {/* ── Sección Compras ── */}
          <section className="rounded-2xl border border-[rgba(212,149,42,0.15)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#f5efe6]">🛒 Compras</h2>
            </div>
            <p className="mb-4 text-xs text-[rgba(245,239,230,0.4)]">La compra es permanente — el libro es tuyo.</p>

            {compras.length === 0 ? (
              <p className="text-sm text-[rgba(245,239,230,0.4)]">
                No tienes libros para compra.{' '}
                <Link href={RUTAS.CATALOGO} className="text-[#f0b445] hover:underline">Explorar catálogo</Link>
              </p>
            ) : (
              <>
                <ul className="divide-y divide-[rgba(212,149,42,0.08)]">
                  {compras.map((item) => {
                    const libro = item.libros
                    const sinStock = (libro?.stock ?? 0) <= 0
                    return (
                      <li key={item.id} className="flex items-center gap-4 py-3">
                        {/* Portada */}
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-[rgba(255,255,255,0.06)]">
                          {libro?.portada_url ? (
                            <Image
                              src={libro.portada_url}
                              alt={libro.titulo}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-lg">📖</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                          <p className="truncate text-sm font-medium text-[#f5efe6]">{libro?.titulo ?? '—'}</p>
                          <p className="truncate text-xs text-[rgba(245,239,230,0.4)]">{libro?.autor ?? '—'}</p>
                          {sinStock && (
                            <span className="mt-0.5 w-fit rounded-full bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              Sin stock
                            </span>
                          )}
                        </div>

                        {/* Precio */}
                        <p className="shrink-0 text-sm font-semibold text-[rgba(245,239,230,0.8)]">
                          {formatPrecio(libro?.precio_compra ?? 0)}
                        </p>

                        {/* Eliminar */}
                        <EliminarItemBtn itemId={item.id} />
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[rgba(212,149,42,0.1)] pt-4">
                  <p className="text-sm text-[rgba(245,239,230,0.5)]">
                    Total compras:{' '}
                    <span className="text-base font-bold text-[rgba(245,239,230,0.9)]">{formatPrecio(totalCompras)}</span>
                  </p>
                  <ConfirmarSeccionBtn tipo="compra" disabled={comprasConSinStock} />
                </div>
              </>
            )}
          </section>

        </div>
      )}
    </div>
  )
}
