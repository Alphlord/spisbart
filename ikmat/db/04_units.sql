-- Navngitte kjøleskap og frysere. Hver enhet får egne måleoppgaver (åpning og stenging).
create table public.units (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  kind text not null check (kind in ('kjol','frys')),
  name text not null check (length(name) between 1 and 100),
  active boolean not null default true,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.units (org_id, active);
alter table public.tasks add column unit_id uuid references public.units(id) on delete set null;
create index on public.tasks (unit_id);

alter table public.units enable row level security;
create policy units_select on public.units for select to authenticated using (public.is_member(org_id));
create policy units_insert on public.units for insert to authenticated with check (
  public.is_leder(org_id)
  and (area_id is null or exists (select 1 from public.areas a where a.id = units.area_id and a.org_id = units.org_id))
);
create policy units_update on public.units for update to authenticated
  using (public.is_leder(org_id))
  with check (
    public.is_leder(org_id)
    and (area_id is null or exists (select 1 from public.areas a where a.id = units.area_id and a.org_id = units.org_id))
  );
grant select, insert, update on public.units to authenticated;
create trigger audit_units after insert or update or delete on public.units for each row execute function public.audit();

-- En oppgave kan bare knyttes til enhet i samme virksomhet
drop policy tasks_insert on public.tasks;
drop policy tasks_update on public.tasks;
create policy tasks_insert on public.tasks for insert to authenticated with check (
  public.is_leder(org_id)
  and (area_id is null or exists (select 1 from public.areas a where a.id = tasks.area_id and a.org_id = tasks.org_id))
  and (unit_id is null or exists (select 1 from public.units u where u.id = tasks.unit_id and u.org_id = tasks.org_id))
);
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_leder(org_id))
  with check (
    public.is_leder(org_id)
    and (area_id is null or exists (select 1 from public.areas a where a.id = tasks.area_id and a.org_id = tasks.org_id))
    and (unit_id is null or exists (select 1 from public.units u where u.id = tasks.unit_id and u.org_id = tasks.org_id))
  );
