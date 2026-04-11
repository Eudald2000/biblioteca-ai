'use client'

import { useTransition } from 'react'
import { eliminarDelCarrito } from '@/app/actions/carrito'

interface Props {
  itemId: string
}

export function EliminarItemBtn({ itemId }: Props) {
  const [pending, startTransition] = useTransition()

  function handleEliminar() {
    startTransition(async () => {
      await eliminarDelCarrito(itemId)
    })
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={pending}
      aria-label="Eliminar del carrito"
      className="rounded-lg p-1.5 text-[rgba(245,239,230,0.3)] transition hover:bg-red-900/20 hover:text-red-400 disabled:cursor-wait disabled:opacity-40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  )
}
