import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad — Biblioteca Virtual',
}

export default function PrivacidadPage() {
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

        .rights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 600px) {
          .rights-grid { grid-template-columns: 1fr; }
        }

        .right-card {
          background: rgba(212, 149, 42, 0.05);
          border: 1px solid rgba(212, 149, 42, 0.12);
          border-radius: 8px;
          padding: 16px 18px;
        }

        .right-card-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #d4952a;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }

        .right-card-desc {
          font-size: 0.85rem;
          color: rgba(245, 239, 230, 0.6);
          line-height: 1.6;
        }

        .info-box {
          background: rgba(212, 149, 42, 0.06);
          border-left: 3px solid #d4952a;
          border-radius: 0 6px 6px 0;
          padding: 16px 20px;
          margin: 16px 0;
        }

        .info-box p {
          margin: 0 !important;
          font-size: 0.9rem !important;
          color: rgba(245, 239, 230, 0.75) !important;
        }
      `}</style>

      <div className="static-page">
        <p className="static-eyebrow">Legal</p>
        <h1 className="static-title">Política de Privacidad</h1>
        <p className="static-lead">
          En Biblioteca Virtual tratamos tus datos con total transparencia y en cumplimiento del
          Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
          Esta política describe qué datos recopilamos, cómo los usamos y qué derechos tienes
          como usuario.
        </p>
        <span className="static-updated">Última actualización: 1 de enero de 2025</span>

        <div className="static-section">
          <h2>Responsable del tratamiento</h2>
          <p>
            <strong style={{ color: '#f5efe6' }}>Razón social:</strong> Biblioteca Virtual S.L.<br />
            <strong style={{ color: '#f5efe6' }}>CIF:</strong> B-12345678<br />
            <strong style={{ color: '#f5efe6' }}>Domicilio:</strong> Calle de las Letras, 12, 08001 Barcelona<br />
            <strong style={{ color: '#f5efe6' }}>Email:</strong>{' '}
            <a href="mailto:privacidad@bibliotecavirtual.es" style={{ color: '#d4952a' }}>
              privacidad@bibliotecavirtual.es
            </a>
          </p>
        </div>

        <div className="static-section">
          <h2>Datos que recopilamos</h2>
          <p>Al registrarte y utilizar el servicio, recopilamos los siguientes datos:</p>
          <ul>
            <li><strong style={{ color: '#f5efe6' }}>Datos de cuenta:</strong> nombre completo y dirección de correo electrónico.</li>
            <li><strong style={{ color: '#f5efe6' }}>Datos de actividad:</strong> libros prestados, comprados y el historial de transacciones.</li>
            <li><strong style={{ color: '#f5efe6' }}>Datos técnicos:</strong> dirección IP, tipo de navegador y sistema operativo (logs de servidor).</li>
            <li><strong style={{ color: '#f5efe6' }}>Datos de sesión:</strong> tokens de autenticación almacenados en cookies seguras (httpOnly).</li>
          </ul>
          <p>No recopilamos datos de pago directamente; en el futuro, este proceso será gestionado íntegramente por un proveedor de pagos certificado (PCI-DSS).</p>
        </div>

        <div className="static-section">
          <h2>Finalidad y base legal del tratamiento</h2>
          <p>Tratamos tus datos con las siguientes finalidades y bases legales:</p>
          <ul>
            <li><strong style={{ color: '#f5efe6' }}>Gestión de cuenta:</strong> ejecución del contrato de servicio (art. 6.1.b RGPD).</li>
            <li><strong style={{ color: '#f5efe6' }}>Gestión de préstamos y compras:</strong> ejecución del contrato (art. 6.1.b RGPD).</li>
            <li><strong style={{ color: '#f5efe6' }}>Comunicaciones sobre vencimientos:</strong> interés legítimo del responsable (art. 6.1.f RGPD).</li>
            <li><strong style={{ color: '#f5efe6' }}>Cumplimiento legal y fiscal:</strong> obligación legal (art. 6.1.c RGPD).</li>
            <li><strong style={{ color: '#f5efe6' }}>Mejora del servicio:</strong> interés legítimo, previa seudonimización de los datos.</li>
          </ul>
        </div>

        <div className="static-section">
          <h2>Conservación de los datos</h2>
          <p>
            Conservamos tus datos durante el tiempo que mantengas una cuenta activa y,
            una vez cancelada, durante el plazo que exija la normativa aplicable (generalmente
            5 años para datos con relevancia fiscal y 3 años para datos de actividad).
            Pasado ese plazo, los datos se eliminan o anonomizan de forma irreversible.
          </p>
        </div>

        <div className="static-section">
          <h2>Encargados del tratamiento (subprocesadores)</h2>
          <p>
            Para prestar el servicio, contamos con los siguientes proveedores que actúan
            como encargados del tratamiento bajo acuerdos de confidencialidad y DPA firmados:
          </p>
          <ul>
            <li><strong style={{ color: '#f5efe6' }}>Supabase Inc.</strong> — Base de datos y autenticación (servidores en la UE — región eu-west-1).</li>
            <li><strong style={{ color: '#f5efe6' }}>Vercel Inc.</strong> — Alojamiento de la aplicación web (CDN con PoP en la UE).</li>
            <li><strong style={{ color: '#f5efe6' }}>Resend Inc.</strong> — Envío de emails transaccionales (solo cuando activo).</li>
          </ul>
          <div className="info-box">
            <p>
              Ninguno de estos proveedores puede utilizar tus datos para fines propios distintos
              de los acordados contractualmente con Biblioteca Virtual.
            </p>
          </div>
        </div>

        <div className="static-section">
          <h2>Tus derechos</h2>
          <p>
            Como titular de los datos, puedes ejercer en cualquier momento los siguientes derechos
            enviando un email a{' '}
            <a href="mailto:privacidad@bibliotecavirtual.es" style={{ color: '#d4952a' }}>
              privacidad@bibliotecavirtual.es
            </a>{' '}
            con copia de tu documento identificativo:
          </p>
          <div className="rights-grid">
            <div className="right-card">
              <p className="right-card-title">Acceso</p>
              <p className="right-card-desc">Obtener confirmación de si tratamos tus datos y recibir una copia.</p>
            </div>
            <div className="right-card">
              <p className="right-card-title">Rectificación</p>
              <p className="right-card-desc">Corregir datos inexactos o incompletos que te conciernan.</p>
            </div>
            <div className="right-card">
              <p className="right-card-title">Supresión</p>
              <p className="right-card-desc">Solicitar el borrado de tus datos cuando ya no sean necesarios.</p>
            </div>
            <div className="right-card">
              <p className="right-card-title">Portabilidad</p>
              <p className="right-card-desc">Recibir tus datos en formato estructurado y legible por máquina.</p>
            </div>
            <div className="right-card">
              <p className="right-card-title">Limitación</p>
              <p className="right-card-desc">Solicitar que limitemos el tratamiento en determinadas circunstancias.</p>
            </div>
            <div className="right-card">
              <p className="right-card-title">Oposición</p>
              <p className="right-card-desc">Oponerte al tratamiento basado en interés legítimo.</p>
            </div>
          </div>
          <p style={{ marginTop: '16px' }}>
            También tienes derecho a presentar una reclamación ante la Agencia Española de
            Protección de Datos (AEPD) en{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#d4952a' }}>
              www.aepd.es
            </a>.
          </p>
        </div>

        <div className="static-section">
          <h2>Seguridad</h2>
          <p>
            Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos:
            cifrado en tránsito (TLS 1.3), cifrado en reposo en la base de datos, tokens de
            sesión httpOnly y secure, y políticas de Row Level Security (RLS) en todas
            las tablas de la base de datos.
          </p>
          <p>
            En caso de brecha de seguridad que afecte tus datos, lo notificaremos a la AEPD
            en el plazo de 72 horas y a los usuarios afectados sin dilación indebida.
          </p>
        </div>
      </div>
    </>
  )
}
