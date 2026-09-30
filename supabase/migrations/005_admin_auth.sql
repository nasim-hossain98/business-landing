-- 005_admin_auth.sql — admin allow-list
--
-- THERE IS NO PUBLIC ADMIN REGISTRATION. A Supabase Auth account becomes an
-- admin only when the business owner does ONE of:
--
--   A) sets the account's `app_metadata` to `{ "role": "admin" }`:
--
--        update auth.users
--           set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--         where email = 'owner@luxe.com';
--
--      (fast path — read straight from the JWT, no extra query)
--
--   B) inserts the account's id into the allow-list below:
--
--        insert into public.admin_users (user_id, note)
--        values ('<the-user-uuid>', 'Store owner');
--
--      Find the uuid in the Supabase dashboard under Authentication → Users.
--
-- `lib/auth/admin.ts` checks A first, then B. Everybody else gets bounced to
-- `/admin/login?error=forbidden`.

create table public.admin_users (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);
