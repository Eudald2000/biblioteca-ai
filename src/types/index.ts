import type { Database } from '@/lib/database.types'

export type RolUsuario = Database['public']['Enums']['rol_usuario']
export type EstadoPrestamo = Database['public']['Enums']['estado_prestamo']

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Libro = Database['public']['Tables']['libros']['Row']
export type Prestamo = Database['public']['Tables']['prestamos']['Row']
export type Compra = Database['public']['Tables']['compras']['Row']
export type Editorial = Database['public']['Tables']['editoriales']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
