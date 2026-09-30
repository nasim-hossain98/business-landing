-- 001_products.sql — LUXE catalogue
-- Run in the Supabase SQL editor (Database → Migrations or the SQL runner).
--
-- Everything here is ordinary Postgres. Row Level Security itself lands in
-- 006_rls_policies.sql; this file only creates tables, indexes and triggers.

create extension if not exists "pgcrypto";

-- Shared updated_at helper -------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- products -------------------------------------------------------------------
-- `status` drives storefront visibility: only `active` rows are ever listed
-- publicly. Extra columns beyond the base spec (`badge`, `features`,
-- `options`, `rating`, `review_count`) exist so the rich landing-page product
-- cards can be served straight from the database.
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  slug            text        not null unique,
  description     text        not null default '',
  price           numeric(10, 2) not null check (price > 0),
  compare_at_price numeric(10, 2),
  category        text        not null default 'others'
                check (category in ('clothes', 'wallets', 'bags', 'others')),
  image_url       text        not null,
  gallery_images  text[]      not null default '{}',
  stock_quantity  integer     not null default 0 check (stock_quantity >= 0),
  sku             text        unique,
  status          text        not null default 'active'
                check (status in ('active', 'draft', 'archived')),
  badge           text,
  features        text[]      not null default '{}',
  options         jsonb       not null default '[]'::jsonb,
  rating          numeric(2, 1) not null default 5.0,
  review_count    integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index products_status_idx     on public.products (status);
create index products_category_idx   on public.products (category);
create index products_created_at_idx on public.products (created_at desc);

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();
