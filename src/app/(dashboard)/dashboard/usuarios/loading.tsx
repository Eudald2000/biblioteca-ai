export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-9 w-80 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
