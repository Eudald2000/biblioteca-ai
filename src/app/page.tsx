import Link from 'next/link'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { RUTAS } from '@/constants'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
})

export default async function HomePage() {
  const supabase = await createClient()
  const { count: totalLibros } = await supabase
    .from('libros')
    .select('*', { count: 'exact', head: true })
    .is('eliminado_en', null)
    .eq('visible', true)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <style>{`
        :root {
          --ink: #0d0b08;
          --parchment: #f5efe6;
          --amber: #d4952a;
          --amber-light: #f0b445;
          --amber-glow: rgba(212, 149, 42, 0.15);
          --serif: var(--font-cormorant), 'Georgia', serif;
          --sans: var(--font-dm), system-ui, sans-serif;
        }

        .landing {
          background: var(--ink);
          color: var(--parchment);
          font-family: var(--sans);
          position: relative;
          flex: 1;
        }

        /* ── NOISE OVERLAY ── */
        .landing::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* Floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: float-orb 20s ease-in-out infinite;
          z-index: 0;
        }
        .orb-1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,149,42,0.06),transparent); top:-100px; left:-150px; animation-duration:25s; }
        .orb-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(180,100,20,0.05),transparent); bottom:-80px; right:-100px; animation-duration:30s; animation-delay:-10s; }
        .orb-3 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(240,180,69,0.04),transparent); top:30%; right:10%; animation-duration:20s; animation-delay:-5s; }

        @keyframes float-orb {
          0%,100% { transform:translate(0,0) scale(1); }
          25% { transform:translate(30px,-40px) scale(1.05); }
          50% { transform:translate(-20px,20px) scale(0.95); }
          75% { transform:translate(40px,30px) scale(1.02); }
        }

        /* Particles */
        .particle { position:absolute; width:2px; height:2px; background:var(--amber); border-radius:50%; opacity:0; animation:particle-float linear infinite; pointer-events:none; z-index:0; }
        @keyframes particle-float {
          0% { opacity:0; transform:translateY(0) scale(0); }
          10% { opacity:0.6; }
          90% { opacity:0.3; }
          100% { opacity:0; transform:translateY(-120vh) scale(1.5); }
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          z-index: 2;
          min-height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          overflow: hidden;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 700px; height: 700px;
          background: radial-gradient(ellipse, rgba(212,149,42,0.08) 0%, transparent 70%);
          pointer-events: none;
          animation: pulse-glow 6s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%,100% { opacity:0.6; transform:translate(-50%,-50%) scale(1); }
          50% { opacity:1; transform:translate(-50%,-50%) scale(1.15); }
        }

        .hero-eyebrow { font-family:var(--sans); font-size:0.72rem; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--amber); margin-bottom:24px; opacity:0; animation:fade-up 0.8s ease forwards; animation-delay:0.2s; }
        .hero-title { font-family:var(--serif); font-size:clamp(3.5rem,10vw,8rem); font-weight:300; line-height:0.95; letter-spacing:-0.02em; max-width:900px; margin-bottom:8px; opacity:0; animation:fade-up 0.9s ease forwards; animation-delay:0.4s; }
        .hero-title em { font-style:italic; background:linear-gradient(135deg,var(--amber-light) 0%,var(--amber) 50%,#a06010 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-subtitle { font-family:var(--serif); font-size:clamp(1.1rem,2.5vw,1.5rem); font-weight:300; font-style:italic; color:rgba(245,239,230,0.55); max-width:560px; line-height:1.6; margin-top:28px; margin-bottom:48px; opacity:0; animation:fade-up 0.9s ease forwards; animation-delay:0.6s; }
        .hero-actions { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; opacity:0; animation:fade-up 0.9s ease forwards; animation-delay:0.8s; }

        .hero-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; background:var(--amber); color:var(--ink); border-radius:8px; font-family:var(--sans); font-size:0.9rem; font-weight:500; letter-spacing:0.04em; text-decoration:none; transition:all 0.25s; position:relative; overflow:hidden; }
        .hero-btn-primary::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transition:left 0.5s; }
        .hero-btn-primary:hover::before { left:100%; }
        .hero-btn-primary:hover { background:var(--amber-light); transform:translateY(-2px); box-shadow:0 8px 32px rgba(212,149,42,0.3); }

        .hero-btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:14px 32px; border:1px solid rgba(245,239,230,0.15); color:rgba(245,239,230,0.7); border-radius:8px; font-family:var(--sans); font-size:0.9rem; font-weight:400; text-decoration:none; transition:all 0.25s; }
        .hero-btn-ghost:hover { border-color:rgba(212,149,42,0.4); color:var(--parchment); background:rgba(212,149,42,0.06); }

        .hero-book { font-size:clamp(4rem,10vw,7rem); margin-bottom:32px; display:block; animation:book-float 4s ease-in-out infinite, fade-up 0.8s ease forwards; animation-delay:0s,0.1s; filter:drop-shadow(0 20px 60px rgba(212,149,42,0.25)); position:relative; z-index:2; }
        @keyframes book-float {
          0%,100% { transform:translateY(0) rotate(-1deg); }
          50% { transform:translateY(-16px) rotate(1deg); }
        }

        @keyframes fade-up {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }

        /* ── DIVIDER ── */
        .divider { position:relative; z-index:2; width:100%; display:flex; align-items:center; justify-content:center; padding:0 24px; margin:0 auto; max-width:1200px; }
        .divider-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(212,149,42,0.2),transparent); }
        .divider-diamond { width:8px; height:8px; background:var(--amber); transform:rotate(45deg); margin:0 16px; flex-shrink:0; }

        /* ── STATS ── */
        .stats { position:relative; z-index:2; max-width:1200px; margin:80px auto; padding:0 24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:2px; }
        .stat-item { padding:40px 32px; text-align:center; border:1px solid rgba(212,149,42,0.08); position:relative; overflow:hidden; animation:fade-up 0.8s ease forwards; opacity:0; transition:border-color 0.2s, background 0.2s; }
        .stat-item:nth-child(1) { animation-delay:0.1s; border-radius:12px 0 0 12px; }
        .stat-item:nth-child(2) { animation-delay:0.2s; }
        .stat-item:nth-child(3) { animation-delay:0.3s; }
        .stat-item:nth-child(4) { animation-delay:0.4s; border-radius:0 12px 12px 0; }
        .stat-item:hover { border-color:rgba(212,149,42,0.25); background:rgba(212,149,42,0.04); }
        .stat-number { font-family:var(--serif); font-size:3.5rem; font-weight:300; color:var(--amber-light); line-height:1; letter-spacing:-0.02em; }
        .stat-label { font-family:var(--sans); font-size:0.72rem; font-weight:500; letter-spacing:0.15em; text-transform:uppercase; color:rgba(245,239,230,0.4); margin-top:8px; }

        /* ── MARQUEE ── */
        .marquee-wrap { position:relative; z-index:2; overflow:hidden; border-top:1px solid rgba(212,149,42,0.08); border-bottom:1px solid rgba(212,149,42,0.08); padding:18px 0; margin:40px 0; }
        .marquee-track { display:flex; gap:48px; white-space:nowrap; animation:marquee 25s linear infinite; }
        .marquee-item { font-family:var(--serif); font-size:0.85rem; font-style:italic; color:rgba(212,149,42,0.4); letter-spacing:0.05em; flex-shrink:0; }
        .marquee-sep { color:rgba(212,149,42,0.2); }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

        /* ── SECTION ── */
        .section { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:80px 24px; }
        .section-label { font-family:var(--sans); font-size:0.72rem; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:var(--amber); margin-bottom:16px; }
        .section-title { font-family:var(--serif); font-size:clamp(2rem,5vw,3.5rem); font-weight:300; line-height:1.1; letter-spacing:-0.01em; margin-bottom:16px; }
        .section-title em { font-style:italic; color:rgba(245,239,230,0.5); }
        .section-desc { font-family:var(--sans); font-size:1rem; font-weight:300; color:rgba(245,239,230,0.5); max-width:520px; line-height:1.7; }

        /* ── FEATURES ── */
        .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:1px; margin-top:64px; border:1px solid rgba(212,149,42,0.08); border-radius:16px; overflow:hidden; }
        .feature-card { padding:48px 40px; background:rgba(255,255,255,0.01); position:relative; overflow:hidden; transition:background 0.3s; }
        .feature-card::after { content:''; position:absolute; bottom:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,transparent,var(--amber),transparent); opacity:0; transition:opacity 0.3s; }
        .feature-card:hover { background:rgba(212,149,42,0.04); }
        .feature-card:hover::after { opacity:1; }
        .feature-card + .feature-card { border-left:1px solid rgba(212,149,42,0.08); }
        .feature-icon { width:52px; height:52px; border-radius:12px; border:1px solid rgba(212,149,42,0.2); display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:28px; background:rgba(212,149,42,0.05); transition:all 0.3s; }
        .feature-card:hover .feature-icon { border-color:var(--amber); background:rgba(212,149,42,0.12); transform:scale(1.05); }
        .feature-title { font-family:var(--serif); font-size:1.6rem; font-weight:500; margin-bottom:14px; letter-spacing:-0.01em; }
        .feature-desc { font-family:var(--sans); font-size:0.9rem; font-weight:300; color:rgba(245,239,230,0.5); line-height:1.7; }
        .feature-badge { display:inline-block; margin-top:20px; padding:4px 12px; border-radius:100px; font-family:var(--sans); font-size:0.7rem; font-weight:500; letter-spacing:0.08em; text-transform:uppercase; }
        .badge-available { background:rgba(212,149,42,0.12); color:var(--amber-light); border:1px solid rgba(212,149,42,0.2); }
        .badge-soon { background:rgba(245,239,230,0.04); color:rgba(245,239,230,0.35); border:1px solid rgba(245,239,230,0.08); }

        /* ── CTA ── */
        .cta-section { position:relative; z-index:2; margin:40px 24px; max-width:1200px; margin-left:auto; margin-right:auto; border:1px solid rgba(212,149,42,0.15); border-radius:24px; padding:80px 48px; text-align:center; overflow:hidden; background:radial-gradient(ellipse at 50% 0%,rgba(212,149,42,0.06) 0%,transparent 70%); }
        .cta-section::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--amber),transparent); }
        .cta-title { font-family:var(--serif); font-size:clamp(2rem,5vw,4rem); font-weight:300; line-height:1.1; margin-bottom:16px; }
        .cta-subtitle { font-family:var(--sans); font-size:0.95rem; font-weight:300; color:rgba(245,239,230,0.45); margin-bottom:40px; max-width:440px; margin-left:auto; margin-right:auto; line-height:1.6; }
        .cta-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }

        /* ── TECH ── */
        .tech-grid { display:flex; flex-wrap:wrap; gap:12px; margin-top:40px; }
        .tech-pill { display:flex; align-items:center; gap:8px; padding:10px 18px; border:1px solid rgba(212,149,42,0.12); border-radius:100px; font-family:var(--sans); font-size:0.82rem; font-weight:400; color:rgba(245,239,230,0.6); transition:all 0.2s; cursor:default; }
        .tech-pill:hover { border-color:rgba(212,149,42,0.35); color:var(--parchment); background:rgba(212,149,42,0.05); }
        .tech-dot { width:6px; height:6px; border-radius:50%; background:var(--amber); flex-shrink:0; opacity:0.6; }

        @media (max-width:640px) {
          .stat-item { border-radius:0 !important; }
          .feature-card + .feature-card { border-left:none; border-top:1px solid rgba(212,149,42,0.08); }
          .cta-section { padding:48px 24px; }
        }
      `}</style>

      <div className={`flex flex-1 flex-col bg-[#0d0b08] ${cormorant.variable} ${dmSans.variable}`}>

        <SiteHeader />

        <div className="landing">

        {/* Orbs de fondo */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Partículas flotantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${5 + (i * 4.7) % 90}%`,
              animationDuration: `${12 + (i * 3.1) % 18}s`,
              animationDelay: `${(i * 1.3) % 12}s`,
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
            }}
          />
        ))}

        {/* ── HERO ── */}
        <section className="hero">
          <span className="hero-book" aria-hidden>📚</span>
          <p className="hero-eyebrow">Biblioteca Virtual · Catálogo digital de libros</p>
          <h1 className="hero-title">
            Explora, <em>pide prestado</em><br />y compra libros
          </h1>
          <p className="hero-subtitle">
            Una biblioteca digital donde el conocimiento no tiene horarios.
            Navega nuestro catálogo, gestiona tus préstamos y adquiere
            los títulos que más te inspiran.
          </p>
          <div className="hero-actions">
            <Link href={RUTAS.CATALOGO} className="hero-btn-primary">
              Explorar catálogo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            {!user && (
              <Link href={RUTAS.REGISTRO} className="hero-btn-ghost">
                Crear cuenta gratis
              </Link>
            )}
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="divider"><div className="divider-line" /><div className="divider-diamond" /><div className="divider-line" /></div>

        {/* ── STATS ── */}
        <div className="stats">
          <div className="stat-item"><div className="stat-number">{totalLibros ?? 0}</div><div className="stat-label">Libros disponibles</div></div>
          <div className="stat-item"><div className="stat-number">2</div><div className="stat-label">Modalidades</div></div>
          <div className="stat-item"><div className="stat-number">∞</div><div className="stat-label">Acceso 24/7</div></div>
          <div className="stat-item"><div className="stat-number">0€</div><div className="stat-label">Coste de registro</div></div>
        </div>

        {/* ── MARQUEE ── */}
        <div className="marquee-wrap" aria-hidden>
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, rep) =>
              ['Préstamos', 'Compras', 'Catálogo digital', 'Gestión de biblioteca', 'Libros a tu alcance', 'Sin límites', 'Lectura sin fronteras', 'Tu biblioteca online'].map((item, i) => (
                <span key={`${rep}-${i}`} className="marquee-item">
                  {item} <span className="marquee-sep">◆</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="section">
          <p className="section-label">Qué puedes hacer</p>
          <h2 className="section-title">Tres maneras de<br /><em>acceder al conocimiento</em></h2>
          <p className="section-desc">Desde navegar el catálogo hasta gestionar tus préstamos activos, todo en un mismo lugar.</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">Explorar</h3>
              <p className="feature-desc">Navega nuestro catálogo completo con filtros por autor, editorial y categoría. Encuentra exactamente lo que buscas.</p>
              <span className="feature-badge badge-available">Disponible ahora</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3 className="feature-title">Pedir prestado</h3>
              <p className="feature-desc">Solicita préstamos de los títulos que te interesen. Gestiona tus préstamos activos y fechas de devolución desde tu cuenta.</p>
              <span className="feature-badge badge-soon">Próximamente</span>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3 className="feature-title">Comprar</h3>
              <p className="feature-desc">Adquiere los libros que quieras conservar. Añade al carrito y gestiona tu compra de forma sencilla y segura.</p>
              <span className="feature-badge badge-soon">Próximamente</span>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="divider"><div className="divider-line" /><div className="divider-diamond" /><div className="divider-line" /></div>

        {/* ── CTA ── */}
        <div className="cta-section">
          <h2 className="cta-title">Empieza a leer<br /><em>hoy mismo</em></h2>
          <p className="cta-subtitle">Crea tu cuenta gratuita y accede al catálogo completo. Sin límites, sin compromisos.</p>
          <div className="cta-actions">
            {user ? (
              <Link href={RUTAS.CATALOGO} className="hero-btn-primary">
                Ir al catálogo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link href={RUTAS.REGISTRO} className="hero-btn-primary">
                  Crear cuenta gratis
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href={RUTAS.CATALOGO} className="hero-btn-ghost">Ver catálogo sin cuenta</Link>
              </>
            )}
          </div>
        </div>

        {/* ── TECH STACK ── */}
        <section className="section" style={{ paddingTop: '40px' }}>
          <p className="section-label">Stack tecnológico</p>
          <h2 className="section-title">Construida con las<br /><em>mejores herramientas</em></h2>
          <p className="section-desc">Cada decisión técnica está orientada a rendimiento, seguridad y una experiencia de desarrollo excelente.</p>
          <div className="tech-grid">
            {[
              { name: 'Next.js 15', desc: 'App Router · Server Components' },
              { name: 'TypeScript', desc: 'Tipado estricto end-to-end' },
              { name: 'Supabase', desc: 'PostgreSQL · Auth · RLS · Storage' },
              { name: 'Tailwind CSS v4', desc: 'Utility-first · Dark mode' },
              { name: 'React 19', desc: 'Server Actions · useActionState' },
              { name: 'next/font', desc: 'Fuentes web optimizadas' },
              { name: 'Row Level Security', desc: 'Políticas de BD por rol' },
              { name: 'Middleware', desc: 'Protección de rutas por sesión' },
            ].map((tech) => (
              <div key={tech.name} className="tech-pill" title={tech.desc}>
                <div className="tech-dot" />
                {tech.name}
              </div>
            ))}
          </div>
        </section>

        </div>{/* /landing */}

        <SiteFooter />

      </div>
    </>
  )
}
