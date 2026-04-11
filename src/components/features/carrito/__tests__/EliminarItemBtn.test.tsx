import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (cb: () => void) => cb()],
}))

jest.mock('@/app/actions/carrito', () => ({
  eliminarDelCarrito: jest.fn().mockResolvedValue({}),
}))

import { eliminarDelCarrito } from '@/app/actions/carrito'
import { EliminarItemBtn } from '../EliminarItemBtn'

const mockEliminar = eliminarDelCarrito as jest.Mock

describe('EliminarItemBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renderiza el botón con aria-label="Eliminar del carrito"', () => {
    render(<EliminarItemBtn itemId="abc-123" />)
    expect(screen.getByRole('button', { name: 'Eliminar del carrito' })).toBeInTheDocument()
  })

  it('al hacer click llama a eliminarDelCarrito con el itemId correcto', async () => {
    const user = userEvent.setup()
    render(<EliminarItemBtn itemId="libro-42" />)

    await user.click(screen.getByRole('button', { name: 'Eliminar del carrito' }))

    expect(mockEliminar).toHaveBeenCalledTimes(1)
    expect(mockEliminar).toHaveBeenCalledWith('libro-42')
  })

  it('con pending=true el botón está disabled', () => {
    const reactModule = jest.requireActual('react') as typeof import('react')
    jest.spyOn(require('react'), 'useTransition').mockReturnValueOnce([true, jest.fn()])

    render(<EliminarItemBtn itemId="abc-123" />)

    expect(screen.getByRole('button', { name: 'Eliminar del carrito' })).toBeDisabled()

    jest.spyOn(reactModule, 'useTransition').mockRestore?.()
  })

  it('con pending=false (por defecto) el botón no está disabled', () => {
    render(<EliminarItemBtn itemId="abc-123" />)
    expect(screen.getByRole('button', { name: 'Eliminar del carrito' })).not.toBeDisabled()
  })
})
