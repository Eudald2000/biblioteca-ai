'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { añadirAlCarrito } from '@/app/actions/carrito'

interface Props {
  libroId: string
  stock: number
  compact?: boolean
}

export function BotonesAccionLibro({ libroId, stock, compact = false }: Props) {
  const [pending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)
  const router = useRouter()

  function handleAñadir(tipo: 'prestamo' | 'compra') {
    setMensaje(null)
    startTransition(async () => {
      const resultado = await añadirAlCarrito(libroId, tipo)
      if (resultado.error) {
        setMensaje({ tipo: 'error', texto: resultado.error })
      } else {
        setMensaje({ tipo: 'exito', texto: resultado.exito ?? 'Añadido al carrito.' })
        router.refresh()
      }
    })
  }

  const sinStock = stock <= 0

  if (sinStock && compact) {
    return (
      <div className="rounded-lg bg-[rgba(255,255,255,0.04)] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[rgba(245,239,230,0.3)]">
        Agotado
      </div>
    )
  }

  if (sinStock) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
        <span className="text-sm text-[rgba(245,239,230,0.45)]">
          Agotado — todos los ejemplares están prestados o vendidos
        </span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => handleAñadir('prestamo')}
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? '...' : 'Pedir préstamo'}
        </button>
        <button
          onClick={() => handleAñadir('compra')}
          disabled={pending}
          className="w-full rounded-lg border border-[rgba(212,149,42,0.2)] px-2 py-1.5 text-xs font-medium text-[rgba(245,239,230,0.6)] transition hover:border-[rgba(212,149,42,0.4)] hover:bg-[rgba(212,149,42,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? '...' : '🛒 Añadir al carrito'}
        </button>
        {mensaje && (
          <p className={`text-[10px] ${mensaje.tipo === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {mensaje.texto}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => handleAñadir('prestamo')}
          disabled={pending}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Añadiendo...' : 'Pedir préstamo'}
        </button>
        <button
          onClick={() => handleAñadir('compra')}
          disabled={pending}
          className="flex-1 rounded-xl border border-[rgba(212,149,42,0.3)] bg-[rgba(212,149,42,0.08)] px-6 py-3 text-sm font-semibold text-[#f0b445] transition hover:border-[rgba(212,149,42,0.6)] hover:bg-[rgba(212,149,42,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Añadiendo...' : '🛒 Añadir al carrito'}
        </button>
      </div>
      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  )
}
