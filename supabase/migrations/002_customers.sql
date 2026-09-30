-- 002_customers.sql — LUXE customers
--
-- A customer row is created (or refreshed) server-side on every checkout,
-- keyed by the digits-only phone number so `+880 1…` and `01…` refer to the
-- same buyer. Customers are *internal*: no public route may read this table.

create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  email       text,
  phone       text        not null unique,  -- digits-only, see lib/validation.ts phoneKey()
  address     text,
  city        text,
  postal_code text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index customers_created_at_idx on public.customers (created_at desc);

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();
