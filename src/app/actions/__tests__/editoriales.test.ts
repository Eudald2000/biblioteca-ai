import { createClient } from '@/lib/supabase/server'
import { crearEditorial, actualizarEditorial, eliminarEditorial } from '@/app/actions/editoriales'

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

// ─── crearEditorial ──────────────────────────────────────────────────────────

describe('crearEditorial', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el nombre está vacío', async () => {
    const formData = new FormData()
    formData.append('nombre', '   ')

    expect(await crearEditorial(null, formData)).toEqual({
      error: 'El nombre de la editorial es obligatorio.',
    })
  })

  it('retorna error si sitio_web tiene URL inválida', async () => {
    const formData = new FormData()
    formData.append('nombre', 'Planeta')
    formData.append('sitio_web', 'planeta.com')

    expect(await crearEditorial(null, formData)).toEqual({
      error: 'La URL del sitio web no es válida. Debe empezar por http:// o https://',
    })
  })

  it('retorna error si logo_url tiene URL inválida', async () => {
    const formData = new FormData()
    formData.append('nombre', 'Planeta')
    formData.append('logo_url', 'logo.png')

    expect(await crearEditorial(null, formData)).toEqual({
      error: 'La URL del logo no es válida. Debe empezar por http:// o https://',
    })
  })

  it('retorna error genérico de DB', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Planeta')

    expect(await crearEditorial(null, formData)).toEqual({
      error: 'Error al crear la editorial. Comprueba que el nombre no esté duplicado.',
    })
  })

  it('llama a redirect en caso de éxito', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Planeta')
    formData.append('pais', 'España')
    formData.append('sitio_web', 'https://planeta.com')
    formData.append('logo_url', 'https://planeta.com/logo.png')

    await crearEditorial(null, formData)

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/editoriales')
  })
})

// ─── actualizarEditorial ─────────────────────────────────────────────────────

describe('actualizarEditorial', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el nombre está vacío', async () => {
    const formData = new FormData()
    formData.append('nombre', '')

    expect(await actualizarEditorial('ed-1', null, formData)).toEqual({
      error: 'El nombre de la editorial es obligatorio.',
    })
  })

  it('retorna error genérico de DB', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Planeta actualizada')

    expect(await actualizarEditorial('ed-1', null, formData)).toEqual({
      error: 'Error al actualizar la editorial.',
    })
  })

  it('llama a redirect en caso de éxito', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    const formData = new FormData()
    formData.append('nombre', 'Planeta actualizada')

    await actualizarEditorial('ed-1', null, formData)

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/editoriales')
  })
})

// ─── eliminarEditorial ───────────────────────────────────────────────────────

describe('eliminarEditorial', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si la editorial tiene libros asociados (count=1)', async () => {
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => queryChain({ data: null, error: null, count: 1 })),
    } as never)

    expect(await eliminarEditorial('ed-1')).toEqual({
      error: 'No se puede eliminar: tiene 1 libro(s) asociado(s).',
    })
  })

  it('retorna error si el delete falla', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: null, error: null, count: 0 }) // libros check
        return queryChain({ data: null, error: { message: 'db error' } })      // delete falla
      }),
    } as never)

    expect(await eliminarEditorial('ed-1')).toEqual({ error: 'Error al eliminar la editorial.' })
  })

  it('llama a redirect en caso de éxito', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: null, error: null, count: 0 }) // libros check
        return queryChain({ data: null, error: null })                          // delete ok
      }),
    } as never)

    await eliminarEditorial('ed-1')

    expect(mockRedirect).toHaveBeenCalledWith('/dashboard/editoriales')
  })
})
