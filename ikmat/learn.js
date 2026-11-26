/* Opplæring: bolker og quiz. Teksten er forslag og grunnlag. Tilpass til stedet og kontroller mot gjeldende regelverk og kommunens vilkår.
   Alkoholbolkene er bygget på temaene i Helsedirektoratets «Ansvarlig vertskap» (IS-2127) og Oslo kommunes Salutt-kurs.
   Hver bolk har fire quizspørsmål (k = nøkkelpunktet spørsmålet tester, a = indeks til riktig svar i o).
   Øk version på en bolk når innholdet endres vesentlig, så må den signeres på nytt. */
window.DATA.learn = {
  mods: [
    { id: 'mat', name: 'IK-mat' },
    { id: 'alk', name: 'IK-alkohol' },
    { id: 'hms', name: 'HMS' },
    { id: 'rut', name: 'Rutiner i FORTGJORT' }
  ],
  // Områdetyper: kjokken, bar, kafe, lager, annet
  bolker: [
    /* ---------- IK-MAT ---------- */
    { id: 'mat-hygiene', mod: 'mat', v: 1, min: 6, areas: ['kjokken', 'bar', 'kafe', 'lager', 'annet'],
      title: 'Personlig hygiene og sykdom',
      intro: 'Mat blir oftest utrygg på grunn av hender, sykdom og dårlige vaner. Dette gjelder alle som er borti mat, drikke, glass og utstyr.',
      sections: [
        { h: 'Hendene dine', p: ['Vask hendene med såpe og vann før du begynner å jobbe, etter toalettbesøk, etter rå kjøtt, fisk, egg og grønnsaker med jord, etter avfall og etter at du har rørt ansiktet, hår, mobil eller nese.', 'Tørk med papir. Hansker erstatter ikke håndvask. Bytt hansker like ofte som du ville vasket hendene.'] },
        { h: 'Når du er syk', p: ['Du skal ikke jobbe med mat hvis du har oppkast, diaré, eller mistanke om mageinfeksjon. Si fra til leder med en gang.', 'Vent til du har vært symptomfri i to døgn (48 timer) før du er tilbake. Åpne sår dekkes til med plaster og hanske.'] },
        { h: 'Tøy, smykker og vaner', p: ['Rent arbeidstøy hver dag. Hår samles og dekkes der det er krav. Ingen ringer, klokke eller løse smykker i produksjon.', 'Smak med ren skje, aldri fingeren. Rene skjeer for hver smaking.'] }
      ],
      quiz: [
        { k: 'Håndvask', q: 'Når skal du alltid vaske hendene?', o: ['Bare når de ser skitne ut', 'Etter toalettbesøk, rå råvarer og avfall', 'Bare før vakt', 'Hansker gjør at du slipper'], a: 1, w: 'Vask med såpe og vann etter toalett, rå råvarer, avfall og å ha rørt ansikt eller mobil. Hansker erstatter ikke håndvask.' },
        { k: 'Sykdom', q: 'Du har hatt oppkast og diaré i natt. Hva gjør du?', o: ['Jobber, men holder avstand til maten', 'Bruker hansker hele vakten', 'Sier fra til leder og blir hjemme til du har vært symptomfri i to døgn', 'Jobber kun i baren'], a: 2, w: 'Meld fra, og vent til du har vært symptomfri i 48 timer.' },
        { k: 'Hansker og sår', q: 'Du har et lite kutt på fingeren. Hva er riktig?', o: ['Plaster og hanske over, og skift ved behov', 'Ingenting, det er lite', 'Bare plaster', 'Hold fingeren bak ryggen'], a: 0, w: 'Åpne sår dekkes til med plaster og hanske, slik at ingenting kommer i maten.' },
        { k: 'Smaking', q: 'Hvordan smaker du på maten?', o: ['Med fingeren, den er jo ren', 'Med samme skje hver gang', 'Med en ren skje hver gang, aldri fingeren', 'Du smaker aldri'], a: 2, w: 'Bruk en ren skje hver gang. Skjeen vaskes eller byttes før neste smaking.' }
      ] },

    { id: 'mat-temp', mod: 'mat', v: 1, min: 8, areas: ['kjokken', 'kafe', 'lager'],
      title: 'Temperaturer og trygg mat',
      intro: 'Bakterier vokser fort i «faresonen». Grensene i denne planen er styringspunktene du kvitterer for i FORTGJORT.',
      sections: [
        { h: 'Grensene i planen', p: ['Kjøl: maks 4 °C. Frys: maks −18 °C.', 'Varmebehandling: kjernetemperatur minst 75 °C.', 'Varmholding: minst 60 °C.', 'Nedkjøling: ned til maks 4 °C innen tiden som er satt for stedet.'] },
        { h: 'Slik måler du', p: ['Mål kjernetemperatur midt i det tykkeste stedet med rent, kalibrert termometer. Tørk av og desinfiser mellom hver måling.', 'Skriv inn målingen i oppgaven. Utenfor grense gir et avvik automatisk.'] },
        { h: 'Når noe er feil', p: ['Flytt varer til annet kjøleskap. Vurder varene (temperatur og tid). Kast ved tvil. Meld feil på utstyret til leder.', 'Aldri sett varm mat rett i kjøleskapet i store gryter. Del opp, kjøl raskt, merk med dato og innhold.'] }
      ],
      quiz: [
        { k: 'Kjøl og frys', q: 'Hva er grensene for kjøl og frys i planen?', o: ['Kjøl maks 4 °C, frys maks −18 °C', 'Kjøl maks 10 °C, frys maks −5 °C', 'Kjøl maks 8 °C, frys maks −12 °C', 'Kjøl maks 4 °C, frys maks −5 °C'], a: 0, w: 'Kjøl maks 4 °C og frys maks −18 °C.' },
        { k: 'Varmebehandling', q: 'Hvor varm skal kjernen være når retten er varmebehandlet?', o: ['Minst 45 °C', 'Minst 60 °C', 'Minst 75 °C', 'Minst 100 °C'], a: 2, w: 'Kjernetemperatur minst 75 °C. Varmholding er minst 60 °C.' },
        { k: 'Varmholding', q: 'Maten står ferdig på buffet. Hvilken temperatur skal den holde?', o: ['Minst 60 °C', 'Minst 30 °C', 'Maks 4 °C', 'Romtemperatur er greit i to timer'], a: 0, w: 'Varmholding er minst 60 °C. Under det er maten i faresonen.' },
        { k: 'Avvik', q: 'Kjøleskapet viser 9 °C. Hva gjør du?', o: ['Venter og ser om det går ned', 'Flytter varene, vurderer dem, kaster ved tvil og melder feilen', 'Skrur ned temperaturen og går videre', 'Ingenting, kjøl tåler det'], a: 1, w: 'Flytt, vurder, kast ved tvil og meld utstyrsfeil. Målingen gir avvik som følges opp.' }
      ] },

    { id: 'mat-allergener', mod: 'mat', v: 1, min: 6, areas: ['kjokken', 'bar', 'kafe'],
      title: 'Allergener og merking',
      intro: 'Allergi kan være livstruende. Gjesten skal få riktig informasjon hver gang.',
      sections: [
        { h: 'De 14 allergenene', p: ['Gluten (hvete, rug, bygg, havre), krepsdyr, egg, fisk, peanøtter, soya, melk, nøtter, selleri, sennep, sesamfrø, svoveldioksid og sulfitt, lupin, bløtdyr.', 'Det gjelder også sauser, dressinger, buljong, brød, drinker og vin (sulfitt).'] },
        { h: 'Når en gjest sier de har allergi', p: ['Ta det alltid på alvor. Aldri gjett. Sjekk oppskrift og emballasje, eller spør kjøkkensjef eller leder.', 'Er du usikker: si det til gjesten og ikke garanter. Bruk rene redskaper, rent brett og rene hansker så ingenting krysskontamineres.', 'Bruk «Når det skjer»-sjekklisten «Gjest med allergi».'] },
        { h: 'Merking og dato', p: ['Åpnede og ferdige varer merkes med dato og innhold. Utgåtte varer kastes.', 'Allergener holdes adskilt under oppbevaring, og informasjonen til gjester er tydelig.'] }
      ],
      quiz: [
        { k: 'Hvilke allergener', q: 'Hvilket av disse er blant de 14 allergenene?', o: ['Gulrot', 'Sennep', 'Hvitløk', 'Paprika'], a: 1, w: 'Sennep er et av de 14 allergenene. Gulrot, hvitløk og paprika er det ikke.' },
        { k: 'Aldri gjette', q: 'Gjesten spør om en rett inneholder nøtter, og du er usikker. Hva gjør du?', o: ['Sier at den sikkert er trygg', 'Sjekker oppskrift eller spør kjøkkensjef eller leder, og sier fra at du er usikker hvis du ikke finner svar', 'Fjerner nøttene og serverer', 'Sier nei til alt for sikkerhets skyld uten å sjekke'], a: 1, w: 'Aldri gjett. Sjekk, og vær ærlig hvis du ikke kan garantere.' },
        { k: 'Krysskontaminering', q: 'Hva må du gjøre for å unngå krysskontaminering?', o: ['Bruke samme brett så fort det går', 'Rene redskaper, rent brett og rene hansker', 'Tørke med samme klut', 'Gi tilleggsportion'], a: 1, w: 'Rene redskaper og adskilt håndtering så allergenet ikke havner i maten.' },
        { k: 'Drikke', q: 'Hvilken påstand stemmer?', o: ['Allergener finnes bare i mat', 'Vin kan inneholde sulfitt, som er et allergen', 'Drinker er alltid trygge', 'Sauser er aldri et problem'], a: 1, w: 'Sulfitt (svoveldioksid) er et allergen og finnes ofte i vin. Allergener finnes også i sauser og drinker.' }
      ] },

    { id: 'mat-renhold', mod: 'mat', v: 1, min: 6, areas: ['kjokken', 'kafe', 'lager'],
      title: 'Renhold, mottak og skadedyr',
      intro: 'God hygienepraksis gjør at feil ikke oppstår. Dette er de faste rutinene som holder stedet trygt.',
      sections: [
        { h: 'Renhold', p: ['Følg renholdsplanen: hva, hvor ofte og hvem. Kvitter i FORTGJORT når det er gjort.', 'Rengjør først, desinfiser etterpå. Desinfeksjon virker ikke på skitne flater. Følg tid og dosering på middelet.', 'Ølanlegg, isbitmaskin, kaffemaskin, skjærebrett og oppvaskmaskin hører også med.'] },
        { h: 'Mottak av varer', p: ['Kontroller temperatur, dato og emballasje ved levering. Kjølevarer skal ikke stå ute. Avvis eller meld avvik ved feil.', 'Merk og lagre riktig med en gang: kjøl, frys eller tørrlager.'] },
        { h: 'Skadedyr og avfall', p: ['Meld spor av mus, rotter, insekter eller fugler som avvik med en gang. Hold dører lukket og tett.', 'Tøm avfall etter plan og hold avfallsrommet rent.'] }
      ],
      quiz: [
        { k: 'Rengjør før desinfiser', q: 'Hva er rekkefølgen på renhold og desinfeksjon?', o: ['Desinfiser først', 'Rengjør først, desinfiser etterpå', 'Bare desinfiser', 'Bare rengjør med vann'], a: 1, w: 'Desinfeksjon virker ikke på skitne flater. Rengjør først.' },
        { k: 'Mottak', q: 'Leveransen kommer med varm kjølevare. Hva gjør du?', o: ['Tar den inn og sier ingenting', 'Måler temperaturen og melder avvik eller avviser varen', 'Setter den i frysen', 'Venter til sjåføren har gått'], a: 1, w: 'Kontroller ved mottak. Feil gir avvik eller avvisning.' },
        { k: 'Skadedyr', q: 'Du ser musebæsj på lageret. Hva gjør du?', o: ['Feier det opp og glemmer det', 'Melder det som avvik til leder med en gang', 'Venter til neste uke', 'Setter ut mat'], a: 1, w: 'Spor av skadedyr meldes med en gang.' },
        { k: 'Kvittering', q: 'Hvorfor kvitterer du i FORTGJORT når renhold er gjort?', o: ['For å bli ferdig fortere', 'Fordi det dokumenterer at rutinen er fulgt', 'Det er valgfritt og uten betydning', 'Fordi det gir poeng'], a: 1, w: 'Kvitteringen er dokumentasjonen ved tilsyn og for egen oversikt.' }
      ] },

    /* ---------- IK-ALKOHOL (bygget på Salutt og Ansvarlig vertskap) ---------- */
    { id: 'alk-lov', mod: 'alk', v: 1, min: 8, areas: ['bar', 'kafe'],
      title: 'Alkoholloven, ansvar og kontroll',
      intro: 'Den som skjenker alkohol, har et eget ansvar. Du kan bli straffet personlig, og stedet kan miste bevillingen.',
      sections: [
        { h: 'Bevilling og ansvar', p: ['Stedet skjenker i kraft av en bevilling fra kommunen. Bevillingshaver, styrer og stedfortreder har ansvaret for at loven følges. Styrer og stedfortreder må ha bestått kunnskapsprøven i alkoholloven.', 'Bevillingshaver er ansvarlig også for ansattes brudd (objektivt ansvar). Du er likevel selv ansvarlig for det du gjør. Ordre fra overordnede fritar ikke deg for ansvar.'] },
        { h: 'Kontroll og prikker', p: ['Kommune og politi kan kontrollere stedet, også ved testkjøp. Kontrollørene kan komme uanmeldt.', 'Brudd gir prikker. For mange prikker over tid kan gi inndragning av bevillingen i en periode, eller for godt. Grove brudd kan også gi straff for den enkelte (bot eller fengsel).'] },
        { h: 'Kunnskap og opplæring', p: ['Alle som skjenker skal ha opplæring i regelverket før første vakt. Det registreres i denne opplæringen.', 'Kommunen kan kreve kurs som vilkår. Oslo kommune har f.eks. Salutt-kurset for dem som skjenker etter kl. 01, og Helsedirektoratet har nettkurset «Ansvarlig vertskap».'] }
      ],
      quiz: [
        { k: 'Hvem har ansvaret', q: 'Hvem har ansvar for at alkoholloven følges?', o: ['Bare styrer', 'Bevillingshaver og styrer, men også du som skjenker for det du gjør selv', 'Bare politiet', 'Ingen, siden bevillingen dekker alt'], a: 1, w: 'Ansvaret er delt. Du kan bli holdt personlig ansvarlig, og «sjefen sa det» fritar ikke.' },
        { k: 'Prikker og bevilling', q: 'Hva kan skje når stedet bryter reglene gjentatte ganger?', o: ['Ingenting', 'Prikker som kan gi inndragning av bevillingen', 'Bare en muntlig advarsel hver gang', 'Maks en kort pause'], a: 1, w: 'Brudd gir prikker, og for mange prikker kan gi inndragning av bevillingen.' },
        { k: 'Kontroll', q: 'Hva slags kontroll kan stedet få?', o: ['Bare varslet kontroll', 'Kontroll fra kommune og politi, også uanmeldt og med testkjøp', 'Ingen kontroll i hverdagen', 'Kun én kontroll hvert tiende år'], a: 1, w: 'Kontrollørene kan komme uanmeldt, og testkjøp forekommer.' },
        { k: 'Opplæring', q: 'Når skal du ha opplæring i regelverket?', o: ['Etter første måned', 'Før første vakt', 'Bare hvis du blir styrer', 'Aldri, det er kun for ledere'], a: 1, w: 'Alle som skjenker får opplæring før første vakt, og den registreres.' }
      ] },

    { id: 'alk-alder', mod: 'alk', v: 1, min: 6, areas: ['bar', 'kafe'],
      title: 'Aldersgrenser og legitimasjon',
      intro: 'Skjenking til mindreårige gir alvorlige sanksjoner. Her er reglene og slik kontrollerer du alder riktig.',
      sections: [
        { h: 'Aldersgrensene', p: ['18 år: drikke under 22 volumprosent (øl, vin, rusbrus og alkoholsvak drikk som lettøl).', '20 år: drikke på 22 volumprosent eller mer (brennevin og sterke drinker).', 'Stedet kan sette strengere grenser enn loven.'] },
        { h: 'ID-kontroll', p: ['Be om legitimasjon ved tvil. Helsedirektoratet anbefaler å kontrollere alle som ser ut til å være under 25.', 'Godkjent: pass, bankkort med bilde, førerkort og asylsøkerbevis med bilde. Se på bildet, fødselsdato og at kortet er ekte og gyldig.', 'Ingen ID, ingen alkohol. Heller nei én gang for mye enn ja én gang for lite.'] },
        { h: 'Mindreårige på stedet', p: ['Mindreårige kan være til stede, men får ikke alkohol, heller ikke alkohol som en annen har bestilt til dem.', 'Hvis du mistenker at en voksen kjøper til en mindreårig, nekter du å servere.'] }
      ],
      quiz: [
        { k: 'Grensene', q: 'Hvilken aldersgrense gjelder for brennevin?', o: ['16 år', '18 år', '20 år', '21 år'], a: 2, w: '18 år for drikke under 22 %, 20 år for 22 % og over.' },
        { k: 'Lettøl', q: 'Hvilken aldersgrense gjelder for lettøl og annen alkoholsvak drikk?', o: ['Ingen', '16 år', '18 år', '20 år'], a: 2, w: 'Alkoholsvak drikk følger 18-årsgrensen.' },
        { k: 'ID-kontroll', q: 'Hvem bør du be om legitimasjon fra?', o: ['Alle som ser ut til å være under 25 og alle du er i tvil om', 'Bare de som ser under 16 ut', 'Bare nye gjester', 'Ingen, det er dørvaktens jobb'], a: 0, w: 'Kontroller ved tvil og for alle som ser ut til å være under 25.' },
        { k: 'Kjøper til andre', q: 'En voksen bestiller til en mindreårig ved bordet. Hva gjør du?', o: ['Serverer, den voksne har ansvaret', 'Nekter å servere alkohol til den mindreårige', 'Serverer svak drikk', 'Lar gjesten ordne det selv'], a: 1, w: 'Mindreårige skal ikke få alkohol, heller ikke via andre.' }
      ] },

    { id: 'alk-paavirket', mod: 'alk', v: 1, min: 8, areas: ['bar', 'kafe'],
      title: 'Påvirkede gjester: nekt og hjelp',
      intro: 'Å skjenke til åpenbart påvirkede er det vanligste bruddet, og et av de alvorligste.',
      sections: [
        { h: 'Forbudet', p: ['Du skal ikke skjenke til personer som er åpenbart påvirket, eller skjenke slik at de blir det.', 'Åpenbart påvirket kan være sløret tale, ustø gange, aggressiv eller usammenhengende oppførsel, sove i stolen, søle eller miste ting.', 'Sitter en åpenbart påvirket gjest ved et bord, skal ingen ved bordet få alkohol før vedkommende er ute.'] },
        { h: 'Aktivitets- og bistandsplikt', p: ['Du har plikt til å følge med gjennom kvelden og gripe inn tidlig. Ikke vent til gjesten er veldig full.', 'Åpenbart påvirkede slipper ikke inn. Er gjesten for påvirket til å komme seg hjem trygt, hjelper stedet gjesten ut: kollega, drosje, pårørende, eller politiet ved fare.'] },
        { h: 'Slik nekter du', p: ['Vær rolig, høflig og tydelig. Fortell hvorfor. Tilby vann eller alkoholfritt. Bruk «jeg»-setninger: «Jeg kan ikke servere deg mer nå».', 'Ta med en kollega ved konflikt. Logg nektelsen. Bruk sjekklisten «Beruset gjest» i «Når det skjer».'] }
      ],
      quiz: [
        { k: 'Forbudet', q: 'Hva er forbudet?', o: ['Å skjenke til åpenbart påvirkede', 'Å skjenke mer enn fem drinker', 'Å skjenke til folk fra andre kommuner', 'Å skjenke til gjester som er alene'], a: 0, w: 'Det er forbudt å skjenke til åpenbart påvirkede, eller skjenke slik at de blir det.' },
        { k: 'Tegn', q: 'Hva er et tydelig tegn på påvirkning?', o: ['Gjesten er trøtt og stille', 'Sløret tale, ustø gange eller aggressiv oppførsel', 'Gjesten bestiller vann', 'Gjesten er høflig'], a: 1, w: 'Sløret tale, ustøhet og endret oppførsel er tegn på åpenbar påvirkning.' },
        { k: 'Bordet', q: 'Én ved bordet er åpenbart påvirket. Hva med de andre?', o: ['De får servering som vanlig', 'Ingen ved bordet får alkohol før vedkommende er fjernet', 'De får bare øl', 'De får bare vin'], a: 1, w: 'Ingen ved bordet skal få alkohol før den påvirkede er fjernet.' },
        { k: 'Hjelp', q: 'En påvirket gjest må ut. Hva er stedets plikt?', o: ['Ingenting etter at gjesten er utenfor', 'Hjelpe gjesten trygt ut, f.eks. drosje eller pårørende, og tilkalle politi ved fare', 'Be gjesten gå hjem til fots', 'Skjenke én til'], a: 1, w: 'Stedet har bistandsplikt og må sørge for at gjesten kommer seg trygt ut.' }
      ] },

    { id: 'alk-tid', mod: 'alk', v: 1, min: 7, areas: ['bar', 'kafe'],
      title: 'Skjenketid, reklame og internkontroll',
      intro: 'Regler for når, hvordan og hva som kan skjenkes og markedsføres, og hvordan stedet dokumenterer at reglene følges.',
      sections: [
        { h: 'Skjenketid og siste runde', p: ['Kommunen fastsetter skjenketiden for stedet i bevillingen. Loven setter ytterkanten: ingen skjenking etter kl. 03.00.', 'Gjester får maks 30 minutter etter skjenketidens slutt til å drikke ut. Ingen ny alkohol serveres etter at tiden er over. Rop ut siste bestilling i god tid. Slå opp stedets bevillingsvedtak for eksakt tid.'] },
        { h: 'Reklame og tilbud', p: ['Reklame for alkohol er forbudt, også i sosiale medier. Happy hour og klippekort kan brukes, men ikke annonseres.', 'Alkoholfrie alternativer og vann skal være tilgjengelig, og stå på skjenkekartet. Ingen medbrakt alkohol inn, og ingen alkohol ut av skjenkeområdet.'] },
        { h: 'Internkontroll (IK-alkohol)', p: ['Alle steder må ha rutiner som sikrer at loven følges, og dokumentere at de virker. Det gjør du ved å kvittere i FORTGJORT, loggføre hendelser samme vakt og melde avvik.', 'Diskriminering av gjester kan føre til at bevillingen inndras. Alle behandles likt.'] }
      ],
      quiz: [
        { k: 'Skjenketid', q: 'Hvem bestemmer skjenketiden for stedet?', o: ['Kommunen, i bevillingen. Loven setter ytterkanten', 'Du selv', 'Gjestene', 'Leverandøren'], a: 0, w: 'Skjenketiden står i bevillingen. Aldri skjenk etter kl. 03.00.' },
        { k: 'Utdrikking', q: 'Skjenketiden er over. Hva gjelder?', o: ['Gjester kan drikke ut i opptil 30 minutter, men får ingen ny alkohol', 'Gjester kan bestille én til', 'Gjester må forlate stedet umiddelbart og betale', 'Det er ikke noen grense'], a: 0, w: 'Maks 30 minutter til å drikke ut, men ingen ny alkohol.' },
        { k: 'Reklame', q: 'Hva gjelder for alkoholreklame?', o: ['Det er tillatt på Instagram', 'Forbudt, også i sosiale medier', 'Tillatt om det er et tilbud', 'Tillatt for øl'], a: 1, w: 'Reklame for alkohol er forbudt, også i sosiale medier. Tilbud kan ikke annonseres.' },
        { k: 'Alkoholfritt', q: 'Hva må stedet ha på menyen?', o: ['Ingenting', 'Et rimelig utvalg alkoholfrie alternativer', 'Kun vann på forespørsel', 'Bare brus'], a: 1, w: 'Alkoholfrie alternativer skal være tilgjengelige og stå på skjenkekartet.' }
      ] },

    { id: 'alk-sikkerhet', mod: 'alk', v: 1, min: 6, areas: ['bar', 'kafe'],
      title: 'Konflikt, narkotika og sikkerhet',
      intro: 'Uro, rus og trusler hører til jobben noen kvelder. Du skal vite hva du gjør, og når du skal be om hjelp.',
      sections: [
        { h: 'Rolig kommunikasjon', p: ['Bruk rolig stemme og enkle jeg-setninger. Vær konkret. Unngå å rope, bebreide og stille krav.', 'Kroppsspråk betyr mye. Hold avstand, ikke pek, ikke bli stående alene. Gi gjesten en mulighet til å trekke seg uten å miste ansikt.'] },
        { h: 'Narkotika', p: ['Stedet må forhindre salg og bruk av narkotika. Bevillingen kan inndras hvis det forekommer.', 'Ved mistanke: gripe inn, si fra til vakthavende, og politiet ringes ved salg eller grov bruk. Loggfør hendelsen.'] },
        { h: 'Trusler og vold', p: ['Trekk deg ut av situasjonen når du kan. Ring 112 ved trussel eller vold. Ring 113 hvis noen er skadet. Aldri slåss eller bruk makt utover det som er nødvendig.', 'Snakk om hendelsen med kolleger og leder etterpå, og logg den. Ta kontakt med leder hvis du trenger støtte.'] }
      ],
      quiz: [
        { k: 'Kommunikasjon', q: 'Hvordan snakker du til en irritert gjest?', o: ['Roper høyere enn gjesten', 'Rolig, med «jeg»-setninger og konkret språk', 'Ler det bort', 'Krever at gjesten går'], a: 1, w: 'Rolig stemme, jeg-setninger og konkrete formuleringer.' },
        { k: 'Narkotika', q: 'Du ser salg av narkotika på stedet. Hva gjør du?', o: ['Ignorerer det', 'Sier fra til vakthavende og kontakter politiet', 'Kjøper selv', 'Spør gjesten pent om å slutte, og det er alt'], a: 1, w: 'Stedet skal forhindre narkotika. Meld fra, og politiet kontaktes.' },
        { k: 'Trusler', q: 'Gjesten truer deg. Hva er riktig?', o: ['Svarer med samme tone', 'Trekker deg unna, tilkaller hjelp og ringer 112 ved trussel eller vold', 'Blir alene med gjesten', 'Venter og håper det går over'], a: 1, w: 'Trekk deg unna og få hjelp. Ring 112 ved trussel eller vold, 113 ved skade.' },
        { k: 'Etterarbeid', q: 'Hva gjør du etter en vond hendelse?', o: ['Glemmer den', 'Logger den og snakker med leder eller kolleger', 'Sier ingenting', 'Sletter loggen'], a: 1, w: 'Hendelser loggføres samme vakt, og du snakker om dem etterpå.' }
      ] },

    /* ---------- HMS ---------- */
    { id: 'hms-melde', mod: 'hms', v: 1, min: 5, areas: ['kjokken', 'bar', 'kafe', 'lager', 'annet'],
      title: 'HMS: din rolle, melding og varsling',
      intro: 'HMS er alles ansvar. Du er med på å gjøre stedet trygt, og du har rett til et trygt arbeidsmiljø.',
      sections: [
        { h: 'Roller', p: ['Arbeidsgiver har det overordnede ansvaret. Verneombudet ivaretar de ansattes interesser. Brannansvarlig og førstehjelpsansvarlig har hvert sitt område.', 'Du skal følge rutiner, bruke verneutstyr, og si fra om farlige forhold.'] },
        { h: 'Meld alltid', p: ['Meld ulykker, skader, nestenulykker og farlige forhold til leder så snart som mulig, i appen eller muntlig. Nestenulykker er gratis lærdom.', 'Ingen skal få problemer for å melde.'] },
        { h: 'Varsling', p: ['Du kan varsle om kritikkverdige forhold, som trakassering, lovbrudd eller farlige forhold. Gå til leder, verneombud eller den som mottar varsler. Varslere har vern mot gjengjeldelse.', 'HMS er fast tema på personalmøte. Alle kan foreslå forbedringer.'] }
      ],
      quiz: [
        { k: 'Melde', q: 'Du var nær ved å skade deg på en glatt gulvflate. Hva gjør du?', o: ['Ingenting, det gikk bra', 'Melder nestenulykken til leder', 'Venter til noen faktisk skader seg', 'Prater om det på sosiale medier'], a: 1, w: 'Nestenulykker meldes. Det forebygger neste ulykke.' },
        { k: 'Verneombud', q: 'Hva gjør verneombudet?', o: ['Fører regnskap', 'Ivaretar de ansattes interesser i HMS-arbeidet', 'Ansetter folk', 'Kontrollerer gjester'], a: 1, w: 'Verneombudet ivaretar de ansattes interesser og deltar i vernerunder og risikovurdering.' },
        { k: 'Varsling', q: 'Du opplever trakassering på jobben. Hvem kan du varsle?', o: ['Ingen', 'Leder, verneombud eller mottaker av varsler', 'Bare kollegaer', 'Bare gjester'], a: 1, w: 'Du kan gå til leder, verneombud eller den som tar imot varsler.' },
        { k: 'Vern', q: 'Hva gjelder for den som melder fra om kritikkverdige forhold?', o: ['Kan oppsies uten grunn', 'Har vern mot gjengjeldelse', 'Må betale for undersøkelsen', 'Må melde anonymt'], a: 1, w: 'Varslere er vernet mot gjengjeldelse.' }
      ] },

    { id: 'hms-brann', mod: 'hms', v: 1, min: 7, areas: ['kjokken', 'bar', 'kafe', 'lager', 'annet'],
      title: 'Brann og førstehjelp',
      intro: 'Brann og akutt sykdom kan skje når som helst. Du skal vite hva du gjør de første minuttene.',
      sections: [
        { h: 'Brann', p: ['Varsle, redd, slukk, evakuer. Varsle alle i nærheten og ring 110. Hjelp gjester ut. Slukk bare hvis det er trygt.', 'Fettbrann slukkes aldri med vann. Skru av varmen og dekk med lokk eller brannteppe.', 'Kjenn rømningsveiene og møteplassen. Hold dem frie og døren ulåst under åpningstid. Kjenn plasseringen av slukkeutstyr og brannvarslere.'] },
        { h: 'Førstehjelp', p: ['Sikre stedet, sjekk om personen reagerer og puster. Ring 113 ved alvorlig sykdom eller skade. Start hjertekompresjoner og hent hjertestarter hvis personen ikke puster normalt.', 'Ved småskader: førstehjelpsutstyret ligger i skapet. Skadede loggføres som hendelse.'] },
        { h: 'Nødnumre', p: ['110 brann. 112 politi. 113 ambulanse. Nødnumrene henger synlig. Gi adresse, hva som har skjedd og antall skadde.'] }
      ],
      quiz: [
        { k: 'Fettbrann', q: 'Det brenner i frityrgryta. Hva gjør du?', o: ['Heller vann på', 'Skrur av varmen og dekker med lokk eller brannteppe', 'Bærer gryta ut', 'Blåser på flammene'], a: 1, w: 'Fettbrann slukkes aldri med vann. Dekk til og skru av varmen.' },
        { k: 'Nødnummer', q: 'Hvilket nummer ringer du for ambulanse?', o: ['110', '112', '113', '114'], a: 2, w: '113 er ambulanse, 110 brann og 112 politi.' },
        { k: 'Rømning', q: 'Hva gjelder for rømningsveier?', o: ['De kan brukes som lager', 'De holdes frie og ulåste under åpningstid', 'De låses etter kl. 22', 'Bare ledere kjenner dem'], a: 1, w: 'Rømningsveier skal alltid være frie. Alle skal kjenne dem og møteplassen.' },
        { k: 'Første minutter', q: 'En gjest faller sammen og puster ikke normalt. Hva gjør du først?', o: ['Venter og ser', 'Ringer 113, starter hjertekompresjoner og henter hjertestarter', 'Gir vann', 'Hjelper gjesten til et annet rom uten å sjekke'], a: 1, w: 'Ring 113, start kompresjoner og hent hjertestarter.' }
      ] },

    { id: 'hms-kropp', mod: 'hms', v: 1, min: 6, areas: ['kjokken', 'bar', 'kafe', 'lager'],
      title: 'Kniv, varme, løft og kjemikalier',
      intro: 'De vanligste skadene er kutt, brannskader, fall, tunge løft og kjemikalier. Her er rutinene som forebygger dem.',
      sections: [
        { h: 'Kniver og maskiner', p: ['Skarpe kniver er tryggere enn sløve. Bruk riktig kniv, riktig brett, og bær kniven med spissen ned. Aldri la kniv ligge i vaskevannet.', 'Verneutstyr på maskiner skal ikke fjernes. Bruk kuttsikre hansker ved mandolin.'] },
        { h: 'Varme og fall', p: ['Si «varmt!» når du bærer varme ting. Ikke bær varm væske gjennom trange rom. Bruk riktig arbeidstøy og sklisikre sko.', 'Tørk opp søl med en gang. Hold gulv og ganger frie.'] },
        { h: 'Løft og kjemikalier', p: ['Bruk tralle, del opp tunge kolli og løft med rett rygg. Tunge varer lagres lavt. Bruk godkjent stige.', 'Kjemikalier skal være merket, med sikkerhetsdatablad tilgjengelig. Bruk hansker og vernebriller. Bland aldri produkter.'] }
      ],
      quiz: [
        { k: 'Kniv', q: 'Hva er riktig med kniver?', o: ['En sløv kniv er tryggere', 'Skarp kniv, riktig brett, og aldri i vaskevannet', 'Kast dem i oppvasken', 'Bær kniven med spissen opp'], a: 1, w: 'Skarpe kniver er tryggere. Aldri la dem ligge i vaskevannet.' },
        { k: 'Varme', q: 'Du bærer en varm gryte gjennom kjøkkenet. Hva gjør du?', o: ['Løper', 'Sier «varmt!» og går rolig', 'Går baklengs', 'Lukker øynene'], a: 1, w: 'Varsle kolleger når du bærer varmt, og gå rolig.' },
        { k: 'Løft', q: 'Hvordan bør du løfte tungt?', o: ['Rett rygg, bruk tralle og del opp', 'Bøy ryggen og løft raskt', 'Stå øverst på stigen', 'Løft alene uansett vekt'], a: 0, w: 'Bruk tralle, del opp tunge kolli og hold ryggen rett.' },
        { k: 'Kjemikalier', q: 'Hva gjelder for kjemikalier?', o: ['Bland for bedre effekt', 'Merk, bruk verneutstyr, og aldri bland produkter', 'Hell om til brusflasker', 'Lukt på dem for å kjenne igjen'], a: 1, w: 'Merk riktig, bruk hansker og briller, og bland aldri produkter.' }
      ] },

    { id: 'hms-trygg', mod: 'hms', v: 1, min: 5, areas: ['bar', 'kafe', 'kjokken'],
      title: 'Trusler, vold, trakassering og alenearbeid',
      intro: 'Alle har rett til å føle seg trygge på jobb. Det gjelder både fra gjester og fra kolleger.',
      sections: [
        { h: 'Nulltoleranse', p: ['Trakassering, uønsket seksuell oppmerksomhet, trusler og vold aksepteres ikke, verken fra gjester eller kolleger.', 'Du skal ikke stå alene med en plagsom gjest. Be om hjelp og fortell hva som skjedde.'] },
        { h: 'Alenearbeid', p: ['Ha mobil med deg. Noen skal vite når du går og at du har kommet frem. Ikke vær alene ved stenging når det kan unngås.', 'Avklar hvem som tilkaller hjelp og politi.'] },
        { h: 'Etterpå', p: ['Meld hendelsen samme vakt, så leder kan følge opp. Snakk om den, og be om støtte hvis du trenger det.'] }
      ],
      quiz: [
        { k: 'Nulltoleranse', q: 'Hva gjelder for trakassering og trusler?', o: ['Det må aksepteres fra gjester', 'Det aksepteres ikke, fra hverken gjester eller kolleger', 'Det er greit hvis gjesten er full', 'Det er ikke leder sitt ansvar'], a: 1, w: 'Nulltoleranse mot trakassering, trusler og vold.' },
        { k: 'Plagsom gjest', q: 'En gjest er plagsom og tar på deg. Hva gjør du?', o: ['Står alene og tåler det', 'Ber kollega om hjelp og melder det til leder', 'Skjenker mer', 'Ler det bort'], a: 1, w: 'Du skal ikke stå alene med en plagsom gjest. Be om hjelp og meld fra.' },
        { k: 'Alenearbeid', q: 'Hva er viktig ved alenearbeid?', o: ['Mobil tilgjengelig og at noen vet når du går og har kommet frem', 'Slå av mobilen', 'Gå uten å si fra', 'Låse deg inne uten rømningsvei'], a: 0, w: 'Ha mobil, og la noen vite om deg.' },
        { k: 'Melding', q: 'Når melder du en vond hendelse?', o: ['Aldri', 'Samme vakt, så leder kan følge opp', 'Om ett år', 'Bare hvis du blir skadet'], a: 1, w: 'Meld samme vakt, så den kan loggføres og følges opp.' }
      ] },

    /* ---------- RUTINER ---------- */
    { id: 'rut-bruk', mod: 'rut', v: 1, min: 6, areas: ['kjokken', 'bar', 'kafe', 'lager', 'annet'],
      title: 'Slik bruker du FORTGJORT',
      intro: 'Appen er arbeidsverktøyet ditt og dokumentasjonen stedet har overfor tilsyn. Det du kvitterer, blir en logg som ikke kan endres.',
      sections: [
        { h: 'I dag', p: ['Under «I dag» ser du oppgavene som gjelder. Velg «Jeg dekker i dag» for å se oppgavene i områdene du jobber i. Resten ligger under «Andre rutiner».', 'Trykk på ruten for å kvittere. Måleoppgaver krever en verdi. Er verdien utenfor grensen, lages det et avvik automatisk.'] },
        { h: 'Hopp over, ikke registrert', p: ['Kan du ikke gjøre en oppgave, bruker du «Hopp over eller utsett» og skriver en begrunnelse. Det er et aktivt valg som logges.', 'Daglige oppgaver du ikke har kvittert for når dagen er over, logges som «ikke registrert». Andre oppgaver følger deg til dagens liste.'] },
        { h: 'Avvik og «Når det skjer»', p: ['Avvik er noe som ikke er som det skal. Registrer det under «Avvik» med hva som skjedde og hva du gjorde.', 'Under Planlegging finner du sjekklister du åpner når noe skjer, som varemottak, allergi, temperatur utenfor grense eller beruset gjest. Hver gjennomføring logges.'] }
      ],
      quiz: [
        { k: 'Kvittering', q: 'Hva skjer når du kvitterer en måleoppgave utenfor grensen?', o: ['Ingenting', 'Det opprettes et avvik automatisk', 'Oppgaven slettes', 'Du får poeng'], a: 1, w: 'Måling utenfor grense gir automatisk avvik.' },
        { k: 'Hopp over', q: 'Du kan ikke gjøre en oppgave. Hva er riktig?', o: ['Kvittere som gjort', 'Bruke «Hopp over eller utsett» og skrive begrunnelse', 'Slette oppgaven', 'Ikke gjøre noe'], a: 1, w: 'Hopp over er et aktivt valg med begrunnelse. Det logges.' },
        { k: 'Ikke registrert', q: 'Hva skjer med daglige oppgaver du ikke kvitterte for i går?', o: ['De ligger i listen for alltid', 'De logges som «ikke registrert»', 'De regnes som gjort', 'De flyttes til neste års plan'], a: 1, w: 'Daglige rutiner som ikke er kvittert når dagen er over, logges som ikke registrert.' },
        { k: 'Når det skjer', q: 'Hvor finner du sjekklister for hendelser som varemottak og beruset gjest?', o: ['Under Planlegging, i «Når det skjer»', 'I Kalender', 'I Avvik', 'På innlogging'], a: 0, w: 'Sjekklistene ligger under Planlegging i «Når det skjer», og hver gjennomføring logges.' }
      ] }
  ]
};
