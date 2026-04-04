export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      {[0, 1].map((t) => (
        <div key={t} className="space-y-3">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
