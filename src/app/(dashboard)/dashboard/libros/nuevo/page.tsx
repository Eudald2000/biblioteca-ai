import { createClient } from '@/lib/supabase/server'
import { LibroForm } from '@/components/features/libros/LibroForm'
import { crearLibro } from '@/app/actions/libros'

export default async function NuevoLibroPage() {
  const supabase = await createClient()

  const [editorialesRes, categoriasRes] = await Promise.all([
    supabase.from('editoriales').select('id, nombre').order('nombre'),
    supabase.from('categorias').select('id, nombre').order('nombre'),
  ])

  return (
    <LibroForm
      action={crearLibro}
      editoriales={editorialesRes.data ?? []}
      categorias={categoriasRes.data ?? []}
    />
  )
}
