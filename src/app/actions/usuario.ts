'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { RUTAS } from '@/constants'

export type UsuarioState = { error?: string; exito?: string } | null

export async function actualizarPerfil(
  _prevState: UsuarioState,
  formData: FormData,
): Promise<UsuarioState> {
  const nombre = (formData.get('nombre_completo') as string)?.trim()

  if (!nombre || nombre.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No hay sesión activa.' }
  }

  const { error } = await supabase
    .from('usuarios')
    .update({ nombre_completo: nombre })
    .eq('id', user.id)

  if (error) {
    return { error: 'Error al actualizar el perfil. Inténtalo de nuevo.' }
  }

  revalidatePath(RUTAS.CUENTA)
  revalidatePath(RUTAS.CATALOGO)

  return { exito: 'Perfil actualizado correctamente.' }
}
