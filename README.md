# Biblioteca Virtual

> Plataforma fullstack de préstamo y compra de libros con panel de administración completo.

[![Live Demo](https://img.shields.io/badge/Demo-biblioteca--ai.vercel.app-d4952a?style=for-the-badge&logo=vercel&logoColor=white)](https://biblioteca-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tests](https://img.shields.io/badge/Tests-156_pasando-22c55e?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io)

---

## Demo en vivo

**[biblioteca-ai.vercel.app](https://biblioteca-ai.vercel.app)**

Puedes explorar la aplicación con las siguientes credenciales de demo:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| **Administrador** | `admin1@biblioteca.com` | `Admin1234!` |
| **Usuario** | regístrate con cualquier email | mínimo 6 caracteres |

> Los datos de demo se restauran automáticamente cada 3 días. Si ves el catálogo vacío o las estadísticas en cero, es posible que alguien haya eliminado contenido — vuelve a comprobarlo en unas horas.

---

## ¿Qué es esto?

Biblioteca Virtual es una aplicación web construida como proyecto de portafolio por **Eudald**. Simula el sistema de gestión de una biblioteca digital real: los usuarios pueden explorar el catálogo, pedir préstamos y comprar libros; los administradores gestionan todo el contenido y las operaciones desde un dashboard completo.

---

## Funcionalidades

### Para usuarios

- **Catálogo** — listado de libros con búsqueda por título/autor y filtros por categoría y editorial
- **Detalle de libro** — sinopsis, precios, disponibilidad, libros relacionados
- **Carrito** — añadir préstamos y compras, ver totales por sección antes de confirmar
- **Pedir préstamo** — se registra con fecha de vencimiento a 15 días; el estado cambia a *vencido* automáticamente mediante un cron job diario si no se devuelve a tiempo
- **Comprar** — compra permanente con precio snapshot en el momento de la transacción
- **Cuenta personal** — historial de préstamos (activo / devuelto / vencido) y compras con precio pagado
- **Stock en tiempo real** — los libros sin stock muestran el badge *Agotado* y desactivan los botones

### Para administradores

- **Dashboard** — estadísticas en tiempo real: libros, usuarios registrados, préstamos activos/vencidos, ingresos totales
- **Gestión de libros** — crear, editar, cambiar visibilidad en catálogo, soft delete (eliminar permanente protegido si tiene operaciones vinculadas)
- **Gestión de editoriales y categorías** — CRUD completo con protección de borrado si hay libros asociados
- **Gestión de usuarios** — ver todos los usuarios, cambiar rol (admin/usuario), banear/desbanear
- **Operaciones** — ver todos los préstamos con filtro por estado, marcar devoluciones (restaura stock automáticamente); ver historial de compras
- **Auto-vencido** — `pg_cron` marca como *vencido* cualquier préstamo cuya fecha de devolución haya pasado, una vez al día a las 00:05 UTC

---

## Stack tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Frontend | [Next.js 15](https://nextjs.org) | App Router, Server Components, Server Actions |
| Lenguaje | TypeScript (strict) | Tipado estricto en todo el proyecto |
| Estilos | Tailwind CSS v4 | Utility-first, sin CSS personalizado |
| Base de datos | PostgreSQL via [Supabase](https://supabase.com) | Esquema completo con RLS |
| Autenticación | Supabase Auth (SSR) | Cookies de servidor, middleware de protección |
| Seguridad | Row Level Security | Políticas por tabla y por rol |
| Tiempo real | Supabase Realtime | Estadísticas del dashboard en vivo |
| Cron jobs | pg_cron | Auto-vencido de préstamos y reset de datos demo |
| Testing | Jest + React Testing Library | 156 tests, 19 suites |
| Deploy | [Vercel](https://vercel.com) | CI/CD automático desde `master` |

---

## Instalación local

### Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Eudald2000/biblioteca-ai.git
cd biblioteca-ai

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

Edita `.env.local` con los valores de tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

```bash
# 4. Aplicar el esquema y los datos de prueba
# Ejecuta supabase/seed.sql desde el SQL Editor de tu proyecto Supabase

# 5. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilación de producción (valida TypeScript)
npm run lint     # ESLint
npm test         # Tests (Jest + RTL)
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro (layout propio)
│   ├── (dashboard)/     # Panel admin (rutas protegidas, layout con sidebar)
│   ├── (public)/        # Catálogo, detalle, carrito, cuenta
│   └── actions/         # Server Actions (auth, libros, carrito, préstamos…)
├── components/
│   ├── ui/              # Button, Input — componentes genéricos reutilizables
│   ├── layout/          # SiteHeader, SidebarNav
│   └── features/        # Componentes por dominio (auth, libros, carrito)
├── lib/
│   └── supabase/        # Clientes server.ts y client.ts
├── types/               # Interfaces TypeScript del dominio
├── constants/           # Rutas, roles, estados
└── middleware.ts         # Protección de rutas y verificación de baneo
```

---

## Roles y accesos

| Ruta | Sin sesión | Usuario | Admin |
|------|-----------|---------|-------|
| `/catalogo` | ✅ | ✅ | ✅ |
| `/libros/[id]` | ✅ | ✅ | ✅ |
| `/carrito` | ❌ | ✅ | ✅ |
| `/cuenta` | ❌ | ✅ | ✅ |
| `/dashboard` | ❌ | ❌ | ✅ |
| `/dashboard/libros` | ❌ | ❌ | ✅ |
| `/dashboard/usuarios` | ❌ | ❌ | ✅ |
| `/dashboard/operaciones` | ❌ | ❌ | ✅ |

Los usuarios baneados son desconectados automáticamente en la siguiente navegación gracias al middleware.

---

## Tests

156 tests distribuidos en 19 suites con 0 fallos:

- **Server Actions** — `auth`, `libros`, `categorias`, `editoriales`, `prestamos`, `usuario`, `usuarios-admin`, `carrito`
- **Componentes UI** — `Button`, `Input`
- **Client Components** — `LoginForm`, `RegisterForm`, `BotonesAccionLibro`, `EliminarItemBtn`, `ConfirmarSeccionBtn`
- **Utilidades** — `cn()` (clsx + tailwind-merge)

```bash
npm test                   # ejecutar todos los tests
npm test -- --coverage     # con informe de cobertura
```

---

## Hoja de ruta

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial y estructura de carpetas | ✅ |
| 2 | Esquema de base de datos en Supabase | ✅ |
| 3 | Autenticación con roles y middleware | ✅ |
| 4 | Dashboard administrativo | ✅ |
| 5 | Catálogo público y flujo de transacciones | ✅ |
| 6 | Testing (Jest + RTL) | ✅ |
| 7 | Deploy en Vercel | ✅ |

---

Desarrollado por **[Eudald](https://github.com/Eudald2000)** · [biblioteca-ai.vercel.app](https://biblioteca-ai.vercel.app)
