'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -200, y: -200 })
  const ringPos = useRef({ x: -200, y: -200 })
  const rafRef = useRef<number | null>(null)
  const isHovered = useRef(false)
  const dotScale = useRef(1)
  const ringScale = useRef(1)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], [tabindex]'

    const onHoverIn = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(INTERACTIVE)) isHovered.current = true
    }
    const onHoverOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest(INTERACTIVE)) isHovered.current = false
    }

    document.addEventListener('mouseover', onHoverIn)
    document.addEventListener('mouseout', onHoverOut)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      const targetDot = isHovered.current ? 2.2 : 1
      const targetRing = isHovered.current ? 1.8 : 1

      dotScale.current = lerp(dotScale.current, targetDot, 0.15)
      ringScale.current = lerp(ringScale.current, targetRing, 0.1)

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) scale(${dotScale.current.toFixed(3)})`
      }

      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.1)
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.1)

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${ringPos.current.x.toFixed(2)}px, ${ringPos.current.y.toFixed(2)}px) scale(${ringScale.current.toFixed(3)})`
        ringRef.current.style.borderColor = isHovered.current
          ? 'rgba(212, 149, 42, 0.85)'
          : 'rgba(212, 149, 42, 0.45)'
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onHoverIn)
      document.removeEventListener('mouseout', onHoverOut)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
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
