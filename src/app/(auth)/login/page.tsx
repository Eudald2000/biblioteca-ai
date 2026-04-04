import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata = { title: 'Iniciar sesión — Biblioteca Virtual' }

type SearchParams = Promise<{ baneado?: string }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const baneado = params.baneado === '1'

  return <LoginForm mensajeBaneo={baneado} />
}
