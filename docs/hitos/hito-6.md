# Hito 6 — Testing (Jest + RTL)

**Estado:** Completado
**Rama:** `feature/hito-5-catalogo-transacciones`

---

## Objetivo

Cubrir con tests automatizados las capas críticas de la aplicación: Server Actions de dominio, componentes UI genéricos, componentes de features con interacción y utilidades comunes. Alcanzar cobertura robusta de la lógica de negocio sin depender de infraestructura externa.

---

## Resultados

| Métrica | Valor |
|---------|-------|
| Tests totales | 156 |
| Suites | 19 |
| Fallos | 0 |
| Skipped | 0 |

---

## Estructura de tests

```
src/
├── app/actions/__tests__/
│   ├── auth.test.ts
│   ├── libros.test.ts
│   ├── carrito.test.ts
│   ├── categorias.test.ts
│   ├── editoriales.test.ts
│   ├── prestamos.test.ts
│   ├── usuario.test.ts
│   └── usuarios-admin.test.ts
├── components/
│   ├── features/
│   │   ├── libros/__tests__/
│   │   │   └── BotonesAccionLibro.test.tsx
│   │   ├── carrito/__tests__/
│   │   │   ├── EliminarItemBtn.test.tsx
│   │   │   └── ConfirmarSeccionBtn.test.tsx
│   │   └── auth/__tests__/
│   │       ├── LoginForm.test.tsx
│   │       └── RegisterForm.test.tsx
│   └── ui/__tests__/
│       ├── Button.test.tsx
│       └── Input.test.tsx
└── lib/__tests__/
    └── utils.test.ts
```

---

## Tier 1 — Server Actions

Las Server Actions son el núcleo de la lógica de negocio. Se testean aislando completamente Supabase mediante un mock del cliente.

### Estrategia: Proxy queryChain para Supabase

El mock de Supabase no devuelve objetos estáticos sino un **proxy encadenable** que intercepta cualquier combinación de `.from().select().eq()...` y retorna el valor configurado para ese test:

```ts
// jest.setup.ts
const createQueryChain = (result: unknown) => {
  const chain: Record<string, unknown> = {};
  const handler = { get: (_: unknown, prop: string) => prop === 'then'
    ? result?.then?.bind(result)
    : () => new Proxy(chain, handler)
  };
  return new Proxy(chain, handler);
};
```

Esto permite que los tests configuren el resultado de cualquier query sin necesidad de conocer la cadena exacta de métodos que usará la implementación.

---

### `auth.test.ts` — 16 tests

Cubre `iniciarSesion`, `registrarse` y `cerrarSesion`.

| Caso | Tests |
|------|-------|
| Login con credenciales correctas (admin → redirect `/dashboard`) | 1 |
| Login con credenciales correctas (usuario → redirect `/catalogo`) | 1 |
| Login con email o password vacío | 2 |
| Login con credenciales incorrectas (error Supabase) | 1 |
| Registro con todos los campos válidos | 1 |
| Registro con nombre vacío o demasiado corto | 2 |
| Registro con email inválido | 1 |
| Registro con password menor de 6 caracteres | 1 |
| Registro con passwords que no coinciden | 1 |
| Registro con email ya existente (error Supabase) | 1 |
| Logout — llama a `signOut` y redirige | 1 |
| Logout — manejo de error en `signOut` | 1 |
| Estado inicial correcto | 1 |

---

### `libros.test.ts` — 16 tests

Cubre `crearLibro`, `actualizarLibro`, `eliminarLibro`, `toggleVisibilidad`.

| Caso | Tests |
|------|-------|
| Crear libro con datos válidos | 1 |
| Crear libro — error si título vacío | 1 |
| Crear libro — error si stock negativo | 1 |
| Crear libro — error de BD (INSERT falla) | 1 |
| Actualizar libro con cambios parciales | 1 |
| Actualizar libro — no encontrado | 1 |
| Actualizar libro — error de validación | 1 |
| Actualizar libro — error de BD | 1 |
| Eliminar libro (soft delete) | 1 |
| Eliminar libro — ya eliminado (idempotente) | 1 |
| Eliminar libro — error de BD | 1 |
| Toggle visibilidad a `false` | 1 |
| Toggle visibilidad a `true` | 1 |
| Toggle visibilidad — libro no encontrado | 1 |
| Toggle visibilidad — sin permiso (usuario normal) | 1 |
| Listar libros del catálogo — filtra ocultos y eliminados | 1 |

---

### `carrito.test.ts` — 21 tests

Suite más extensa; cubre toda la lógica de negocio del carrito.

| Caso | Tests |
|------|-------|
| `añadirAlCarrito` — éxito préstamo | 1 |
| `añadirAlCarrito` — éxito compra | 1 |
| `añadirAlCarrito` — sin sesión → error | 1 |
| `añadirAlCarrito` — ya en carrito (conflict → idempotente) | 1 |
| `añadirAlCarrito` — tipo inválido → error | 1 |
| `eliminarDelCarrito` — éxito | 1 |
| `eliminarDelCarrito` — item no encontrado | 1 |
| `eliminarDelCarrito` — sin sesión → error | 1 |
| `confirmarPrestamos` — flujo completo (stock decrementado, registro insertado) | 1 |
| `confirmarPrestamos` — carrito vacío → no hace nada | 1 |
| `confirmarPrestamos` — sin sesión → error | 1 |
| `confirmarPrestamos` — préstamo duplicado → rechazado | 1 |
| `confirmarPrestamos` — libro sin stock → rechazado | 1 |
| `confirmarPrestamos` — error en INSERT `prestamos` | 1 |
| `confirmarPrestamos` — error al decrementar stock | 1 |
| `confirmarCompras` — flujo completo (stock decrementado, registro insertado) | 1 |
| `confirmarCompras` — carrito vacío → no hace nada | 1 |
| `confirmarCompras` — sin sesión → error | 1 |
| `confirmarCompras` — libro sin stock → rechazado | 1 |
| `confirmarCompras` — error en INSERT `compras` | 1 |
| `confirmarCompras` — error al decrementar stock | 1 |

---

### `categorias.test.ts` — 11 tests

Cubre `crearCategoria`, `actualizarCategoria`, `eliminarCategoria`.

| Caso | Tests |
|------|-------|
| Crear categoría válida | 1 |
| Crear con nombre vacío → error | 1 |
| Crear con error de BD | 1 |
| Actualizar nombre | 1 |
| Actualizar — no encontrada | 1 |
| Actualizar — error de BD | 1 |
| Eliminar categoría sin libros asociados | 1 |
| Eliminar — guard: tiene libros asociados → error | 1 |
| Eliminar — no encontrada | 1 |
| Eliminar — error de BD | 1 |
| Listar todas las categorías ordenadas | 1 |

---

### `editoriales.test.ts` — 11 tests

Estructura idéntica a `categorias.test.ts`, adaptada a la entidad `editoriales`.

---

### `prestamos.test.ts` — 6 tests

Cubre `marcarDevuelto` y la consulta de préstamos activos.

| Caso | Tests |
|------|-------|
| `marcarDevuelto` — éxito (estado actualizado, stock restaurado) | 1 |
| `marcarDevuelto` — sin sesión → error | 1 |
| `marcarDevuelto` — préstamo no encontrado | 1 |
| `marcarDevuelto` — ya devuelto (idempotente) | 1 |
| `marcarDevuelto` — error al restaurar stock | 1 |
| Listar préstamos activos del usuario | 1 |

---

### `usuario.test.ts` — 5 tests

Cubre las acciones del perfil de usuario propio.

| Caso | Tests |
|------|-------|
| Obtener perfil del usuario autenticado | 1 |
| Obtener perfil — sin sesión → null | 1 |
| Actualizar nombre completo | 1 |
| Actualizar — nombre vacío → error | 1 |
| Actualizar — sin sesión → error | 1 |

---

### `usuarios-admin.test.ts` — 8 tests

Cubre las acciones administrativas sobre usuarios.

| Caso | Tests |
|------|-------|
| Cambiar rol de usuario → admin | 1 |
| Cambiar rol → usuario | 1 |
| Cambiar rol propio → guard: rechazado | 1 |
| Cambiar rol — sin permiso admin → error | 1 |
| Banear usuario | 1 |
| Desbanear usuario | 1 |
| Banear propio → guard: rechazado | 1 |
| Banear — sin permiso admin → error | 1 |

---

## Tier 2 — Componentes UI y Utilidades

### `utils.test.ts` — 4 tests

Tests de la función `cn()` (clsx + tailwind-merge):

| Caso | Test |
|------|------|
| Combina clases simples | 1 |
| Resuelve conflictos Tailwind (e.g., `p-2` + `p-4` → `p-4`) | 1 |
| Clases condicionales con `false` y `undefined` | 1 |
| Combina arrays y objetos | 1 |

---

### `Button.test.tsx` — 7 tests

| Caso | Test |
|------|------|
| Renderiza con texto | 1 |
| Variante `primary` aplica clases correctas | 1 |
| Variante `danger` aplica clases correctas | 1 |
| Estado `loading` muestra spinner y desactiva el botón | 1 |
| Prop `disabled` desactiva el botón | 1 |
| Dispara `onClick` al hacer clic | 1 |
| No dispara `onClick` cuando está disabled | 1 |

---

### `Input.test.tsx` — 7 tests

| Caso | Test |
|------|------|
| Renderiza con label | 1 |
| Muestra `error` con `aria-invalid` y `role="alert"` | 1 |
| Muestra `helper` cuando no hay error | 1 |
| Llama a `onChange` con el valor correcto | 1 |
| Tipo `password` oculta el texto | 1 |
| Aplica clases de error en el borde | 1 |
| Forwards ref correctamente | 1 |

---

## Tier 3 — Client Components con RTL

Los Client Components requieren mocks adicionales por su dependencia en hooks de React y Server Actions.

### Estrategia: `useTransition` síncrono

`useTransition` se mockea para ejecutar el callback de forma síncrona, eliminando la necesidad de `act()` asíncrono en la mayoría de los tests:

```ts
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (fn: () => void) => fn()],
}));
```

### Estrategia: `useActionState` controlado por test

`useActionState` se mockea para que los tests puedan inyectar el estado inicial y observar qué acción se pasó:

```ts
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: (action: unknown, initialState: unknown) => [initialState, action, false],
}));
```

---

### `BotonesAccionLibro.test.tsx` — 8 tests

| Caso | Test |
|------|------|
| Renderiza botones "Pedir préstamo" y "Añadir al carrito" con stock disponible | 1 |
| En modo `compact` los botones tienen texto abreviado | 1 |
| Muestra badge "Agotado" cuando `stock = 0` | 1 |
| No renderiza botones cuando `stock = 0` | 1 |
| Llama a `añadirAlCarrito` con tipo `'prestamo'` al clic | 1 |
| Llama a `añadirAlCarrito` con tipo `'compra'` al clic | 1 |
| Botón muestra estado de carga durante la transición | 1 |
| Muestra mensaje de error si la Server Action falla | 1 |

---

### `EliminarItemBtn.test.tsx` — 4 tests

| Caso | Test |
|------|------|
| Renderiza botón de eliminar | 1 |
| Llama a `eliminarDelCarrito` con el id correcto al clic | 1 |
| Muestra estado de carga durante la transición | 1 |
| Muestra error si la acción falla | 1 |

---

### `ConfirmarSeccionBtn.test.tsx` — 5 tests

| Caso | Test |
|------|------|
| Renderiza botón de confirmación con el texto correcto según tipo | 1 |
| Llama a `confirmarPrestamos` cuando `tipo = 'prestamo'` | 1 |
| Llama a `confirmarCompras` cuando `tipo = 'compra'` | 1 |
| Muestra estado de carga durante la transición | 1 |
| Muestra mensaje de error si la acción falla | 1 |

---

### `LoginForm.test.tsx` — 6 tests

| Caso | Test |
|------|------|
| Renderiza campos de email y password | 1 |
| Muestra error de estado cuando `useActionState` retorna un error | 1 |
| Botón de submit muestra "Iniciando sesión..." durante `isPending` | 1 |
| Botón de submit está desactivado durante `isPending` | 1 |
| Link a `/registro` visible | 1 |
| Campos accesibles (labels, aria-invalid) | 1 |

---

### `RegisterForm.test.tsx` — 6 tests

| Caso | Test |
|------|------|
| Renderiza los cuatro campos del formulario | 1 |
| Muestra error de estado cuando `useActionState` retorna un error | 1 |
| Botón de submit muestra "Registrando..." durante `isPending` | 1 |
| Botón de submit está desactivado durante `isPending` | 1 |
| Link a `/login` visible | 1 |
| Helper text de requisitos de password visible | 1 |

---

## Configuración de Jest

### `jest.config.ts`
- `testEnvironment: 'jsdom'` para componentes React
- `transform` con `ts-jest` + `babel-jest` para JSX/TSX
- `moduleNameMapper` para alias `@/*` → `src/*` y assets estáticos
- `setupFilesAfterFramework: ['<rootDir>/jest.setup.ts']`

### `jest.setup.ts`
- Importa `@testing-library/jest-dom` para matchers extendidos (`toBeInTheDocument`, `toHaveClass`, etc.)
- Mocka el módulo `next/navigation` (`useRouter`, `usePathname`, `redirect`)
- Mocka `next/cache` (`revalidatePath`, `revalidateTag`)
- Mocka el cliente Supabase con el proxy queryChain genérico
- Mocka `next/headers` (`cookies`)

---

## Decisiones técnicas

| Decisión | Motivo |
|----------|--------|
| Proxy queryChain en lugar de mock estático | Las Server Actions encadenan múltiples métodos en orden variable; un proxy intercepta cualquier combinación sin necesidad de predefinir la cadena exacta |
| `useTransition` síncrono | Elimina la complejidad de `act()` y `waitFor()` en tests donde el comportamiento async no es lo que se está verificando |
| `useActionState` controlado | Permite inyectar estados de error/éxito directamente en el test sin ejecutar la Server Action real |
| Tests por tiers (Actions → UI → Client) | Orden de dependencias: las actions son la base; los componentes las consumen. Esto permite detectar regresiones en la capa correcta |
| Sin tests de integración end-to-end en este hito | El volumen de mocking necesario para Supabase + Next.js hace que los E2E sean más fiables con herramientas como Playwright contra un entorno real — queda para fase de producción |

---

## Comandos de ejecución

```bash
# Todos los tests
npm test

# Con cobertura
npm test -- --coverage

# Suite específica
npm test -- carrito

# Modo watch (desarrollo)
npm test -- --watch
```

---

## Pendientes

- Tests de integración E2E con Playwright (requiere entorno staging con BD seed)
- Cobertura de `src/app/(public)/catalogo/page.tsx` y páginas Server Component (requieren render server-side en test)
- Tests de accesibilidad automatizados con `jest-axe`
