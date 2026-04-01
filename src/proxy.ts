import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { RUTAS } from '@/constants'

const RUTAS_PROTEGIDAS = [RUTAS.DASHBOARD, RUTAS.CUENTA]
const RUTAS_SOLO_INVITADOS = [RUTAS.LOGIN, RUTAS.REGISTRO]

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Refresca la sesión — imprescindible para SSR con @supabase/ssr
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const estaAutenticado = !!user

  // Rutas privadas: redirigir a /login si no hay sesión
  const esRutaProtegida = RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta))
  if (esRutaProtegida && !estaAutenticado) {
    const url = request.nextUrl.clone()
    url.pathname = RUTAS.LOGIN
    return NextResponse.redirect(url)
  }

  // Rutas de auth: redirigir a /catalogo si ya hay sesión
  const esRutaSoloInvitado = RUTAS_SOLO_INVITADOS.some((ruta) => pathname.startsWith(ruta))
  if (esRutaSoloInvitado && estaAutenticado) {
    const url = request.nextUrl.clone()
    url.pathname = RUTAS.CATALOGO
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
