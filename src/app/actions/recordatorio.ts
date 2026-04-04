'use server'

// TODO: Activar cuando la edge function esté desplegada y RESEND_API_KEY configurado
// Ver: supabase/functions/enviar-recordatorio/index.ts

import { createClient } from '@/lib/supabase/server'

export type RecordatorioState = { error?: string; exito?: string } | null

export async function enviarRecordatorioPrestamo(
  prestamoId: string,
): Promise<RecordatorioState> {
  const supabase = await createClient()

  // Verificar que el solicitante es admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') return { error: 'Sin permisos.' }

  // Verificar que el préstamo existe y está vencido
  const { data: prestamo } = await supabase
    .from('prestamos')
    .select('id, estado')
    .eq('id', prestamoId)
    .single()

  if (!prestamo) return { error: 'Préstamo no encontrado.' }
  if (prestamo.estado !== 'vencido') return { error: 'Solo se pueden enviar recordatorios de préstamos vencidos.' }

  // TODO: descomentar cuando la edge function esté desplegada
  /*
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(`${supabaseUrl}/functions/v1/enviar-recordatorio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ prestamo_id: prestamoId }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[recordatorio] Error edge function:', body)
    return { error: 'Error al enviar el recordatorio. Inténtalo de nuevo.' }
  }
  */

  // Placeholder hasta que el servicio de email esté configurado
  console.log(`[recordatorio] Pendiente de configurar — préstamo ${prestamoId}`)
  return { error: 'El servicio de email aún no está configurado. Ver CLAUDE.md → Pendientes.' }
}
