# CLAUDE.md – Biblioteca Virtual (HITL)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto del Proyecto

Aplicación para préstamo, compra y venta de libros con gestión de usuarios (roles: **Admin** / **User**) y un dashboard administrativo.

**Stack principal:**
- **Next.js 15** — App Router, Server Components por defecto (no Pages Router)
- **TypeScript** — tipado estricto
- **Tailwind CSS v4** — estilos utility-first
- **Supabase** — PostgreSQL + Auth + Row Level Security + Storage
- **Testing:** Jest / React Testing Library (configuración pendiente)
- **Gestión de estado:** por definir (candidatos: Context API, Zustand, TanStack Query)

## Comandos Esenciales

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compila para producción (valida TypeScript) |
| `npm run lint` | Ejecuta ESLint |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm test` | Ejecuta los tests (Jest) |

## Estructura de `src/`

```
src/
├── app/
│   ├── (auth)/       ← rutas de login/registro (layout propio)
│   ├── (dashboard)/  ← panel administrativo (layout propio con sidebar)
│   ├── (public)/     ← catálogo público (layout con navbar)
│   └── api/          ← API Routes de Next.js
├── components/
│   ├── ui/           ← componentes genéricos reutilizables (Button, Input, Modal...)
│   ├── layout/       ← Navbar, Footer, Sidebar
│   └── features/     ← componentes de dominio (books/, loans/, users/)
├── lib/
│   ├── supabase/     ← clientes Supabase: server.ts y client.ts
│   └── utils/        ← helpers genéricos
├── hooks/            ← custom React hooks
├── types/            ← interfaces TypeScript del dominio (Book, User, Loan, Role)
└── constants/        ← constantes globales (ROLES, LOAN_STATUS, etc.)
```

## Convenciones de Código

- **Componentes:** PascalCase, un componente por archivo (`BookCard.tsx`)
- **Archivos y carpetas:** kebab-case (`book-card.tsx`, `use-books.ts`)
- **Hooks:** camelCase con prefijo `use` (`useBooks.ts`)
- **Rutas API:** `src/app/api/[recurso]/route.ts`
- **Tipos de dominio:** definidos en `src/types/`, importados con `@/types/...`
- **Tipos de Supabase:** generados con `supabase gen types` y ubicados en `lib/database.types.ts`
- **Server vs Client Components:** Server Components por defecto; `'use client'` solo cuando sea estrictamente necesario (eventos del navegador, hooks de estado)

## Reglas de Arquitectura

- **Route Groups** `(auth)`, `(dashboard)`, `(public)`: layouts distintos por sección sin afectar la URL
- **Supabase Auth:** sesiones gestionadas vía cookies del servidor, no localStorage
- **Roles:** almacenados en tabla `profiles` de Supabase, validados en middleware de Next.js
- **Estilos:** Tailwind CSS v4 con clases utilitarias; evitar CSS custom salvo que sea inevitable. Objetivo: responsive y accesible (WCAG 2.1 AA)

## Base de Datos y Seguridad

- **Antes de proponer cambios en la DB:** usar el servidor MCP de Supabase para inspeccionar el esquema actual
- **Row Level Security:** cada tabla debe tener RLS habilitado. Las políticas deben definirse explícitamente para los roles `anon`, `authenticated` y `admin`
- **Tipos compartidos:** generar desde Supabase y ubicar en `lib/database.types.ts`

## Flujo de Trabajo (HITL)

1. **Planificación estricta:** activar `/plan` antes de cualquier cambio significativo. Esperar aprobación explícita antes de ejecutar
2. **Sin commits automáticos:** mostrar siempre el `diff` y esperar confirmación antes de cada commit
3. **Subagentes para investigación:** usar subagentes para analizar bases de código extensas o APIs externas, manteniendo limpio el contexto principal
4. **Verificación continua:** tras cada hito, proporcionar comandos de test o validación. Si no existen, sugerir crearlos

## Instrucciones de Compactación

Cuando se ejecute `/compact` (o se alcance ~70–80% de tokens), el resumen **debe incluir**:
- Estado actual de la hoja de ruta (tabla de hitos)
- Decisiones clave sobre esquema de DB y roles de usuario
- Comandos de test ya validados
- Cualquier pendiente crítico acordado

## Hoja de Ruta (Hitos)

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial + estructura de carpetas | ✅ Completado |
| 2 | Esquema de base de datos en Supabase (Libros, Usuarios, Préstamos) | Pendiente |
| 3 | Autenticación con roles (Admin/User) y Middleware | Pendiente |
| 4 | Dashboard Administrativo (gestión de stock) | Pendiente |
| 5 | Catálogo público y flujo de préstamos/ventas | Pendiente |
| 6 | CRUD completo de libros | Pendiente |
