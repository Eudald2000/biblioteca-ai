export default function CatalogoLoading() {
  return (
    <div className="animate-pulse">
      {/* Cabecera */}
      <div className="h-8 w-52 rounded-md bg-[rgba(212,149,42,0.08)]" />
      <div className="mt-2 h-4 w-32 rounded bg-[rgba(212,149,42,0.06)]" />

      {/* Bloque de filtros */}
      <div className="mt-4 h-24 w-full rounded-xl bg-[rgba(212,149,42,0.08)]" />

      {/* Grid de tarjetas skeleton */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-[rgba(212,149,42,0.08)] bg-[rgba(212,149,42,0.04)]"
          >
            {/* Portada */}
            <div className="aspect-[2/3] w-full rounded-t-xl bg-[rgba(212,149,42,0.08)]" />

            {/* Info */}
            <div className="flex flex-col gap-2 p-3">
              {/* Título */}
              <div className="h-3 w-full rounded bg-[rgba(212,149,42,0.08)]" />
              <div className="h-3 w-3/4 rounded bg-[rgba(212,149,42,0.06)]" />
              {/* Autor */}
              <div className="h-2.5 w-1/2 rounded bg-[rgba(212,149,42,0.05)]" />
              {/* Precios */}
              <div className="mt-1 h-2.5 w-2/3 rounded bg-[rgba(212,149,42,0.08)]" />
              <div className="h-2.5 w-1/2 rounded bg-[rgba(212,149,42,0.06)]" />
              {/* Botón */}
              <div className="mt-2 h-7 w-full rounded-lg bg-[rgba(212,149,42,0.08)]" />
              <div className="h-7 w-full rounded-lg bg-[rgba(212,149,42,0.06)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
