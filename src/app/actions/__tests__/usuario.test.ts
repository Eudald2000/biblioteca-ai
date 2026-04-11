import { createClient } from '@/lib/supabase/server'
import { actualizarPerfil } from '@/app/actions/usuario'

jest.mock('@/lib/supabase/server')
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/constants', () => ({
  RUTAS: { CUENTA: '/cuenta', CATALOGO: '/catalogo' },
}))

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

// ─── actualizarPerfil ────────────────────────────────────────────────────────

describe('actualizarPerfil', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error si el nombre está vacío', async () => {
    const fd = new FormData()
    fd.set('nombre_completo', '')

    expect(await actualizarPerfil(null, fd)).toEqual({
      error: 'El nombre debe tener al menos 2 caracteres.',
    })
  })

  it('retorna error si el nombre tiene solo 1 carácter', async () => {
    const fd = new FormData()
    fd.set('nombre_completo', 'A')

    expect(await actualizarPerfil(null, fd)).toEqual({
      error: 'El nombre debe tener al menos 2 caracteres.',
    })
  })

  it('retorna error sin sesión activa', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    const fd = new FormData()
    fd.set('nombre_completo', 'Ana García')

    expect(await actualizarPerfil(null, fd)).toEqual({ error: 'No hay sesión activa.' })
  })

  it('retorna error si falla la actualización en BD', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    const fd = new FormData()
    fd.set('nombre_completo', 'Ana García')

    expect(await actualizarPerfil(null, fd)).toEqual({
      error: 'Error al actualizar el perfil. Inténtalo de nuevo.',
    })
  })

  it('retorna exito y llama revalidatePath al actualizar correctamente', async () => {
    const { revalidatePath } = jest.requireMock('next/cache') as { revalidatePath: jest.Mock }

    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    const fd = new FormData()
    fd.set('nombre_completo', 'Ana García')

    expect(await actualizarPerfil(null, fd)).toEqual({ exito: 'Perfil actualizado correctamente.' })
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })
})
