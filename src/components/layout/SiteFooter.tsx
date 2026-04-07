import Link from 'next/link'

export function SiteFooter() {
  return (
    <>
      <style>{`
        .site-footer {
          position: relative;
          z-index: 2;
          background: #0d0b08;
          border-top: 1px solid rgba(212, 149, 42, 0.12);
          font-family: var(--font-dm, system-ui, sans-serif);
          color: rgba(245, 239, 230, 0.65);
        }

        .site-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px 40px;
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 48px;
        }

        @media (max-width: 768px) {
          .site-footer-inner {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 40px 24px 32px;
          }
        }

        .site-footer-logo {
          font-family: var(--font-cormorant, 'Georgia', serif);
          font-size: 1.5rem;
          font-weight: 600;
          color: #f5efe6;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
          display: block;
          text-decoration: none;
        }

        .site-footer-logo:hover {
          color: #d4952a;
        }

        .site-footer-desc {
          font-size: 0.875rem;
          line-height: 1.7;
          color: rgba(245, 239, 230, 0.55);
          max-width: 280px;
        }

        .site-footer-col-title {
          font-family: var(--font-dm, system-ui, sans-serif);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d4952a;
          margin-bottom: 16px;
        }

        .site-footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .site-footer-links a {
          font-size: 0.875rem;
          color: rgba(245, 239, 230, 0.6);
          text-decoration: none;
          transition: color 0.2s;
        }

        .site-footer-links a:hover {
          color: #d4952a;
        }

        .site-footer-strip {
          border-top: 1px solid rgba(212, 149, 42, 0.08);
          padding: 18px 24px;
          text-align: center;
          font-size: 0.78rem;
          color: rgba(245, 239, 230, 0.35);
          letter-spacing: 0.02em;
        }
      `}</style>

      <footer className="site-footer">
        <div className="site-footer-inner">
          {/* Columna 1 — Marca */}
          <div>
            <Link href="/" className="site-footer-logo">
              ❧ Biblioteca Virtual
            </Link>
            <p className="site-footer-desc">
              Tu biblioteca digital de confianza. Préstamos, compras y gestión de libros en un solo lugar.
            </p>
          </div>

          {/* Columna 2 — Navegación */}
          <div>
            <p className="site-footer-col-title">Navegación</p>
            <ul className="site-footer-links">
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/catalogo">Catálogo</Link></li>
              <li><Link href="/login">Iniciar sesión</Link></li>
              <li><Link href="/registro">Registrarse</Link></li>
            </ul>
          </div>

          {/* Columna 3 — Legal */}
          <div>
            <p className="site-footer-col-title">Legal</p>
            <ul className="site-footer-links">
              <li><Link href="/cookies">Política de cookies</Link></li>
              <li><Link href="/privacidad">Política de privacidad</Link></li>
              <li><Link href="/terminos">Términos de uso</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="site-footer-strip">
          © 2025 Biblioteca Virtual — Construida con Next.js, Supabase y TypeScript
        </div>
      </footer>
    </>
  )
}
