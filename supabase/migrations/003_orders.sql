-- 003_orders.sql — LUXE orders
--
-- One row per checkout. Customers denormalise the delivery details onto the
-- order itself (snapshot: later profile edits never rewrite order history),
-- and `customer_id` links the order into the directory for aggregates.
--
-- order_number is the human reference printed on the receipt (`LUXE-…`) —
-- unique, and indexed for the tracking lookup.

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text        not null unique,
  customer_id         uuid        references public.customers (id) on delete set null,
  customer_name       text        not null,
  customer_email      text,
  customer_phone      text        not null,
  shipping_address    text        not null,
  shipping_city       text        not null,
  shipping_postal_code text       not null,
  subtotal            numeric(10, 2) not null default 0,
  shipping_cost       numeric(10, 2) not null default 0,
  total_amount        numeric(10, 2) not null default 0,
  payment_method      text        not null default 'cod'
                    check (payment_method in ('cod', 'bkash', 'nagad')),
  payment_status      text        not null default 'unpaid'
                    check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  order_status        text        not null default 'pending'
                    check (order_status in (
                      'pending', 'confirmed', 'processing', 'shipped',
                      'delivered', 'cancelled', 'returned'
                    )),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_order_number_idx on public.orders (order_number);
create index orders_customer_id_idx  on public.orders (customer_id);
create index orders_status_idx       on public.orders (order_status);
create index orders_payment_idx      on public.orders (payment_status);
create index orders_created_at_idx   on public.orders (created_at desc);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();
