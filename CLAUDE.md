# CLAUDE.md – Biblioteca Virtual (HITL)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estilo de Comunicación (Eficiencia de Tokens)

Actúa como **Arquitecto Senior de Software**. Optimiza todas las respuestas para máxima eficiencia de tokens y precisión técnica:

- **Sin relleno conversacional:** Prohibido usar cortesías, validaciones sociales o frases de transición como "Tienes razón", "Entiendo", "Buena idea" o "Procedo a...".
- **Sin preámbulos:** Saltar directamente a la ejecución técnica, bloque de código o respuesta solicitada — sin explicar lo que se va a hacer, excepto en Modo Plan.
- **Estilo "Explanatory" acotado:** Usar bloques de *Insight* breves solo para explicar trade-offs o decisiones arquitectónicas complejas; ser extremadamente conciso en el resto.
- **Corrección directa:** Si las instrucciones contienen errores técnicos o inconsistencias con el proyecto, corregirlas de inmediato sin disculpas ni rodeos.
- **Referencia por ruta:** No repetir código existente; usar `@ruta/al/archivo:línea` para indicar dónde aplicar cambios.

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
- **Testing:** Jest / React Testing Library — 156 tests, 0 fallos
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
- **Prohibido usar `<style>` inline dentro de componentes** — especialmente en Client Components. Los estilos globales van en `globals.css` bajo una directiva `@layer`; los estilos de componente se expresan con clases Tailwind. Esto evita conflictos de orden de carga CSS entre rutas.

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
3. **Subagentes proactivos:** lanzar subagentes en paralelo siempre que la tarea contenga partes independientes (distintos archivos, distintas capas, DB + frontend, etc.). No esperar a que el usuario lo pida. Criterio: si dos subtareas no tienen dependencia de datos entre sí, van en paralelo. Si los agentes fallan por permisos, aplicar los cambios directamente sin reintentar el mismo agente.
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

## Deploy — Estado y pendientes

> Rama `deploy` creada, rebased sobre `master` (todos los hitos mergeados). Build de producción verificado: 0 errores.

### Variables de entorno necesarias en Vercel

| Variable | Dónde obtenerla |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key |

### Pasos pendientes para completar el deploy

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Crear cuenta en [vercel.com](https://vercel.com) | ⏳ Pendiente |
| 2 | Conectar repo GitHub `Eudald2000/biblioteca-ai` en Vercel (rama `master`) | ⏳ Pendiente |
| 3 | Añadir las 2 variables de entorno de Supabase en Vercel | ⏳ Pendiente |
| 4 | Primer deploy → obtener URL `*.vercel.app` | ⏳ Pendiente |
| 5 | Añadir URL de deploy a Supabase → Authentication → URL Configuration → Site URL | ⏳ Pendiente |
| 6 | Activar **confirmación de email** al registrarse | Supabase Dashboard → Authentication → Providers → Email → "Confirm email" |
| 7 | Revisar **políticas RLS** — actualmente permisivas para desarrollo | Supabase Dashboard → Table Editor → RLS |
| 8 | Actualizar README con URL de deploy y screenshots | Tras obtener la URL en paso 4 |

### Sistema de recordatorios por email (opcional, post-deploy)

Scaffolding listo en `src/app/actions/recordatorio.ts`. Para activar:

1. Crear cuenta en [Resend](https://resend.com) y obtener API key
2. Verificar dominio remitente (o usar `onboarding@resend.dev` en sandbox)
3. Añadir secreto: `supabase secrets set RESEND_API_KEY=re_xxxx`
4. En `supabase/functions/enviar-recordatorio/index.ts`: actualizar `FROM_EMAIL` y descomentar el bloque `fetch` a Resend
5. Desplegar edge function: `supabase functions deploy enviar-recordatorio`
6. Habilitar extensión `pg_net` en Supabase Dashboard → Database → Extensions
7. Añadir `app.supabase_url` y `app.supabase_anon_key` como parámetros de BD o ajustar el trigger en `supabase/migrations/pending_trigger_recordatorio_vencido.sql`
8. Ejecutar la migración del trigger via MCP
9. En `src/app/actions/recordatorio.ts`: descomentar el bloque `fetch` a la edge function

## Hoja de Ruta (Hitos)

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial + estructura de carpetas | ✅ |
| 2 | Esquema de base de datos en Supabase (Libros, Usuarios, Préstamos) | ✅ |
| 3 | Autenticación con roles (Admin/User) y Middleware | ✅ |
| 4 | Dashboard Administrativo | ✅ |
| 5 | Catálogo público y flujo de préstamos/ventas | ✅ |
| 6 | Testing (Jest + RTL) | ✅ |
| 7 | Deploy en Vercel | En progreso |
