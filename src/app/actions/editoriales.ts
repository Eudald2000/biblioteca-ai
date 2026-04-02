'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EditorialFormState = { error?: string; exito?: string } | null

const URL_REGEX = /^https?:\/\/.+/

function validarCampos(formData: FormData): {
  nombre: string
  pais: string | null
  sitio_web: string | null
  logo_url: string | null
} | { error: string } {
  const nombre = (formData.get('nombre') as string)?.trim()
  const pais = (formData.get('pais') as string)?.trim() || null
  const sitio_web = (formData.get('sitio_web') as string)?.trim() || null
  const logo_url = (formData.get('logo_url') as string)?.trim() || null

  if (!nombre) return { error: 'El nombre de la editorial es obligatorio.' }
  if (sitio_web && !URL_REGEX.test(sitio_web))
    return { error: 'La URL del sitio web no es válida. Debe empezar por http:// o https://' }
  if (logo_url && !URL_REGEX.test(logo_url))
    return { error: 'La URL del logo no es válida. Debe empezar por http:// o https://' }

  return { nombre, pais, sitio_web, logo_url }
}

export async function crearEditorial(
  _prev: EditorialFormState,
  formData: FormData,
): Promise<EditorialFormState> {
  const campos = validarCampos(formData)
  if ('error' in campos) return { error: campos.error }

  const supabase = await createClient()

  const { error } = await supabase.from('editoriales').insert({
    nombre: campos.nombre,
    pais: campos.pais,
    sitio_web: campos.sitio_web,
    logo_url: campos.logo_url,
  })

  if (error) return { error: 'Error al crear la editorial. Comprueba que el nombre no esté duplicado.' }

  revalidatePath('/dashboard/editoriales')
  redirect('/dashboard/editoriales')
}

export async function actualizarEditorial(
  id: string,
  _prev: EditorialFormState,
  formData: FormData,
): Promise<EditorialFormState> {
  const campos = validarCampos(formData)
  if ('error' in campos) return { error: campos.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('editoriales')
    .update({
      nombre: campos.nombre,
      pais: campos.pais,
      sitio_web: campos.sitio_web,
      logo_url: campos.logo_url,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar la editorial.' }

  revalidatePath('/dashboard/editoriales')
  redirect('/dashboard/editoriales')
}

export async function eliminarEditorial(id: string): Promise<EditorialFormState> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('libros')
    .select('*', { count: 'exact', head: true })
    .eq('editorial_id', id)
    .is('eliminado_en', null)

  if (count && count > 0) {
    return { error: `No se puede eliminar: tiene ${count} libro(s) asociado(s).` }
  }

  const { error } = await supabase.from('editoriales').delete().eq('id', id)

  if (error) return { error: 'Error al eliminar la editorial.' }

  revalidatePath('/dashboard/editoriales')
  redirect('/dashboard/editoriales')
}
