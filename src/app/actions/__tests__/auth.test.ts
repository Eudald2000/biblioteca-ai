import { createClient } from '@/lib/supabase/server'
import { iniciarSesion, registrarse, cerrarSesion } from '../auth'

jest.mock('@/lib/supabase/server')

const mockRedirect = jest.fn()
const mockRevalidatePath = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))
jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// ---------------------------------------------------------------------------
// Helper: proxy encadenable que resuelve al resultado dado
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Helper: FormData de login
// ---------------------------------------------------------------------------
function loginFormData(email: string, password: string): FormData {
  const fd = new FormData()
  fd.append('email', email)
  fd.append('password', password)
  return fd
}

// ---------------------------------------------------------------------------
// Helper: FormData de registro
// ---------------------------------------------------------------------------
function registroFormData(overrides: {
  nombre?: string
  email?: string
  password?: string
  confirmPassword?: string
}): FormData {
  const defaults = {
    nombre: 'Usuario Test',
    email: 'test@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  }
  const values = { ...defaults, ...overrides }
  const fd = new FormData()
  fd.append('nombre', values.nombre)
  fd.append('email', values.email)
  fd.append('password', values.password)
  fd.append('confirmPassword', values.confirmPassword)
  return fd
}

// ---------------------------------------------------------------------------
// Helper: cliente mock base para login exitoso
// ---------------------------------------------------------------------------
function mockClienteLogin({
  signInError = null as null | { message: string; status?: number },
  userId = 'user-1',
  perfil = { rol: 'usuario', baneado: false },
} = {}) {
  const signOutMock = jest.fn().mockResolvedValue({})
  mockCreateClient.mockResolvedValue({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: signInError }),
      getUser: jest.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
      signOut: signOutMock,
    },
    from: jest.fn(() => queryChain({ data: perfil, error: null })),
  } as never)
  return { signOutMock }
}

// ===========================================================================
// iniciarSesion
// ===========================================================================
describe('iniciarSesion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('1. devuelve error si el email está vacío', async () => {
    const fd = loginFormData('', 'password123')
    const result = await iniciarSesion(null, fd)
    expect(result).toEqual({ error: 'El email y la contraseña son obligatorios.' })
  })

  it('2. devuelve error si la contraseña está vacía', async () => {
    const fd = loginFormData('test@example.com', '')
    const result = await iniciarSesion(null, fd)
    expect(result).toEqual({ error: 'El email y la contraseña son obligatorios.' })
  })

  it('3. devuelve error de credenciales incorrectas ante error genérico', async () => {
    mockClienteLogin({ signInError: { message: 'Invalid login credentials' } })
    const fd = loginFormData('test@example.com', 'wrongpass')
    const result = await iniciarSesion(null, fd)
    expect(result).toEqual({ error: 'Email o contraseña incorrectos.' })
  })

  it('5. devuelve error y llama signOut si el usuario está baneado', async () => {
    const { signOutMock } = mockClienteLogin({
      perfil: { rol: 'usuario', baneado: true },
    })
    const fd = loginFormData('baneado@example.com', 'password123')
    const result = await iniciarSesion(null, fd)
    expect(result?.error).toMatch(/suspendida/)
    expect(signOutMock).toHaveBeenCalledTimes(1)
  })

  it('6. redirige a /dashboard si el usuario es admin', async () => {
    mockClienteLogin({ perfil: { rol: 'admin', baneado: false } })
    const fd = loginFormData('admin@example.com', 'adminpass')
    await iniciarSesion(null, fd)
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('7. redirige a /catalogo si el usuario tiene rol usuario', async () => {
    mockClienteLogin({ perfil: { rol: 'usuario', baneado: false } })
    const fd = loginFormData('user@example.com', 'userpass')
    await iniciarSesion(null, fd)
    expect(mockRedirect).toHaveBeenCalledWith('/catalogo')
  })
})

// ===========================================================================
// registrarse
// ===========================================================================
describe('registrarse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('1. devuelve error si el nombre tiene menos de 2 caracteres', async () => {
    const fd = registroFormData({ nombre: 'A' })
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'El nombre debe tener al menos 2 caracteres.' })
  })

  it('2. devuelve error si el email tiene formato inválido', async () => {
    const fd = registroFormData({ email: 'no-es-un-email' })
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'Introduce un email con formato válido.' })
  })

  it('3. devuelve error si la contraseña tiene menos de 6 caracteres', async () => {
    const fd = registroFormData({ password: 'abc', confirmPassword: 'abc' })
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'La contraseña debe tener al menos 6 caracteres.' })
  })

  it('4. devuelve error si las contraseñas no coinciden', async () => {
    const fd = registroFormData({ password: 'password1', confirmPassword: 'password2' })
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'Las contraseñas no coinciden.' })
  })

  it('5. devuelve error si el email ya está registrado', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          error: { message: 'User already registered' },
        }),
      },
    } as never)
    const fd = registroFormData({ email: 'existing@example.com' })
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'Este email ya está registrado.' })
  })

  it('6. devuelve error de rate limit (status 429)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          error: { message: 'Too many requests', status: 429 },
        }),
      },
    } as never)
    const fd = registroFormData({})
    const result = await registrarse(null, fd)
    expect(result?.error).toMatch(/Demasiados intentos/)
  })

  it('7. devuelve error genérico ante cualquier otro error de signUp', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          error: { message: 'Unexpected server error' },
        }),
      },
    } as never)
    const fd = registroFormData({})
    const result = await registrarse(null, fd)
    expect(result).toEqual({ error: 'Error al crear la cuenta. Inténtalo de nuevo.' })
  })

  it('8. redirige a /catalogo tras registro exitoso', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ error: null }),
      },
    } as never)
    const fd = registroFormData({})
    await registrarse(null, fd)
    expect(mockRedirect).toHaveBeenCalledWith('/catalogo')
  })
})

// ===========================================================================
// cerrarSesion
// ===========================================================================
describe('cerrarSesion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('1. llama signOut y redirige a /login', async () => {
    const signOutMock = jest.fn().mockResolvedValue({})
    mockCreateClient.mockResolvedValue({
      auth: { signOut: signOutMock },
    } as never)

    await cerrarSesion()

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
