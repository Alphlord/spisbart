-- Rutinesjekk (25. november 2026): maler gjennomgått av eier.
-- Kjørt i Supabase som ikmat_06a_org_start_og_frekvens og ikmat_06b_maler_aktiv.
-- * 30 maler er satt til active = false (fjernet fra dagslisten, flyttet til grunnrutiner i HACCP-planen eller helt fjernet).
-- * Kalibrering av termometer, opplæring, brann, gass/el og førstehjelp: hvert halvår (every 6). Vernerunde: årlig.
-- * create_organization setter start = i dag på maler med "every" og bruker bare aktive maler.
-- * Eksisterende virksomheter: fjernede maloppgaver er satt til inaktive, og stengemåling per kjøl/frys er slått av.
alter table public.task_templates add column if not exists active boolean not null default true;
-- Resten (update av maler og oppgaver, create_organization) står i migrasjonshistorikken.
