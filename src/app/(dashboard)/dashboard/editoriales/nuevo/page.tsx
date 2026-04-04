import { EditorialForm } from '@/components/features/editoriales/EditorialForm'
import { crearEditorial } from '@/app/actions/editoriales'

export default function NuevaEditorialPage() {
  return <EditorialForm action={crearEditorial} />
}
