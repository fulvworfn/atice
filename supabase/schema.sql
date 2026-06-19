-- ════════════════════════════════════════════════════════════
-- ESQUEMA SUPABASE — Catálogo de productos artesanales
-- ════════════════════════════════════════════════════════════
-- Cómo usar este archivo:
--   1. Crea un proyecto en https://supabase.com
--   2. Ve a "SQL Editor" → "New query"
--   3. Pega TODO este archivo y ejecútalo (Run)
--   4. Repite lo mismo en el archivo storage-policies.sql
--
-- Esto reemplaza completamente a JSONBin. Ya no existen API keys
-- maestras en el frontend: la seguridad la imponen las políticas
-- RLS (Row Level Security) de abajo, evaluadas por PostgreSQL en
-- cada request, sin importar qué tan manipulado esté el cliente.
-- ════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 1. TABLA: products
-- ───────────────────────────────────────────
create table if not exists public.products (
  id           bigint generated always as identity primary key,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null check (char_length(trim(name)) > 0),
  price        numeric(12, 2),
  description  text,
  contact      text,
  contact_type text check (contact_type in ('email', 'phone')),
  media        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.products is 'Productos del catálogo. owner_id identifica al admin dueño de la tienda.';

-- Índices útiles para listar/ordenar/buscar
create index if not exists products_owner_id_idx   on public.products (owner_id);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_name_trgm_idx  on public.products using gin (name gin_trgm_ops);

-- Extensión necesaria para búsqueda por texto (ilike rápido)
create extension if not exists pg_trgm;

-- Trigger para mantener updated_at al día
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────
-- 2. TABLA: reviews
-- ───────────────────────────────────────────
-- Las reseñas son públicas (cualquiera puede dejar una, como en
-- el sitio original), pero solo el admin (owner del producto)
-- puede eliminarlas. No requieren login para crearse.
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  author      text not null check (char_length(trim(author)) > 0),
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text not null check (char_length(trim(comment)) > 0),
  created_at  timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

-- ───────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ───────────────────────────────────────────
alter table public.products enable row level security;
alter table public.reviews  enable row level security;

-- PRODUCTS ────────────────────────────────────
-- Lectura: cualquier visitante (anónimo incluido) puede ver productos.
drop policy if exists "Productos visibles para todos" on public.products;
create policy "Productos visibles para todos"
  on public.products
  for select
  using (true);

-- Inserción: solo un usuario autenticado, y solo puede crear
-- productos asignándose a sí mismo como owner_id.
drop policy if exists "Solo admin autenticado crea productos" on public.products;
create policy "Solo admin autenticado crea productos"
  on public.products
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Actualización: solo el owner puede editar SUS productos.
drop policy if exists "Solo el owner edita sus productos" on public.products;
create policy "Solo el owner edita sus productos"
  on public.products
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Borrado: solo el owner puede borrar SUS productos.
drop policy if exists "Solo el owner borra sus productos" on public.products;
create policy "Solo el owner borra sus productos"
  on public.products
  for delete
  to authenticated
  using (auth.uid() = owner_id);

-- REVIEWS ─────────────────────────────────────
-- Lectura: públicas para todos.
drop policy if exists "Reseñas visibles para todos" on public.reviews;
create policy "Reseñas visibles para todos"
  on public.reviews
  for select
  using (true);

-- Inserción: CUALQUIERA puede dejar una reseña (igual que el sitio
-- original, que no pedía login para comentar). El check de rating
-- y los NOT NULL/CHECK ya validan la forma del dato.
drop policy if exists "Cualquiera puede dejar una reseña" on public.reviews;
create policy "Cualquiera puede dejar una reseña"
  on public.reviews
  for insert
  with check (true);

-- Borrado: solo el admin dueño del producto al que pertenece la
-- reseña puede borrarla (se valida vía subquery a products).
drop policy if exists "Solo el owner del producto borra reseñas" on public.reviews;
create policy "Solo el owner del producto borra reseñas"
  on public.reviews
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = reviews.product_id
        and p.owner_id = auth.uid()
    )
  );

-- No se permite editar reseñas (ni desde el frontend original se
-- ofrecía esa función) — no se crea policy de UPDATE, por lo que
-- queda bloqueado por defecto al tener RLS activado.

-- ───────────────────────────────────────────
-- 4. VISTA: products_with_rating (opcional, conveniente)
-- ───────────────────────────────────────────
-- Devuelve cada producto junto con su promedio de rating y cantidad
-- de reseñas ya calculados, para no tener que hacerlo en el cliente.
create or replace view public.products_with_reviews as
select
  p.*,
  coalesce(
    (select jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'author', r.author,
        'rating', r.rating,
        'comment', r.comment,
        'date', r.created_at
      ) order by r.id desc
    )
    from public.reviews r
    where r.product_id = p.id),
    '[]'::jsonb
  ) as reviews
from public.products p;

-- Nota: las vistas heredan RLS de las tablas base, así que esta
-- vista respeta automáticamente las policies de arriba.
