# Spisbart

Apper for matkontroll. Nettsted lagt ut med GitHub Pages på spisbart.no.

## Struktur
- `index.html` – landingsside (spisbart.no)
- `barnemat/index.html` – Bare Barnemat, hele appen i én fil (spisbart.no/barnemat/)
- `CNAME` – eget domene for GitHub Pages

## Backend
Supabase (innlogging, database med RLS). Den offentlige nøkkelen i appen er laget for nettleseren; tilgang styres av reglene i databasen.

## Oppdatering
Endringer på `main` legges ut automatisk av GitHub Pages.
