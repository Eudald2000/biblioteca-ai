import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — Biblioteca Virtual',
}

export default function CookiesPage() {
  return (
    <>
      <style>{`
        .static-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 0 80px;
          font-family: var(--font-dm, system-ui, sans-serif);
        }

        .static-eyebrow {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #d4952a;
          margin-bottom: 12px;
        }

        .static-title {
          font-family: var(--font-cormorant, 'Georgia', serif);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 600;
          color: #f5efe6;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .static-lead {
          font-size: 1.05rem;
          color: rgba(245, 239, 230, 0.65);
          line-height: 1.7;
          margin-bottom: 48px;
          border-bottom: 1px solid rgba(212, 149, 42, 0.12);
          padding-bottom: 32px;
        }

        .static-updated {
          display: inline-block;
          font-size: 0.78rem;
          color: rgba(245, 239, 230, 0.4);
          margin-bottom: 48px;
        }

        .static-section {
          margin-bottom: 40px;
        }

        .static-section h2 {
          font-family: var(--font-cormorant, 'Georgia', serif);
          font-size: 1.4rem;
          font-weight: 600;
          color: #f5efe6;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(212, 149, 42, 0.15);
        }

        .static-section p {
          font-size: 0.95rem;
          color: rgba(245, 239, 230, 0.7);
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .static-section ul {
          margin: 8px 0 12px 20px;
          padding: 0;
        }

        .static-section ul li {
          font-size: 0.95rem;
          color: rgba(245, 239, 230, 0.7);
          line-height: 1.8;
          margin-bottom: 6px;
        }

        .cookie-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0 24px;
          font-size: 0.88rem;
        }

        .cookie-table thead tr {
          border-bottom: 1px solid rgba(212, 149, 42, 0.25);
        }

        .cookie-table th {
          text-align: left;
          padding: 10px 12px;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #d4952a;
        }

        .cookie-table td {
          padding: 10px 12px;
          color: rgba(245, 239, 230, 0.7);
          border-bottom: 1px solid rgba(212, 149, 42, 0.07);
          line-height: 1.5;
        }

        .cookie-table tbody tr:hover td {
          background: rgba(212, 149, 42, 0.03);
        }

        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-required {
          background: rgba(212, 149, 42, 0.15);
          color: #d4952a;
        }

        .badge-optional {
          background: rgba(245, 239, 230, 0.08);
          color: rgba(245, 239, 230, 0.5);
        }
      `}</style>

      <div className="static-page">
        <p className="static-eyebrow">Legal</p>
        <h1 className="static-title">Política de Cookies</h1>
        <p className="static-lead">
          Esta política explica qué son las cookies, qué tipos utilizamos en Biblioteca Virtual,
          para qué las empleamos y cómo puedes gestionarlas o rechazarlas.
        </p>
        <span className="static-updated">Última actualización: 1 de enero de 2025</span>

        <div className="static-section">
          <h2>¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo
            (ordenador, tablet o móvil) cuando lo visitas. Permiten que el sitio recuerde tus
            preferencias, mantenga tu sesión iniciada y recopile información de uso para mejorar
            el servicio.
          </p>
          <p>
            Las cookies no son programas ni virus. No pueden ejecutar código ni instalar software,
            y su alcance está limitado al dominio que las creó.
          </p>
        </div>

        <div className="static-section">
          <h2>Tipos de cookies que usamos</h2>
          <p>
            En Biblioteca Virtual utilizamos exclusivamente las cookies estrictamente necesarias
            para el funcionamiento del servicio. No empleamos cookies de publicidad ni de
            seguimiento entre sitios.
          </p>

          <table className="cookie-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Duración</th>
                <th>Finalidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>sb-access-token</code></td>
                <td><span className="badge badge-required">Necesaria</span></td>
                <td>1 hora</td>
                <td>Token de sesión de autenticación (Supabase Auth)</td>
              </tr>
              <tr>
                <td><code>sb-refresh-token</code></td>
                <td><span className="badge badge-required">Necesaria</span></td>
                <td>7 días</td>
                <td>Renovación automática de sesión sin necesidad de volver a iniciar sesión</td>
              </tr>
              <tr>
                <td><code>__vercel_live_token</code></td>
                <td><span className="badge badge-optional">Técnica</span></td>
                <td>Sesión</td>
                <td>Funcionalidad de preview en Vercel (solo entorno de desarrollo/staging)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="static-section">
          <h2>Cookies de sesión y autenticación</h2>
          <p>
            Las cookies de autenticación son imprescindibles para que puedas iniciar sesión y
            acceder a tu cuenta. Sin ellas no sería posible mantener tu identidad entre páginas
            ni proteger tu información personal.
          </p>
          <p>
            Estas cookies desaparecen al cerrar sesión o al expirar el período de inactividad.
            En ningún caso almacenan contraseñas en texto plano.
          </p>
        </div>

        <div className="static-section">
          <h2>Lo que NO hacemos</h2>
          <ul>
            <li>No utilizamos cookies de publicidad comportamental ni retargeting.</li>
            <li>No compartimos datos de cookies con terceros con fines comerciales.</li>
            <li>No instalamos cookies de redes sociales sin tu consentimiento previo.</li>
            <li>No empleamos técnicas de fingerprinting ni tracking cross-site.</li>
          </ul>
        </div>

        <div className="static-section">
          <h2>Cómo gestionar o eliminar las cookies</h2>
          <p>
            Puedes controlar y eliminar las cookies desde la configuración de tu navegador.
            Ten en cuenta que deshabilitar las cookies de sesión impedirá el inicio de sesión
            en la plataforma.
          </p>
          <ul>
            <li><strong style={{ color: '#f5efe6' }}>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
            <li><strong style={{ color: '#f5efe6' }}>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
            <li><strong style={{ color: '#f5efe6' }}>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</li>
            <li><strong style={{ color: '#f5efe6' }}>Edge:</strong> Configuración → Privacidad, búsqueda y servicios → Cookies</li>
          </ul>
        </div>

        <div className="static-section">
          <h2>Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política para reflejar cambios técnicos o legales.
            Si realizamos modificaciones relevantes, lo comunicaremos mediante un aviso
            visible en la plataforma. La fecha de última actualización siempre estará
            indicada al inicio de este documento.
          </p>
          <p>
            Para cualquier consulta sobre el uso de cookies, puedes escribirnos a{' '}
            <a href="mailto:soporte@bibliotecavirtual.es" style={{ color: '#d4952a' }}>
              soporte@bibliotecavirtual.es
            </a>.
          </p>
        </div>
      </div>
    </>
  )
}
