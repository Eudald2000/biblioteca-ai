import { createClient } from '@/lib/supabase/server'
import {
  añadirAlCarrito,
  eliminarDelCarrito,
  confirmarPrestamos,
  confirmarCompras,
} from '@/app/actions/carrito'

jest.mock('@/lib/supabase/server')
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Proxy que resuelve siempre al mismo `result`, sin importar la cadena de métodos
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

const USER = { id: 'user-uuid-1' }

// ─── añadirAlCarrito ────────────────────────────────────────────────────────

describe('añadirAlCarrito', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin sesión', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({ error: 'Sin sesión.' })
  })

  it('retorna error si el libro no está disponible', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({ error: 'El libro no está disponible.' })
  })

  it('retorna error si no hay stock', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() =>
        queryChain({ data: { id: 'libro-1', stock: 0, visible: true, eliminado_en: null }, error: null })
      ),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({
      error: 'Este libro no tiene stock disponible.',
    })
  })

  it('retorna exito si el libro ya está en el carrito', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1)
          return queryChain({ data: { id: 'libro-1', stock: 3, visible: true, eliminado_en: null }, error: null })
        return queryChain({ data: { id: 'carrito-existente' }, error: null })
      }),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({ exito: 'Ya está en el carrito.' })
  })

  it('inserta el item y retorna exito (préstamo)', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1)
          return queryChain({ data: { id: 'libro-1', stock: 3, visible: true, eliminado_en: null }, error: null })
        return queryChain({ data: null, error: null })
      }),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({
      exito: 'Añadido al carrito de préstamo.',
    })
  })

  it('inserta el item y retorna exito (compra)', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1)
          return queryChain({ data: { id: 'libro-1', stock: 3, visible: true, eliminado_en: null }, error: null })
        return queryChain({ data: null, error: null })
      }),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'compra')).toEqual({
      exito: 'Añadido al carrito de compra.',
    })
  })

  it('retorna error si el insert falla', async () => {
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1)
          return queryChain({ data: { id: 'libro-1', stock: 3, visible: true, eliminado_en: null }, error: null })
        if (n === 2) return queryChain({ data: null, error: null }) // carrito check — no existe
        return queryChain({ data: null, error: { message: 'db error' } }) // insert falla
      }),
    } as never)

    expect(await añadirAlCarrito('libro-1', 'prestamo')).toEqual({ error: 'Error al añadir al carrito.' })
  })
})

// ─── eliminarDelCarrito ──────────────────────────────────────────────────────

describe('eliminarDelCarrito', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin sesión', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    expect(await eliminarDelCarrito('item-1')).toEqual({ error: 'Sin sesión.' })
  })

  it('retorna {} al eliminar correctamente', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: null, error: null })),
    } as never)

    expect(await eliminarDelCarrito('item-1')).toEqual({})
  })

  it('retorna error si el delete falla', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: null, error: { message: 'db error' } })),
    } as never)

    expect(await eliminarDelCarrito('item-1')).toEqual({ error: 'Error al eliminar el item.' })
  })
})

// ─── confirmarPrestamos ──────────────────────────────────────────────────────

describe('confirmarPrestamos', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin sesión', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    expect(await confirmarPrestamos()).toEqual({ error: 'Sin sesión.' })
  })

  it('retorna error si el carrito está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: [], error: null })),
    } as never)

    expect(await confirmarPrestamos()).toEqual({ error: 'No hay libros para préstamo en el carrito.' })
  })

  it('retorna error si no hay stock del libro', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: 'El Quijote', stock: 0, precio_prestamo: 5 } },
    ]
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: items, error: null })),
    } as never)

    expect(await confirmarPrestamos()).toEqual({ error: 'Sin stock disponible: "El Quijote".' })
  })

  it('retorna error si ya existe un préstamo activo del libro', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: 'El Quijote', stock: 3, precio_prestamo: 5 } },
    ]
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: items, error: null }) // carrito
        return queryChain({ data: { id: 'prestamo-existente' }, error: null }) // préstamo duplicado
      }),
    } as never)

    expect(await confirmarPrestamos()).toEqual({
      error: 'Ya tienes un préstamo activo de "El Quijote".',
    })
  })

  it('confirma los préstamos y vacía el carrito', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: 'El Quijote', stock: 3, precio_prestamo: 5 } },
    ]
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: items, error: null })         // carrito
        if (n === 2) return queryChain({ data: null, error: null })           // check duplicado — sin activo
        if (n === 3) return queryChain({ data: [{ id: 'libro-1' }], error: null }) // update stock
        if (n === 4) return queryChain({ data: null, error: null })           // insert préstamo
        return queryChain({ data: null, error: null })                        // delete carrito
      }),
    } as never)

    expect(await confirmarPrestamos()).toEqual({ exito: 'Préstamos confirmados correctamente.' })
  })

  it('hace rollback de stock si el insert de préstamo falla', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: 'El Quijote', stock: 3, precio_prestamo: 5 } },
    ]
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: items, error: null })              // carrito
        if (n === 2) return queryChain({ data: null, error: null })               // check duplicado — sin activo
        if (n === 3) return queryChain({ data: [{ id: 'libro-1' }], error: null }) // update stock
        if (n === 4) return queryChain({ data: null, error: { message: 'db' } })  // insert falla
        return queryChain({ data: null, error: null })                            // rollback stock
      }),
    } as never)

    expect(await confirmarPrestamos()).toEqual({
      error: 'Error al registrar el préstamo: "El Quijote".',
    })
  })
})

// ─── confirmarCompras ────────────────────────────────────────────────────────

describe('confirmarCompras', () => {
  afterEach(() => jest.clearAllMocks())

  it('retorna error sin sesión', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    } as never)

    expect(await confirmarCompras()).toEqual({ error: 'Sin sesión.' })
  })

  it('retorna error si el carrito está vacío', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: [], error: null })),
    } as never)

    expect(await confirmarCompras()).toEqual({ error: 'No hay libros para compra en el carrito.' })
  })

  it('retorna error si no hay stock del libro', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: '1984', stock: 0, precio_compra: 12 } },
    ]
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => queryChain({ data: items, error: null })),
    } as never)

    expect(await confirmarCompras()).toEqual({ error: 'Sin stock disponible: "1984".' })
  })

  it('confirma las compras y vacía el carrito', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: '1984', stock: 3, precio_compra: 12 } },
    ]
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: items, error: null })               // carrito
        if (n === 2) return queryChain({ data: [{ id: 'libro-1' }], error: null })  // update stock
        if (n === 3) return queryChain({ data: null, error: null })                // insert compra
        return queryChain({ data: null, error: null })                             // delete carrito
      }),
    } as never)

    expect(await confirmarCompras()).toEqual({ exito: 'Compras confirmadas correctamente.' })
  })

  it('hace rollback de stock si el insert de compra falla', async () => {
    const items = [
      { id: 'item-1', libro_id: 'libro-1', libros: { titulo: '1984', stock: 3, precio_compra: 12 } },
    ]
    let n = 0
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: USER } }) },
      from: jest.fn(() => {
        n++
        if (n === 1) return queryChain({ data: items, error: null })               // carrito
        if (n === 2) return queryChain({ data: [{ id: 'libro-1' }], error: null })  // update stock
        if (n === 3) return queryChain({ data: null, error: { message: 'db' } })   // insert falla
        return queryChain({ data: null, error: null })                             // rollback stock
      }),
    } as never)

    expect(await confirmarCompras()).toEqual({
      error: 'Error al registrar la compra: "1984".',
    })
  })
})
