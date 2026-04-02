# CLAUDE.md – Biblioteca Virtual (HITL)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rol del Asistente

Actúa como **Senior Full-Stack Engineer** con experiencia en Next.js, Supabase y TypeScript.
Aplica siempre **buenas prácticas de desarrollo**: código limpio, mantenible, seguro y escalable.
Prioriza la calidad sobre la velocidad: cada solución debe ser robusta, tipada, accesible y bien documentada.
Hablame siempre en español, manteniendo un tono profesional y claro. Inclueso en la terminal o al describir comandos, usa español para los mensajes y descripciones.

## Contexto del Proyecto

Aplicación para préstamo, compra y venta de libros con gestión de usuarios (roles: **Admin** / **User**) y un dashboard administrativo.

**Stack principal:**
- **Next.js 15** — App Router, Server Components por defecto (no Pages Router)
- **TypeScript** — tipado estricto (`strict: true`)
- **Tailwind CSS v4** — estilos utility-first
- **Supabase** — PostgreSQL + Auth + Row Level Security + Storage
- **Testing:** Jest / React Testing Library (configuración pendiente)
- **Gestión de estado:** Zustand para estado global simple, TanStack Query para estado servidor

## Comandos Esenciales

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compila para producción (valida TypeScript) |
| `npm run lint` | Ejecuta ESLint |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm test` | Ejecuta los tests (Jest) |

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/       ← rutas de login/registro (layout propio)
│   ├── (dashboard)/  ← panel administrativo (layout con sidebar)
│   ├── (public)/     ← catálogo público (layout con navbar)
│   └── api/          ← API Routes de Next.js
├── components/
│   ├── ui/           ← componentes genéricos reutilizables (Button, Input, Modal...)
│   ├── layout/       ← Navbar, Footer, Sidebar
│   └── features/     ← componentes de dominio (books/, loans/, users/)
├── lib/
│   ├── supabase/     ← clientes Supabase: server.ts y client.ts
│   └── utils/        ← helpers genéricos (formatters, validators, cn)
├── hooks/            ← custom React hooks
├── types/            ← interfaces TypeScript del dominio (Book, User, Loan, Role)
├── constants/        ← constantes globales (ROLES, LOAN_STATUS, etc.)
└── middleware.ts     ← protección de rutas y validación de sesión
```

## Convenciones de Código

- **Componentes:** PascalCase, un componente por archivo (`BookCard.tsx`)
- **Archivos y carpetas:** kebab-case (`book-card.tsx`, `use-books.ts`)
- **Hooks:** camelCase con prefijo `use` (`useBooks.ts`)
- **Rutas API:** `src/app/api/[recurso]/route.ts`
- **Tipos de dominio:** definidos en `src/types/`, importados con `@/types/...`
- **Tipos de Supabase:** generados con `supabase gen types --lang=typescript --project-id <id> > src/lib/database.types.ts`
- **Server vs Client Components:** Server Components por defecto; `'use client'` solo cuando sea estrictamente necesario

## Reglas de Arquitectura y Buenas Prácticas

### Next.js
- Usar **Route Groups** `(auth)`, `(dashboard)`, `(public)` para layouts distintos sin afectar la URL.
- Preferir **Server Actions** para mutaciones en lugar de API Routes cuando sea posible.
- Implementar **loading.tsx** y **error.tsx** para cada segmento de ruta que lo requiera.
- Utilizar **middleware.ts** para proteger rutas basadas en roles.

### Supabase y Base de Datos
- **Toda operación sobre la base de datos** (crear tablas, modificar esquema, añadir columnas, definir políticas RLS, ejecutar migraciones) debe realizarse **exclusivamente a través del MCP de Supabase** — nunca mediante SQL manual directo ni editando la base de datos fuera del MCP.
- Antes de proponer cualquier cambio de esquema, usar `list_tables` y `execute_sql` del MCP para inspeccionar el estado actual.
- **Sesiones:** gestionadas vía cookies del servidor (usar `@supabase/ssr`).
- **RLS:** todas las tablas deben tener RLS habilitado. Políticas definidas para roles `anon`, `authenticated` y `admin`.
- **Tipos:** regenerar `src/lib/database.types.ts` cada vez que se modifica el esquema.

### TypeScript
- Evitar `any` explícito. Usar `unknown` si es necesario.
- Definir tipos estrictos para props de componentes y retornos de funciones.
- Utilizar `satisfies` para validar objetos complejos sin perder el tipado.

### Estilos (Tailwind CSS v4)
- Orden de clases: utility-first, siguiendo el orden recomendado (layout, espaciado, tipografía, colores, efectos).
- Usar `cn()` (clsx + tailwind-merge) para combinar clases condicionales.
- Preferir clases utilitarias sobre CSS custom.

### Accesibilidad
- Usar etiquetas semánticas HTML (`main`, `section`, `nav`, etc.).
- Incluir atributos `alt` en imágenes, `aria-label` cuando sea necesario.
- Contraste de colores conforme a WCAG 2.1 AA.

### Testing
- Escribir tests unitarios para lógica compleja (hooks, utilidades).
- Tests de integración para flujos críticos (autenticación, préstamos).
- Mockear el cliente Supabase en tests unitarios.

## Uso de Skills

Activa las siguientes skills según el contexto:

| Skill | Cuándo usarla |
|-------|----------------|
| `tailwind-v4` | Al crear o revisar componentes con estilos: clases, orden, uso de `cn()`, patrones responsive. |
| `supabase-db` | Al diseñar esquemas, escribir SQL, definir políticas RLS o usar el cliente Supabase. |
| `next-best-practices` | Para estructurar rutas, Server Components, caching, Server Actions. |
| `webapp-testing` | Para escribir tests, mocks y configuración de Jest/RTL. |
| `frontend-design` | Para decisiones de diseño UI/UX, componentes visuales, accesibilidad. |
| `skill-creator` | Para crear o mejorar skills personalizadas del proyecto. |
| `find-skills` | Para descubrir nuevas skills disponibles cuando sea necesario. |

Si la tarea abarca múltiples áreas, activa las skills secuencialmente.

## Flujo de Trabajo (HITL)

1. **Planificación estricta:** activar `/plan` antes de cambios significativos. Esperar aprobación explícita.
2. **Sin commits automáticos:** mostrar el `diff` y esperar confirmación antes de cada commit.
3. **Subagentes para investigación:** usar para bases de código extensas o APIs externas.
4. **Verificación continua:** tras cada hito, proporcionar comandos de test o validación.
5. **Resumen final:** después de ejecutar los cambios, entregar un resumen estructurado que incluya:
   - **Archivos modificados o creados** (ruta y propósito breve).
   - **Principales cambios realizados** (nuevas funcionalidades, refactors, configuraciones).
   - **Componentes o utilidades nuevas** (nombre y responsabilidad).
   - **Acciones pendientes** (testing, migraciones, validación manual).
   - **Próximos pasos sugeridos** según la hoja de ruta.

## Instrucciones de Compactación

Cuando se ejecute `/compact` (o se alcance ~70–80% de tokens), el resumen **debe incluir**:
- Estado actual de la hoja de ruta.
- Decisiones clave de esquema de DB y roles.
- Comandos de test validados.
- Pendientes críticos acordados.
- Avisarme ante de realizar la accion de compactar, para que pueda revisar el resumen antes de confirmar.

## Esquema de BD — Decisiones clave

| Tabla | Campo destacado | Notas |
|-------|----------------|-------|
| `libros` | `precio_compra` + `precio_prestamo` | Dos precios separados. Compra = venta permanente; préstamo = alquiler temporal |
| `libros` | `visible boolean DEFAULT true` | Controla visibilidad en catálogo público sin borrar el registro |
| `libros` | `eliminado_en timestamptz` | Soft delete — reservado para borrado lógico definitivo |
| `compras` | `precio_compra` | Snapshot del precio en el momento de la compra |
| `prestamos` | `precio_prestamo` | Snapshot del precio en el momento del préstamo |

## Pendientes antes de producción

> ⚠️ Estas configuraciones están desactivadas intencionalmente durante el desarrollo. **Deben activarse antes de desplegar a producción.**

| # | Tarea | Dónde |
|---|-------|-------|
| 1 | Activar **confirmación de email** al registrarse | Supabase Dashboard → Authentication → Providers → Email → "Confirm email" |
| 2 | Implementar **"Pedir préstamo"** en tarjeta y página de libro | Hito 5 — `src/app/(public)/libros/[id]/page.tsx` + Server Action |
| 3 | Implementar **"Añadir al carrito"** en tarjeta y página de libro | Hito 5 — requiere tabla `carrito` en BD y página `/carrito` |
| 4 | Crear página del **carrito de compra** (`/carrito`) | Ver items añadidos, cantidades y checkout |
| 5 | Configurar **RLS completo** en todas las tablas | Actualmente permisivo para desarrollo — revisar antes de producción |

## Hoja de Ruta (Hitos)

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial + estructura de carpetas | ✅ |
| 2 | Esquema de base de datos en Supabase (Libros, Usuarios, Préstamos) | ✅ |
| 3 | Autenticación con roles (Admin/User) y Middleware | ✅ |
| 4 | Dashboard Administrativo | ✅ parcial |
| 5 | Catálogo público y flujo de préstamos/ventas | Pendiente |
| 6 | Testing (Jest + RTL) | Pendiente |

### Hito 4 — Dashboard (detalle)

| Sección | Estado | Notas |
|---------|--------|-------|
| Stats en tiempo real (inicio) | ✅ | 8 métricas con Supabase Realtime |
| CRUD Libros | ✅ | Tabla con filtros, búsqueda, paginación, orden, toggle visible |
| CRUD Editoriales | ✅ | Guard: no eliminar si tiene libros |
| CRUD Categorías | ✅ | Guard: no eliminar si tiene libros |
| CRUD Usuarios | Pendiente | Listar, ver detalle, cambiar rol, desactivar |
| Gestión Préstamos | Pendiente | Listar, filtrar por estado, marcar como devuelto |
| Gestión Ventas/Compras | Pendiente | Historial de compras por usuario/libro |

### Hito 5 — Catálogo y flujo de transacciones (detalle)

| Feature | Estado | Notas |
|---------|--------|-------|
| Catálogo público (listado) | ✅ | Filtra `visible=true AND eliminado_en IS NULL` |
| Página de detalle de libro | ✅ | Muestra precios, editorial, categorías, sinopsis |
| Server Action "Pedir préstamo" | Pendiente | Requiere: decrementar stock, insertar en `prestamos` con precio snapshot, validar disponibilidad |
| Server Action "Comprar libro" | Pendiente | Requiere: decrementar stock, insertar en `compras` con precio snapshot |
| Tabla `carrito` en BD | Pendiente | Campos: usuario_id, libro_id, cantidad, tipo (prestamo/compra) |
| Página `/carrito` | Pendiente | Ver items, cantidades, checkout |
| Página `/cuenta/prestamos` | Pendiente | Historial de préstamos del usuario, estado, devolución |
| Página `/cuenta/compras` | Pendiente | Historial de compras del usuario |
