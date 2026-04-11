import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza el texto children', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('variant="danger" aplica la clase bg-red-600', () => {
    render(<Button variant="danger">Eliminar</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('size="sm" aplica la clase h-8', () => {
    render(<Button size="sm">Pequeño</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
  })

  it('loading=true muestra el SVG spinner', () => {
    render(<Button loading>Cargando</Button>)
    const spinner = document.querySelector('svg[aria-hidden="true"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('loading=true deshabilita el botón', () => {
    render(<Button loading>Cargando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disabled=true deshabilita el botón', () => {
    render(<Button disabled>Deshabilitado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('llama onClick al hacer click cuando no está deshabilitado', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Hacer click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
