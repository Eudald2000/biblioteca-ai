export default function CarritoLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-8 w-40 rounded-md bg-[rgba(212,149,42,0.08)]" />
      <div className="mt-8 flex flex-col gap-6">
        {[0, 1].map((s) => (
          <div key={s} className="rounded-2xl border border-[rgba(212,149,42,0.1)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="mb-4 h-5 w-32 rounded bg-[rgba(212,149,42,0.08)]" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-[rgba(212,149,42,0.08)] py-3">
                <div className="h-14 w-10 shrink-0 rounded-lg bg-[rgba(212,149,42,0.08)]" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-3.5 w-2/3 rounded bg-[rgba(212,149,42,0.08)]" />
                  <div className="h-3 w-1/3 rounded bg-[rgba(212,149,42,0.06)]" />
                </div>
                <div className="h-4 w-12 rounded bg-[rgba(212,149,42,0.08)]" />
              </div>
            ))}
            <div className="mt-4 flex justify-between">
              <div className="h-5 w-28 rounded bg-[rgba(212,149,42,0.06)]" />
              <div className="h-9 w-36 rounded-xl bg-[rgba(212,149,42,0.08)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
