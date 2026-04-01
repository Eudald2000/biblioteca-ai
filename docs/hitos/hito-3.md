# Hito 3 — Autenticación con roles y Middleware

**Estado:** Completado (pendiente validación manual)
**Rama:** `feature/hito-3-autenticacion`

---

## Objetivo

Implementar el sistema completo de autenticación con Supabase Auth: registro y login de usuarios, protección de rutas según rol (Admin/Usuario), layouts base para cada sección de la app y componentes UI reutilizables.

---

## Decisiones de diseño tomadas

| Pregunta | Decisión | Motivo |
|---|---|---|
| ¿Registro abierto o solo por admin? | Abierto (`/registro`) | App de biblioteca pública |
| ¿Verificación de email? | Desactivada por ahora | Agilizar desarrollo y pruebas |
| ¿Redirect post-login? | Según rol: Admin → `/dashboard`, Usuario → `/catalogo` | UX diferenciada por rol |
| ¿UI de formularios? | Funcional + diseño Tailwind v4 | Calidad production-ready |
| ¿Verificación de rol en middleware o layout? | En layout de dashboard | Evitar query a BD en cada request |

---

## Flujo de autenticación

```
Registro
  /registro → RegisterForm → Server Action registrarse()
    → supabase.auth.signUp() → trigger al_crear_usuario crea perfil
    → redirect /catalogo

Login
  /login → LoginForm → Server Action iniciarSesion()
    → supabase.auth.signInWithPassword()
    → consulta usuarios para leer el rol
    → Admin: redirect /dashboard
    → Usuario: redirect /catalogo

Logout
  LogoutButton / form → cerrarSesion()
    → supabase.auth.signOut()
    → redirect /login

Acceso a /dashboard sin autenticar
  → proxy.ts detecta ruta protegida → redirect /login

Acceso a /dashboard autenticado pero sin rol admin
  → proxy.ts permite (está autenticado)
  → DashboardLayout consulta perfil → rol !== 'admin' → redirect /catalogo
```

---

## Archivos creados

### Utilidades y tipos base

| Archivo | Descripción |
|---|---|
| `src/constants/index.ts` | `ROLES` (`admin`/`usuario`) y `RUTAS` (paths tipados) como objetos `as const` |
| `src/types/index.ts` | Re-exports tipados desde `database.types.ts`: `Usuario`, `Libro`, `Prestamo`, `Compra`, `Editorial`, `Categoria`, `RolUsuario`, `EstadoPrestamo` |
| `src/lib/utils.ts` | Función `cn()` — combina `clsx` + `tailwind-merge` para clases condicionales |

### Proxy / Middleware

**`src/proxy.ts`** (equivalente al `middleware.ts` de Next.js 15, renombrado en Next.js 16)

Lógica:
1. Crea un cliente Supabase SSR que lee/escribe cookies de la request/response
2. Llama a `supabase.auth.getUser()` para refrescar la sesión (imprescindible con `@supabase/ssr`)
3. Si la ruta está en `RUTAS_PROTEGIDAS` (`/dashboard`, `/cuenta`) y no hay usuario → redirect `/login`
4. Si la ruta está en `RUTAS_SOLO_INVITADOS` (`/login`, `/registro`) y ya hay usuario → redirect `/catalogo`

**Por qué no verificar el rol en el proxy:** hacer una query a la BD en cada request es costoso. El proxy solo comprueba si hay sesión; la verificación de rol `admin` se delega al layout del dashboard (que ya se ejecuta en servidor).

### Server Actions

**`src/app/actions/auth.ts`**

```ts
iniciarSesion(_prevState, formData)  // login → redirect por rol
registrarse(_prevState, formData)    // signup + validaciones
cerrarSesion()                       // logout → redirect /login
```

**Validaciones en `registrarse`:**
- Nombre: requerido, mínimo 2 caracteres
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` + validación de Supabase en servidor
- Password: mínimo 6 caracteres (límite de Supabase)
- Confirm password: debe coincidir con password

**Firma con `useActionState`:** las acciones aceptan `(_prevState: AuthState, formData: FormData)` para ser compatibles con `useActionState` de React. El primer parámetro se prefija con `_` porque no se usa.

### Componentes UI genéricos

**`src/components/ui/Button.tsx`**
- Variantes: `primary` (azul), `secondary` (gris), `ghost` (transparente), `danger` (rojo)
- Tamaños: `sm`, `md`, `lg`
- Prop `loading` — muestra spinner SVG animado y desactiva el botón
- `forwardRef` para compatibilidad con formularios
- Target mínimo de 44px para accesibilidad táctil

**`src/components/ui/Input.tsx`**
- Props: `label`, `error`, `helper`
- `aria-invalid` y `aria-describedby` para accesibilidad
- Estado de error con borde rojo y mensaje bajo el campo (`role="alert"`)
- `forwardRef` para compatibilidad con `react-hook-form` en el futuro

### Componentes de autenticación (Client Components)

**`src/components/features/auth/LoginForm.tsx`**
- `'use client'` — necesario para `useActionState`
- Estado de error mostrado en banner rojo sobre el formulario
- Loading state en el botón durante la petición
- Link a `/registro` al pie del formulario

**`src/components/features/auth/RegisterForm.tsx`**
- Campos: nombre completo, email, password, confirmar password
- Helper text con requisitos mínimos
- Misma estructura de error que LoginForm
- Link a `/login` al pie

**`src/components/features/auth/LogoutButton.tsx`**
- Usa `useTransition` para loading state sin bloquear la UI
- Llama a `cerrarSesion()` Server Action

### Layouts

**`src/app/(auth)/layout.tsx`**
- Fondo `gray-50`, card blanca centrada con `max-w-md`
- Logo "📚 Biblioteca Virtual" como header
- Sin estado de sesión (páginas de auth no necesitan verificarlo)

**`src/app/(public)/layout.tsx`**
- Navbar sticky con logo y botón de login/logout dinámico
- Consulta `supabase.auth.getUser()` para mostrar el estado correcto
- Logout mediante `<form action={cerrarSesion}>` — evita JS en el cliente

**`src/app/(dashboard)/layout.tsx`**
- **Verificación de rol:** consulta `usuarios` y redirige si `rol !== 'admin'`
- Sidebar fija con navegación: Inicio, Libros, Usuarios, Préstamos
- Muestra nombre del admin en el pie del sidebar
- Logout mediante form server action

### Páginas

| Ruta | Archivo | Tipo | Descripción |
|---|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Static | Renderiza `LoginForm` |
| `/registro` | `(auth)/registro/page.tsx` | Static | Renderiza `RegisterForm` |
| `/catalogo` | `(public)/catalogo/page.tsx` | Dynamic | Grid de libros con portadas desde Supabase |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | Dynamic | Bienvenida admin con tarjetas de estadísticas placeholder |
| `/` | `app/page.tsx` | Static | Redirect a `/catalogo` |

### Configuración adicional

**`next.config.ts`** — añadido `remotePatterns` para permitir `next/image` con imágenes de Open Library:
```ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'covers.openlibrary.org' }]
}
```

**`package.json`** — nuevas dependencias:
- `clsx` — utilidad de clases condicionales
- `tailwind-merge` — merge inteligente de clases Tailwind (evita conflictos)

---

## Tests

Este hito no incluye tests unitarios propios (los componentes de auth son principalmente presentacionales y de integración con Supabase). Los flujos se validan manualmente:

**Checklist de validación manual:**
- [ ] Registro con email válido → perfil creado en Supabase → redirect `/catalogo`
- [ ] Registro con email inválido → mensaje de error en formulario
- [ ] Registro con passwords que no coinciden → mensaje de error
- [ ] Login con credenciales correctas (admin) → redirect `/dashboard`
- [ ] Login con credenciales correctas (usuario) → redirect `/catalogo`
- [ ] Login con credenciales incorrectas → mensaje de error
- [ ] Acceder a `/dashboard` sin sesión → redirect `/login`
- [ ] Acceder a `/dashboard` con sesión de usuario normal → redirect `/catalogo`
- [ ] Logout → redirect `/login` y sesión cerrada

---

## Notas técnicas

- **`proxy.ts` en lugar de `middleware.ts`:** Next.js 16 depreca `middleware.ts` en favor de `proxy.ts`. La función exportada también cambia de `middleware` a `proxy`. El matcher sigue siendo el mismo.
- **`useActionState` vs `useFormState`:** `useActionState` es el hook estable de React 19 que reemplaza `useFormState` de React DOM. La firma de la Server Action debe incluir el estado previo como primer parámetro: `(prevState, formData)`.
- **`getUser()` vs `getSession()`:** Supabase recomienda usar `getUser()` en el servidor porque valida el JWT contra su API, mientras que `getSession()` solo lee la cookie sin validar. El proxy y el dashboard layout usan `getUser()` por seguridad.
- **Redirect en Server Actions:** `redirect()` de Next.js lanza una excepción internamente, lo que significa que la función nunca llega a retornar un valor tras el redirect. TypeScript acepta esto porque el tipo de retorno `Promise<AuthState>` nunca se materializa en el camino del redirect.
