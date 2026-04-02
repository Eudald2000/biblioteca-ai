import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorialForm } from '@/components/features/editoriales/EditorialForm'
import { actualizarEditorial } from '@/app/actions/editoriales'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditarEditorialPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: editorial } = await supabase
    .from('editoriales')
    .select('id, nombre, pais, sitio_web, logo_url')
    .eq('id', id)
    .single()

  if (!editorial) notFound()

  const action = actualizarEditorial.bind(null, id)

  return <EditorialForm editorial={editorial} action={action} />
}
