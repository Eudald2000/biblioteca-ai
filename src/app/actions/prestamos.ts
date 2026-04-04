'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type PrestamoState = { error?: string; exito?: string } | null

export async function marcarDevuelto(prestamoId: string): Promise<PrestamoState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') return { error: 'Sin permisos.' }

  const { data: prestamo } = await supabase
    .from('prestamos')
    .select('estado')
    .eq('id', prestamoId)
    .single()

  if (!prestamo) return { error: 'Préstamo no encontrado.' }
  if (prestamo.estado === 'devuelto') return { error: 'El préstamo ya está marcado como devuelto.' }

  const { error } = await supabase
    .from('prestamos')
    .update({ estado: 'devuelto', fecha_devolucion: new Date().toISOString().split('T')[0] })
    .eq('id', prestamoId)

  if (error) return { error: 'Error al actualizar el préstamo.' }

  revalidatePath('/dashboard/operaciones')
  revalidatePath('/dashboard/usuarios/[id]', 'page')

  return { exito: 'Préstamo marcado como devuelto.' }
}
