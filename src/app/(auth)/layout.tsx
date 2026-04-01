import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          📚 Biblioteca Virtual
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tu biblioteca digital de confianza
        </p>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {children}
      </div>
    </div>
  )
}
