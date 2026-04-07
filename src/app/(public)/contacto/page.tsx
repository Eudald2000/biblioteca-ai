import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto — Biblioteca Virtual',
}

export default function ContactoPage() {
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }

        @media (max-width: 600px) {
          .contact-grid { grid-template-columns: 1fr; }
        }

        .contact-card {
          background: rgba(212, 149, 42, 0.05);
          border: 1px solid rgba(212, 149, 42, 0.15);
          border-radius: 10px;
          padding: 24px;
        }

        .contact-card-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d4952a;
          margin-bottom: 8px;
        }

        .contact-card-value {
          font-size: 0.95rem;
          color: #f5efe6;
          line-height: 1.5;
        }

        .contact-card-value a {
          color: #d4952a;
          text-decoration: none;
        }

        .contact-card-value a:hover {
          text-decoration: underline;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(245, 239, 230, 0.75);
          letter-spacing: 0.02em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(245, 239, 230, 0.04);
          border: 1px solid rgba(212, 149, 42, 0.2);
          border-radius: 6px;
          padding: 10px 14px;
          color: #f5efe6;
          font-size: 0.9rem;
          font-family: var(--font-dm, system-ui, sans-serif);
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(245, 239, 230, 0.3);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: rgba(212, 149, 42, 0.5);
        }

        .form-group select option {
          background: #1a160f;
          color: #f5efe6;
        }

        .form-note {
          font-size: 0.8rem;
          color: rgba(245, 239, 230, 0.4);
          margin-top: 8px;
          font-style: italic;
        }

        .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: #d4952a;
          border: none;
          border-radius: 6px;
          color: #0d0b08;
          font-size: 0.9rem;
          font-weight: 500;
          font-family: var(--font-dm, system-ui, sans-serif);
          cursor: pointer;
          transition: background 0.2s;
          letter-spacing: 0.02em;
        }

        .btn-submit:hover {
          background: #f0b445;
        }
      `}</style>

      <div className="static-page">
        <p className="static-eyebrow">Soporte</p>
        <h1 className="static-title">Contacto</h1>
        <p className="static-lead">
          ¿Tienes alguna pregunta, incidencia o sugerencia? Estamos aquí para ayudarte.
          Nuestro equipo responde en un plazo máximo de 48 horas hábiles.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <p className="contact-card-label">Email de soporte</p>
            <p className="contact-card-value">
              <a href="mailto:soporte@bibliotecavirtual.es">soporte@bibliotecavirtual.es</a>
            </p>
          </div>
          <div className="contact-card">
            <p className="contact-card-label">Dirección</p>
            <p className="contact-card-value">
              Calle de las Letras, 12<br />
              08001 Barcelona, España
            </p>
          </div>
          <div className="contact-card">
            <p className="contact-card-label">Horario de atención</p>
            <p className="contact-card-value">
              Lunes a viernes<br />
              9:00 — 18:00 (CET)
            </p>
          </div>
          <div className="contact-card">
            <p className="contact-card-label">Tiempo de respuesta</p>
            <p className="contact-card-value">
              Máximo 48 horas hábiles<br />
              desde la recepción
            </p>
          </div>
        </div>

        <div className="static-section">
          <h2>Envíanos un mensaje</h2>
          <p>
            Rellena el formulario y te responderemos lo antes posible. Para incidencias
            urgentes relacionadas con tu cuenta, incluye tu nombre de usuario en el mensaje.
          </p>

          <div className="form-grid" style={{ marginTop: '24px' }}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input type="text" id="nombre" placeholder="Ana García López" disabled />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" placeholder="ana@ejemplo.com" disabled />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="asunto">Asunto</label>
            <select id="asunto" disabled>
              <option value="">Selecciona una categoría</option>
              <option value="cuenta">Problema con mi cuenta</option>
              <option value="prestamo">Incidencia en un préstamo</option>
              <option value="compra">Incidencia en una compra</option>
              <option value="sugerencia">Sugerencia de mejora</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea id="mensaje" rows={5} placeholder="Describe tu consulta con el mayor detalle posible..." disabled />
          </div>

          <button type="button" className="btn-submit" disabled>
            Enviar mensaje
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p className="form-note">
            Formulario desactivado durante el período de desarrollo. Usa el email de soporte para contactar.
          </p>
        </div>
      </div>
    </>
  )
}
