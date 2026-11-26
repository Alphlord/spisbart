-- Opplæring: hvor man jobber (styrer hvilke bolker som gjelder) og utsignering av bolker.
alter table public.members add column if not exists work_areas uuid[] not null default '{}';

create or replace function public.set_my_work_areas(p_org uuid, p_areas uuid[]) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_member(p_org) then raise exception 'Ikke tilgang'; end if;
  update public.members set work_areas = coalesce((
    select array_agg(a.id) from public.areas a where a.org_id = p_org and a.id = any(coalesce(p_areas, '{}'))
  ), '{}')
  where org_id = p_org and user_id = auth.uid();
end $$;
revoke all on function public.set_my_work_areas(uuid, uuid[]) from public, anon;
grant execute on function public.set_my_work_areas(uuid, uuid[]) to authenticated;

create table if not exists public.training_signoffs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  module_id text not null check (length(module_id) between 1 and 60),
  version int not null default 1,
  score int not null check (score between 0 and 4),
  signed_at timestamptz not null default now()
);
create index if not exists training_signoffs_org_user on public.training_signoffs (org_id, user_id, module_id);
alter table public.training_signoffs enable row level security;
create policy ts_select on public.training_signoffs for select to authenticated
  using (public.is_member(org_id) and (user_id = auth.uid() or public.is_leder(org_id)));
create policy ts_insert on public.training_signoffs for insert to authenticated
  with check (public.is_member(org_id) and user_id = auth.uid() and score = 4);
grant select, insert on public.training_signoffs to authenticated;
create trigger audit_training_signoffs after insert or update or delete on public.training_signoffs for each row execute function public.audit();
