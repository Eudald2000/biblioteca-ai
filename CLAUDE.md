# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Biblioteca virtual para préstamo, compra y venta de libros con gestión de usuarios y dashboard administrativo.

## Comandos

```bash
npm run dev       # servidor de desarrollo en http://localhost:3000
npm run build     # compilar para producción (valida TypeScript)
npm run lint      # ESLint
npm run start     # servidor de producción (requiere build previo)
```

## Stack

- **Next.js 15** — App Router (no Pages Router)
- **TypeScript** — tipado estricto
- **Tailwind CSS v4** — estilos utility-first
- **Supabase** — PostgreSQL + Auth + Storage (Hito 2+)

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

## Convenciones

- **Componentes:** PascalCase, un componente por archivo (`BookCard.tsx`)
- **Hooks:** camelCase con prefijo `use` (`useBooks.ts`)
- **Rutas API:** `src/app/api/[recurso]/route.ts`
- **Tipos de dominio:** definidos en `src/types/`, importados con `@/types/...`
- **Server vs Client Components:** Server Components por defecto; añadir `"use client"` solo cuando sea necesario (eventos, hooks de estado)

## Decisiones arquitectónicas

- **Route Groups** `(auth)`, `(dashboard)`, `(public)`: layouts distintos por sección sin afectar la URL
- **Server Components por defecto**: mejor rendimiento y SEO
- **Supabase Auth**: sesiones gestionadas vía cookies del servidor, no localStorage
- **Roles**: almacenados en tabla `profiles` de Supabase, validados en middleware de Next.js

## Flujo de trabajo (HITL)

- Activar siempre `/plan` antes de modificar código
- Esperar aprobación explícita antes de ejecutar
- Verificar con los comandos anteriores tras cada implementación

## Hitos del proyecto

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial + estructura de carpetas | ✅ Completado |
| 2 | Esquema de base de datos en Supabase | Pendiente |
| 3 | Autenticación con Supabase Auth + middleware | Pendiente |
| 4 | CRUD de libros (catálogo público) | Pendiente |
| 5 | Sistema de préstamos | Pendiente |
| 6 | Dashboard administrativo | Pendiente |
