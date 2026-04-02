'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CategoriaFormState = { error?: string; exito?: string } | null

export async function crearCategoria(
  _prev: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const supabase = await createClient()

  const { error } = await supabase.from('categorias').insert({ nombre, descripcion })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe una categoría con ese nombre.' }
    }
    return { error: 'Error al crear la categoría.' }
  }

  revalidatePath('/dashboard/categorias')
  redirect('/dashboard/categorias')
}

export async function actualizarCategoria(
  id: string,
  _prev: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  const nombre = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null

  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categorias')
    .update({ nombre, descripcion, actualizado_en: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya existe una categoría con ese nombre.' }
    }
    return { error: 'Error al actualizar la categoría.' }
  }

  revalidatePath('/dashboard/categorias')
  redirect('/dashboard/categorias')
}

export async function eliminarCategoria(id: string): Promise<CategoriaFormState> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('libros_categorias')
    .select('*', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if (count && count > 0) {
    return { error: `No se puede eliminar: tiene ${count} libro(s) asociado(s).` }
  }

  await supabase.from('categorias').delete().eq('id', id)

  revalidatePath('/dashboard/categorias')
  redirect('/dashboard/categorias')
}
