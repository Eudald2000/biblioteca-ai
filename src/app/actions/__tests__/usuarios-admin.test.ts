import { createClient } from '@/lib/supabase/server'
import { cambiarRolUsuario, toggleBaneoUsuario } from '@/app/actions/usuarios-admin'

jest.mock('@/lib/supabase/server')
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/constants', () => ({
  RUTAS: { USUARIOS_ADMIN: '/dashboard/usuarios' },
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

/** Mock de cliente admin: primera llamada a `from` devuelve el perfil admin,
 *  la segunda devuelve `fromResult` (usado para el update del target). */
function mockAdminClient(fromResult: { data: unknown; error: unknown }) {
  let n = 0
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }) },
    from: jest.fn(() => {
      n++
      if (n === 1) return queryChain({ data: { rol: 'admin' }, error: null }) // verificarAdmin: select perfil
      return queryChain(fromResult)                                            // update target
    }),
  }
}

/** Mock de cliente sin permisos (usuario no admin). */
function mockNoAdminClient() {
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: jest.fn(() => queryChain({ data: { rol: 'usuario' }, error: null })),
  }
}

// ─── cambiarRolUsuario ───────────────────────────────────────────────────────

describe('cambiarRolUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin permisos (no admin)', async () => {
    mockCreateClient.mockResolvedValue(mockNoAdminClient() as never)

    expect(await cambiarRolUsuario('otro-user', 'usuario')).toEqual({ error: 'Sin permisos.' })
  })

  it('retorna error si el admin intenta cambiar su propio rol', async () => {
    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: null }) as never,
    )

    // id === adminId → auto-cambio
    expect(await cambiarRolUsuario('admin-1', 'usuario')).toEqual({
      error: 'No puedes cambiar tu propio rol.',
    })
  })

  it('retorna error si falla la actualización en BD', async () => {
    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: { message: 'db error' } }) as never,
    )

    expect(await cambiarRolUsuario('otro-user', 'usuario')).toEqual({ error: 'Error al cambiar el rol.' })
  })

  it('retorna exito con el nuevo rol', async () => {
    const { revalidatePath } = jest.requireMock('next/cache') as { revalidatePath: jest.Mock }

    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: null }) as never,
    )

    expect(await cambiarRolUsuario('otro-user', 'usuario')).toEqual({
      exito: 'Rol actualizado a "usuario".',
    })
    expect(revalidatePath).toHaveBeenCalledTimes(1)
  })
})

// ─── toggleBaneoUsuario ──────────────────────────────────────────────────────

describe('toggleBaneoUsuario', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin permisos (no admin)', async () => {
    mockCreateClient.mockResolvedValue(mockNoAdminClient() as never)

    expect(await toggleBaneoUsuario('otro-user', true)).toEqual({ error: 'Sin permisos.' })
  })

  it('retorna error si el admin intenta banearse a sí mismo', async () => {
    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: null }) as never,
    )

    expect(await toggleBaneoUsuario('admin-1', true)).toEqual({
      error: 'No puedes banearte a ti mismo.',
    })
  })

  it('banea a un usuario y retorna exito', async () => {
    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: null }) as never,
    )

    expect(await toggleBaneoUsuario('otro-user', true)).toEqual({ exito: 'Usuario baneado.' })
  })

  it('levanta el baneo y retorna exito', async () => {
    mockCreateClient.mockResolvedValue(
      mockAdminClient({ data: null, error: null }) as never,
    )

    expect(await toggleBaneoUsuario('otro-user', false)).toEqual({ exito: 'Baneo levantado.' })
  })
})
