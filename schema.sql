-- ============================================================
-- UNDIGITAL - schema.sql
-- Cara pakai: Supabase Dashboard > SQL Editor > New Query
-- Paste seluruh file ini > Run. Aman dijalankan ulang.
-- Project : https://nrotipuxmfbiqvzolzox.supabase.co
-- Frontend memakai Publishable Key (sb_publishable_...),
-- jadi JANGAN pakai service_role key di kode website.
-- ============================================================

-- ---------- 0. BERSIH-BERSIH (agar idempotent) ----------
drop policy if exists "events_baca_publish" on public.events;
drop policy if exists "events_select" on public.events;
drop policy if exists "events_insert" on public.events;
drop policy if exists "events_update" on public.events;
drop policy if exists "events_delete" on public.events;
drop policy if exists "ucapan_baca_publik" on public.ucapan;
drop policy if exists "ucapan_tulis_publik" on public.ucapan;
drop policy if exists "ucapan_hapus_admin" on public.ucapan;
drop policy if exists "profiles_baca_sendiri" on public.profiles;
drop policy if exists "profiles_update_sendiri" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
-- ---------- 1. TABEL profiles (role admin / pelanggan) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'pelanggan' check (role in ('admin','pelanggan')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ---------- 2. TABEL events (9 bagian form dashboard) ----------
-- mempelai_pria  : {nama, panggilan, ortu, ig, foto}
-- mempelai_wanita: {nama, panggilan, ortu, ig, foto}
-- acara1/acara2  : {nama, tanggal, jam, tempat, alamat, maps}
-- galeri         : ["url1", ...] (maks 8)
-- kata           : {quote, sumber, c1j, c1i, c2j, c2i, tutup}
-- wa             : {nomor, teks, pesan}
-- lainnya        : {rek1, rek2, musik, tamu}
create table if not exists public.events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  judul text not null default 'Undangan Baru',
  template text not null default 'palet-1',
  foto_cover text,
  foto_hero text,
  tanggal_utama date,
  status text not null default 'draft' check (status in ('draft','publish')),
  mempelai_pria jsonb not null default '{}'::jsonb,
  mempelai_wanita jsonb not null default '{}'::jsonb,
  acara1 jsonb not null default '{}'::jsonb,
  acara2 jsonb not null default '{}'::jsonb,
  galeri jsonb not null default '[]'::jsonb,
  kata jsonb not null default '{}'::jsonb,
  wa jsonb not null default '{}'::jsonb,
  lainnya jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;

-- ---------- 3. TABEL ucapan (RSVP per acara) ----------
create table if not exists public.ucapan (
  id bigint generated always as identity primary key,
  nama text not null,
  hadir text not null default 'Hadir',
  pesan text not null,
  created_at timestamptz not null default now(),
  event_id bigint references public.events(id) on delete cascade
);
create index if not exists ucapan_event_id_idx on public.ucapan(event_id);
alter table public.ucapan enable row level security;

-- ---------- 4. FUNGSI + TRIGGER ----------
-- Cek admin (dipakai policy; SECURITY DEFINER agar tidak loop RLS)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Profil otomatis untuk user baru (login pertama via email/Google)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'pelanggan')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 5. POLICY events ----------
create policy "events_select" on public.events
  for select using (auth.uid() = owner_id or public.is_admin());
create policy "events_insert" on public.events
  for insert with check (auth.uid() = owner_id);
create policy "events_update" on public.events
  for update using (auth.uid() = owner_id or public.is_admin());
create policy "events_delete" on public.events
  for delete using (auth.uid() = owner_id or public.is_admin());
-- Tamu tanpa login boleh MEMBACA undangan yang sudah publish (/u/slug)
create policy "events_baca_publish" on public.events
  for select to anon using (status = 'publish');

-- ---------- 6. POLICY ucapan ----------
create policy "ucapan_baca_publik" on public.ucapan for select using (true);
create policy "ucapan_tulis_publik" on public.ucapan for insert with check (true);
create policy "ucapan_hapus_admin" on public.ucapan
  for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---------- 7. POLICY profiles ----------
create policy "profiles_baca_sendiri" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_sendiri" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin());

