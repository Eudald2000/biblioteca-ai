# Hito 4 — Dashboard Administrativo

**Estado:** COMPLETADO  
**Rama:** `feature/hito-4-dashboard`  
**PR:** Eudald2000/biblioteca-ai#4

---

## Objetivo

Construir el panel de administración completo: gestión de libros, editoriales, categorías, usuarios, operaciones (préstamos y compras) y estadísticas en tiempo real.

---

## Secciones implementadas

### 1. Stats en tiempo real — `/dashboard`

- 9 tarjetas con métricas actualizadas vía **Supabase Realtime** (canal `dashboard-stats`)
- Métricas: libros en catálogo, libros disponibles (stock > 0), usuarios registrados, **usuarios baneados**, ventas realizadas, préstamos activos, préstamos vencidos, ingresos por ventas, valor en préstamos activos
- Badge rojo dinámico en "Usuarios baneados" cuando el valor es > 0
- Indicador visual de estado (verde = en tiempo real, amarillo = actualizando)

**Archivos:**
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/components/features/dashboard/StatsGrid.tsx`

---

### 2. CRUD Libros — `/dashboard/libros`

- Tabla con búsqueda (título/autor), filtros por editorial y categoría, paginación (15/página) y ordenación por cualquier columna
- Toggle de visibilidad (ocultar del catálogo público sin borrar)
- Soft delete (`eliminado_en`)
- Formulario de creación y edición con validación completa: ISBN, precios, stock, URL de portada, categorías múltiples

**Archivos:**
- `src/app/(dashboard)/dashboard/libros/page.tsx`
- `src/app/(dashboard)/dashboard/libros/nuevo/page.tsx`
- `src/app/(dashboard)/dashboard/libros/[id]/editar/page.tsx`
- `src/components/features/libros/LibrosTabla.tsx`
- `src/components/features/libros/LibroForm.tsx`
- `src/app/actions/libros.ts`

---

### 3. CRUD Editoriales — `/dashboard/editoriales`

- Listado, creación y edición
- Guard: no permite eliminar una editorial si tiene libros asociados

**Archivos:**
- `src/app/(dashboard)/dashboard/editoriales/`
- `src/app/actions/editoriales.ts`

---

### 4. CRUD Categorías — `/dashboard/categorias`

- Listado, creación y edición
- Guard: no permite eliminar una categoría si tiene libros asociados

**Archivos:**
- `src/app/(dashboard)/dashboard/categorias/`
- `src/app/actions/categorias.ts`

---

### 5. CRUD Usuarios — `/dashboard/usuarios`

#### Listado
- Búsqueda por nombre/email, filtro por rol (`admin`/`usuario`), paginación (20/página)
- Email obtenido de `auth.users` vía RPC con `SECURITY DEFINER` (`listar_usuarios_admin`)
- Badge de rol (Admin/Usuario) y estado (Activo/Baneado)

#### Acciones inline (con confirmación)
- **Cambiar rol** (`admin` ↔ `usuario`) — guard: no puedes cambiar tu propio rol
- **Banear / Desbanear** — guard: no puedes banearte a ti mismo
- Diálogo `window.confirm` con nombre del usuario antes de ejecutar cualquier acción destructiva

#### Página de detalle — `/dashboard/usuarios/[id]`
- Ficha de cuenta: fecha de registro, préstamos activos, total préstamos, total compras, gasto total en préstamos, gasto total en compras
- Aviso visual si hay préstamos vencidos sin devolver
- Tabla de préstamos con botón "Devuelto" y botón "Recordatorio" (ver sección 7)
- Tabla de compras

**Archivos:**
- `src/app/(dashboard)/dashboard/usuarios/page.tsx`
- `src/app/(dashboard)/dashboard/usuarios/[id]/page.tsx`
- `src/app/(dashboard)/dashboard/usuarios/loading.tsx`
- `src/components/features/usuarios/UsuariosTabla.tsx`
- `src/components/features/usuarios/PrestamosUsuarioTabla.tsx`
- `src/app/actions/usuarios-admin.ts`

**Migraciones:**
- `add_baneado_to_usuarios` — columna `baneado boolean NOT NULL DEFAULT false`
- `add_rls_admin_update_usuarios` — política RLS que permite a admins actualizar cualquier usuario
- `create_rpc_listar_usuarios_admin` — RPC SECURITY DEFINER con filtros y paginación
- `create_rpc_detalle_usuario_admin` — RPC SECURITY DEFINER para detalle individual
- `fix_rpc_listar_usuarios_admin_ambiguous_id` — fix de ambigüedad de columna `id` en el JOIN

---

### 6. Gestión de Operaciones — `/dashboard/operaciones`

Página única con dos tablas independientes.

#### Préstamos
- Columnas: usuario (link a detalle), libro/autor, estado (badge), fecha préstamo, vencimiento, devolución, precio
- Filtro por estado (`activo`/`devuelto`/`vencido`)
- Paginación independiente (`pagina_p`)
- Botón **"✓ Devuelto"** en préstamos activos y vencidos

#### Compras
- Columnas: usuario (link a detalle), libro/autor, fecha, precio pagado
- Paginación independiente (`pagina_c`)

#### Búsqueda cruzada (afecta a ambas tablas)
- Campo **Libro / Autor** — filtra por `titulo` o `autor` (ILIKE)
- Campo **Usuario** — filtra por `nombre_completo` (ILIKE)
- Ambos filtros se combinan con AND y se aplican simultáneamente a las dos tablas
- Filtros y paginaciones coexisten en la URL sin interferirse

**Archivos:**
- `src/app/(dashboard)/dashboard/operaciones/page.tsx`
- `src/app/(dashboard)/dashboard/operaciones/loading.tsx`
- `src/components/features/operaciones/PrestamosTabla.tsx`
- `src/components/features/operaciones/ComprasTabla.tsx`
- `src/components/features/operaciones/BusquedaOperaciones.tsx`
- `src/app/actions/prestamos.ts`

---

### 7. Recordatorios por email (scaffolding)

Estructura completa preparada, pendiente de configurar Resend.

- Botón **"📧 Recordatorio"** visible en préstamos vencidos (detalle de usuario y operaciones)
- Al hacer clic muestra aviso de configuración pendiente
- Edge Function lista en `supabase/functions/enviar-recordatorio/index.ts`
- Trigger PostgreSQL listo en `supabase/migrations/pending_trigger_recordatorio_vencido.sql`
- Server Action lista en `src/app/actions/recordatorio.ts`

**Para activar:** ver sección "Recordatorios por email" en `CLAUDE.md → Pendientes antes de producción`.

---

### 8. Auto-vencido de préstamos

- `fecha_vencimiento DEFAULT CURRENT_DATE + INTERVAL '15 days'` en nuevos préstamos
- **`pg_cron`** configurado: job `marcar-prestamos-vencidos` se ejecuta cada día a las 00:05 UTC
- Función `marcar_prestamos_vencidos()`: actualiza a `vencido` todos los préstamos `activo` con `fecha_vencimiento < CURRENT_DATE`

**Migración:** `enable_pg_cron_and_auto_vencido`

---

### 9. Middleware de baneo — `src/proxy.ts`

- En cada request a rutas protegidas (`/dashboard/*`, `/catalogo/*`, `/cuenta/*`), consulta `baneado` en `public.usuarios`
- Si `baneado = true`: `signOut()` inmediato + redirect a `/login?baneado=1`
- La página de login muestra el mensaje "Tu cuenta ha sido suspendida" cuando detecta `?baneado=1`
- Protección en tiempo real: un usuario baneado mientras tiene sesión activa pierde el acceso en la siguiente navegación

---

### 10. Mejoras de UX

| Mejora | Detalle |
|--------|---------|
| Enlace activo en sidebar | `SidebarNav.tsx` — Client Component con `usePathname()`, resalta la ruta actual |
| Estados de carga | `loading.tsx` con skeletons animados en `/usuarios` y `/operaciones` |
| Confirmaciones | `window.confirm` con nombre del usuario antes de banear/desbanear o cambiar rol |
| Mensaje de baneo en login | Banner rojo cuando se llega desde redirect por baneo |

**Archivos:**
- `src/components/layout/SidebarNav.tsx`
- `src/app/(dashboard)/dashboard/usuarios/loading.tsx`
- `src/app/(dashboard)/dashboard/operaciones/loading.tsx`

---

## Decisiones técnicas

| Decisión | Motivo |
|----------|--------|
| RPC con SECURITY DEFINER para emails | `auth.users` no es accesible directamente con la anon key; el RPC corre con permisos de `postgres` |
| Baneo en `proxy.ts` en lugar de solo en login | Garantiza corte de acceso aunque el usuario ya tenga sesión activa |
| `pg_cron` para auto-vencido | Solución nativa de PostgreSQL, sin dependencias externas ni Edge Functions para una tarea puramente de BD |
| Filtros de búsqueda en operaciones como params de URL | Permite compartir/bookmarkear búsquedas y mantiene el estado al navegar entre páginas |
| `window.confirm` para confirmaciones | Suficiente para el contexto admin sin añadir complejidad de modales |

---

## Pendientes / Conocidos

- El check de baneo en `proxy.ts` hace una query a BD en cada navegación — aceptable para volumen bajo; escalar con caché si fuera necesario
- Recordatorios por email requieren configurar Resend (ver `CLAUDE.md`)
- Trigger de auto-vencido requiere habilitar `pg_net` para notificar vía Edge Function al cambiar estado (ver migration `pending_trigger_recordatorio_vencido.sql`)
