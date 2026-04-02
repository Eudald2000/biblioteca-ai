import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoriaForm } from '@/components/features/categorias/CategoriaForm'
import { actualizarCategoria } from '@/app/actions/categorias'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categoria } = await supabase
    .from('categorias')
    .select('id, nombre, descripcion')
    .eq('id', id)
    .single()

  if (!categoria) notFound()

  const action = actualizarCategoria.bind(null, id)

  return (
    <CategoriaForm
      categoria={categoria}
      action={action}
    />
  )
}
