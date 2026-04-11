import { createClient } from '@/lib/supabase/server'
import { SiteHeaderClient } from './SiteHeaderClient'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let perfil: { nombre_completo: string | null; rol: string } | null = null
  let carritoCount = 0
  if (user) {
    const [{ data }, { count }] = await Promise.all([
      supabase.from('usuarios').select('nombre_completo, rol').eq('id', user.id).single(),
      supabase.from('carrito').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id),
    ])
    perfil = data
    carritoCount = count ?? 0
  }

  return (
    <SiteHeaderClient
      user={user ? { email: user.email ?? '' } : null}
      perfil={perfil}
      carritoCount={carritoCount}
    />
  )
}
