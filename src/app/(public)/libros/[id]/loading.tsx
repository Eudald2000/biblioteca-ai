export default function LibroDetalleLoading() {
  return (
    <div className="animate-pulse">
      {/* Migas de pan */}
      <div className="mb-6 h-4 w-48 rounded bg-[rgba(212,149,42,0.06)]" />

      {/* Layout dos columnas */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Columna izquierda — portada */}
        <div className="w-full shrink-0 md:w-64 lg:w-72">
          <div className="aspect-[2/3] w-full rounded-xl bg-[rgba(212,149,42,0.08)]" />
        </div>

        {/* Columna derecha — info */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Título */}
          <div className="h-8 w-3/4 rounded-md bg-[rgba(212,149,42,0.1)]" />
          <div className="h-6 w-1/2 rounded-md bg-[rgba(212,149,42,0.08)]" />

          {/* Autor */}
          <div className="h-5 w-40 rounded bg-[rgba(212,149,42,0.07)]" />

          {/* Editorial / categorías */}
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-[rgba(212,149,42,0.08)]" />
            <div className="h-6 w-20 rounded-full bg-[rgba(212,149,42,0.06)]" />
            <div className="h-6 w-16 rounded-full bg-[rgba(212,149,42,0.06)]" />
          </div>

          {/* Separador */}
          <div className="h-px w-full bg-[rgba(212,149,42,0.08)]" />

          {/* Precios */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-16 rounded bg-[rgba(212,149,42,0.06)]" />
              <div className="h-7 w-20 rounded-md bg-[rgba(212,149,42,0.1)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-16 rounded bg-[rgba(212,149,42,0.06)]" />
              <div className="h-7 w-20 rounded-md bg-[rgba(212,149,42,0.08)]" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-10 w-full rounded-lg bg-[rgba(212,149,42,0.1)] sm:w-44" />
            <div className="h-10 w-full rounded-lg bg-[rgba(212,149,42,0.07)] sm:w-44" />
          </div>

          {/* Separador */}
          <div className="h-px w-full bg-[rgba(212,149,42,0.08)]" />

          {/* Sinopsis — líneas */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-full rounded bg-[rgba(212,149,42,0.07)]" />
            <div className="h-4 w-full rounded bg-[rgba(212,149,42,0.07)]" />
            <div className="h-4 w-5/6 rounded bg-[rgba(212,149,42,0.07)]" />
            <div className="h-4 w-4/5 rounded bg-[rgba(212,149,42,0.06)]" />
            <div className="h-4 w-3/4 rounded bg-[rgba(212,149,42,0.05)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
