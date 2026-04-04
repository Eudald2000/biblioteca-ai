// TODO: Implementar envío de email con Resend
// Requisitos antes de activar:
//   1. Cuenta en https://resend.com + API key
//   2. supabase secrets set RESEND_API_KEY=re_xxxx
//   3. Dominio verificado en Resend (o usar onboarding@resend.dev en sandbox)
//   4. Habilitar extensión pg_net en Supabase (Dashboard → Database → Extensions)
//   5. Crear trigger en prestamos (ver migration pendiente abajo)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM_EMAIL = 'Biblioteca Virtual <noreply@tudominio.com>' // TODO: cambiar por dominio verificado

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { prestamo_id } = await req.json()
  if (!prestamo_id) {
    return new Response(JSON.stringify({ error: 'prestamo_id requerido' }), { status: 400 })
  }

  // Cliente con service role para leer auth.users
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Obtener datos del préstamo + usuario + libro
  const { data: prestamo, error } = await supabase
    .from('prestamos')
    .select(`
      id,
      fecha_vencimiento,
      precio_prestamo,
      libros ( titulo, autor ),
      usuarios ( id, nombre_completo )
    `)
    .eq('id', prestamo_id)
    .single()

  if (error || !prestamo) {
    return new Response(JSON.stringify({ error: 'Préstamo no encontrado' }), { status: 404 })
  }

  // Obtener email del usuario desde auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(
    (prestamo.usuarios as { id: string }).id
  )

  if (!authUser?.user?.email) {
    return new Response(JSON.stringify({ error: 'Email de usuario no encontrado' }), { status: 404 })
  }

  const libro = prestamo.libros as { titulo: string; autor: string }
  const usuario = prestamo.usuarios as { nombre_completo: string | null }
  const nombreUsuario = usuario.nombre_completo ?? authUser.user.email
  const fechaVencimiento = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(
    new Date(prestamo.fecha_vencimiento)
  )

  // TODO: descomentar cuando RESEND_API_KEY esté configurado
  /*
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: authUser.user.email,
      subject: `Recordatorio: préstamo vencido — ${libro.titulo}`,
      html: `
        <p>Hola, <strong>${nombreUsuario}</strong>.</p>
        <p>Te recordamos que el préstamo del libro <strong>"${libro.titulo}"</strong> de ${libro.autor}
        venció el <strong>${fechaVencimiento}</strong> y aún no ha sido devuelto.</p>
        <p>Por favor, devuelve el libro a la mayor brevedad posible.</p>
        <p>Si ya lo has devuelto y ves este mensaje por error, ignóralo.</p>
        <br/>
        <p>— Biblioteca Virtual</p>
      `,
    }),
  })

  if (!emailRes.ok) {
    const body = await emailRes.text()
    return new Response(JSON.stringify({ error: 'Error al enviar email', detail: body }), { status: 500 })
  }
  */

  // Registrar el recordatorio (opcional: añadir tabla recordatorios en el futuro)
  console.log(`[recordatorio] email que se enviaría a ${authUser.user.email} por préstamo ${prestamo_id}`)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
