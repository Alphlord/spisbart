-- Daglige rutiner som ikke er kvittert innen dagen er over, logges som «ikke registrert».
-- Kjøres av appen ved åpning (idempotent). Ser bakover maks 7 dager.
alter table public.task_runs drop constraint if exists task_runs_status_check;
alter table public.task_runs add constraint task_runs_status_check check (status in ('done','skipped','missed'));
alter table public.task_runs alter column done_by drop not null;

create or replace function public.close_missed(p_org uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Europe/Oslo')::date;
  d date;
  n integer := 0;
  c integer;
begin
  if auth.uid() is null or not public.is_member(p_org) then raise exception 'Ikke tilgang'; end if;
  for d in select g::date from generate_series(today - 7, today - 1, interval '1 day') g loop
    insert into public.task_runs (org_id, task_id, due_date, status, note, done_by)
    select t.org_id, t.id, d, 'missed', 'Ikke registrert', null
    from public.tasks t
    left join public.routine_blocks b on b.id = t.block_id
    where t.org_id = p_org and t.active
      and coalesce(t.recurrence->>'freq', 'daily') = 'daily'
      and public.due_on(t.recurrence, d)
      and (t.created_at at time zone 'Europe/Oslo')::date < d
      and (b.id is null or (b.active and (b.weekdays is null or cardinality(b.weekdays) = 0 or extract(isodow from d)::int = any(b.weekdays))))
      and not (d = today - 1 and b.id is not null and b.end_time < b.start_time and (now() at time zone 'Europe/Oslo')::time <= b.end_time)
      and not exists (select 1 from public.task_runs r where r.task_id = t.id and r.due_date = d)
    on conflict (task_id, due_date) do nothing;
    get diagnostics c = row_count; n := n + c;
  end loop;
  return n;
end $$;
revoke all on function public.close_missed(uuid) from public, anon;
grant execute on function public.close_missed(uuid) to authenticated;
