'use server'

import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'
import { redirect } from 'next/navigation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type AuthState = { error?: string } | null

export async function iniciarSesion(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'El email y la contraseña son obligatorios.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No se pudo obtener la sesión.' }
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('rol, baneado')
    .eq('id', user.id)
    .single()

  if (perfil?.baneado) {
    await supabase.auth.signOut()
    return { error: 'Tu cuenta ha sido suspendida. Contacta con el administrador.' }
  }

  if (perfil?.rol === 'admin') {
    redirect(RUTAS.DASHBOARD)
  }

  redirect(RUTAS.CATALOGO)
}

export async function registrarse(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!nombre || nombre.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' }
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: 'Introduce un email con formato válido.' }
  }

  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo: nombre },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado.' }
    }
    if (error.status === 429) {
      return { error: 'Demasiados intentos. Espera unos segundos e inténtalo de nuevo.' }
    }
    return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' }
  }

  redirect(RUTAS.CATALOGO)
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(RUTAS.LOGIN)
}
