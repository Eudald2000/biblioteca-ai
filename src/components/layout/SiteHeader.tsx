import { createClient } from '@/lib/supabase/server'
import { SiteHeaderClient } from './SiteHeaderClient'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let perfil: { nombre_completo: string | null; rol: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('usuarios')
      .select('nombre_completo, rol')
      .eq('id', user.id)
      .single()
    perfil = data
  }

  return (
    <SiteHeaderClient
      user={user ? { email: user.email ?? '' } : null}
      perfil={perfil}
    />
  )
}
