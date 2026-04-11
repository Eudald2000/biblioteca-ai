# Hito 5 — Catálogo público y flujo de transacciones

**Estado:** Completado
**Rama:** `feature/hito-5-catalogo-transacciones`

---

## Objetivo

Construir la experiencia completa del usuario final: navegación del catálogo con filtros, página de detalle de libro, flujo de préstamo y compra mediante carrito, historial de transacciones en la cuenta personal y actualización en tiempo real del badge del header.

---

## Secciones implementadas

### 1. Catálogo público — `/catalogo`

- Grid responsive de tarjetas de libro con portada, título, autor, editorial, categorías y precio
- Filtros en tiempo real (sin reload) por **título**, **autor**, **editorial** y **categoría** — todos combinables simultáneamente
- Badge **"Agotado"** superpuesto en la portada cuando `stock = 0`; en ese estado los botones de acción se reemplazan por el badge
- Consulta solo libros con `visible = true AND eliminado_en IS NULL`
- Componente `BotonesAccionLibro` con prop `compact={true}` para adaptarse al espacio reducido de las tarjetas

**Archivo:**
- `src/app/(public)/catalogo/page.tsx`

---

### 2. Página de detalle de libro — `/libros/[id]`

- Portada a tamaño completo, título, autor, editorial, descripción, precios de préstamo y compra, stock actual, categorías como badges
- Sección **"Libros relacionados"** — libros de las mismas categorías, excluyendo el actual, con límite de 4
- `BotonesAccionLibro` en modo normal (tamaño completo con etiquetas)
- Si `stock = 0`: badge "Agotado" en lugar de botones
- Metadatos de página dinámicos (`generateMetadata`) con título y descripción del libro

**Archivos:**
- `src/app/(public)/libros/[id]/page.tsx`
- `src/components/features/libros/LibrosRelacionados.tsx`

---

### 3. Componente BotonesAccionLibro

Client Component que encapsula las acciones de préstamo y compra disponibles para un libro.

- Prop `compact` — versión reducida para tarjetas del catálogo; sin `compact`, versión completa para la página de detalle
- Prop `libroId` — identificador del libro
- Prop `stock` — determina si mostrar botones o badge "Agotado"
- Llama a `añadirAlCarrito(libroId, 'prestamo')` o `añadirAlCarrito(libroId, 'compra')` según la acción
- `useTransition` para loading state por botón sin bloquear la UI
- Feedback inmediato: toast/mensaje de confirmación o error tras cada acción

**Archivo:**
- `src/components/features/libros/BotonesAccionLibro.tsx`

---

### 4. Tabla `carrito` en base de datos

Nueva tabla para gestionar el carrito de cada usuario antes de confirmar transacciones.

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
usuario_id  uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
libro_id    uuid NOT NULL REFERENCES libros(id) ON DELETE CASCADE
tipo        tipo_carrito NOT NULL  -- 'prestamo' | 'compra'
creado_en   timestamptz DEFAULT now()
UNIQUE (usuario_id, libro_id, tipo)
```

- Enum `tipo_carrito` con valores `'prestamo'` y `'compra'`
- Constraint `UNIQUE(usuario_id, libro_id, tipo)` — evita duplicados por tipo en el carrito del mismo usuario
- RLS habilitado: cada usuario solo puede ver, insertar y eliminar sus propios registros del carrito

**Migración:** `create_tabla_carrito`

---

### 5. Server Actions del carrito — `src/app/actions/carrito.ts`

#### `añadirAlCarrito(libroId, tipo)`
- Verifica sesión activa; rechaza con error si no hay usuario
- Inserta en `carrito` con `ON CONFLICT DO NOTHING` — idempotente
- `revalidatePath('/carrito')` y `revalidatePath('/catalogo')` tras inserción

#### `eliminarDelCarrito(carritoItemId)`
- Elimina un item del carrito verificando que pertenece al usuario en sesión (RLS lo garantiza a nivel BD)
- `revalidatePath('/carrito')`

#### `confirmarPrestamos()`
- Lee todos los items de tipo `'prestamo'` del carrito del usuario
- **Validación de préstamo duplicado:** rechaza si el usuario ya tiene un préstamo `activo` para el mismo libro (consulta `prestamos WHERE usuario_id = X AND libro_id = Y AND estado = 'activo'`)
- Por cada libro válido: decrementa `stock - 1` en `libros`, inserta en `prestamos` con snapshot de `precio_prestamo`
- Elimina los items procesados del carrito
- `revalidatePath` en `/carrito`, `/cuenta`, `/catalogo` y la ruta de cada libro

#### `confirmarCompras()`
- Lee todos los items de tipo `'compra'` del carrito del usuario
- Por cada libro: decrementa `stock - 1` en `libros`, inserta en `compras` con snapshot de `precio_compra`
- Elimina los items procesados del carrito
- `revalidatePath` en `/carrito`, `/cuenta`, `/catalogo` y la ruta de cada libro

**Archivo:**
- `src/app/actions/carrito.ts`

---

### 6. Página de carrito — `/carrito`

Página Server Component que lee el carrito del usuario autenticado y presenta dos secciones independientes.

#### Sección "Préstamos"
- Lista de libros añadidos como préstamo: portada, título, autor, precio de préstamo
- Total de la sección
- Botón **"Confirmar préstamos"** — llama a `confirmarPrestamos()`
- Botón de eliminar por item — llama a `eliminarDelCarrito(id)`

#### Sección "Compras"
- Lista de libros añadidos como compra: portada, título, autor, precio de compra
- Total de la sección
- Botón **"Confirmar compras"** — llama a `confirmarCompras()`
- Botón de eliminar por item — llama a `eliminarDelCarrito(id)`

#### Estado vacío
- Si el carrito está vacío: mensaje y enlace de vuelta al catálogo
- Si una sección está vacía pero la otra no: solo se muestra la sección con contenido

**Archivos:**
- `src/app/(public)/carrito/page.tsx`
- `src/components/features/carrito/SeccionCarrito.tsx`
- `src/components/features/carrito/EliminarItemBtn.tsx`
- `src/components/features/carrito/ConfirmarSeccionBtn.tsx`

---

### 7. Badge de carrito en el header

- `SiteHeader.tsx` consulta en servidor el número total de items del carrito del usuario
- Badge numérico sobre el icono de carrito, actualizado automáticamente vía `revalidatePath` tras cada mutación (añadir, eliminar, confirmar)
- Desaparece si el carrito está vacío; no se muestra para usuarios no autenticados

**Archivos:**
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteHeaderClient.tsx`

---

### 8. Historial en `/cuenta`

Página del usuario autenticado con su historial completo de transacciones.

#### Préstamos
- Tabla con: portada, título, autor, fecha de préstamo, fecha de vencimiento, fecha de devolución, precio pagado
- Badge de estado con color semántico:
  - `activo` — azul
  - `devuelto` — verde
  - `vencido` — rojo
- El precio mostrado es el **snapshot** del momento del préstamo (`prestamos.precio_prestamo`), no el precio actual del libro

#### Compras
- Tabla con: portada, título, autor, fecha de compra, precio pagado
- El precio mostrado es el **snapshot** del momento de la compra (`compras.precio_compra`)

**Archivo:**
- `src/app/(public)/cuenta/page.tsx`

---

### 9. Devolución de préstamos y restauración de stock

Server Action `marcarDevuelto(prestamoId)` en `src/app/actions/prestamos.ts`:
- Actualiza `estado = 'devuelto'` y `fecha_devolucion = CURRENT_DATE`
- **Restaura stock:** incrementa `stock + 1` en `libros` — el libro vuelve a estar disponible
- `revalidatePath` en `/cuenta`, `/catalogo`, `/dashboard/operaciones` y la ruta del libro
- Guard de rol: solo ejecutable por el propio usuario (via RLS) o un admin

**Archivo:**
- `src/app/actions/prestamos.ts`

---

### 10. Cron job de vencimiento automático

`pg_cron` configurado para marcar préstamos vencidos automáticamente (habilitado en Hito 4, integrado en el flujo del Hito 5):

- Job `marcar-prestamos-vencidos` ejecuta cada día a las **00:05 UTC**
- Función `marcar_prestamos_vencidos()`: actualiza a `vencido` todos los préstamos con `estado = 'activo'` y `fecha_vencimiento < CURRENT_DATE`
- Compatible con la lógica de devolución: los préstamos vencidos siguen pudiendo devolverse

---

## Decisiones técnicas

| Decisión | Motivo |
|----------|--------|
| Carrito en BD en lugar de `localStorage` | Persistencia entre dispositivos y sesiones; necesario para snapshots de precio y validaciones en servidor |
| Constraint `UNIQUE(usuario_id, libro_id, tipo)` | Evita duplicados a nivel BD sin depender de checks en la aplicación |
| Snapshot de precios en `prestamos` y `compras` | El precio puede cambiar después; el historial debe reflejar lo que se pagó realmente |
| `revalidatePath` en lugar de revalidación por tag | Granularidad suficiente para este volumen de rutas; tags serían necesarios con caching agresivo |
| Validación de préstamo duplicado en `confirmarPrestamos` | Evita que un usuario tenga el mismo libro en dos préstamos activos simultáneamente |
| `BotonesAccionLibro` como Client Component | Necesita `useTransition` para feedback de carga por botón sin bloquear la UI del resto de la página |
| Stock restaurado al devolver | Garantiza que el inventario es siempre coherente con el número de préstamos activos |

---

## Pendientes / Conocidos

- El flujo de compra no valida si el usuario ya compró el mismo libro previamente (no es un requisito de negocio definido, pero podría añadirse)
- La página `/cuenta` no tiene paginación — aceptable para el volumen actual de datos de prueba
- Tests de integración completos del flujo (carrito → confirmación → historial) — cubiertos en Hito 6
