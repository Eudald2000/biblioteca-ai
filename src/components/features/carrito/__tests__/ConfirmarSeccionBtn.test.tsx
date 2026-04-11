import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (cb: () => void) => cb()],
}))

jest.mock('@/app/actions/carrito', () => ({
  confirmarPrestamos: jest.fn().mockResolvedValue({ exito: 'Préstamos confirmados.' }),
  confirmarCompras: jest.fn().mockResolvedValue({ exito: 'Compras confirmadas.' }),
}))

import { confirmarPrestamos, confirmarCompras } from '@/app/actions/carrito'
import { ConfirmarSeccionBtn } from '../ConfirmarSeccionBtn'

const mockConfirmarPrestamos = confirmarPrestamos as jest.Mock
const mockConfirmarCompras = confirmarCompras as jest.Mock

describe('ConfirmarSeccionBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tipo="prestamo" → muestra el texto "Confirmar préstamos"', () => {
    render(<ConfirmarSeccionBtn tipo="prestamo" />)
    expect(screen.getByRole('button', { name: 'Confirmar préstamos' })).toBeInTheDocument()
  })

  it('tipo="compra" → muestra el texto "Confirmar compras"', () => {
    render(<ConfirmarSeccionBtn tipo="compra" />)
    expect(screen.getByRole('button', { name: 'Confirmar compras' })).toBeInTheDocument()
  })

  it('disabled=true → el botón está deshabilitado', () => {
    render(<ConfirmarSeccionBtn tipo="prestamo" disabled />)
    expect(screen.getByRole('button', { name: 'Confirmar préstamos' })).toBeDisabled()
  })

  it('click con tipo="prestamo" → llama confirmarPrestamos, no confirmarCompras', async () => {
    const user = userEvent.setup()
    render(<ConfirmarSeccionBtn tipo="prestamo" />)

    await user.click(screen.getByRole('button', { name: 'Confirmar préstamos' }))

    expect(mockConfirmarPrestamos).toHaveBeenCalledTimes(1)
    expect(mockConfirmarCompras).not.toHaveBeenCalled()
  })

  it('cuando la action devuelve error → muestra el error en pantalla', async () => {
    mockConfirmarPrestamos.mockResolvedValueOnce({ error: 'Error de prueba' })

    const user = userEvent.setup()
    render(<ConfirmarSeccionBtn tipo="prestamo" />)

    await user.click(screen.getByRole('button', { name: 'Confirmar préstamos' }))

    expect(await screen.findByText('Error de prueba')).toBeInTheDocument()
  })
})
