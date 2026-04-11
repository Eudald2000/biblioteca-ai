import { createClient } from '@/lib/supabase/server'
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '@/app/actions/categorias'

jest.mock('@/lib/supabase/server')

const mockRevalidatePath = jest.fn()
const mockRedirect = jest.fn()
jest.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }))
jest.mock('next/navigation', () => ({ redirect: (...args: unknown[]) => mockRedirect(...args) }))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function queryChain(result: { data: unknown; error: unknown; count?: number | null }) {
  const p = Promise.resolve(result)
  function makeProxy(): object {
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === 'then') return p.then.bind(p)
        if (prop === 'catch') return p.catch.bind(p)
        if (prop === 'finally') return p.finally.bind(p)
        if (prop === 'single' || prop === 'maybeSingle') return () => p
        return () => makeProxy()
      },
    }
    return new Proxy({}, handler)
  }
  return makeProxy()
}

// ─── crearCategoria ──────────────────────────────────────────────────────────

describe('crearCategoria', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el nombre está vacío', async () => {
    const formData = new FormData()
    formData.append('nombre', '   ')

    expect(await crearCategoria(null, formData)).toEqual({ error: 'El nombre es obligatorio.' })
  })

  it('retorna error de duplicado (code 23505)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { code: '23505' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción')

    expect(await crearCategoria(null, formData)).toEqual({
      error: 'Ya existe una categoría con ese nombre.',
    })
  })

  it('retorna error genérico de DB', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { code: '50000', message: 'db error' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción')

    expect(await crearCategoria(null, formData)).toEqual({ error: 'Error al crear la categoría.' })
  })

  it('llama a redirect en caso de éxito', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción')
    formData.append('descripcion', 'Literatura de ficción')

    await crearCategoria(null, formData)

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/categorias')
  })
})

// ─── actualizarCategoria ─────────────────────────────────────────────────────

describe('actualizarCategoria', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el nombre está vacío', async () => {
    const formData = new FormData()
    formData.append('nombre', '')

    expect(await actualizarCategoria('cat-1', null, formData)).toEqual({
      error: 'El nombre es obligatorio.',
    })
  })

  it('retorna error de duplicado (code 23505)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { code: '23505' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción')

    expect(await actualizarCategoria('cat-1', null, formData)).toEqual({
      error: 'Ya existe una categoría con ese nombre.',
    })
  })

  it('retorna error genérico de DB', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { code: '50000', message: 'db error' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción')

    expect(await actualizarCategoria('cat-1', null, formData)).toEqual({
      error: 'Error al actualizar la categoría.',
    })
  })

  it('llama a redirect en caso de éxito', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Ficción actualizada')

    await actualizarCategoria('cat-1', null, formData)

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/categorias')
  })
})

// ─── eliminarCategoria ───────────────────────────────────────────────────────

describe('eliminarCategoria', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si la categoría tiene libros asociados (count=2)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null, count: 2 })),
    } as never)

    expect(await eliminarCategoria('cat-1')).toEqual({
      error: 'No se puede eliminar: tiene 2 libro(s) asociado(s).',
    })
  })

  it('llama a redirect cuando no hay libros asociados (count=0)', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: null, error: null, count: 0 }) // libros_categorias check
        return queryChain({ data: null, error: null })                          // delete
      }),
    } as never)

    await eliminarCategoria('cat-1')

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/categorias')
  })

  it('llama a redirect cuando no hay libros asociados (count=null)', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: null, error: null, count: null }) // libros_categorias check
        return queryChain({ data: null, error: null })                             // delete
      }),
    } as never)

    await eliminarCategoria('cat-1')

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/categorias')
  })
})
