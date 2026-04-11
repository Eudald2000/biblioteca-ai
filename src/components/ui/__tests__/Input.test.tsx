import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('sin label no renderiza ningún <label>', () => {
    render(<Input placeholder="nombre" />)
    expect(screen.queryByRole('label' as never)).not.toBeInTheDocument()
    // queryByText vacío: no debe haber elemento <label> en el DOM
    expect(document.querySelector('label')).toBeNull()
  })

  it('con label renderiza el texto del label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('con label + required muestra el asterisco en el label', () => {
    render(<Input label="Nombre" required />)
    const asterisk = document.querySelector('label span[aria-hidden="true"]')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveTextContent('*')
  })

  it('con error renderiza un elemento con role="alert" con el texto del error', () => {
    render(<Input label="Email" error="Correo inválido" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido')
  })

  it('con error el input tiene aria-invalid="true"', () => {
    render(<Input label="Email" error="Correo inválido" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('con helper (sin error) muestra el texto de ayuda', () => {
    render(<Input label="Contraseña" helper="Mínimo 8 caracteres" />)
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  it('con error y helper el helper NO aparece (error tiene prioridad)', () => {
    render(<Input label="Email" error="Correo inválido" helper="Escribe tu email" />)
    expect(screen.queryByText('Escribe tu email')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido')
  })
})
