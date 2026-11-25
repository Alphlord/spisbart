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

/* ---------- HMS-modul: forslag og standardtekster (internkontrollforskriften § 5) ---------- */
window.DATA.hms = {
  bad: ['Ingen skade', 'Førstehjelp', 'Skade med fravær', 'Alvorlig skade', 'Dødsfall eller varig men'],
  badLong: ['Ingen blir skadet', 'Liten skade som løses med førstehjelp', 'Skade som gir fravær fra jobb', 'Alvorlig skade', 'Dødsfall eller varig men'],
  label: { PRP: 'Lav', CP: 'Middels', OPRP: 'Høy', CCP: 'Svært høy', NONE: 'Ikke vurdert' },
  text: {
    PRP: 'Lav risiko. Følg vanlige rutiner. Tiltak er valgfritt.',
    CP: 'Middels risiko. Bør ha et tiltak, og tiltaket bør følges opp.',
    OPRP: 'Høy risiko. Må ha tiltak med ansvarlig og frist, og vises i I dag-listen til det er gjort.',
    CCP: 'Svært høy risiko. Stopp og gjør tiltak før arbeidet fortsetter. Ansvarlig og frist er et must.'
  },
  goals: [
    'Ingen arbeidsulykker som gir fravær.',
    'Alle nye ansatte får HMS- og brannopplæring før første vakt.',
    'Farer, nestenulykker og skader meldes og følges opp innen 14 dager.',
    'Ingen trakassering, vold eller trusler på arbeidsplassen. Alle vet hvordan de varsler.',
    'Gode vaktplaner med nok hvile og pauser.'
  ],
  roles: [
    ['Arbeidsgiver / daglig leder', 'Har det overordnede ansvaret for HMS og internkontroll, setter mål, gir ressurser og godkjenner risikovurderingen.'],
    ['Verneombud', 'Ivaretar de ansattes interesser i HMS-arbeidet, deltar i vernerunder og risikovurdering.'],
    ['Brannansvarlig', 'Passer på slukkeutstyr, rømningsveier, brannøvelse og opplæring.'],
    ['Førstehjelpsansvarlig', 'Passer på førstehjelpsutstyr og at noen på hver vakt kan førstehjelp.'],
    ['Mottaker av varsling', 'Tar imot og følger opp varsler om kritikkverdige forhold.']
  ],
  participation: 'Ansatte tas med i kartleggingen av farer og i vernerunden. Alle kan melde farlige forhold, nestenulykker og skader i appen eller muntlig til leder. HMS er fast tema på personalmøte. Verneombud og tillitsvalgte får se og kommentere risikovurderingen og tiltaksplanen før den godkjennes.',
  avvik: 'Alle ansatte melder farlige forhold, nestenulykker og skader til leder så snart som mulig, i appen eller muntlig. Leder registrerer hendelsen, finner årsaken, bestemmer tiltak og følger opp til saken er lukket. Åpne hendelser og tiltak vises i leders I dag-liste. Vernerunden avdekker mangler som registreres som tiltak med ansvarlig og frist. Gjentatte avvik tas opp på personalmøte og i den årlige gjennomgangen.',
  // [område, fare, sannsynlighet 0-4, konsekvens 0-4, tiltak]
  hazards: [
    ['Kjøkken', 'Kutt fra kniver og skjæremaskiner', 3, 1, 'Skarpe kniver og opplæring i bruk. Kuttsikre hansker ved mandolin. Verneutstyr på maskiner skal ikke fjernes.'],
    ['Kjøkken', 'Brannskader og skålding (varm olje, damp, ovner)', 3, 2, 'Riktig arbeidstøy, varsle når du bærer varmt, ikke bær varm væske gjennom trange rom. Brannskadekit og kjølegel er lett tilgjengelig.'],
    ['Kjøkken', 'Fettbrann', 1, 3, 'Brannteppe og slukkeutstyr på plass. Frityr og avtrekk rengjøres etter plan. Alle vet at fettbrann ikke slukkes med vann.'],
    ['Hele stedet', 'Fall og snubling på glatte eller rotete gulv', 3, 2, 'Tørk opp søl med en gang. Sklisikre sko. Hold gulv og ganger frie for kasser og slanger. God belysning.'],
    ['Lager', 'Tunge løft og belastning', 3, 2, 'Opplæring i løfteteknikk. Bruk tralle. Del opp tunge kolli. Tunge varer lagres lavt.'],
    ['Lager', 'Fall fra stige og trapp', 1, 3, 'Godkjent stige, ikke stå øverst. Ingen kasser i trapper. To personer ved høye løft.'],
    ['Hele stedet', 'Elektrisk utstyr og ledninger', 1, 3, 'Skadet utstyr tas ut av bruk og meldes. Regelmessig el-kontroll. Ingen skjøteledninger som fast løsning.'],
    ['Hele stedet', 'Brann og evakuering', 1, 4, 'Branndetektorer og slukkeutstyr kontrolleres. Rømningsveier holdes frie. Brannøvelse minst én gang i året. Alle kjenner møteplass.'],
    ['Hele stedet', 'Kjemikalier (rengjøring, avkalking)', 3, 2, 'Sikkerhetsdatablad tilgjengelig. Riktig merking, hansker og vernebriller. Ikke bland produkter. Opplæring i bruk.'],
    ['Bar', 'Knust glass og kutt', 3, 1, 'Fast rutine for knust glass. Bruk ikke glass til isskuff. Hansker og kost ved opprydding.'],
    ['Bar', 'Trusler og vold fra gjester', 2, 2, 'Rutine for å håndtere beruset eller aggressiv gjest. Ikke vær alene ved stenging. Avklar hvem som tilkaller hjelp og politi. Snakk om hendelsen etterpå.'],
    ['Hele stedet', 'Trakassering og uønsket seksuell oppmerksomhet (kolleger og gjester)', 2, 2, 'Nulltoleranse, tydelig varslingsrutine, tema på personalmøte. Ansatte skal ikke stå alene med plagsomme gjester.'],
    ['Hele stedet', 'Stress, høyt tempo, lange vakter og nattarbeid', 4, 1, 'Vaktplan i god tid. Pauser og hviledøgn etter arbeidsmiljøloven. Medarbeidersamtaler og åpen dialog om belastning.'],
    ['Hele stedet', 'Støy og dårlig innemiljø (musikk, avtrekk, temperatur)', 3, 1, 'Kontroll av ventilasjon og lydnivå. God pauserom og mulighet til å hvile ørene.'],
    ['Hele stedet', 'Alenearbeid (åpning eller stenging)', 3, 2, 'Rutine for alenearbeid. Mobil tilgjengelig. Noen vet når du går, og at du har kommet frem.'],
    ['Hele stedet', 'Førstehjelp ikke tilgjengelig', 1, 3, 'Førstehjelpsutstyr er komplett og merket. Minst én med førstehjelpskurs på hver vakt. Nødnumre henger synlig.']
  ],
  round: [
    'Nødutganger og rømningsveier er frie',
    'Slukkeutstyr på plass og kontrollert',
    'Brannvarslere er testet',
    'Førstehjelpsutstyr er komplett og ikke utgått',
    'Gulv er rene, sklisikre og uten hindre',
    'Belysning er god nok',
    'Ledninger og elektrisk utstyr er uten skader',
    'Kniver og verneutstyr på maskiner er i orden',
    'Kjemikalier er merket og sikkerhetsdatablad er tilgjengelig',
    'Hyller er stabile og tunge varer lagres lavt',
    'Stiger og trapper er i orden',
    'Garderobe, pauserom og toalett er i orden',
    'Ventilasjon og temperatur er greit',
    'Verneutstyr (hansker, forkle, briller) er tilgjengelig'
  ],
  topics: ['HMS-opplæring ved ansettelse', 'Brannvern og evakuering', 'Førstehjelp', 'Kniv og maskiner', 'Kjemikalier', 'Verneombud (HMS-kurs, 40 timer)', 'HMS for ledere', 'Ansvarlig alkoholservering', 'Håndtering av trusler og vold'],
  kinds: { ulykke: 'Ulykke / skade', nestenulykke: 'Nestenulykke / farlig forhold', sykdom: 'Arbeidsrelatert sykdom', trusler_vold: 'Trusler, vold eller trakassering', annet: 'Annet' },
  laws: [
    ['Arbeidsmiljøloven', 'Hovedloven for arbeidsmiljø: arbeidsgivers plikter, verneombud, arbeidstid, varsling, medvirkning.'],
    ['Internkontrollforskriften', 'Krav til systematisk HMS-arbeid og skriftlig dokumentasjon (§ 5).'],
    ['Forskrift om organisering, ledelse og medvirkning', 'Verneombud, arbeidsmiljøutvalg og bedriftshelsetjeneste.'],
    ['Forskrift om utførelse av arbeid', 'Krav til arbeidsplass, kjemikalier, støy, løft og verneutstyr.'],
    ['Forskrift om brannforebygging', 'Brannvern, slukkeutstyr, rømningsveier og opplæring.'],
    ['Forskrift om elektriske forsyningsanlegg og lavspenningsanlegg', 'Krav til elektrisk anlegg og kontroll.'],
    ['Forskrift om arbeidsplasser og arbeidslokaler', 'Innemiljø, lys, ventilasjon, garderobe, toalett og pauserom.']
  ]
};

/* ---------- IK-alkohol: forslag og standardtekster (alkoholloven, alkoholforskriften kap. 8) ---------- */
window.DATA.alk = {
  bad: ['Ingen følger', 'Merknad', 'Prikker ved kontroll', 'Mange prikker eller advarsel', 'Inndragning av bevilling'],
  badLong: ['Ingen følger', 'Merknad fra kommunen eller politiet', 'Prikker ved kontroll', 'Mange prikker eller advarsel', 'Bevillingen kan bli inndratt'],
  label: { PRP: 'Lav', CP: 'Middels', OPRP: 'Høy', CCP: 'Svært høy', NONE: 'Ikke vurdert' },
  text: {
    PRP: 'Lav risiko. Følg vanlige rutiner. Tiltak er valgfritt.',
    CP: 'Middels risiko. Bør ha et tiltak, og tiltaket bør følges opp.',
    OPRP: 'Høy risiko. Må ha tiltak med ansvarlig og frist, og vises i I dag-listen til det er gjort.',
    CCP: 'Svært høy risiko. Gjør tiltak nå. Brudd kan koste bevillingen.'
  },
  t: { name: 'IK-alkohol', risks: 'Risiko og tiltak', round: 'Skjenkekontroll', hazardQ: 'Hva kan gå galt?', total: 6, reg: 'alkoholforskriften kapittel 8',
    roundIntro: 'Observer en vanlig vakt, helst i travle perioder. Alt er satt til «I orden». Trykk «Avvik» der noe ikke følges. Hvert avvik blir et tiltak med frist om 14 dager.',
    docTitle: 'IK-alkohol-mappe', injured: 'Involverte', trainTitle: 'Opplæring og kunnskapsprøve',
    reviewIntro: 'Gå gjennom systemet jevnlig, og minst én gang i året. Tallene under er hentet automatisk fra siste 12 måneder.',
    seedInfo: 'Fyller inn forslag til ansvar, rutiner og 13 vanlige risikoer for steder med skjenkebevilling, med vurdering og tiltak. Du gjennomgår og retter selv etterpå.',
    incNote: 'Ved kontroll fra kommunen eller politiet: skriv hva som ble kontrollert, eventuelle merknader og prikker. Gjentatte brudd kan føre til inndragning av bevillingen.' },
  goals: [
    'Ingen skjenking til mindreårige eller åpenbart påvirkede.',
    'Alle som skjenker har opplæring før første vakt.',
    'Ingen prikker ved kontroll.',
    'Alle hendelser loggføres samme vakt og følges opp.'
  ],
  roles: [
    ['Bevillingshaver / daglig leder', 'Har ansvaret for at bevillingen og kravene overholdes, og for at internkontrollen fungerer.'],
    ['Styrer', 'Er ansvarlig for skjenkingen i det daglige. Har bestått kunnskapsprøven i alkoholloven.'],
    ['Stedfortreder for styrer', 'Overtar styrers ansvar ved fravær. Har bestått kunnskapsprøven i alkoholloven.'],
    ['Ansvarlig for opplæring', 'Sørger for at alle som skjenker får opplæring og at den registreres.'],
    ['Skjenkepersonale', 'Følger rutinene, kontrollerer alder og nekter servering til påvirkede.'],
    ['Dørvakt', 'Kontrollerer alder og påvirkning ved inngang, og håndterer uro.']
  ],
  participation: 'Ansatte som skjenker er med på å gjennomgå risikoer og rutiner. Rutinene henger synlig for personalet. Hendelser, nektet servering og vanskelige situasjoner tas opp på personalmøte, og alle kan foreslå endringer.',
  avvik: 'Alle som skjenker melder hendelser, vanskelige situasjoner og feil til styrer eller stedfortreder, i appen eller muntlig. Hendelsen loggføres samme vakt: hva skjedde, hvem var involvert og hva ble gjort. Styrer finner årsak, bestemmer tiltak og følger opp til saken er lukket. Åpne hendelser og tiltak vises i leders I dag-liste. Skjenkekontroll og hendelseslogg brukes til å vurdere om rutinene virker. Overtredelser rettes opp og følges opp slik at de ikke gjentas.',
  // [område, risiko, sannsynlighet 0-4, konsekvens 0-4, tiltak]
  hazards: [
    ['Hele stedet', 'Skjenking til person under aldersgrensen (18 år for drikke under 22 %, 20 år for sterkere)', 3, 3, 'Legitimasjon fra alle som ser ut til å være under 25, ved døra og i baren. Bare gyldig legitimasjon med bilde. Nekt ved tvil. Alderspåminnelse i kassa der det er mulig.'],
    ['Hele stedet', 'Skjenking til åpenbart påvirket gjest', 3, 3, 'Dørvakt og servitører følger med gjennom kvelden. Snakk med gjesten, tilby vann og alkoholfritt, nekt servering. Begrens shots og runder i travle perioder. Logg alle nektelser.'],
    ['Hele stedet', 'Skjenking utenfor bevilget skjenketid', 2, 3, 'Siste bestilling ropes ut i god tid. Ansvarlig på vakt sjekker klokka. Utdrikking etter kommunens vilkår.'],
    ['Hele stedet', 'Styrer eller stedfortreder er ikke til stede når det skjenkes', 2, 3, 'Vaktplanen viser navngitt ansvarlig hver vakt. Varslingsrutine hvis vedkommende må forlate stedet.'],
    ['Bar', 'Rabatter og tilbud som oppfordrer til høyt forbruk', 2, 2, 'Tilbud vurderes mot regelverket før de lanseres. Alkoholfrie alternativer og vann er alltid tilgjengelig og til gode priser.'],
    ['Hele stedet', 'Medbrakt alkohol og alkohol tatt med ut av skjenkeområdet', 3, 2, 'Tydelig skilting. Vakt følger med ved inngang og utgang. Glass tas fra gjester som skal ut.'],
    ['Hele stedet', 'Skjenking utenfor området bevillingen gjelder', 2, 2, 'Skjenkeområdet er tydelig avgrenset. Uteservering og ekstra områder avklares med kommunen før de brukes.'],
    ['Hele stedet', 'Ansatte som skjenker mangler opplæring', 2, 3, 'Opplæringsplan. Alle får kurs og gjennomgang av rutiner før første vakt. Opplæring registreres i appen.'],
    ['Hele stedet', 'Bevillingen utløper eller vilkår brytes', 1, 4, 'Utløpsdato ligger i appen og varsler i god tid. Vilkår i bevillingen gjennomgås med styrer og stedfortreder.'],
    ['Hele stedet', 'Omsetningsoppgave og avgift ikke levert til kommunen i tide', 1, 2, 'Årlig påminnelse i I dag-listen. Sjekk frist og skjema hos kommunen.'],
    ['Hele stedet', 'Uro, vold eller narkotika i lokalet', 2, 3, 'Dørvakt og vaktrutine. Kontakt politiet ved vold, trusler eller narkotika. Loggfør hendelsen og snakk om den etterpå.'],
    ['Bar', 'Konflikt når gjest nektes servering', 4, 1, 'Fortell gjesten hvorfor, vær rolig og høflig. Be kollega eller dørvakt om hjelp, tilkall styrer. Refunder forhåndsbetalt drikke.'],
    ['Hele stedet', 'Hendelser loggføres ikke', 3, 2, 'Hendelseslogg føres samme vakt. Styrer gjennomgår loggen ukentlig.']
  ],
  round: [
    'Bevillingen henger synlig og er gyldig',
    'Skjenketidene overholdes',
    'Styrer eller stedfortreder er til stede og ansvarlig',
    'Alderskontroll gjøres, og bare gyldig legitimasjon godtas',
    'Ingen skjenkes når de er åpenbart påvirket',
    'Alkoholfrie alternativer og vann er tilgjengelig',
    'Ingen drikker alkohol utenfor skjenkeområdet',
    'Medbrakt alkohol blir stoppet',
    'Ansatte som skjenker har fått opplæring',
    'Hendelseslogg er ført for forrige vakt'
  ],
  topics: ['Opplæring i alkoholloven (før første vakt)', 'Kunnskapsprøve i alkoholloven (styrer)', 'Kunnskapsprøve i alkoholloven (stedfortreder)', 'Alderskontroll og legitimasjon', 'Håndtering av påvirkede gjester', 'Konflikthåndtering', 'Oppfriskning av rutiner'],
  kinds: { nektet: 'Nektet servering', paavirket: 'Påvirket gjest', alder: 'Alderskontroll eller falsk ID', konflikt: 'Konflikt, vold eller trusler', kontroll: 'Kontroll fra kommune eller politi', annet: 'Annet' },
  laws: [
    ['Alkoholloven', 'Bevilling, aldersgrenser, skjenking til påvirkede, skjenketider, styrer og stedfortreder, kontroll og inndragning.'],
    ['Alkoholforskriften', 'Kunnskapsprøve (kap. 5), internkontroll (kap. 8) og kontroll med bevillinger (kap. 9).'],
    ['Kommunens alkoholpolitiske retningslinjer og bevillingsvilkår', 'Skjenketider, skjenkeområde, vilkår og gebyr varierer fra kommune til kommune. Se vedtaket om bevillingen.'],
    ['Prikktildelingssystemet', 'Brudd ved kontroll gir prikker. For mange prikker kan føre til at bevillingen inndras.']
  ],
  routines: [
    ['alder', 'Alderskontroll', 'Alle som ser ut til å være under 25 år bes om legitimasjon, ved døra og i baren. Vi godtar bare gyldig legitimasjon med bilde (pass, førerkort eller bankkort med bilde). Ved tvil eller falsk ID nektes servering, og hendelsen loggføres. Aldersgrensen er 18 år for drikke under 22 volumprosent og 20 år for sterkere drikke. Kassa minner om alderskontroll der det er mulig.'],
    ['paavirket', 'Påvirkede gjester', 'Vi skjenker aldri til åpenbart påvirkede gjester. Dørvakt og servitører følger med gjennom kvelden. Ved tvil snakker vi med gjesten, tilbyr vann og alkoholfritt, og nekter servering ved behov. Vi begrenser shots og runder i travle perioder. Styrer eller stedfortreder tilkalles ved konflikt. Alle nektelser loggføres.'],
    ['tider', 'Skjenketider', 'Vi skjenker bare innenfor tidene i bevillingen. Siste bestilling ropes ut i god tid. Utdrikking og stenging skjer etter kommunens vilkår. Ansvarlig på vakt kontrollerer at ingen drikker etter at tiden er ute.'],
    ['opplaering', 'Opplæring', 'Alle som skjenker får opplæring i alkoholloven og våre rutiner før første vakt. Styrer og stedfortreder har bestått kunnskapsprøven i alkoholloven. Opplæring registreres i appen, og rutinene frisker vi opp minst én gang i året.'],
    ['konflikt', 'Konflikthåndtering', 'Vi forteller gjester at vi har plikt til å nekte servering. Vi er rolige og høflige. Be kolleger eller dørvakt om hjelp og tilkall styrer eller stedfortreder. Ved vold, trusler eller narkotika kontaktes politiet. Hendelsen loggføres, og vi snakker om den etterpå.'],
    ['ansvar', 'Styrer og stedfortreder på vakt', 'Styrer eller stedfortreder er til stede og ansvarlig hver gang det skjenkes. Vaktplanen viser hvem som har ansvaret. Alle ansatte vet hvordan de når vedkommende.']
  ]
};
window.DATA.hms.t = { name: 'HMS', risks: 'Farer og tiltak', round: 'Vernerunde', hazardQ: 'Hva kan gå galt?', total: 8, reg: 'internkontrollforskriften § 5',
  roundIntro: 'Gå gjennom stedet sammen med verneombud. Alt er satt til «I orden». Trykk «Avvik» der noe mangler. Hvert avvik blir et tiltak med frist om 14 dager.',
  docTitle: 'HMS-mappe', injured: 'Skadet person', trainTitle: 'Opplæring',
  reviewIntro: 'Gå gjennom HMS-arbeidet minst én gang i året (internkontrollforskriften § 5 punkt 8). Tallene under er hentet automatisk fra siste 12 måneder.',
  seedInfo: 'Fyller inn forslag til mål, roller, medvirkning og 16 vanlige farer for serveringssteder med vurdering og tiltak. Du gjennomgår og retter det selv etterpå.',
  incNote: null };
