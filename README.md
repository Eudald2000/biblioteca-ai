# Biblioteca Virtual

Aplicación web fullstack para la gestión de una biblioteca digital con sistema de préstamos, compras y panel de administración completo.

Desarrollada por **Eudald** como proyecto de portafolio.

---

## Descripción

Biblioteca Virtual permite a los usuarios explorar un catálogo de libros, solicitar préstamos y comprar títulos. Los administradores disponen de un dashboard completo para gestionar el inventario, los usuarios y todas las operaciones de la plataforma.

### Funcionalidades actuales

**Catálogo público**
- Listado de libros con búsqueda y filtros por categoría y editorial
- Página de detalle de cada libro con sinopsis, precios y disponibilidad

**Autenticación**
- Registro e inicio de sesión con email y contraseña
- Roles diferenciados: `admin` y `usuario`
- Protección de rutas por rol y verificación de baneo en tiempo real

**Dashboard administrativo** *(solo admins)*
- Estadísticas en tiempo real: libros, usuarios, préstamos activos/vencidos, ingresos
- CRUD completo de libros con gestión de stock, visibilidad y soft delete
- CRUD de editoriales y categorías
- Gestión de usuarios: cambiar rol, banear/desbanear, ver historial de actividad
- Gestión de operaciones: préstamos (filtro por estado, marcar como devuelto) y compras
- Auto-vencido de préstamos a los 15 días mediante `pg_cron`

**Próximamente**
- Server Actions para pedir préstamo y comprar desde el catálogo
- Carrito de compra
- Historial personal del usuario
- Sistema de recordatorios por email (Resend)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | [Next.js 15](https://nextjs.org) — App Router, Server Components |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL via [Supabase](https://supabase.com) |
| Autenticación | Supabase Auth con SSR cookies |
| Seguridad | Row Level Security (RLS) en todas las tablas |
| Tiempo real | Supabase Realtime |
| Cron jobs | pg_cron (auto-vencido de préstamos) |
| Deploy | Vercel *(próximamente)* |

---

## Instalación y uso local

### Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### Configuración

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
# 4. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilación de producción
npm run lint     # ESLint
npm test         # Tests (Jest)
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (dashboard)/     # Panel admin (rutas protegidas)
│   ├── (public)/        # Catálogo público
│   └── actions/         # Server Actions
├── components/
│   ├── ui/              # Componentes genéricos
│   ├── layout/          # Navbar, Sidebar
│   └── features/        # Componentes por dominio
├── lib/
│   └── supabase/        # Clientes server y client
├── types/               # Tipos TypeScript del dominio
├── constants/           # Constantes globales
└── proxy.ts             # Middleware de autenticación y baneo
```

---

## Roles y accesos

| Ruta | Usuario no autenticado | Usuario autenticado | Admin |
|------|----------------------|---------------------|-------|
| `/catalogo` | ✅ | ✅ | ✅ |
| `/catalogo/[id]` | ✅ | ✅ | ✅ |
| `/cuenta` | ❌ | ✅ | ✅ |
| `/dashboard` | ❌ | ❌ | ✅ |

Los usuarios baneados son desconectados automáticamente en la siguiente navegación.

---

## Hoja de ruta

| # | Hito | Estado |
|---|------|--------|
| 1 | Configuración inicial | ✅ |
| 2 | Esquema de base de datos | ✅ |
| 3 | Autenticación y middleware | ✅ |
| 4 | Dashboard administrativo | ✅ |
| 5 | Catálogo y flujo de transacciones | 🔄 En progreso |
| 6 | Testing (Jest + RTL) | Pendiente |
| 7 | Deploy en Vercel | Pendiente |
