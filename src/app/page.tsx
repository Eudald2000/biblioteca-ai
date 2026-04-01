import { redirect } from 'next/navigation'
import { RUTAS } from '@/constants'

export default function RootPage() {
  redirect(RUTAS.CATALOGO)
}
