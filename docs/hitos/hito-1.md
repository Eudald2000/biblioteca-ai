# Hito 1 — Configuración inicial y estructura de carpetas

**Estado:** Completado
**Rama:** `master`
**Commit:** `117790c`

---

## Objetivo

Sentar las bases del proyecto: stack tecnológico, estructura de carpetas, herramientas de desarrollo y configuración de Claude Code para el resto del desarrollo.

---

## Stack elegido

| Tecnología | Versión | Motivo |
|---|---|---|
| Next.js | 16.x | App Router, Server Components, Server Actions |
| TypeScript | 5.x | `strict: true` — tipado estricto en todo el proyecto |
| Tailwind CSS | v4 | Configuración CSS-first, sin `tailwind.config.js` |
| Supabase | 2.x | PostgreSQL + Auth + RLS + Storage en un solo servicio |
| Jest + RTL | 30.x / 16.x | Tests unitarios e integración |

---

## Estructura de carpetas

El proyecto sigue la convención de **Route Groups** de Next.js para separar layouts sin afectar las URLs:

```
src/
├── app/
│   ├── (auth)/        ← login, registro (layout: card centrada)
│   ├── (dashboard)/   ← panel admin (layout: sidebar)
│   ├── (public)/      ← catálogo público (layout: navbar)
│   ├── api/           ← API Routes (webhooks, endpoints REST si necesario)
│   ├── actions/       ← Server Actions organizadas por dominio
│   ├── layout.tsx     ← Root layout (fuentes, metadata global)
│   └── page.tsx       ← Redirección a /catalogo
├── components/
│   ├── ui/            ← Button, Input, Modal, Badge... (genéricos, sin lógica de negocio)
│   ├── layout/        ← Navbar, Footer, Sidebar (estructurales)
│   └── features/      ← auth/, books/, loans/, users/ (componentes de dominio)
├── lib/
│   ├── supabase/      ← server.ts y client.ts
│   ├── database.types.ts ← tipos generados por Supabase CLI
│   └── utils.ts       ← cn(), formatters, helpers
├── types/             ← interfaces de dominio (Perfil, Libro, Prestamo...)
├── constants/         ← ROLES, RUTAS, LOAN_STATUS...
├── hooks/             ← custom React hooks (useAuth, useBooks...)
└── middleware.ts / proxy.ts ← protección de rutas
```

### Decisión de diseño: por qué Route Groups

Los route groups `(auth)`, `(dashboard)` y `(public)` permiten tener tres layouts completamente distintos (auth con card centrada, dashboard con sidebar, público con navbar) sin que esos nombres aparezcan en la URL. Esto mantiene rutas limpias como `/login`, `/dashboard` o `/catalogo`.

---

## Archivos de configuración

### `tsconfig.json`
- `strict: true` — sin `any` implícito, null checks, etc.
- Alias `@/*` → `src/*` para imports limpios en todo el proyecto
- Target ES2017, moduleResolution bundler

### `next.config.ts`
- Mínimo al inicio; ampliado en Hito 3 con `remotePatterns` para Open Library
- Usa Turbopack como bundler (Next.js 16)

### `.env.example`
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```
El archivo real `.env.local` nunca se commitea (está en `.gitignore`).

### `CLAUDE.md`
Instrucciones persistentes para Claude Code que definen:
- Rol del asistente (Senior Full-Stack Engineer)
- Stack y convenciones de código
- Reglas de arquitectura (RLS, Server Components, etc.)
- Hoja de ruta con hitos
- Qué skills activar según el contexto

---

## Skills configuradas

Las skills son instrucciones especializadas que Claude Code carga según el contexto:

| Skill | Cuándo se activa |
|---|---|
| `tailwind-v4` | Al crear/revisar componentes con estilos |
| `supabase-db` | Al diseñar esquema, escribir SQL, definir RLS |
| `next-best-practices` | Al estructurar rutas, Server Actions, caching |
| `webapp-testing` | Al escribir tests con Jest/RTL |
| `frontend-design` | Para decisiones UI/UX y accesibilidad |

---

## Dependencias instaladas

**Producción:**
- `next` — framework principal
- `react` / `react-dom` — React 19
- `@supabase/supabase-js` — cliente oficial de Supabase
- `@supabase/ssr` — adaptador SSR para Next.js (gestión de sesiones via cookies)

**Desarrollo:**
- `typescript` — compilador TypeScript
- `tailwindcss` + `@tailwindcss/postcss` — Tailwind v4
- `eslint` + `eslint-config-next` — linting
- `jest` + `@testing-library/react` + `@testing-library/jest-dom` — testing

---

## Notas técnicas

- **Next.js 16 vs 15**: El proyecto usa Next.js 16.2.1 aunque el CLAUDE.md referencia Next.js 15. En v16, `middleware.ts` se renombra a `proxy.ts` y la función exportada pasa de llamarse `middleware` a `proxy`.
- **Tailwind v4**: No hay `tailwind.config.js`. La configuración de tema se hace en `globals.css` con `@theme {}`. Las clases utilitarias funcionan igual.
