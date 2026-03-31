import { Constants } from '@/lib/database.types'
import type { Tables, TablesInsert, Enums } from '@/lib/database.types'

describe('database.types — Constants', () => {
  it('define los valores del enum rol_usuario', () => {
    expect(Constants.public.Enums.rol_usuario).toEqual(['admin', 'usuario'])
  })

  it('define los valores del enum estado_prestamo', () => {
    expect(Constants.public.Enums.estado_prestamo).toEqual(['activo', 'devuelto', 'vencido'])
  })

  it('rol_usuario contiene exactamente 2 roles', () => {
    expect(Constants.public.Enums.rol_usuario).toHaveLength(2)
  })

  it('estado_prestamo contiene exactamente 3 estados', () => {
    expect(Constants.public.Enums.estado_prestamo).toHaveLength(3)
  })
})

describe('database.types — inferencia de tipos (compilación)', () => {
  it('Libro tiene los campos obligatorios correctos', () => {
    const libro: TablesInsert<'libros'> = {
      titulo: 'El Quijote',
      autor: 'Cervantes',
      editorial_id: 'uuid-editorial',
    }
    expect(libro.titulo).toBe('El Quijote')
    expect(libro.autor).toBe('Cervantes')
    expect(libro.editorial_id).toBe('uuid-editorial')
  })

  it('Perfil Row tiene el campo rol tipado como enum', () => {
    const rol: Enums<'rol_usuario'> = 'admin'
    expect(['admin', 'usuario']).toContain(rol)
  })

  it('Préstamo Row tiene el campo estado tipado como enum', () => {
    const estado: Enums<'estado_prestamo'> = 'activo'
    expect(['activo', 'devuelto', 'vencido']).toContain(estado)
  })

  it('Editorial Row tiene los campos esperados', () => {
    const editorial: Tables<'editoriales'> = {
      id: 'uuid',
      nombre: 'Planeta',
      pais: 'España',
      sitio_web: null,
      logo_url: null,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
    expect(editorial.nombre).toBe('Planeta')
  })

  it('Categoría Row tiene los campos esperados', () => {
    const categoria: Tables<'categorias'> = {
      id: 'uuid',
      nombre: 'Novela',
      descripcion: 'Ficción narrativa larga',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }
    expect(categoria.nombre).toBe('Novela')
  })
})
