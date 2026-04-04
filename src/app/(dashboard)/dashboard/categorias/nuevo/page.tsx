import { CategoriaForm } from '@/components/features/categorias/CategoriaForm'
import { crearCategoria } from '@/app/actions/categorias'

export default function NuevaCategoriaPage() {
  return <CategoriaForm action={crearCategoria} />
}
