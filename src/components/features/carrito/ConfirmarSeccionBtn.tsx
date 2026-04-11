'use client'

import { useTransition, useState } from 'react'
import { confirmarPrestamos, confirmarCompras } from '@/app/actions/carrito'

interface Props {
  tipo: 'prestamo' | 'compra'
  disabled?: boolean
}

export function ConfirmarSeccionBtn({ tipo, disabled = false }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirmar() {
    setError(null)
    startTransition(async () => {
      const resultado = tipo === 'prestamo' ? await confirmarPrestamos() : await confirmarCompras()
      if (resultado.error) setError(resultado.error)
    })
  }

  const label = tipo === 'prestamo' ? 'Confirmar préstamos' : 'Confirmar compras'

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleConfirmar}
        disabled={disabled || pending}
        className="rounded-xl bg-[#d4952a] px-6 py-2.5 text-sm font-semibold text-[#0d0b08] transition hover:bg-[#f0b445] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? 'Procesando...' : label}
      </button>
      {error && (
        <p className="text-right text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
