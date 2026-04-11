'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

type TipoItem = Database['public']['Enums']['tipo_item_carrito']
type ActionResult = { error?: string; exito?: string }

function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

function fechaMas15Dias(): string {
  const d = new Date()
  d.setDate(d.getDate() + 15)
  return d.toISOString().split('T')[0]
}

// ─── añadirAlCarrito ────────────────────────────────────────────────────────

export async function añadirAlCarrito(
  libroId: string,
  tipo: TipoItem,
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { data: libro } = await supabase
    .from('libros')
    .select('id, stock, visible, eliminado_en')
    .eq('id', libroId)
    .is('eliminado_en', null)
    .eq('visible', true)
    .single()

  if (!libro) return { error: 'El libro no está disponible.' }
  if (libro.stock <= 0) return { error: 'Este libro no tiene stock disponible.' }

  const { data: existente } = await supabase
    .from('carrito')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('libro_id', libroId)
    .eq('tipo', tipo)
    .maybeSingle()

  if (existente) return { exito: 'Ya está en el carrito.' }

  const { error } = await supabase.from('carrito').insert({
    usuario_id: user.id,
    libro_id: libroId,
    tipo,
    cantidad: 1,
  })

  if (error) return { error: 'Error al añadir al carrito.' }

  revalidatePath('/', 'layout')

  const tipoTexto = tipo === 'prestamo' ? 'préstamo' : 'compra'
  return { exito: `Añadido al carrito de ${tipoTexto}.` }
}

// ─── eliminarDelCarrito ──────────────────────────────────────────────────────

export async function eliminarDelCarrito(itemId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { error } = await supabase
    .from('carrito')
    .delete()
    .eq('id', itemId)
    .eq('usuario_id', user.id)

  if (error) return { error: 'Error al eliminar el item.' }

  revalidatePath('/carrito')
  revalidatePath('/', 'layout')

  return {}
}

// ─── confirmarPrestamos ──────────────────────────────────────────────────────

export async function confirmarPrestamos(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { data: items, error: errorItems } = await supabase
    .from('carrito')
    .select('id, libro_id, libros(titulo, stock, precio_prestamo)')
    .eq('usuario_id', user.id)
    .eq('tipo', 'prestamo' as TipoItem)

  if (errorItems) return { error: 'Error al obtener el carrito.' }
  if (!items || items.length === 0) return { error: 'No hay libros para préstamo en el carrito.' }

  const fechaPrestamo = hoy()
  const fechaVencimiento = fechaMas15Dias()

  for (const item of items) {
    const libro = item.libros
    if (!libro) return { error: 'Libro no encontrado.' }
    if (libro.stock <= 0) return { error: `Sin stock disponible: "${libro.titulo}".` }

    // Validar préstamo duplicado — rechazar si ya tiene este libro en préstamo activo
    const { data: prestamoDuplicado } = await supabase
      .from('prestamos')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('libro_id', item.libro_id)
      .eq('estado', 'activo')
      .maybeSingle()

    if (prestamoDuplicado) return { error: `Ya tienes un préstamo activo de "${libro.titulo}".` }

    // Decremento atómico — falla si stock ya era 0
    const { data: updated, error: errorStock } = await supabase
      .from('libros')
      .update({ stock: libro.stock - 1 })
      .eq('id', item.libro_id)
      .gt('stock', 0)
      .select('id')

    if (errorStock) return { error: `Error al reservar stock: "${libro.titulo}".` }
    if (!updated || updated.length === 0) return { error: `Stock agotado en el último momento: "${libro.titulo}".` }

    const { error: errorPrestamo } = await supabase.from('prestamos').insert({
      usuario_id: user.id,
      libro_id: item.libro_id,
      precio_prestamo: libro.precio_prestamo,
      estado: 'activo',
      fecha_prestamo: fechaPrestamo,
      fecha_vencimiento: fechaVencimiento,
    })

    if (errorPrestamo) {
      // Rollback parcial del stock
      await supabase.from('libros').update({ stock: libro.stock }).eq('id', item.libro_id)
      return { error: `Error al registrar el préstamo: "${libro.titulo}".` }
    }
  }

  await supabase
    .from('carrito')
    .delete()
    .eq('usuario_id', user.id)
    .eq('tipo', 'prestamo' as TipoItem)

  revalidatePath('/carrito')
  revalidatePath('/cuenta/prestamos')
  revalidatePath('/', 'layout')

  return { exito: 'Préstamos confirmados correctamente.' }
}

// ─── confirmarCompras ────────────────────────────────────────────────────────

export async function confirmarCompras(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sin sesión.' }

  const { data: items, error: errorItems } = await supabase
    .from('carrito')
    .select('id, libro_id, libros(titulo, stock, precio_compra)')
    .eq('usuario_id', user.id)
    .eq('tipo', 'compra' as TipoItem)

  if (errorItems) return { error: 'Error al obtener el carrito.' }
  if (!items || items.length === 0) return { error: 'No hay libros para compra en el carrito.' }

  for (const item of items) {
    const libro = item.libros
    if (!libro) return { error: 'Libro no encontrado.' }
    if (libro.stock <= 0) return { error: `Sin stock disponible: "${libro.titulo}".` }

    const { data: updated, error: errorStock } = await supabase
      .from('libros')
      .update({ stock: libro.stock - 1 })
      .eq('id', item.libro_id)
      .gt('stock', 0)
      .select('id')

    if (errorStock) return { error: `Error al reservar stock: "${libro.titulo}".` }
    if (!updated || updated.length === 0) return { error: `Stock agotado en el último momento: "${libro.titulo}".` }

    const { error: errorCompra } = await supabase.from('compras').insert({
      usuario_id: user.id,
      libro_id: item.libro_id,
      precio_compra: libro.precio_compra,
    })

    if (errorCompra) {
      await supabase.from('libros').update({ stock: libro.stock }).eq('id', item.libro_id)
      return { error: `Error al registrar la compra: "${libro.titulo}".` }
    }
  }

  await supabase
    .from('carrito')
    .delete()
    .eq('usuario_id', user.id)
    .eq('tipo', 'compra' as TipoItem)

  revalidatePath('/carrito')
  revalidatePath('/cuenta/compras')
  revalidatePath('/', 'layout')

  return { exito: 'Compras confirmadas correctamente.' }
}
