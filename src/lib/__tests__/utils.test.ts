import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('devuelve una sola clase sin modificarla', () => {
    expect(cn('text-sm')).toBe('text-sm')
  })

  it('une varias clases con espacio', () => {
    expect(cn('text-sm', 'font-bold', 'text-white')).toBe('text-sm font-bold text-white')
  })

  it('descarta clases condicionales falsas', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('resuelve conflictos de Tailwind: px-4 reemplaza px-2', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
