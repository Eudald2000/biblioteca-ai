'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'
import type { RolUsuario } from '@/types'

export type UsuarioAdminState = { error?: string; exito?: string } | null

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, adminId: null }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') return { supabase: null, adminId: null }
  return { supabase, adminId: user.id }
}

export async function cambiarRolUsuario(
  id: string,
  nuevoRol: RolUsuario,
): Promise<UsuarioAdminState> {
  const { supabase, adminId } = await verificarAdmin()
  if (!supabase) return { error: 'Sin permisos.' }

  if (id === adminId) return { error: 'No puedes cambiar tu propio rol.' }

  const { error } = await supabase
    .from('usuarios')
    .update({ rol: nuevoRol })
    .eq('id', id)

  if (error) return { error: 'Error al cambiar el rol.' }

  revalidatePath(RUTAS.USUARIOS_ADMIN)
  return { exito: `Rol actualizado a "${nuevoRol}".` }
}

export async function toggleBaneoUsuario(
  id: string,
  baneado: boolean,
): Promise<UsuarioAdminState> {
  const { supabase, adminId } = await verificarAdmin()
  if (!supabase) return { error: 'Sin permisos.' }

  if (id === adminId) return { error: 'No puedes banearte a ti mismo.' }

  const { error } = await supabase
    .from('usuarios')
    .update({ baneado })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar el estado del usuario.' }

  revalidatePath(RUTAS.USUARIOS_ADMIN)
  return { exito: baneado ? 'Usuario baneado.' : 'Baneo levantado.' }
}
