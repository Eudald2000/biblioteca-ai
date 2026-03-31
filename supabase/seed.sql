-- ============================================================
-- SEED — biblioteca-ai
-- Las contraseñas se generan aleatoriamente en tiempo de
-- ejecución con gen_random_bytes(). Nadie conoce el texto
-- plano. Para acceder, usar "olvidé mi contraseña" o
-- asignar una nueva desde el dashboard de Supabase Auth.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. USUARIOS EN AUTH
-- Las contraseñas son hashes bcrypt de 32 bytes aleatorios.
-- ============================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'admin1@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ana Martínez"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'admin2@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Carlos López"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'usuario1@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"María García"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated', 'authenticated',
    'usuario2@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pedro Sánchez"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated', 'authenticated',
    'usuario3@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Laura Fernández"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated', 'authenticated',
    'usuario4@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Miguel Rodríguez"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '77777777-7777-7777-7777-777777777777',
    'authenticated', 'authenticated',
    'usuario5@biblioteca.com',
    crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Isabel Gómez"}',
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- El trigger `al_crear_usuario` habrá creado las filas en perfiles automáticamente.
-- Ascendemos a admin los dos primeros usuarios.
UPDATE perfiles SET rol = 'admin'
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- ============================================================
-- 2. EDITORIALES
-- ============================================================
INSERT INTO editoriales (id, nombre, pais, sitio_web) VALUES
  ('aaaaaaaa-0001-0000-0000-000000000000', 'Planeta',                    'España',  'https://www.planeta.es'),
  ('aaaaaaaa-0002-0000-0000-000000000000', 'Alfaguara',                  'España',  'https://www.alfaguara.com'),
  ('aaaaaaaa-0003-0000-0000-000000000000', 'Anagrama',                   'España',  'https://www.anagrama-ed.es'),
  ('aaaaaaaa-0004-0000-0000-000000000000', 'Penguin Random House España', 'España',  'https://www.penguinlibros.com'),
  ('aaaaaaaa-0005-0000-0000-000000000000', 'Tusquets',                   'España',  'https://www.tusquetseditores.com'),
  ('aaaaaaaa-0006-0000-0000-000000000000', 'Destino',                    'España',  'https://www.edicionesdestino.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CATEGORÍAS
-- ============================================================
INSERT INTO categorias (id, nombre, descripcion) VALUES
  ('bbbbbbbb-0001-0000-0000-000000000000', 'Novela',           'Ficción narrativa larga'),
  ('bbbbbbbb-0002-0000-0000-000000000000', 'Ciencia Ficción',  'Narrativa especulativa y futurista'),
  ('bbbbbbbb-0003-0000-0000-000000000000', 'Historia',         'Obras históricas y de no ficción histórica'),
  ('bbbbbbbb-0004-0000-0000-000000000000', 'Ensayo',           'Reflexión y análisis no ficcional'),
  ('bbbbbbbb-0005-0000-0000-000000000000', 'Poesía',           'Obra lírica y versificada'),
  ('bbbbbbbb-0006-0000-0000-000000000000', 'Infantil y Juvenil','Literatura para lectores jóvenes'),
  ('bbbbbbbb-0007-0000-0000-000000000000', 'Thriller',         'Suspenso e intriga')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. LIBROS
-- ============================================================
INSERT INTO libros (id, titulo, autor, isbn, editorial_id, descripcion, stock, precio, portada_url) VALUES
  (
    'cccccccc-0001-0000-0000-000000000000',
    'Don Quijote de la Mancha',
    'Miguel de Cervantes',
    '9788408163435',
    'aaaaaaaa-0001-0000-0000-000000000000',
    'La obra cumbre de la literatura española, considerada la primera novela moderna.',
    8, 18.90, null
  ),
  (
    'cccccccc-0002-0000-0000-000000000000',
    'Cien años de soledad',
    'Gabriel García Márquez',
    '9788497592208',
    'aaaaaaaa-0002-0000-0000-000000000000',
    'La saga de la familia Buendía en el mítico Macondo, obra cumbre del realismo mágico.',
    5, 21.50, null
  ),
  (
    'cccccccc-0003-0000-0000-000000000000',
    '1984',
    'George Orwell',
    '9788499890944',
    'aaaaaaaa-0006-0000-0000-000000000000',
    'Una distopía sobre el totalitarismo y la vigilancia en un futuro opresivo.',
    10, 14.95, null
  ),
  (
    'cccccccc-0004-0000-0000-000000000000',
    'La sombra del viento',
    'Carlos Ruiz Zafón',
    '9788408074359',
    'aaaaaaaa-0001-0000-0000-000000000000',
    'Un joven descubre un libro misterioso en el Cementerio de los Libros Olvidados de Barcelona.',
    6, 19.95, null
  ),
  (
    'cccccccc-0005-0000-0000-000000000000',
    'Dune',
    'Frank Herbert',
    '9788466338981',
    'aaaaaaaa-0004-0000-0000-000000000000',
    'La épica historia de Paul Atreides en el desértico planeta Arrakis.',
    4, 22.00, null
  ),
  (
    'cccccccc-0006-0000-0000-000000000000',
    'El nombre del viento',
    'Patrick Rothfuss',
    '9788401352836',
    'aaaaaaaa-0004-0000-0000-000000000000',
    'Las memorias del legendario mago Kvothe narradas en primera persona.',
    7, 23.90, null
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. LIBROS ↔ CATEGORÍAS
-- ============================================================
INSERT INTO libros_categorias (libro_id, categoria_id) VALUES
  ('cccccccc-0001-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'), -- Don Quijote → Novela
  ('cccccccc-0002-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'), -- Cien años → Novela
  ('cccccccc-0003-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'), -- 1984 → Novela
  ('cccccccc-0003-0000-0000-000000000000', 'bbbbbbbb-0002-0000-0000-000000000000'), -- 1984 → Ciencia Ficción
  ('cccccccc-0004-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000'), -- Sombra del viento → Novela
  ('cccccccc-0004-0000-0000-000000000000', 'bbbbbbbb-0007-0000-0000-000000000000'), -- Sombra del viento → Thriller
  ('cccccccc-0005-0000-0000-000000000000', 'bbbbbbbb-0002-0000-0000-000000000000'), -- Dune → Ciencia Ficción
  ('cccccccc-0006-0000-0000-000000000000', 'bbbbbbbb-0001-0000-0000-000000000000')  -- Nombre del viento → Novela
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. PRÉSTAMOS
-- ============================================================
INSERT INTO prestamos (id, usuario_id, libro_id, estado, fecha_prestamo, fecha_vencimiento, fecha_devolucion) VALUES
  (
    'dddddddd-0001-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-0001-0000-0000-000000000000',
    'devuelto', '2026-01-10', '2026-01-24', '2026-01-22'
  ),
  (
    'dddddddd-0002-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'cccccccc-0002-0000-0000-000000000000',
    'activo', '2026-03-15', '2026-03-29', null
  ),
  (
    'dddddddd-0003-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'cccccccc-0003-0000-0000-000000000000',
    'vencido', '2026-02-01', '2026-02-15', null
  ),
  (
    'dddddddd-0004-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'cccccccc-0004-0000-0000-000000000000',
    'activo', '2026-03-20', '2026-04-03', null
  ),
  (
    'dddddddd-0005-0000-0000-000000000000',
    '77777777-7777-7777-7777-777777777777',
    'cccccccc-0005-0000-0000-000000000000',
    'devuelto', '2026-02-10', '2026-02-24', '2026-02-20'
  ),
  (
    'dddddddd-0006-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-0006-0000-0000-000000000000',
    'activo', '2026-03-25', '2026-04-08', null
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. COMPRAS
-- ============================================================
INSERT INTO compras (id, usuario_id, libro_id, precio_compra) VALUES
  ('eeeeeeee-0001-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'cccccccc-0003-0000-0000-000000000000', 14.95),
  ('eeeeeeee-0002-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'cccccccc-0001-0000-0000-000000000000', 18.90),
  ('eeeeeeee-0003-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'cccccccc-0005-0000-0000-000000000000', 22.00),
  ('eeeeeeee-0004-0000-0000-000000000000', '66666666-6666-6666-6666-666666666666', 'cccccccc-0002-0000-0000-000000000000', 21.50),
  ('eeeeeeee-0005-0000-0000-000000000000', '77777777-7777-7777-7777-777777777777', 'cccccccc-0004-0000-0000-000000000000', 19.95),
  ('eeeeeeee-0006-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'cccccccc-0006-0000-0000-000000000000', 23.90)
ON CONFLICT (id) DO NOTHING;
