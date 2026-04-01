# Hito 2 — Esquema de base de datos en Supabase

**Estado:** Completado
**Rama:** `feature/hito-2-esquema-bbdd` → mergeada a `master`
**Commit:** `0af86fe`

---

## Objetivo

Diseñar e implementar el esquema completo de la base de datos en Supabase: tablas, relaciones, enums, políticas RLS, trigger de perfiles y datos de prueba (seed).

---

## Diseño del esquema

### Tablas

#### `usuarios`
Extiende `auth.users` de Supabase. Cada usuario autenticado tiene exactamente un perfil.
```sql
id uuid PRIMARY KEY REFERENCES auth.users(id)
rol         rol_usuario DEFAULT 'usuario'
nombre_completo text
avatar_url  text
creado_en   timestamptz DEFAULT now()
actualizado_en timestamptz DEFAULT now()
```

#### `editoriales`
```sql
id uuid DEFAULT gen_random_uuid() PRIMARY KEY
nombre      text NOT NULL
pais        text
sitio_web   text
logo_url    text
creado_en / actualizado_en timestamptz
```

#### `libros`
Tabla principal del catálogo. Soporta soft-delete con `eliminado_en`.
```sql
id uuid DEFAULT gen_random_uuid() PRIMARY KEY
titulo      text NOT NULL
autor       text NOT NULL
isbn        text UNIQUE CHECK (isbn ~ '^([0-9]{9}[0-9X]|[0-9]{13})$')
editorial_id uuid REFERENCES editoriales(id)
portada_url text
descripcion text
stock       integer DEFAULT 0 CHECK (stock >= 0)
precio      numeric DEFAULT 0 CHECK (precio >= 0)
creado_en / actualizado_en timestamptz
eliminado_en timestamptz  ← soft delete
```

#### `categorias` y `libros_categorias`
Relación muchos-a-muchos entre libros y categorías mediante tabla pivote.

#### `prestamos`
```sql
id uuid PRIMARY KEY
usuario_id  uuid REFERENCES usuarios(id)
libro_id    uuid REFERENCES libros(id)
estado      estado_prestamo DEFAULT 'activo'
fecha_prestamo    date DEFAULT CURRENT_DATE
fecha_vencimiento date NOT NULL
fecha_devolucion  date
creado_en timestamptz
```

#### `compras`
```sql
id uuid PRIMARY KEY
usuario_id    uuid REFERENCES usuarios(id)
libro_id      uuid REFERENCES libros(id)
precio_compra numeric CHECK (precio_compra >= 0)
creado_en timestamptz
```

### Enums
```sql
CREATE TYPE rol_usuario AS ENUM ('admin', 'usuario');
CREATE TYPE estado_prestamo AS ENUM ('activo', 'devuelto', 'vencido');
```

---

## Row Level Security (RLS)

RLS habilitado en **todas** las tablas. Nomenclatura de políticas: `<tabla>_<rol>_<operación>`.

### Políticas principales

| Tabla | Política | Acceso |
|---|---|---|
| `libros` | `libros_lectura_publica` | SELECT para `anon` y `authenticated` (libros no eliminados) |
| `libros` | `libros_admin_insertar/actualizar/eliminar` | Solo admin |
| `usuarios` | `usuarios_leer_propio` | SELECT solo el propio perfil |
| `usuarios` | `usuarios_admin_leer_todos` | SELECT todos (solo admin) |
| `usuarios` | `usuarios_actualizar_propio` | UPDATE solo el propio perfil |

### Verificación de rol admin en RLS
Las políticas de admin comprueban el rol consultando la propia tabla `usuarios`:
```sql
EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
```

---

## Trigger automático de perfiles

```sql
CREATE FUNCTION crear_perfil_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre_completo)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre_completo');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER al_crear_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_nuevo_usuario();
```

**Por qué SECURITY DEFINER:** el trigger necesita insertar en `usuarios` ignorando RLS, ya que en el momento del registro no hay sesión activa. Esta función se ejecuta con los permisos del propietario (postgres), no del usuario invocante.

---

## Clientes Supabase

### `src/lib/supabase/server.ts`
Cliente para Server Components, Route Handlers y Server Actions. Gestiona la sesión mediante cookies del servidor usando `@supabase/ssr`.
- **Nunca usar `getSession()`** en el servidor — solo `getUser()` que valida el JWT contra Supabase.

### `src/lib/supabase/client.ts`
Cliente browser para Client Components. Usa `createBrowserClient` de `@supabase/ssr`. Las cookies se gestionan automáticamente por el navegador.

---

## Tipos TypeScript generados

`src/lib/database.types.ts` generado con:
```bash
npx supabase gen types typescript --project-id cysvnatgdsswmchqfohh > src/lib/database.types.ts
```

Expone los tipos:
- `Database` — tipo raíz de toda la BD
- `Tables<'libros'>` — tipo Row de cada tabla
- `TablesInsert<'libros'>` — tipo Insert
- `TablesUpdate<'libros'>` — tipo Update
- `Enums<'rol_usuario'>` — tipos de enums

---

## Seed data

Datos de prueba cargados directamente via MCP de Supabase:

| Tabla | Registros | Detalle |
|---|---|---|
| `editoriales` | 6 | Anagrama, Debolsillo, Minotauro, Destino, Plaza & Janés, Secker & Warburg |
| `libros` | 6 | Clásicos: 1984, Cien años de soledad, Don Quijote, Dune, El nombre del viento, La sombra del viento |
| `categorias` | 7 | Ficción, Ciencia ficción, Fantasía, Clásicos, Literatura española, Literatura latinoamericana, Aventura |
| `usuarios` | 7 | 1 admin + 6 usuarios de prueba |
| `prestamos` | 6 | En distintos estados (activo, devuelto, vencido) |
| `compras` | 6 | Distribuidas entre los usuarios |

### Portadas de libros
El campo `portada_url` se decidió poblar con URLs de la **Open Library Covers API**:
```
https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg
```

**Decisión clave:** se usan ISBNs internacionales (ediciones inglesas) en lugar de los ISBNs españoles originales, porque Open Library tiene mayor cobertura de ediciones anglófonas. Los ISBNs de la BD se actualizaron para coincidir con los de las portadas, asegurando consistencia.

**Por qué URL completa en BD y no construirla dinámicamente:** mayor flexibilidad — permite mezclar fuentes (Open Library, Google Books, Supabase Storage) y sobrescribir portadas individuales sin cambiar ISBNs.

---

## Migraciones

7 migraciones aplicadas vía MCP de Supabase (`apply_migration`):

| # | Nombre | Contenido |
|---|---|---|
| 01 | `usuarios` | Enum `rol_usuario`, tabla `usuarios`, trigger `al_crear_usuario` |
| 02 | `editoriales` | Tabla `editoriales`, trigger `actualizado_en` |
| 03 | `libros` | Tabla `libros` con constraints, trigger `actualizado_en`, RLS |
| 04 | `prestamos_compras` | Enum `estado_prestamo`, tablas `prestamos` y `compras`, RLS |
| 05 | `categorias` | Tablas `categorias` y `libros_categorias`, RLS |
| 06 | `libros_editorial_id_not_null` | Constraint NOT NULL en `editorial_id` |
| 07 | `libros_isbn_formato` | Check constraint formato ISBN (ISBN-10/ISBN-13) |

**Regla seguida:** toda operación DDL se realiza exclusivamente vía MCP de Supabase — nunca SQL manual directo.

---

## Tests

### `src/lib/__tests__/database.types.test.ts`
Verifica que los tipos generados exponen correctamente las interfaces esperadas (Row, Insert, Update) para cada tabla.

### `src/lib/supabase/__tests__/client.test.ts`
- Verifica que `createClient()` retorna un objeto con métodos `from` y `auth`
- Comprueba que usa las variables de entorno correctas

### `src/lib/supabase/__tests__/server.test.ts`
- Verifica que `createClient()` es async y retorna un cliente con `from` y `auth`
- Mockea `cookies()` de Next.js para aislar del entorno de servidor

---

## Notas técnicas

- **Soft delete en libros:** se usa `eliminado_en timestamptz` en lugar de borrar registros. Las políticas RLS filtran `WHERE eliminado_en IS NULL` automáticamente en SELECT.
- **IDs con UUID v4:** `gen_random_uuid()` en lugar de secuencias numéricas — mejor para sistemas distribuidos y evita enumeración de IDs.
- **Timestamps automáticos:** trigger `actualizar_timestamp()` actualiza `actualizado_en` en cada UPDATE, evitando tener que gestionarlo en la aplicación.
