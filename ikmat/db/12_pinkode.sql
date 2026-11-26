-- Innlogging med navn og pinkode (4 siffer). Tabellene har RLS uten policyer: bare edge-funksjonen «staff-auth» (service role) bruker dem.
create extension if not exists pgcrypto with schema extensions;
create table public.staff_pins (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pin_hash text not null, failed int not null default 0, locked_until timestamptz, updated_at timestamptz not null default now(),
  primary key (org_id, user_id));
alter table public.staff_pins enable row level security;
revoke all on public.staff_pins from anon, authenticated;
create table public.org_pair_codes (org_id uuid primary key references public.organizations(id) on delete cascade, code text not null unique, created_at timestamptz not null default now());
alter table public.org_pair_codes enable row level security;
revoke all on public.org_pair_codes from anon, authenticated;
-- Funksjonene staff_set_pin, staff_check_pin (lås etter 5 feil, 15 min) og org_pair_code_new: se migrasjon ikmat_15_pinkode i Supabase.
-- Edge-funksjonen staff-auth (verify_jwt av, egen sjekk av leder) hentes med get_edge_function.
