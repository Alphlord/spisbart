/* Forslag til HACCP-veiviseren. Alt kan endres av brukeren, og ansvaret for at planen passer driften ligger hos virksomheten.
   Grenseverdiene er utgangspunkt og må kontrolleres mot Mattilsynets veiledning og bransjenorm. */
window.DATA = {
  businessTypes: [
    ['restaurant', 'Restaurant'], ['kafe', 'Kafé'], ['bar', 'Bar eller pub'],
    ['catering', 'Catering'], ['barnehagekjokken', 'Barnehagekjøkken'], ['bakeri', 'Bakeri eller konditori'], ['annet', 'Annet']
  ],
  defaultAreas: {
    restaurant: ['kjokken', 'bar'], kafe: ['kafe'], bar: ['bar'], catering: ['kjokken'],
    barnehagekjokken: ['kjokken'], bakeri: ['kafe', 'kjokken'], annet: ['kjokken']
  },
  areas: [['kjokken', 'Kjøkken'], ['bar', 'Bar'], ['kafe', 'Kafé']],

  steps: [
    ['mottak', 'Mottak av varer'],
    ['kjol', 'Lagring i kjøl'],
    ['frys', 'Lagring i frys'],
    ['tort', 'Lagring av tørrvarer'],
    ['forb', 'Forberedelse og oppskjæring'],
    ['varme', 'Varmebehandling (steking og koking)'],
    ['nedkjol', 'Nedkjøling'],
    ['varmhold', 'Varmholding'],
    ['gjenvarme', 'Gjenoppvarming'],
    ['servering', 'Servering og buffet'],
    ['transport', 'Transport (catering)'],
    ['oppvask', 'Oppvask og renhold']
  ],
  defaultSteps: {
    restaurant: ['mottak','kjol','frys','tort','forb','varme','nedkjol','varmhold','servering','oppvask'],
    kafe: ['mottak','kjol','tort','forb','servering','oppvask'],
    bar: ['mottak','kjol','servering','oppvask'],
    catering: ['mottak','kjol','frys','tort','forb','varme','nedkjol','varmhold','gjenvarme','transport','servering','oppvask'],
    barnehagekjokken: ['mottak','kjol','frys','tort','forb','varme','nedkjol','varmhold','servering','oppvask'],
    bakeri: ['mottak','kjol','tort','forb','varme','servering','oppvask'],
    annet: ['mottak','kjol','frys','tort','forb','varme','servering','oppvask']
  },

  // Farer per steg. type: bio, kjem, fys, allergen
  hazards: {
    mottak: [
      ['Bakterier vokser ved for høy temperatur under transport', 'bio'],
      ['Skadet emballasje eller utgått dato', 'bio'],
      ['Fremmedlegemer i varer', 'fys'],
      ['Feil allergenmerking fra leverandør', 'allergen']
    ],
    kjol: [
      ['Bakterievekst ved for høy temperatur i kjøl', 'bio'],
      ['Krysskontaminering mellom rå og ferdig mat', 'bio'],
      ['Allergener spres ved oppbevaring', 'allergen']
    ],
    frys: [
      ['Opptining og ny nedfrysing', 'bio'],
      ['Frysebrann og kvalitetstap ved for høy temperatur', 'bio']
    ],
    tort: [
      ['Skadedyr og mugg', 'bio'],
      ['Kjemikalier oppbevart nær mat', 'kjem']
    ],
    forb: [
      ['Krysskontaminering fra rå til ferdig mat', 'bio'],
      ['Forurensning fra hender og utstyr', 'bio'],
      ['Allergener spres via skjærebrett og utstyr', 'allergen'],
      ['Fremmedlegemer som plast, glass eller hår', 'fys']
    ],
    varme: [
      ['Overlevende bakterier ved for lav kjernetemperatur', 'bio'],
      ['Rester av rengjøringsmiddel på utstyr', 'kjem']
    ],
    nedkjol: [
      ['Bakterievekst i lang nedkjølingstid', 'bio']
    ],
    varmhold: [
      ['Bakterievekst ved for lav varmholdingstemperatur', 'bio']
    ],
    gjenvarme: [
      ['Overlevende bakterier ved for lav gjenoppvarming', 'bio']
    ],
    servering: [
      ['Forurensning fra gjester, hender eller utstyr', 'bio'],
      ['Feil informasjon om allergener', 'allergen'],
      ['For lang tid ved romtemperatur', 'bio']
    ],
    transport: [
      ['Temperaturbrudd under transport', 'bio'],
      ['Krysskontaminering i kasser og bil', 'bio']
    ],
    oppvask: [
      ['Dårlig rengjøring gir smitte og allergenrester', 'bio'],
      ['Feil dosering av kjemikalier', 'kjem']
    ]
  },
  // Farevurdering: matrise. Rad = hvor ofte (0 nesten aldri .. 4 ukentlig), kolonne = hvor ille (0 ingen følger .. 4 alvorlig).
  risk: {
    often: ['Nesten aldri', 'Hvert par år', 'Noen ganger i året', 'Månedlig', 'Ukentlig eller oftere'],
    oftenLong: ['Skjer nesten aldri', 'Skjer sjelden', 'Kan skje i løpet av et år', 'Skjer jevnlig', 'Skjer ofte'],
    bad: ['Ingen følger', 'Litt ubehag', 'Én blir syk', 'Flere blir syke', 'Alvorlig'],
    badLong: ['Ingen blir syke, bare kvalitet eller utseende', 'Litt ubehag, ingen blir syke', 'Én gjest blir syk', 'Flere gjester blir syke', 'Alvorlig sykdom eller dødsfall'],
    matrix: [['PRP','PRP','PRP','CP','CP'],['PRP','CP','CP','OPRP','OPRP'],['PRP','CP','OPRP','OPRP','CCP'],['CP','OPRP','OPRP','CCP','CCP'],['CP','OPRP','CCP','CCP','CCP']],
    label: { PRP: 'Rutine', CP: 'Kontroll', OPRP: 'Tiltak', CCP: 'Kritisk', MOD: 'Uavklart', NONE: 'Ikke vurdert' },
    name: { PRP: 'Rutine (grunnrutine, PRP)', CP: 'Kontroll (kontrollpunkt, CP)', OPRP: 'Tiltak (operasjonell grunnrutine, OPRP)', CCP: 'Kritisk (kritisk kontrollpunkt, CCP)', MOD: 'Uavklart (under endring)' },
    text: {
      PRP: 'Dekkes av god hygienepraksis. Ingen egen avkrysning, men faren står i planen.',
      CP: 'Et sted i prosessen der du passer ekstra godt på. Appen legger inn en kontroll hver måned.',
      OPRP: 'Et tiltak som må følges aktivt. Appen legger inn en kontroll hver uke.',
      CCP: 'Her kan det bli farlig. Du må måle mot en grense. Appen legger inn en daglig kontroll, og måling med grenseverdi der det finnes et styringspunkt.',
      MOD: 'Ikke avklart ennå. Faren står som uavklart i planen.'
    },
    // forslag per fare, i samme rekkefølge som hazards: [rad, kolonne]
    suggest: {
      mottak: [[2,3],[2,2],[1,2],[1,4]], kjol: [[2,3],[2,3],[1,4]], frys: [[1,2],[2,0]], tort: [[1,2],[0,3]],
      forb: [[2,3],[2,2],[1,4],[2,1]], varme: [[2,4],[1,2]], nedkjol: [[3,3]], varmhold: [[2,3]], gjenvarme: [[2,4]],
      servering: [[2,2],[1,4],[2,3]], transport: [[2,3],[1,3]], oppvask: [[2,2],[1,2]]
    }
  },
  hazardTypes: { bio: 'Biologisk', kjem: 'Kjemisk', fys: 'Fysisk', allergen: 'Allergen' },

  // God hygienepraksis. Alle forhåndsvalgt.
  ghp: [
    ['Personlig hygiene og sykdom', 'Håndvask, rent arbeidstøy, ingen jobb ved mageinfeksjon, og melding til leder.'],
    ['Renhold og desinfeksjon', 'Renholdsplan med hva, hvor ofte og hvem. Kvittering i kalenderen.'],
    ['Skadedyr', 'Fast kontroll, tetting av innganger og melding ved funn.'],
    ['Vann og avløp', 'Rent drikkevann og kontroll av avløp.'],
    ['Avfall', 'Tømming, sortering og rene avfallsrom.'],
    ['Vedlikehold av lokaler og utstyr', 'Feil meldes og rettes. Termometre kalibreres.'],
    ['Leverandører og mottakskontroll', 'Godkjente leverandører, kontroll av temperatur og dato ved mottak.'],
    ['Sporbarhet og merking', 'Dato og innhold på åpnede og produserte varer.'],
    ['Allergener', 'Oversikt over allergener per rett, adskilt oppbevaring og tydelig informasjon til gjester.'],
    ['Opplæring', 'Nye ansatte får opplæring. Oversikt over hvem som har fått hva.'],
    ['Daglig oppstart og personlig hygiene', 'Ansatte er friske, har rent arbeidstøy og rene hender. Håndvask har såpe og papir. Ingen daglig avkrysning, men en fast regel i planen.'],
    ['Merking og datering', 'Åpnede og ferdige varer er merket med dato og innhold. Garnityr, bakevarer og melk datomerkes. Utgåtte varer kastes.'],
    ['Rene flater og utstyr', 'Flater, gulv, avtrekk, skjærebrett, oppvaskmaskin, ølanlegg, isbitmaskin, glass, bardisk, kaffemaskin og sittegrupper holdes rene etter renholdsplanen.'],
    ['Rester og nedkjøling', 'Rester kjøles ned raskt, merkes med dato og innhold og dekkes til. Kjernetemperatur etter nedkjøling følger styringspunktet i planen.'],
    ['Mottak og kontroll av skadedyr', 'Varer kontrolleres ved levering (temperatur og emballasje). Spor av skadedyr meldes som avvik.'],
    ['Sikring av lokaler', 'Dører og varemottak låses. Alkohol på lager låses inn.'],
    ['Ansvarlig skjenking', 'Skjenketider og siste runde er avklart, ansvarlig for skjenking er satt på vakten, og det gjøres vakt- og rydderunder. Gjelder bare med skjenkebevilling.', 'alk']
  ],

  // Kritiske styringspunkter. step = steg som må være valgt. limit: {kind:'max'|'min', value, unit}
  ccps: [
    { id: 'kjol', step: 'kjol', title: 'Kjøl', kind: 'max', value: 4, unit: '°C',
      monitor: 'Måles hver dag ved åpning og stenging.',
      action: 'Flytt varer til annet kjøleskap, vurder varene (temperatur og tid), kast ved tvil, og meld feil på utstyret.',
      verify: 'Ukentlig kontroll av termometer og gjennomgang av målingene.' },
    { id: 'frys', step: 'frys', title: 'Frys', kind: 'max', value: -18, unit: '°C',
      monitor: 'Måles hver dag ved åpning og stenging.',
      action: 'Flytt varer, vurder varene, kast ved tvil, og meld feil på utstyret.',
      verify: 'Ukentlig kontroll av termometer og gjennomgang av målingene.' },
    { id: 'varme', step: 'varme', title: 'Varmebehandling (kjernetemperatur)', kind: 'min', value: 75, unit: '°C',
      monitor: 'Mål kjernetemperatur på varmebehandlede retter ved hver produksjon av risikovarer.',
      action: 'Fortsett varmebehandlingen til grensen er nådd. Kast hvis retten ikke kan varmes tilstrekkelig.',
      verify: 'Termometer kalibreres ukentlig. Leder gjennomgår målinger månedlig.' },
    { id: 'varmhold', step: 'varmhold', title: 'Varmholding', kind: 'min', value: 60, unit: '°C',
      monitor: 'Mål temperatur ved oppstart og med jevne mellomrom under servering.',
      action: 'Varm opp på nytt til grensen, eller kast hvis maten har stått for lenge under grensen.',
      verify: 'Leder gjennomgår målinger månedlig.' },
    { id: 'nedkjol', step: 'nedkjol', title: 'Nedkjøling (kjernetemperatur ved ferdig nedkjøling)', kind: 'max', value: 4, unit: '°C',
      monitor: 'Mål temperatur etter nedkjølingstiden som er fastsatt for stedet.',
      action: 'Kast mat som ikke er nedkjølt i tide, og vurder nedkjølingsmetoden.',
      verify: 'Leder gjennomgår målinger månedlig.' }
  ],

  // Hvilke temperaturoppgaver fra malene hører til hvilket kritisk styringspunkt (for å oppdatere grensene)
  limitTaskMatch: { kjol: /^Temperatur i (kjøl|vitrin og kjøl)/i, frys: /^Temperatur i frys/i }
};
