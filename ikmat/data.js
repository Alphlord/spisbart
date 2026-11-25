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
    ['Opplæring', 'Nye ansatte får opplæring. Oversikt over hvem som har fått hva.']
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
