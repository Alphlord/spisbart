# Kildefiler (publiseres ikke)

Mappen `_src` ignoreres av GitHub Pages.

- `site_template.html` er den opprinnelige forsiden med alle seksjonene. `build_site.py` leser den og lager `index.html`, `produkter.html`, `barnehage.html`, `horeca.html`, `quiz.html` og `om.html`.
- Kjør fra rotmappen: `python3 _src/build_site.py`
- Sidene er generert. Endre malen eller skriptet, ikke de genererte sidene, ellers overskrives endringene.
- `tts_reference.js` er en kopi av lydbok-koden som ligger i begge quizappene.
