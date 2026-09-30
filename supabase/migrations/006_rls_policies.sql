-- 006_rls_policies.sql — Row Level Security
--
-- THE CLOSED-BY-DEFAULT RULEBOOK
-- ------------------------------
-- Every catalogue, order and customer read/write in this app goes through the
-- Next.js server with the SERVICE-ROLE key (`lib/supabase/admin.ts`), where
-- `requireAdmin()` / phone-verified tracking gate access first. PostgreSQL
-- therefore denies *all* anonymous and authenticated-direct access:
--
--   * no public product catalogue reads          — the server projects them
--   * no public order reads or writes            — same, after verification
--   * no customer reads or writes                — admin sessions only
--   * no direct `admin_users` reads               — service role only
--   * no two customers can ever see each other    — enforced by construction
--
-- Enabling RLS without any broad policies is what makes this hold: even if a
-- key or a route is misconfigured, the database refuses to serve data.

alter table public.products      enable row level security;
alter table public.customers     enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.admin_users   enable row level security;

-- Intentionally NO permissive policies on any table above: the anon and
-- authenticated roles get zero rows. (Service role bypasses RLS by design.)

-- Storage: product images --------------------------------------------------
-- Bucket `product-images` holds admin-uploaded catalogue photos. They are
-- PUBLIC to read (product images must render on the storefront) but only
-- writable by signed-in users — anonymous uploads are impossible.
-- The bucket itself is created by the dashboard owner once (Storage →
-- "New bucket" → name `product-images`, Public ON), or with the Storage API.

-- Allow anyone to view product images.
create policy "Public read of product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow only signed-in accounts (i.e. admins) to upload images.
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

-- Allow only signed-in accounts to replace images.
create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- Allow only signed-in accounts to delete images.
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
