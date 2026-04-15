'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LibroFormState = { error?: string; exito?: string } | null

const ISBN_REGEX = /^([0-9]{9}[0-9X]|[0-9]{13})$/

function validarCampos(formData: FormData): {
  titulo: string
  autor: string
  isbn: string | null
  editorial_id: string
  descripcion: string | null
  portada_url: string | null
  stock: number
  precio_compra: number
  precio_prestamo: number
  categorias: string[]
} | { error: string } {
  const titulo = (formData.get('titulo') as string)?.trim()
  const autor = (formData.get('autor') as string)?.trim()
  const isbn = (formData.get('isbn') as string)?.trim() || null
  const editorial_id = (formData.get('editorial_id') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const portada_url = (formData.get('portada_url') as string)?.trim() || null
  const stockRaw = formData.get('stock') as string
  const precioCompraRaw = formData.get('precio_compra') as string
  const precioPrestamoRaw = formData.get('precio_prestamo') as string
  const categorias = formData.getAll('categorias') as string[]

  if (!titulo) return { error: 'El título es obligatorio.' }
  if (!autor) return { error: 'El autor es obligatorio.' }
  if (!editorial_id) return { error: 'La editorial es obligatoria.' }
  if (isbn && !ISBN_REGEX.test(isbn)) return { error: 'El ISBN debe tener 10 o 13 dígitos.' }

  const stock = parseInt(stockRaw, 10)
  if (isNaN(stock) || stock < 0) return { error: 'El stock debe ser un número entero >= 0.' }

  const precio_compra = parseFloat(precioCompraRaw)
  if (isNaN(precio_compra) || precio_compra < 0) return { error: 'El precio de compra debe ser >= 0.' }

  const precio_prestamo = parseFloat(precioPrestamoRaw)
  if (isNaN(precio_prestamo) || precio_prestamo < 0) return { error: 'El precio de préstamo debe ser >= 0.' }

  return { titulo, autor, isbn, editorial_id, descripcion, portada_url, stock, precio_compra, precio_prestamo, categorias }
}

export async function crearLibro(
  _prev: LibroFormState,
  formData: FormData,
): Promise<LibroFormState> {
  const campos = validarCampos(formData)
  if ('error' in campos) return { error: campos.error }

  const supabase = await createClient()

  const { data: libro, error } = await supabase
    .from('libros')
    .insert({
      titulo: campos.titulo,
      autor: campos.autor,
      isbn: campos.isbn,
      editorial_id: campos.editorial_id,
      descripcion: campos.descripcion,
      portada_url: campos.portada_url,
      stock: campos.stock,
      precio_compra: campos.precio_compra,
      precio_prestamo: campos.precio_prestamo,
    })
    .select('id')
    .single()

  if (error || !libro) {
    return { error: 'Error al crear el libro. Comprueba que el ISBN no esté duplicado.' }
  }

  if (campos.categorias.length > 0) {
    await supabase.from('libros_categorias').insert(
      campos.categorias.map((categoria_id) => ({ libro_id: libro.id, categoria_id })),
    )
  }

  revalidatePath('/dashboard/libros')
  redirect('/dashboard/libros')
}

export async function actualizarLibro(
  id: string,
  _prev: LibroFormState,
  formData: FormData,
): Promise<LibroFormState> {
  const campos = validarCampos(formData)
  if ('error' in campos) return { error: campos.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('libros')
    .update({
      titulo: campos.titulo,
      autor: campos.autor,
      isbn: campos.isbn,
      editorial_id: campos.editorial_id,
      descripcion: campos.descripcion,
      portada_url: campos.portada_url,
      stock: campos.stock,
      precio_compra: campos.precio_compra,
      precio_prestamo: campos.precio_prestamo,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar el libro.' }

  // Reemplazar categorías
  await supabase.from('libros_categorias').delete().eq('libro_id', id)

  if (campos.categorias.length > 0) {
    await supabase.from('libros_categorias').insert(
      campos.categorias.map((categoria_id) => ({ libro_id: id, categoria_id })),
    )
  }

  revalidatePath('/dashboard/libros')
  redirect('/dashboard/libros')
}

/** Alterna la visibilidad del libro en el catálogo público sin redirigir. */
export async function toggleVisibilidad(id: string, visible: boolean): Promise<void> {
  const supabase = await createClient()

  await supabase.from('libros').update({ visible }).eq('id', id)

  revalidatePath('/dashboard/libros')
}

/** Elimina el libro permanentemente de la base de datos. Irreversible. */
export async function eliminarLibroPermanente(id: string): Promise<void> {
  const supabase = await createClient()

  // Obtener portada_url antes de borrar para limpiar Storage
  const { data: libro } = await supabase
    .from('libros')
    .select('portada_url')
    .eq('id', id)
    .single()

  await supabase.from('libros_categorias').delete().eq('libro_id', id)
  await supabase.from('libros').delete().eq('id', id)

  // Limpiar imagen del bucket si pertenece a Supabase Storage
  if (libro?.portada_url?.includes('/storage/v1/object/public/portadas/')) {
    const fileName = libro.portada_url.split('/portadas/').pop()
    if (fileName) {
      await supabase.storage.from('portadas').remove([fileName])
    }
  }

  revalidatePath('/dashboard/libros')
  redirect('/dashboard/libros')
}
