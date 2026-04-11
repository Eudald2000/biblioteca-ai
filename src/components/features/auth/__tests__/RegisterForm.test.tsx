import { render, screen } from '@testing-library/react'
import { useActionState } from 'react'
import { RegisterForm } from '../RegisterForm'

jest.mock('next/link', () => {
  const Link = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}))

jest.mock('@/app/actions/auth', () => ({
  registrarse: jest.fn(),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
}))

const mockUseActionState = useActionState as jest.Mock

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, jest.fn(), false])
})

describe('RegisterForm', () => {
  it('renderiza el campo Nombre completo', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
  })

  it('renderiza el campo Email', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renderiza el campo Contraseña', () => {
    render(<RegisterForm />)
    // Localizar por name attribute es más fiable que por label text con caracteres especiales (ñ)
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]')
    expect(passwordInput).toBeInTheDocument()
  })

  it('renderiza el campo Confirmar contraseña', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
  })

  it('muestra el mensaje de error en role="alert" cuando estado.error tiene valor', () => {
    mockUseActionState.mockReturnValue([
      { error: 'El email ya está en uso.' },
      jest.fn(),
      false,
    ])
    render(<RegisterForm />)
    expect(screen.getByRole('alert')).toHaveTextContent('El email ya está en uso.')
  })

  it('muestra el helper text "Mínimo 2 caracteres" para el campo Nombre completo', () => {
    render(<RegisterForm />)
    expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument()
  })
})
