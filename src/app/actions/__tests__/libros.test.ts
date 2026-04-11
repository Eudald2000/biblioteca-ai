import { createClient } from '@/lib/supabase/server'
import { crearLibro, actualizarLibro, toggleVisibilidad, eliminarLibroPermanente } from '@/app/actions/libros'

jest.mock('@/lib/supabase/server')
const mockRedirect = jest.fn()
const mockRevalidatePath = jest.fn()
jest.mock('next/navigation', () => ({ redirect: (...args: unknown[]) => mockRedirect(...args) }))
jest.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function queryChain(result: { data: unknown; error: unknown }) {
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

function makeLibroForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData()
  fd.append('titulo', 'El Quijote')
  fd.append('autor', 'Cervantes')
  fd.append('editorial_id', 'ed-uuid-1')
  fd.append('stock', '5')
  fd.append('precio_compra', '12.99')
  fd.append('precio_prestamo', '2.99')
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v)
  }
  return fd
}

// ─── crearLibro ──────────────────────────────────────────────────────────────

describe('crearLibro', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el título está vacío', async () => {
    const result = await crearLibro(null, makeLibroForm({ titulo: '' }))
    expect(result).toEqual({ error: 'El título es obligatorio.' })
  })

  it('retorna error si el autor está vacío', async () => {
    const result = await crearLibro(null, makeLibroForm({ autor: '' }))
    expect(result).toEqual({ error: 'El autor es obligatorio.' })
  })

  it('retorna error si el ISBN es inválido', async () => {
    const result = await crearLibro(null, makeLibroForm({ isbn: '123' }))
    expect(result).toEqual({ error: 'El ISBN debe tener 10 o 13 dígitos.' })
  })

  it('retorna error si la URL de portada es inválida', async () => {
    const result = await crearLibro(null, makeLibroForm({ portada_url: 'no-es-una-url' }))
    expect(result).toEqual({ error: 'La URL de portada no es válida.' })
  })

  it('retorna error si el stock es negativo', async () => {
    const result = await crearLibro(null, makeLibroForm({ stock: '-1' }))
    expect(result).toEqual({ error: 'El stock debe ser un número entero >= 0.' })
  })

  it('retorna error si el insert en BD falla', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { message: 'duplicate key' } })),
    } as never)

    const result = await crearLibro(null, makeLibroForm())
    expect(result).toEqual({
      error: 'Error al crear el libro. Comprueba que el ISBN no esté duplicado.',
    })
  })

  it('redirige a /dashboard/libros en éxito sin categorías', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: { id: 'nuevo-libro' }, error: null })),
    } as never)

    await crearLibro(null, makeLibroForm())

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/libros')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })

  it('redirige a /dashboard/libros en éxito con categorías e inserta en libros_categorias', async () => {
    let n = 0
    const mockFrom = jest.fn(() => {
      n++
      if (n === 1) return queryChain({ data: { id: 'nuevo-libro' }, error: null })
      return queryChain({ data: null, error: null })
    })

    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    const fd = makeLibroForm()
    fd.append('categorias', 'cat-uuid-1')
    fd.append('categorias', 'cat-uuid-2')

    await crearLibro(null, fd)

    expect(mockFrom).toHaveBeenCalledWith('libros_categorias')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })
})

// ─── actualizarLibro ─────────────────────────────────────────────────────────

describe('actualizarLibro', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si la editorial está vacía', async () => {
    const result = await actualizarLibro('libro-id-1', null, makeLibroForm({ editorial_id: '' }))
    expect(result).toEqual({ error: 'La editorial es obligatoria.' })
  })

  it('retorna error si el update en BD falla', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    const result = await actualizarLibro('libro-id-1', null, makeLibroForm())
    expect(result).toEqual({ error: 'Error al actualizar el libro.' })
  })

  it('redirige a /dashboard/libros en éxito sin categorías', async () => {
    let n = 0
    const mockFrom = jest.fn(() => {
      n++
      if (n === 1) return queryChain({ data: null, error: null }) // libros update
      return queryChain({ data: null, error: null })              // libros_categorias delete
    })

    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    await actualizarLibro('libro-id-1', null, makeLibroForm())

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/libros')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })

  it('redirige a /dashboard/libros en éxito con 1 categoría', async () => {
    let n = 0
    const mockFrom = jest.fn(() => {
      n++
      if (n === 1) return queryChain({ data: null, error: null }) // libros update
      if (n === 2) return queryChain({ data: null, error: null }) // libros_categorias delete
      return queryChain({ data: null, error: null })              // libros_categorias insert
    })

    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    const fd = makeLibroForm()
    fd.append('categorias', 'cat-uuid-1')

    await actualizarLibro('libro-id-1', null, fd)

    expect(mockFrom).toHaveBeenCalledTimes(3)
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })
})

// ─── toggleVisibilidad ───────────────────────────────────────────────────────

describe('toggleVisibilidad', () => {
  afterEach(() => jest.clearAllMocks())

  it('llama a revalidatePath sin redirect al poner visible=false', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    await toggleVisibilidad('libro-id-1', false)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/libros')
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('llama a revalidatePath sin redirect al poner visible=true', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    await toggleVisibilidad('libro-id-1', true)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/libros')
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

// ─── eliminarLibroPermanente ─────────────────────────────────────────────────

describe('eliminarLibroPermanente', () => {
  afterEach(() => jest.clearAllMocks())

  it('elimina categorías y libro, luego redirige a /dashboard/libros', async () => {
    let n = 0
    const mockFrom = jest.fn(() => {
      n++
      if (n === 1) return queryChain({ data: null, error: null }) // libros_categorias delete
      return queryChain({ data: null, error: null })              // libros delete
    })

    mockCreateClient.mockResolvedValue({ from: mockFrom } as never)

    await eliminarLibroPermanente('libro-id-1')

    expect(mockFrom).toHaveBeenCalledWith('libros_categorias')
    expect(mockFrom).toHaveBeenCalledWith('libros')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/libros')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })

  it('siempre llama a redirect independientemente de errores de BD', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    await eliminarLibroPermanente('libro-id-1')

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/libros')
  })
})
