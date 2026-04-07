'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -200, y: -200 })
  const ringPos = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }

    // Anillo con lerp suave
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.1)
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.1)
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* Glow inmediato bajo el cursor */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '12px',
          height: '12px',
          marginLeft: '-6px',
          marginTop: '-6px',
          borderRadius: '50%',
          background: 'rgba(212, 149, 42, 0.9)',
          pointerEvents: 'none',
          zIndex: 99,
          mixBlendMode: 'screen',
          filter: 'blur(1px)',
          transform: 'translate(-200px, -200px)',
        }}
      />
      {/* Anillo flotante con retraso */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          marginLeft: '-18px',
          marginTop: '-18px',
          borderRadius: '50%',
          border: '1.5px solid rgba(212, 149, 42, 0.45)',
          pointerEvents: 'none',
          zIndex: 98,
          background: 'radial-gradient(circle, rgba(212,149,42,0.06) 0%, transparent 70%)',
          transform: 'translate(-200px, -200px)',
        }}
      />
    </>
  )
}
