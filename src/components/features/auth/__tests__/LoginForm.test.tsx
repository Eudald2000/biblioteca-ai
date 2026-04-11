import { render, screen } from '@testing-library/react'
import { useActionState } from 'react'
import { LoginForm } from '../LoginForm'

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
  iniciarSesion: jest.fn(),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
}))

const mockUseActionState = useActionState as jest.Mock

beforeEach(() => {
  mockUseActionState.mockReturnValue([null, jest.fn(), false])
})

describe('LoginForm', () => {
  it('renderiza el campo Email', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renderiza el campo Contraseña', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('renderiza el botón Iniciar sesión', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra el mensaje de error en role="alert" cuando estado.error tiene valor', () => {
    mockUseActionState.mockReturnValue([
      { error: 'Email o contraseña incorrectos.' },
      jest.fn(),
      false,
    ])
    render(<LoginForm />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email o contraseña incorrectos.')
  })

  it('muestra el mensaje de cuenta suspendida cuando mensajeBaneo=true', () => {
    render(<LoginForm mensajeBaneo={true} />)
    expect(screen.getByRole('alert')).toHaveTextContent(/suspendida/i)
  })

  it('deshabilita el campo Email cuando pendiente=true', () => {
    mockUseActionState.mockReturnValue([null, jest.fn(), true])
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
  })
})
