import { createClient } from '@/lib/supabase/client'

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  })),
}))

describe('supabase/client — createClient (navegador)', () => {
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

  it('devuelve un cliente con los métodos esperados', () => {
    const cliente = createClient()
    expect(cliente).toBeDefined()
    expect(typeof cliente.from).toBe('function')
    expect(typeof cliente.auth.getUser).toBe('function')
  })

  it('llama a createBrowserClient con las variables de entorno correctas', () => {
    const { createBrowserClient } = require('@supabase/ssr')
    createClient()
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })
})
