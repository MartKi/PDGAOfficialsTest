# Promptplan: PDGA regel-quiz som PWA

Seks prompts fordelt på fire sessioner. Kør dem i rækkefølge.
Efter hver prompt: tjek acceptkriteriet, før du går videre.

---

## Før du starter

```bash
mkdir pdga-quiz && cd pdga-quiz
git init
claude
```

---

# SESSION 1: fundament og app-skal

## Prompt 1 af 6: opsætning og rammer

```
Vi skal bygge en PWA til træning til PDGA Certified Rules Official-eksamen.
Start med at oprette projektrammerne, ikke selve appen endnu.

1. Opret CLAUDE.md i projektroden med disse faste rammer:
   - Al UI-tekst og alt indhold er på dansk
   - Ingen backend, ingen login, ingen eksterne API-kald i den færdige app
   - Al data ligger lokalt i IndexedDB via Dexie
   - PDGA's regeltekst må ALDRIG kopieres ind i appen.
     Kun mine egne resuméer plus regelnummer og link til pdga.com
   - Commit efter hvert færdigt delmål, med kort beskrivende besked
   - Mørkt tema, store touch-venlige knapper, appen bruges på iPhone
   - Ingen tankestreger i dansk brødtekst

2. Opret et tomt Vite-projekt med React og TypeScript, tilføj Tailwind
   og Dexie. Kør en build for at bekræfte at alt virker.

3. git commit.

Vis mig CLAUDE.md og bekræft at build kører, før du går videre.
```

**Acceptkriterie:** `npm run dev` starter, og du ser en tom side.

---

## Prompt 2 af 6: hele app-skallen

```
Byg nu selve appen.

TRE TILSTANDE

1. "På banen" (standardvisning ved åbning)
   - Stort søgefelt øverst
   - Under søgefeltet en liste med de 15 mest almindelige
     tvivlssituationer som store knapper
   - Hver situation åbnes til ét skærmbillede uden scroll:
     overskrift, afgørelse i 1 til 2 linjer, straffekast ja/nej,
     regelnummer, og et "mere"-felt der kan foldes ud
   - Skal virke 100 procent offline, ingen animationer,
     ingen indlæsningstid
   - Indholdet lægges i src/data/banesituationer.json.
     Lav 3 eksempler nu, resten kommer senere

2. Eksamenssimulering
   - 25 spørgsmål trukket tilfældigt, vægtet efter en
     kategorifordeling defineret i src/config/eksamen.ts
   - Ingen feedback undervejs
   - Alle svar vises til sidst med forklaring og regelreference
   - Resultat gemmes i historik: dato, samlet score, score pr. kategori

3. Træningstilstand
   - Vælg antal spørgsmål (5, 10, 20) og eventuelt specifikke kategorier
   - Knappen "Forfaldne spørgsmål" trækker kun spørgsmål der er due
     i spaced repetition
   - Øjeblikkelig feedback efter hvert svar med forklaring og regelnummer
   - Knappen "Forklar reglen først": svarmulighederne skjules indtil
     jeg trykker videre, så jeg selv skal tænke svaret først

SPACED REPETITION
- Leitner med 5 bokse. Korrekt svar rykker én boks op,
  forkert svar rykker tilbage til boks 1
- Intervaller: 1, 3, 7, 14, 30 dage
- Både eksamen og træning opdaterer bokse

ANTI-GENKENDELSE
- Bland rækkefølgen af de fire svarmuligheder ved hver visning
  og opdater det korrekte indeks dynamisk

REGELOPSLAG (fjerde fane)
- Søgbar liste over regelafsnit: regelnummer, dansk overskrift,
  mit resumé, eksternt link til pdga.com
- Kopiér ikke officiel regeltekst

STATISTIK (femte fane)
- Rigtig-procent pr. kategori, farvekodet
- Graf over eksamensresultater over tid
- Liste over de spørgsmål jeg oftest svarer forkert på

DATA
- Spørgsmål i src/data/questions.json, indlæses i Dexie ved første start
- Definér og validér JSON-skema ved indlæsning
- Skema: id, kategori, spoergsmaal, svar (4 stk.), korrekt,
  forklaring, regel, kilde, verificeret (boolean)
- Vis en lille markering i UI på spørgsmål hvor verificeret er false
- Seed med 15 eksempelspørgsmål fordelt på kategorierne
- Importfunktion hvor jeg kan indsætte JSON og tilføje flere
  spørgsmål uden at bygge appen om

KATEGORIER
kastning og stance, lie og marker, OB og hazard,
obstakler og lempelse, straf og misplay, putting og Circle 1,
etikette 810, Competition Manual

PWA
- Manifest, service worker, installerbar på iOS-hjemmeskærm,
  virker offline
- Skriv en README med hvordan jeg kører lokalt og deployer
  til Netlify eller Vercel
```

**Acceptkriterie:** Alle fem faner virker med de 15 seed-spørgsmål. Test på din iPhone, læg den på hjemmeskærmen, og slå flytilstand til for at bekræfte at den kører offline. Gå ikke videre før det virker.

---

# SESSION 2: spørgsmål, del A

Start ny session i samme mappe.

## Prompt 3 af 6: 114 spørgsmål

```
Vi skal generere spørgsmålsbanken. Den bliver delt over to sessioner.
Dette er session A.

FØRST
Opret src/data/GENERERING.md med:
- Fuld kategoriliste og målantal
- Tabel med kolonner: kategori, målantal, genereret, status, filnavne
- Afsnittet "Konventioner" hvor du noterer det spørgsmålsformat og
  de variationstyper du bruger, så session B kan matche stilen
Opdater filen efter HVER batch. Det er min eneste kilde til
hvad der mangler.

MÅL FOR HELE BANKEN (begge sessioner, 200 i alt)
Kastning og stance 30, lie og marker 30, OB og hazard 30,
obstakler og lempelse 24, straf og misplay 24,
putting og Circle 1 20, etikette 810 20, Competition Manual 22

DENNE SESSION LAVER KUN
Kastning og stance 30, lie og marker 30, OB og hazard 30,
obstakler og lempelse 24. I alt 114.

FREMGANGSMÅDE
1. Slå den aktuelle Official Rules of Disc Golf op på pdga.com og
   lav en liste over alle relevante regelnumre i kategorien, FØR du
   skriver spørgsmål. Skriv listen ind i GENERERING.md
2. Maks 30 spørgsmål pr. batch, én kategori ad gangen
3. Skriv til src/data/batches/<kategori>-01.json
4. git commit efter hver færdig batch
5. Opdater GENERERING.md før du går videre til næste kategori

KRAV TIL SPØRGSMÅLENE
- Situationsbaserede, ikke udenadslære. Beskriv en konkret
  banesituation og spørg hvad der er korrekt afgørelse
- Alle fire svarmuligheder skal være plausible. Distraktorerne skal
  afspejle almindelige misforståelser, ikke være åbenlyst forkerte
- Varier hvilket bogstav der er korrekt
- Ingen "alle ovenstående" eller "ingen af ovenstående"
- Forklaring 2 til 4 sætninger på dansk i egne ord.
  Kopiér ikke PDGA's regeltekst ordret
- Verificér hvert regelnummer på pdga.com. Gæt aldrig et regelnummer
- Sæt "verificeret": false hvis du er det mindste i tvivl om reglen
- Dæk alle regelnumre i kategorien mindst én gang, før du
  laver variationer. Bredde før dybde

VARIATIONSTYPER pr. regel
- Hvad er den korrekte afgørelse?
- Hvor mange straffekast?
- Hvor placeres lien?
- Hvad gør en official i denne situation?
- Hvilken af fire situationer er IKKE en overtrædelse?

STOP når de fire kategorier er færdige og skriv en kort
opsummering af hvad der mangler, direkte i GENERERING.md.
```

**Acceptkriterie:** 114 spørgsmål i `src/data/batches/`, GENERERING.md er opdateret, alt er committet.

---

# SESSION 3: spørgsmål, del B

Ny session.

## Prompt 4 af 6: 86 spørgsmål og fletning

```
Fortsættelse af spørgsmålsgenereringen. Dette er session B.

FØRST
Læs src/data/GENERERING.md og alle filer i src/data/batches/.
Rapportér hvad der allerede er lavet og hvad der mangler,
FØR du skriver noget nyt. Følg konventionerne i GENERERING.md,
så stilen matcher session A.

DENNE SESSION LAVER
Straf og misplay 24, putting og Circle 1 20, etikette 810 20,
Competition Manual 22. I alt 86.

Competition Manual-spørgsmålene skal baseres på Competition Manual,
ikke Official Rules. Verificér på pdga.com.

Samme format, samme krav, samme batch-fremgangsmåde som session A.
Opdater GENERERING.md efter hver batch og commit undervejs.

TIL SIDST: byg scripts/merge-questions.js som skal
- flette alle batchfiler til src/data/questions.json
- tildele fortløbende id'er q-0001 og frem
- fejle hvis to spørgsmål har samme regelnummer og næsten identisk
  spørgsmålstekst
- printe optælling pr. kategori mod målantallet
- printe en liste over alle spørgsmål med "verificeret": false

Kør scriptet, vis mig outputtet, og bekræft at appen starter
med den fulde bank på 200 spørgsmål.
```

**Acceptkriterie:** 200 spørgsmål i appen. Tag en eksamenssimulering og se om spørgsmålene giver mening.

---

# SESSION 4: bane-tilstand og afslutning

Ny session.

## Prompt 5 af 6: de 15 banesituationer

```
Udfyld nu src/data/banesituationer.json med alle 15 situationer.

DE 15
OB og hvor lien placeres, tabt disc og 3 minutter, disc i træ over
jorden, missed mando, falling putt inden for 10 meter, stance og
støttepunkter, markerdisc, uspilleligt lie, casual relief og
farligt lie, provisorisk kast, 30 sekunder til at kaste, flyttet
disc og interferens, øvekast, courtesy-advarsel og straf,
scorekortfejl og deadline

FORMAT PR. SITUATION
{ "id", "titel", "afgoerelse" (maks 2 linjer),
  "straffekast": "0" | "1" | "afhænger", "regel", "uddybning",
  "soegeord": [], "kilde", "verificeret": false }

KRAV
- Verificér hvert regelnummer på pdga.com. Dette er det indhold
  jeg bruger som spotter, så præcision går før mængde
- Afgørelsen skal kunne læses på under 5 sekunder
- Uddybningen håndterer de almindelige undtagelser
- Søgeord skal indeholde både danske og engelske termer,
  fx "OB", "out of bounds", "vand", "sø"

Lav derefter en oversigt til mig i chatten med alle 15
regelnumre, så jeg kan verificere dem manuelt mod pdga.com.
```

**Acceptkriterie:** Du har selv slået alle 15 regelnumre op og bekræftet dem. Sæt `verificeret: true` manuelt bagefter. Dette trin må du ikke springe over.

---

## Prompt 6 af 6: polering og deploy

```
Sidste runde.

1. Gennemgå appen på mobilviewport. Ret alt hvor knapper er for små,
   tekst er for lille, eller noget kræver scroll i "På banen"-visningen
2. Tjek at appen virker i flytilstand efter installation
   på iOS-hjemmeskærmen
3. Tilføj en simpel eksport- og importknap under Statistik,
   så jeg kan tage backup af min fremdrift som JSON
4. Skriv en kort brugsvejledning øverst i README:
   hvordan jeg tilføjer flere spørgsmål, og hvordan jeg
   markerer spørgsmål som verificeret
5. Deploy til Vercel og giv mig URL'en
6. git commit og push
```

---

## Din egen tjekliste efter sidste prompt

- [ ] Alle 15 banesituationer er manuelt verificeret mod pdga.com
- [ ] Stikprøve: 20 tilfældige spørgsmål, tjek regelnumrene
- [ ] Alle spørgsmål med `verificeret: false` er gennemgået eller slettet
- [ ] Competition Manual-spørgsmålene er tjekket ekstra, tallene ændrer sig oftest
- [ ] Appen ligger på hjemmeskærmen og virker uden netværk
