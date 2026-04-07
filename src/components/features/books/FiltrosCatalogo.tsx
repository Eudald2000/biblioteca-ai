'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Editorial { id: string; nombre: string }
interface Categoria { id: string; nombre: string }

interface FiltrosCatalogoProps {
  editoriales: Editorial[]
  categorias: Categoria[]
  valorTitulo: string
  valorAutor: string
  valorEditorialId: string
  valorCategoriaId: string
}

export default function FiltrosCatalogo({
  editoriales,
  categorias,
  valorTitulo,
  valorAutor,
  valorEditorialId,
  valorCategoriaId,
}: FiltrosCatalogoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tituloLocal, setTituloLocal] = useState(valorTitulo)
  const [autorLocal, setAutorLocal] = useState(valorAutor)
  const debounceTitle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceAutor = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hayFiltrosActivos =
    valorTitulo !== '' || valorAutor !== '' || valorEditorialId !== '' || valorCategoriaId !== ''

  function actualizarUrl(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [clave, valor] of Object.entries(params)) {
      if (valor) sp.set(clave, valor)
      else sp.delete(clave)
    }
    router.push(`/catalogo?${sp.toString()}`)
  }

  useEffect(() => {
    if (debounceTitle.current) clearTimeout(debounceTitle.current)
    debounceTitle.current = setTimeout(() => actualizarUrl({ titulo: tituloLocal }), 300)
    return () => { if (debounceTitle.current) clearTimeout(debounceTitle.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tituloLocal])

  useEffect(() => {
    if (debounceAutor.current) clearTimeout(debounceAutor.current)
    debounceAutor.current = setTimeout(() => actualizarUrl({ autor: autorLocal }), 300)
    return () => { if (debounceAutor.current) clearTimeout(debounceAutor.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorLocal])

  function limpiarFiltros() {
    setTituloLocal('')
    setAutorLocal('')
    router.push('/catalogo')
  }

  const inputBase =
    'w-full rounded-lg border border-[rgba(212,149,42,0.15)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm text-[#f5efe6] placeholder-[rgba(245,239,230,0.3)] transition focus:border-[#d4952a] focus:outline-none focus:ring-2 focus:ring-[rgba(212,149,42,0.15)]'

  return (
    <div className="mb-6 rounded-xl border border-[rgba(212,149,42,0.12)] bg-[rgba(255,255,255,0.04)] p-4">
      <div className="flex flex-wrap items-end gap-3">

        {/* Título */}
        <div className="min-w-0 flex-1 basis-48">
          <label htmlFor="filtro-titulo" className="mb-1 block text-xs font-medium text-[rgba(245,239,230,0.5)]">
            Título
          </label>
          <input
            id="filtro-titulo"
            type="search"
            placeholder="Buscar por título..."
            value={tituloLocal}
            onChange={(e) => setTituloLocal(e.target.value)}
            className={inputBase}
          />
        </div>

        {/* Autor */}
        <div className="min-w-0 flex-1 basis-48">
          <label htmlFor="filtro-autor" className="mb-1 block text-xs font-medium text-[rgba(245,239,230,0.5)]">
            Autor
          </label>
          <input
            id="filtro-autor"
            type="search"
            placeholder="Buscar por autor..."
            value={autorLocal}
            onChange={(e) => setAutorLocal(e.target.value)}
            className={inputBase}
          />
        </div>

        {/* Editorial */}
        <div className="min-w-0 flex-1 basis-40">
          <label htmlFor="filtro-editorial" className="mb-1 block text-xs font-medium text-[rgba(245,239,230,0.5)]">
            Editorial
          </label>
          <select
            id="filtro-editorial"
            value={valorEditorialId}
            onChange={(e) => actualizarUrl({ editorial_id: e.target.value })}
            className={cn(inputBase, 'cursor-pointer')}
          >
            <option value="">Todas</option>
            {editoriales.map((ed) => (
              <option key={ed.id} value={ed.id}>{ed.nombre}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="min-w-0 flex-1 basis-40">
          <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-medium text-[rgba(245,239,230,0.5)]">
            Categoría
          </label>
          <select
            id="filtro-categoria"
            value={valorCategoriaId}
            onChange={(e) => actualizarUrl({ categoria_id: e.target.value })}
            className={cn(inputBase, 'cursor-pointer')}
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Limpiar */}
        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="shrink-0 self-end rounded-lg border border-[rgba(212,149,42,0.2)] px-3 py-2 text-sm font-medium text-[rgba(245,239,230,0.5)] transition hover:border-red-500/50 hover:text-red-400"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
