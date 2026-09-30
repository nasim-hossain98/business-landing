-- 004_order_items.sql — LUXE order lines + atomic stock helpers
--
-- Every line snapshots the product's name/image/price at purchase time, so
-- renaming a product, changing its price or deleting it afterwards can never
-- rewrite a customer's receipt. `product_id` is deliberately `on delete set
-- null`: history survives catalogue deletion.
--
-- The two `SECURITY DEFINER` helpers below are the only way the app mutates
-- `stock_quantity` concurrently — a single conditional UPDATE per function
-- call, executed as the service role regardless of the caller's JWT.

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid        not null references public.orders (id) on delete cascade,
  product_id      uuid        references public.products (id) on delete set null,
  product_name    text        not null,
  product_slug    text,
  product_image   text,
  selected_option text,
  product_price   numeric(10, 2) not null,
  quantity        integer     not null check (quantity > 0),
  subtotal        numeric(10, 2) not null,
  created_at      timestamptz not null default now()
);

create index order_items_order_id_idx   on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- Atomically reserve stock. Returns TRUE when the product existed AND had
-- enough units; the UPDATE is a single statement, so concurrent checkouts
-- can never oversell the same units.
create or replace function public.decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated uuid;
begin
  if p_quantity is null or p_quantity <= 0 then
    return false;
  end if;

  update public.products
     set stock_quantity = stock_quantity - p_quantity
   where id = p_product_id
     and stock_quantity >= p_quantity
  returning id into v_updated;

  return v_updated is not null;
end;
$$;

-- Complement used when an order insert is rolled back after reserving units.
create or replace function public.increment_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity is null or p_quantity <= 0 then
    return false;
  end if;

  update public.products
     set stock_quantity = stock_quantity + p_quantity
   where id = p_product_id;

  return found;
end;
$$;
