import { createClient } from '@/lib/supabase/server'
import { marcarDevuelto } from '@/app/actions/prestamos'

jest.mock('@/lib/supabase/server')
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

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

// ─── marcarDevuelto ──────────────────────────────────────────────────────────

describe('marcarDevuelto', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin sesión', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({ error: 'Sin sesión.' })
  })

  it('retorna error si el usuario no es admin', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: jest.fn(() => queryChain({ data: { rol: 'usuario' }, error: null })),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({ error: 'Sin permisos.' })
  })

  it('retorna error si el préstamo no existe', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: { rol: 'admin' }, error: null }) // perfil admin
        return queryChain({ data: null, error: null }) // préstamo no encontrado
      }),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({ error: 'Préstamo no encontrado.' })
  })

  it('retorna error si el préstamo ya está devuelto', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: { rol: 'admin' }, error: null })
        return queryChain({ data: { estado: 'devuelto', libro_id: 'libro-1' }, error: null })
      }),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({
      error: 'El préstamo ya está marcado como devuelto.',
    })
  })

  it('retorna error si falla la actualización en BD', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: { rol: 'admin' }, error: null })            // perfil admin
        if (n === 2) return queryChain({ data: { estado: 'activo', libro_id: 'libro-1' }, error: null }) // préstamo
        return queryChain({ data: null, error: { message: 'db error' } })                  // update falla
      }),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({ error: 'Error al actualizar el préstamo.' })
  })

  it('marca como devuelto y llama revalidatePath 4 veces', async () => {
    const { revalidatePath } = jest.requireMock('next/cache') as { revalidatePath: jest.Mock }

    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: { rol: 'admin' }, error: null })                          // perfil admin
        if (n === 2) return queryChain({ data: { estado: 'activo', libro_id: 'libro-1' }, error: null }) // prestamo select
        if (n === 3) return queryChain({ data: null, error: null })                                      // prestamo update
        if (n === 4) return queryChain({ data: { stock: 2 }, error: null })                              // libro select stock
        return queryChain({ data: null, error: null })                                                   // libro update stock
      }),
    } as never)

    expect(await marcarDevuelto('prestamo-1')).toEqual({ exito: 'Préstamo marcado como devuelto.' })
    expect(revalidatePath).toHaveBeenCalledTimes(4)
  })
})
