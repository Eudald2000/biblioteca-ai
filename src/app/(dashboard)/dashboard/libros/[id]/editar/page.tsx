import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LibroForm } from '@/components/features/libros/LibroForm'
import { actualizarLibro } from '@/app/actions/libros'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarLibroPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [libroRes, editorialesRes, categoriasRes] = await Promise.all([
    supabase
      .from('libros')
      .select('id, titulo, autor, isbn, descripcion, portada_url, stock, precio_compra, precio_prestamo, editorial_id, libros_categorias(categoria_id)')
      .eq('id', id)
      .is('eliminado_en', null)
      .single(),
    supabase.from('editoriales').select('id, nombre').order('nombre'),
    supabase.from('categorias').select('id, nombre').order('nombre'),
  ])

  if (!libroRes.data) notFound()

  const action = actualizarLibro.bind(null, id)

  return (
    <LibroForm
      libro={libroRes.data}
      action={action}
      editoriales={editorialesRes.data ?? []}
      categorias={categoriasRes.data ?? []}
    />
  )
}
