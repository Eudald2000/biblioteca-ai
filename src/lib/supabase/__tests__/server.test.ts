import { createClient } from '@/lib/supabase/server'

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
  }),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  })),
}))

describe('supabase/server — createClient (servidor)', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
  })

  it('devuelve un cliente con los métodos esperados', async () => {
    const cliente = await createClient()
    expect(cliente).toBeDefined()
    expect(typeof cliente.from).toBe('function')
    expect(typeof cliente.auth.getUser).toBe('function')
  })

  it('llama a createServerClient con las variables de entorno correctas', async () => {
    const { createServerClient } = require('@supabase/ssr')
    await createClient()
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )
  })

  it('el adaptador de cookies llama a getAll del cookieStore', async () => {
    const { cookies } = require('next/headers')
    const { createServerClient } = require('@supabase/ssr')
    await createClient()
    const cookiesArg = createServerClient.mock.calls[0][2].cookies
    cookiesArg.getAll()
    const cookieStore = await cookies()
    expect(cookieStore.getAll).toHaveBeenCalled()
  })

  it('el adaptador de cookies llama a set al usar setAll', async () => {
    const { cookies } = require('next/headers')
    const { createServerClient } = require('@supabase/ssr')
    await createClient()
    const cookiesArg = createServerClient.mock.calls[0][2].cookies
    cookiesArg.setAll([{ name: 'session', value: 'abc', options: {} }])
    const cookieStore = await cookies()
    expect(cookieStore.set).toHaveBeenCalledWith('session', 'abc', {})
  })
})
