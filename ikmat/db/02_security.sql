-- IK-mat: tilgangsstyring (RLS), hjelpefunksjoner, revisjonslogg og RPC-er.

-- ---------- Ingen tilgang for anonyme ----------
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from anon, public;

-- ---------- Hjelpefunksjoner ----------
create or replace function public.is_member(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where org_id = o and user_id = auth.uid())
$$;

create or replace function public.is_leder(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where org_id = o and user_id = auth.uid() and role = 'leder')
$$;

revoke all on function public.is_member(uuid), public.is_leder(uuid) from public, anon;
grant execute on function public.is_member(uuid), public.is_leder(uuid) to authenticated;

-- ---------- Skru på RLS ----------
alter table public.organizations enable row level security;
alter table public.members enable row level security;
alter table public.invites enable row level security;
alter table public.areas enable row level security;
alter table public.haccp_plans enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;
alter table public.task_runs enable row level security;
alter table public.deviations enable row level security;
alter table public.audit_log enable row level security;

-- Virksomhet: opprettes bare via create_organization()
create policy org_select on public.organizations for select to authenticated using (public.is_member(id));
create policy org_update on public.organizations for update to authenticated
  using (public.is_leder(id)) with check (public.is_leder(id));

-- Medlemmer
create policy members_select on public.members for select to authenticated using (public.is_member(org_id));
create policy members_update on public.members for update to authenticated
  using (public.is_leder(org_id)) with check (public.is_leder(org_id));
create policy members_delete on public.members for delete to authenticated using (public.is_leder(org_id));

-- Invitasjoner: bare leder ser dem, og de opprettes via create_invite()
create policy invites_select on public.invites for select to authenticated using (public.is_leder(org_id));

-- Avdelinger
create policy areas_select on public.areas for select to authenticated using (public.is_member(org_id));
create policy areas_insert on public.areas for insert to authenticated with check (public.is_leder(org_id));
create policy areas_update on public.areas for update to authenticated
  using (public.is_leder(org_id)) with check (public.is_leder(org_id));

-- HACCP-plan
create policy plans_select on public.haccp_plans for select to authenticated using (public.is_member(org_id));
create policy plans_insert on public.haccp_plans for insert to authenticated with check (public.is_leder(org_id));
create policy plans_update on public.haccp_plans for update to authenticated
  using (public.is_leder(org_id)) with check (public.is_leder(org_id));

-- Maler: alle innloggede kan lese, ingen kan skrive
create policy templates_select on public.task_templates for select to authenticated using (true);

-- Oppgaver: leder endrer, alle medlemmer leser. Ingen sletting (bruk active = false).
create policy tasks_select on public.tasks for select to authenticated using (public.is_member(org_id));
create policy tasks_insert on public.tasks for insert to authenticated with check (
  public.is_leder(org_id)
  and (area_id is null or exists (select 1 from public.areas a where a.id = tasks.area_id and a.org_id = tasks.org_id))
);
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_leder(org_id))
  with check (
    public.is_leder(org_id)
    and (area_id is null or exists (select 1 from public.areas a where a.id = tasks.area_id and a.org_id = tasks.org_id))
  );

-- Utføring: alle medlemmer kvitterer, med eget navn. Bare leder kan rette, og ingen kan slette.
create policy runs_select on public.task_runs for select to authenticated using (public.is_member(org_id));
create policy runs_insert on public.task_runs for insert to authenticated with check (
  public.is_member(org_id)
  and done_by = auth.uid()
  and exists (select 1 from public.tasks t where t.id = task_runs.task_id and t.org_id = task_runs.org_id)
);
create policy runs_update on public.task_runs for update to authenticated
  using (public.is_leder(org_id)) with check (public.is_leder(org_id));

-- Avvik: alle medlemmer registrerer og følger opp. Ingen sletting.
create policy dev_select on public.deviations for select to authenticated using (public.is_member(org_id));
create policy dev_insert on public.deviations for insert to authenticated with check (
  public.is_member(org_id)
  and (source_run_id is null or exists (select 1 from public.task_runs r where r.id = deviations.source_run_id and r.org_id = deviations.org_id))
);
create policy dev_update on public.deviations for update to authenticated
  using (public.is_member(org_id)) with check (public.is_member(org_id));

-- Revisjonslogg: bare leder leser. Ingen policies for skriving, så bare triggeren kan skrive.
create policy audit_select on public.audit_log for select to authenticated using (public.is_leder(org_id));

-- Rettigheter på tabellnivå (RLS styrer resten)
grant select, update on public.organizations to authenticated;
grant select, update, delete on public.members to authenticated;
grant select on public.invites to authenticated;
grant select, insert, update on public.areas, public.haccp_plans, public.tasks to authenticated;
grant select on public.task_templates to authenticated;
grant select, insert, update on public.task_runs, public.deviations to authenticated;
grant select on public.audit_log to authenticated;

-- ---------- Revisjonslogg: trigger ----------
create or replace function public.audit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  rec jsonb;
  org uuid;
begin
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  org := case when tg_table_name = 'organizations' then (rec->>'id')::uuid else (rec->>'org_id')::uuid end;
  insert into public.audit_log (org_id, user_id, table_name, row_id, action, old_data, new_data)
  values (
    org, auth.uid(), tg_table_name,
    coalesce(rec->>'id', (rec->>'user_id')),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return null;
end $$;
revoke all on function public.audit() from public, anon, authenticated;

create trigger audit_organizations after insert or update or delete on public.organizations for each row execute function public.audit();
create trigger audit_members after insert or update or delete on public.members for each row execute function public.audit();
create trigger audit_areas after insert or update or delete on public.areas for each row execute function public.audit();
create trigger audit_plans after insert or update or delete on public.haccp_plans for each row execute function public.audit();
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.audit();
create trigger audit_runs after insert or update or delete on public.task_runs for each row execute function public.audit();
create trigger audit_deviations after insert or update or delete on public.deviations for each row execute function public.audit();

-- ---------- Måling utenfor grense gir avvik ----------
create or replace function public.run_out_of_bounds() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tasks;
begin
  if new.status <> 'done' or new.value is null then return null; end if;
  select * into t from public.tasks where id = new.task_id;
  if t.id is null then return null; end if;
  if (t.min_value is not null and new.value < t.min_value) or (t.max_value is not null and new.value > t.max_value) then
    insert into public.deviations (org_id, category, title, description, source_run_id, created_by)
    values (
      new.org_id, t.domain,
      'Måling utenfor grense: ' || t.title,
      format('Målt %s %s. Grense: %s til %s.', new.value, coalesce(t.unit,''),
             coalesce(t.min_value::text,'ingen'), coalesce(t.max_value::text,'ingen')),
      new.id, new.done_by
    );
  end if;
  return null;
end $$;
revoke all on function public.run_out_of_bounds() from public, anon, authenticated;
create trigger task_run_bounds after insert on public.task_runs for each row execute function public.run_out_of_bounds();

-- ---------- Når er en oppgave forfalt? ----------
-- recurrence: {"freq":"daily"|"weekly"|"monthly"|"yearly", "weekdays":[1..7 (man=1)], "day":1..31, "month":1..12, "start":"YYYY-MM-DD"}
create or replace function public.due_on(rec jsonb, d date) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  f text := coalesce(rec->>'freq','daily');
  wd int[];
  dd int;
  last_day int := extract(day from ((date_trunc('month', d) + interval '1 month') - interval '1 day'))::int;
begin
  if rec ? 'start' and d < (rec->>'start')::date then return false; end if;
  if rec ? 'weekdays' then
    select array_agg(x::int) into wd from jsonb_array_elements_text(rec->'weekdays') x;
  end if;
  if f = 'daily' then
    return wd is null or extract(isodow from d)::int = any(wd);
  elsif f = 'weekly' then
    return extract(isodow from d)::int = any(coalesce(wd, array[1]));
  elsif f = 'monthly' then
    dd := least(coalesce((rec->>'day')::int, 1), last_day);
    return extract(day from d)::int = dd;
  elsif f = 'yearly' then
    dd := least(coalesce((rec->>'day')::int, 1), last_day);
    return extract(month from d)::int = coalesce((rec->>'month')::int, 1) and extract(day from d)::int = dd;
  end if;
  return false;
end $$;

-- ---------- Dagens liste ----------
create or replace function public.tasks_for_day(p_org uuid, p_day date)
returns table (
  task_id uuid, area_id uuid, area_name text, domain text, routine text, title text, hint text,
  kind text, unit text, min_value numeric, max_value numeric, sort int,
  run_id uuid, run_status text, run_value numeric, run_note text, run_skip_reason text,
  run_done_by uuid, run_done_at timestamptz, run_photo_path text
)
language sql stable security invoker set search_path = public as $$
  select t.id, t.area_id, a.name, t.domain, t.routine, t.title, t.hint,
         t.kind, t.unit, t.min_value, t.max_value, t.sort,
         r.id, r.status, r.value, r.note, r.skip_reason, r.done_by, r.done_at, r.photo_path
  from public.tasks t
  left join public.areas a on a.id = t.area_id
  left join public.task_runs r on r.task_id = t.id and r.due_date = p_day
  where t.org_id = p_org and t.active and public.due_on(t.recurrence, p_day)
  order by t.sort, t.title
$$;
revoke all on function public.tasks_for_day(uuid, date) from public, anon;
grant execute on function public.tasks_for_day(uuid, date) to authenticated;

-- ---------- Opprett virksomhet med ferdige rutiner ----------
create or replace function public.create_organization(
  p_name text, p_orgnr text, p_business_type text, p_has_alcohol boolean,
  p_areas text[], p_display_name text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  org uuid;
  ak text;
  aid uuid;
  names jsonb := '{"kjokken":"Kjøkken","bar":"Bar","kafe":"Kafé"}';
begin
  if auth.uid() is null then raise exception 'Ikke innlogget'; end if;
  if p_name is null or length(trim(p_name)) = 0 then raise exception 'Navn mangler'; end if;
  if (select count(*) from public.members where user_id = auth.uid() and role = 'leder') >= 20 then
    raise exception 'For mange virksomheter på denne brukeren';
  end if;

  insert into public.organizations (name, orgnr, business_type, has_alcohol, created_by)
  values (trim(p_name), nullif(trim(coalesce(p_orgnr,'')),''), p_business_type, coalesce(p_has_alcohol,false), auth.uid())
  returning id into org;

  insert into public.members (org_id, user_id, role, display_name)
  values (org, auth.uid(), 'leder', left(coalesce(p_display_name,''),120));

  insert into public.haccp_plans (org_id, version, plan, created_by) values (org, 1, '{}'::jsonb, auth.uid());

  -- Felles oppgaver (ikke knyttet til avdeling)
  insert into public.tasks (org_id, area_id, domain, routine, title, hint, kind, unit, min_value, max_value, recurrence, source, sort)
  select org, null, domain, routine, title, hint, kind, unit, min_value, max_value, recurrence, 'mal', sort
  from public.task_templates
  where area_kind = 'alle' and (not requires_alcohol or coalesce(p_has_alcohol,false));

  foreach ak in array coalesce(p_areas, array[]::text[]) loop
    if ak not in ('kjokken','bar','kafe') then raise exception 'Ukjent avdeling: %', ak; end if;
    insert into public.areas (org_id, kind, name) values (org, ak, names->>ak) returning id into aid;
    insert into public.tasks (org_id, area_id, domain, routine, title, hint, kind, unit, min_value, max_value, recurrence, source, sort)
    select org, aid, domain, routine, title, hint, t.kind, unit, min_value, max_value, recurrence, 'mal', sort
    from public.task_templates t
    where t.area_kind = ak and (not requires_alcohol or coalesce(p_has_alcohol,false));
  end loop;

  return org;
end $$;
revoke all on function public.create_organization(text,text,text,boolean,text[],text) from public, anon;
grant execute on function public.create_organization(text,text,text,boolean,text[],text) to authenticated;

-- ---------- Invitasjon ----------
create or replace function public.create_invite(p_org uuid, p_role text default 'ansatt') returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not public.is_leder(p_org) then raise exception 'Bare leder kan invitere'; end if;
  if p_role not in ('leder','ansatt') then raise exception 'Ugyldig rolle'; end if;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.invites (code, org_id, role, created_by) values (c, p_org, p_role, auth.uid());
  return c;
end $$;
revoke all on function public.create_invite(uuid,text) from public, anon;
grant execute on function public.create_invite(uuid,text) to authenticated;

create or replace function public.join_with_code(p_code text, p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare inv public.invites;
begin
  if auth.uid() is null then raise exception 'Ikke innlogget'; end if;
  select * into inv from public.invites where code = upper(trim(p_code)) for update;
  if inv.code is null or inv.used_at is not null or inv.expires_at < now() then
    raise exception 'Koden er ugyldig eller utløpt';
  end if;
  insert into public.members (org_id, user_id, role, display_name)
  values (inv.org_id, auth.uid(), inv.role, left(coalesce(p_name,''),120))
  on conflict (org_id, user_id) do nothing;
  update public.invites set used_at = now() where code = inv.code;
  return inv.org_id;
end $$;
revoke all on function public.join_with_code(text,text) from public, anon;
grant execute on function public.join_with_code(text,text) to authenticated;

create or replace function public.set_my_name(p_org uuid, p_name text) returns void
language sql security definer set search_path = public as $$
  update public.members set display_name = left(coalesce(p_name,''),120)
  where org_id = p_org and user_id = auth.uid()
$$;
revoke all on function public.set_my_name(uuid,text) from public, anon;
grant execute on function public.set_my_name(uuid,text) to authenticated;

-- ---------- Lagring av bilder (privat, per virksomhet) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ikmat-bilder', 'ikmat-bilder', false, 5242880, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

create policy ikmat_bilder_select on storage.objects for select to authenticated
  using (bucket_id = 'ikmat-bilder' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy ikmat_bilder_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'ikmat-bilder' and public.is_member(((storage.foldername(name))[1])::uuid));
