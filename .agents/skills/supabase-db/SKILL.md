---
name: supabase-db
description: Expert guidance for Supabase in this project: PostgreSQL schema design, Row Level Security policies, Auth integration, typed queries, and client usage. Use this skill whenever working with the database schema, writing SQL migrations, defining RLS policies, using the Supabase client (server or client-side), handling authentication, managing user roles, or generating TypeScript types. Activate even if the user just says "add a table", "query the DB", "protect this route", or "check user permissions" — anything touching data persistence or auth in this project.
---

# Supabase — Biblioteca Virtual

This project uses Supabase for PostgreSQL + Auth + Storage. Apply these guidelines for all database and auth work.

## Client Usage: Server vs Client

**Always prefer the server client** in Server Components, Route Handlers, and Server Actions.

```ts
// src/lib/supabase/server.ts — use in Server Components and API routes
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}

// src/lib/supabase/client.ts — use only in Client Components with 'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Use the client-side client only when you need reactivity (real-time subscriptions, client-only interactions). Everything else: server client.

## TypeScript Types

Types are generated from Supabase and live in `src/lib/database.types.ts`. Regenerate with:

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
```

Use them in queries:
```ts
import type { Database } from '@/lib/database.types'
const supabase = createClient<Database>()
```

Never write manual types that duplicate what Supabase can generate.

## Database Schema Conventions

- **Primary keys:** `id uuid DEFAULT gen_random_uuid()`
- **Timestamps:** always add `created_at timestamptz DEFAULT now()` and `updated_at timestamptz DEFAULT now()`
- **Soft deletes:** use `deleted_at timestamptz` instead of actually deleting rows
- **Foreign keys:** name them `<table>_id` (e.g., `user_id`, `book_id`)
- **Indexes:** add indexes on foreign keys and columns used in WHERE clauses

### Core Tables for This Project

```sql
-- User profiles (extends Supabase auth.users)
profiles (id, role, full_name, avatar_url, created_at, updated_at)

-- Books catalog
books (id, title, author, isbn, cover_url, description, stock, price, created_at, updated_at)

-- Loans
loans (id, user_id, book_id, status, loan_date, due_date, return_date, created_at)
-- status: 'active' | 'returned' | 'overdue'

-- Purchases
purchases (id, user_id, book_id, price, created_at)
```

## Row Level Security (RLS)

Every table **must** have RLS enabled. Define policies explicitly for each role.

```sql
-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can browse catalog)
CREATE POLICY "books_public_read" ON books
  FOR SELECT TO anon, authenticated USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "books_admin_write" ON books
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

RLS policy naming convention: `<table>_<role>_<operation>` (e.g., `loans_user_read`, `books_admin_write`).

## Roles and Auth

Roles are stored in `profiles.role` (values: `'admin'` | `'user'`).

```ts
// Check role in Server Component
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user?.id)
  .single()

if (profile?.role !== 'admin') redirect('/unauthorized')
```

**Never trust client-side role checks for access control** — always validate on the server or via RLS.

## Before Any Schema Change

Before proposing migrations or schema changes, inspect the current state via MCP:
1. Use `list_tables` to see existing tables
2. Use `execute_sql` to check existing policies: `SELECT * FROM pg_policies WHERE tablename = '<table>'`
3. Use `list_migrations` to see applied migrations

Always create migrations as SQL files in `supabase/migrations/` with timestamp prefix: `20240101000000_description.sql`.

## Query Patterns

```ts
// Typed query with error handling
const { data, error } = await supabase
  .from('books')
  .select('id, title, author, stock')
  .gt('stock', 0)
  .order('title')

if (error) throw new Error(error.message)

// Join example: loans with book and user info
const { data: loans } = await supabase
  .from('loans')
  .select(`
    id, status, due_date,
    books (title, author),
    profiles (full_name)
  `)
  .eq('status', 'active')
```

## What to Avoid

- Never use `supabase.auth.getSession()` server-side — use `getUser()` which validates the JWT
- Never expose the `service_role` key client-side
- Never skip RLS on a table "temporarily" — define a permissive policy instead
- Don't write raw SQL in application code when the query builder suffices
