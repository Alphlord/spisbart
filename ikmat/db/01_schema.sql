-- IK-mat: skjema, tilgangsstyring og revisjonslogg.
-- Alt er knyttet til en virksomhet (organizations). RLS slipper bare inn medlemmer av virksomheten.

create extension if not exists pgcrypto;

-- ---------- Virksomhet og medlemmer ----------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  orgnr text check (orgnr is null or orgnr ~ '^[0-9 ]{9,11}$'),
  address text,
  business_type text not null default 'restaurant'
    check (business_type in ('restaurant','kafe','bar','catering','barnehagekjokken','bakeri','annet')),
  has_alcohol boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'ansatt' check (role in ('leder','ansatt')),
  display_name text not null default '' check (length(display_name) <= 120),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index on public.members (user_id);

create table public.invites (
  code text primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'ansatt' check (role in ('leder','ansatt')),
  created_by uuid not null default auth.uid(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('kjokken','bar','kafe','lager','annet')),
  name text not null check (length(name) between 1 and 100),
  created_at timestamptz not null default now()
);
create index on public.areas (org_id);

-- ---------- HACCP-plan (versjonert) ----------
create table public.haccp_plans (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  version int not null,
  plan jsonb not null default '{}'::jsonb,
  status text not null default 'utkast' check (status in ('utkast','godkjent')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (org_id, version)
);

-- ---------- Maler (global, skrivebeskyttet for brukere) ----------
create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  area_kind text not null check (area_kind in ('kjokken','bar','kafe','alle')),
  domain text not null default 'mat' check (domain in ('mat','alkohol','hms')),
  routine text not null check (routine in ('apning','stenging','daglig','ukentlig','manedlig','arlig','annet')),
  title text not null,
  hint text,
  kind text not null default 'check' check (kind in ('check','measure','note','photo')),
  unit text,
  min_value numeric,
  max_value numeric,
  recurrence jsonb not null default '{"freq":"daily"}'::jsonb,
  sort int not null default 0,
  requires_alcohol boolean not null default false
);

-- ---------- Oppgaver og utføring ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  domain text not null default 'mat' check (domain in ('mat','alkohol','hms')),
  routine text not null default 'annet' check (routine in ('apning','stenging','daglig','ukentlig','manedlig','arlig','annet')),
  title text not null check (length(title) between 1 and 200),
  hint text,
  kind text not null default 'check' check (kind in ('check','measure','note','photo')),
  unit text,
  min_value numeric,
  max_value numeric,
  recurrence jsonb not null default '{"freq":"daily"}'::jsonb,
  source text not null default 'egen' check (source in ('mal','haccp','egen')),
  sort int not null default 0,
  active boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.tasks (org_id, active);

create table public.task_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  due_date date not null,
  status text not null check (status in ('done','skipped')),
  value numeric,
  note text check (note is null or length(note) <= 2000),
  photo_path text,
  skip_reason text check (skip_reason is null or length(skip_reason) <= 500),
  done_by uuid not null default auth.uid() references auth.users(id),
  done_at timestamptz not null default now(),
  unique (task_id, due_date)
);
create index on public.task_runs (org_id, due_date);

create table public.deviations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  category text not null default 'mat' check (category in ('mat','alkohol','hms')),
  title text not null check (length(title) between 1 and 200),
  description text check (description is null or length(description) <= 4000),
  cause text check (cause is null or length(cause) <= 2000),
  action text check (action is null or length(action) <= 2000),
  responsible uuid references auth.users(id),
  status text not null default 'apen' check (status in ('apen','under_arbeid','lukket')),
  source_run_id uuid references public.task_runs(id) on delete set null,
  photo_path text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index on public.deviations (org_id, status);

-- ---------- Revisjonslogg (kan ikke endres eller slettes av brukere) ----------
create table public.audit_log (
  id bigint generated always as identity primary key,
  org_id uuid,
  user_id uuid,
  table_name text not null,
  row_id text,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  at timestamptz not null default now()
);
create index on public.audit_log (org_id, at desc);
