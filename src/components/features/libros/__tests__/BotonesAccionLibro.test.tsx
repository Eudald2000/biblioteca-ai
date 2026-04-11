import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (cb: () => void) => cb()],
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ refresh: jest.fn() })),
}))

jest.mock('@/app/actions/carrito', () => ({
  añadirAlCarrito: jest.fn().mockResolvedValue({ exito: 'Añadido.' }),
}))

import { añadirAlCarrito } from '@/app/actions/carrito'
import { BotonesAccionLibro } from '../BotonesAccionLibro'

const mockAñadir = añadirAlCarrito as jest.Mock

describe('BotonesAccionLibro', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stock=3, compact=false → muestra botones "Pedir préstamo" y "🛒 Añadir al carrito"', () => {
    render(<BotonesAccionLibro libroId="lib-1" stock={3} compact={false} />)
    expect(screen.getByRole('button', { name: 'Pedir préstamo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeInTheDocument()
  })

  it('stock=3, compact=true → muestra botones en versión compacta', () => {
    render(<BotonesAccionLibro libroId="lib-1" stock={3} compact={true} />)
    expect(screen.getByRole('button', { name: 'Pedir préstamo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeInTheDocument()
  })

  it('stock=0, compact=false → muestra texto "Agotado"', () => {
    render(<BotonesAccionLibro libroId="lib-1" stock={0} compact={false} />)
    expect(screen.getByText(/agotado/i)).toBeInTheDocument()
  })

  it('stock=0, compact=false → NO muestra botones de acción', () => {
    render(<BotonesAccionLibro libroId="lib-1" stock={0} compact={false} />)
    expect(screen.queryByRole('button', { name: 'Pedir préstamo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /añadir al carrito/i })).not.toBeInTheDocument()
  })

  it('stock=0, compact=true → muestra badge "Agotado"', () => {
    render(<BotonesAccionLibro libroId="lib-1" stock={0} compact={true} />)
    expect(screen.getByText(/agotado/i)).toBeInTheDocument()
  })

  it('click en "Pedir préstamo" → llama añadirAlCarrito con tipo "prestamo"', async () => {
    const user = userEvent.setup()
    render(<BotonesAccionLibro libroId="lib-99" stock={5} />)

    await user.click(screen.getByRole('button', { name: 'Pedir préstamo' }))

    expect(mockAñadir).toHaveBeenCalledTimes(1)
    expect(mockAñadir).toHaveBeenCalledWith('lib-99', 'prestamo')
  })

  it('click en "🛒 Añadir al carrito" → llama añadirAlCarrito con tipo "compra"', async () => {
    const user = userEvent.setup()
    render(<BotonesAccionLibro libroId="lib-99" stock={5} />)

    await user.click(screen.getByRole('button', { name: /añadir al carrito/i }))

    expect(mockAñadir).toHaveBeenCalledTimes(1)
    expect(mockAñadir).toHaveBeenCalledWith('lib-99', 'compra')
  })

  it('cuando la action devuelve error → muestra el mensaje de error en pantalla', async () => {
    mockAñadir.mockResolvedValueOnce({ error: 'Sin stock.' })

    const user = userEvent.setup()
    render(<BotonesAccionLibro libroId="lib-99" stock={5} />)

    await user.click(screen.getByRole('button', { name: 'Pedir préstamo' }))

    expect(await screen.findByText('Sin stock.')).toBeInTheDocument()
  })
})
