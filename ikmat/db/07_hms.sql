-- HMS-modul: dokumentasjon etter internkontrollforskriften § 5 (punkt 4 til 8) og tilhørende registre.
create table public.hms_settings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations(id) on delete cascade,
  goals jsonb not null default '[]'::jsonb,
  roles jsonb not null default '[]'::jsonb,
  participation text check (participation is null or length(participation) <= 4000),
  updated_by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);
create table public.hms_risks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  area text not null default '' check (length(area) <= 100),
  hazard text not null check (length(hazard) between 1 and 300),
  often smallint check (often between 0 and 4),
  bad smallint check (bad between 0 and 4),
  measure text check (measure is null or length(measure) <= 2000),
  responsible uuid references auth.users(id),
  due date,
  status text not null default 'apen' check (status in ('apen','pagar','ferdig','fjernet')),
  source text not null default 'egen',
  done_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.hms_risks (org_id, status, due);
create table public.hms_incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null default 'nestenulykke' check (kind in ('ulykke','nestenulykke','sykdom','trusler_vold','annet')),
  occurred_at timestamptz not null default now(),
  place text check (place is null or length(place) <= 200),
  description text not null check (length(description) between 1 and 4000),
  injured text check (injured is null or length(injured) <= 500),
  cause text check (cause is null or length(cause) <= 2000),
  action text check (action is null or length(action) <= 2000),
  reported text check (reported is null or length(reported) <= 500),
  responsible uuid references auth.users(id),
  status text not null default 'apen' check (status in ('apen','under_arbeid','lukket')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index on public.hms_incidents (org_id, occurred_at desc);
create table public.hms_training (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  person_name text not null check (length(person_name) between 1 and 120),
  topic text not null check (length(topic) between 1 and 200),
  done_on date not null default current_date,
  valid_until date,
  note text check (note is null or length(note) <= 1000),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.hms_rounds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  done_on date not null default current_date,
  area text not null default '' check (length(area) <= 100),
  items jsonb not null default '[]'::jsonb,
  note text check (note is null or length(note) <= 2000),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create table public.hms_reviews (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  done_on date not null default current_date,
  goals_met text check (goals_met is null or length(goals_met) <= 3000),
  conclusion text check (conclusion is null or length(conclusion) <= 3000),
  next_actions text check (next_actions is null or length(next_actions) <= 3000),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.hms_settings enable row level security;
alter table public.hms_risks enable row level security;
alter table public.hms_incidents enable row level security;
alter table public.hms_training enable row level security;
alter table public.hms_rounds enable row level security;
alter table public.hms_reviews enable row level security;
-- Alle medlemmer leser (arbeidstakerne skal medvirke). Leder skriver, men alle kan melde hendelser.
create policy hs_sel on public.hms_settings for select to authenticated using (public.is_member(org_id));
create policy hs_ins on public.hms_settings for insert to authenticated with check (public.is_leder(org_id));
create policy hs_upd on public.hms_settings for update to authenticated using (public.is_leder(org_id)) with check (public.is_leder(org_id));
create policy hr_sel on public.hms_risks for select to authenticated using (public.is_member(org_id));
create policy hr_ins on public.hms_risks for insert to authenticated with check (public.is_leder(org_id));
create policy hr_upd on public.hms_risks for update to authenticated using (public.is_leder(org_id)) with check (public.is_leder(org_id));
create policy hr_del on public.hms_risks for delete to authenticated using (public.is_leder(org_id));
create policy hi_sel on public.hms_incidents for select to authenticated using (public.is_member(org_id));
create policy hi_ins on public.hms_incidents for insert to authenticated with check (public.is_member(org_id));
create policy hi_upd on public.hms_incidents for update to authenticated using (public.is_leder(org_id)) with check (public.is_leder(org_id));
create policy ht_sel on public.hms_training for select to authenticated using (public.is_member(org_id));
create policy ht_ins on public.hms_training for insert to authenticated with check (public.is_leder(org_id));
create policy ht_upd on public.hms_training for update to authenticated using (public.is_leder(org_id)) with check (public.is_leder(org_id));
create policy ht_del on public.hms_training for delete to authenticated using (public.is_leder(org_id));
create policy hd_sel on public.hms_rounds for select to authenticated using (public.is_member(org_id));
create policy hd_ins on public.hms_rounds for insert to authenticated with check (public.is_leder(org_id));
create policy hv_sel on public.hms_reviews for select to authenticated using (public.is_member(org_id));
create policy hv_ins on public.hms_reviews for insert to authenticated with check (public.is_leder(org_id));
grant select, insert, update on public.hms_settings, public.hms_incidents to authenticated;
grant select, insert, update, delete on public.hms_risks, public.hms_training to authenticated;
grant select, insert on public.hms_rounds, public.hms_reviews to authenticated;
create trigger audit_hms_settings after insert or update or delete on public.hms_settings for each row execute function public.audit();
create trigger audit_hms_risks after insert or update or delete on public.hms_risks for each row execute function public.audit();
create trigger audit_hms_incidents after insert or update or delete on public.hms_incidents for each row execute function public.audit();
create trigger audit_hms_training after insert or update or delete on public.hms_training for each row execute function public.audit();
create trigger audit_hms_rounds after insert or update or delete on public.hms_rounds for each row execute function public.audit();
create trigger audit_hms_reviews after insert or update or delete on public.hms_reviews for each row execute function public.audit();
