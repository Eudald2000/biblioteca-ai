import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Uso — Biblioteca Virtual',
}

export default function TerminosPage() {
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

        .static-section ol {
          margin: 8px 0 12px 20px;
          padding: 0;
        }

        .static-section ol li {
          font-size: 0.95rem;
          color: rgba(245, 239, 230, 0.7);
          line-height: 1.8;
          margin-bottom: 8px;
        }

        .terms-highlight {
          background: rgba(212, 149, 42, 0.06);
          border: 1px solid rgba(212, 149, 42, 0.15);
          border-radius: 8px;
          padding: 16px 20px;
          margin: 16px 0;
          font-size: 0.9rem;
          color: rgba(245, 239, 230, 0.75);
          line-height: 1.7;
        }

        .terms-number {
          color: #d4952a;
          font-weight: 600;
          font-family: var(--font-cormorant, 'Georgia', serif);
          font-size: 1.1rem;
          margin-right: 4px;
        }
      `}</style>

      <div className="static-page">
        <p className="static-eyebrow">Legal</p>
        <h1 className="static-title">Términos de Uso</h1>
        <p className="static-lead">
          Al acceder y utilizar Biblioteca Virtual aceptas los presentes Términos de Uso.
          Te recomendamos leerlos detenidamente antes de crear una cuenta o realizar
          cualquier transacción en la plataforma.
        </p>
        <span className="static-updated">Última actualización: 1 de enero de 2025</span>

        <div className="static-section">
          <h2>1. Objeto del servicio</h2>
          <p>
            Biblioteca Virtual es una plataforma digital que permite a sus usuarios registrados
            acceder a un catálogo de libros digitales mediante dos modalidades:
          </p>
          <ul>
            <li><strong style={{ color: '#f5efe6' }}>Préstamo temporal:</strong> acceso al libro durante un período determinado, tras el cual el acceso se revoca automáticamente.</li>
            <li><strong style={{ color: '#f5efe6' }}>Compra permanente:</strong> adquisición definitiva del libro digital, que queda vinculado a la cuenta del usuario de forma permanente.</li>
          </ul>
          <p>
            El servicio está disponible en español y se dirige principalmente a usuarios
            residentes en el Espacio Económico Europeo.
          </p>
        </div>

        <div className="static-section">
          <h2>2. Registro y cuenta de usuario</h2>
          <p>
            Para acceder a las funcionalidades de préstamo y compra es necesario crear una
            cuenta de usuario. Al registrarte, garantizas que:
          </p>
          <ol>
            <li>Tienes al menos 16 años de edad (o has obtenido el consentimiento de tus tutores legales).</li>
            <li>La información que proporcionas es veraz, completa y actualizada.</li>
            <li>Eres el titular o tienes autorización para usar la dirección de email indicada.</li>
            <li>Mantendrás la confidencialidad de tus credenciales de acceso.</li>
          </ol>
          <p>
            Cada usuario puede tener una única cuenta. Las cuentas son personales e
            intransferibles. Está prohibido compartir credenciales de acceso.
          </p>
        </div>

        <div className="static-section">
          <h2>3. Condiciones del servicio de préstamo</h2>
          <p>
            El servicio de préstamo digital está sujeto a las siguientes condiciones:
          </p>
          <ul>
            <li>El período de préstamo estándar es de <strong style={{ color: '#f5efe6' }}>14 días naturales</strong> desde la fecha de solicitud.</li>
            <li>Cada usuario puede tener activos simultáneamente un máximo de <strong style={{ color: '#f5efe6' }}>5 préstamos</strong>.</li>
            <li>Si el stock de ejemplares digitales está agotado, el préstamo quedará en lista de espera.</li>
            <li>Recibirás un recordatorio por email 48 horas antes del vencimiento.</li>
            <li>La renovación del préstamo está sujeta a disponibilidad y se solicita antes del vencimiento.</li>
            <li>El precio del préstamo se fija en el momento de la solicitud y no varía durante el período activo.</li>
          </ul>
          <div className="terms-highlight">
            El acceso al libro prestado se revoca automáticamente al vencer el plazo. No es
            necesaria ninguna acción por parte del usuario para "devolver" el libro.
          </div>
        </div>

        <div className="static-section">
          <h2>4. Condiciones de compra</h2>
          <p>
            La compra de un libro digital implica la adquisición de una licencia de uso personal,
            no exclusiva e intransferible, sujeta a las siguientes condiciones:
          </p>
          <ul>
            <li>El precio de compra queda fijado en el momento de la transacción.</li>
            <li>El libro adquirido estará disponible de forma permanente en tu biblioteca personal.</li>
            <li>La licencia es estrictamente personal: no puedes ceder, revender ni distribuir el acceso.</li>
            <li>En caso de cierre del servicio, Biblioteca Virtual informará con al menos 90 días de antelación y habilitará mecanismos de exportación.</li>
          </ul>
          <p>
            De conformidad con el art. 103 m) del Real Decreto Legislativo 1/2007, el derecho
            de desistimiento no aplica a contenidos digitales que el usuario haya comenzado
            a descargar o utilizar con su consentimiento previo.
          </p>
        </div>

        <div className="static-section">
          <h2>5. Uso aceptable</h2>
          <p>Queda expresamente prohibido:</p>
          <ul>
            <li>Reproducir, distribuir o comunicar públicamente los contenidos sin autorización.</li>
            <li>Utilizar herramientas automatizadas (bots, scrapers) para acceder al catálogo.</li>
            <li>Intentar eludir las medidas de protección técnica del servicio.</li>
            <li>Crear cuentas falsas o suplantar la identidad de otros usuarios.</li>
            <li>Usar el servicio para actividades ilícitas o contrarias al orden público.</li>
          </ul>
          <p>
            El incumplimiento de estas condiciones podrá dar lugar a la suspensión inmediata
            de la cuenta sin derecho a reembolso de saldo pendiente.
          </p>
        </div>

        <div className="static-section">
          <h2>6. Propiedad intelectual</h2>
          <p>
            Todos los contenidos del catálogo (textos, imágenes de portada, metadatos) son
            propiedad de sus respectivos autores y editores, o están licenciados a
            Biblioteca Virtual para su distribución digital. Están protegidos por la
            legislación española e internacional sobre propiedad intelectual.
          </p>
          <p>
            El diseño, código fuente y marca de la plataforma son propiedad exclusiva de
            Biblioteca Virtual S.L. y no pueden reproducirse sin autorización expresa.
          </p>
        </div>

        <div className="static-section">
          <h2>7. Responsabilidad y garantías</h2>
          <p>
            Biblioteca Virtual se compromete a mantener el servicio disponible con una
            disponibilidad objetivo del 99,5% mensual. Sin embargo, no garantiza la
            disponibilidad ininterrumpida y queda exenta de responsabilidad por
            interrupciones debidas a mantenimiento programado, causas de fuerza mayor
            o fallos de proveedores terceros.
          </p>
          <p>
            En ningún caso la responsabilidad máxima de Biblioteca Virtual frente a un
            usuario por cualquier causa superará el importe abonado por dicho usuario
            en los últimos 3 meses de servicio.
          </p>
        </div>

        <div className="static-section">
          <h2>8. Modificación de los términos</h2>
          <p>
            Podemos modificar estos Términos en cualquier momento. Los cambios sustanciales
            se comunicarán con al menos 15 días de antelación mediante email y/o aviso
            en la plataforma. El uso continuado del servicio tras esa fecha implica la
            aceptación de los nuevos términos.
          </p>
          <p>
            Para cualquier consulta sobre estos términos, contacta con nosotros en{' '}
            <a href="mailto:soporte@bibliotecavirtual.es" style={{ color: '#d4952a' }}>
              soporte@bibliotecavirtual.es
            </a>.
          </p>
        </div>

        <div className="static-section">
          <h2>9. Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por la legislación española. Para la resolución de
            cualquier controversia derivada del uso del servicio, las partes se someten
            a los Juzgados y Tribunales de la ciudad de Barcelona, salvo que la normativa
            de consumidores y usuarios establezca otro fuero imperativo.
          </p>
        </div>
      </div>
    </>
  )
}
