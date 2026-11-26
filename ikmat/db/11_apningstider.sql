-- Åpningstider per ukedag (ISO 1=man..7=søn): {"1":["11:00","22:00"]}. Manglende dag = stengt.
alter table public.organizations add column if not exists opening_hours jsonb;
