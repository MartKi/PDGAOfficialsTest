# PDGA regel-quiz

PWA til træning til PDGA Certified Rules Official-eksamen. Appen kører helt
lokalt uden backend, al data ligger i IndexedDB via Dexie, og den virker
offline når den først er hentet.

Stack: Vite, React, TypeScript, Tailwind og Dexie.

## Kom i gang

```bash
npm install
npm run dev
```

Appen ligger på http://localhost:5173. For at teste PWA og offline skal du
bruge en rigtig build:

```bash
npm run build
npm run preview
```

Service workeren er kun aktiv i en build, ikke i dev.

## De fem faner

1. **På banen** er standardvisningen. Søgefelt øverst og de almindelige
   tvivlssituationer som store knapper. Hver situation åbner på én skærm med
   afgørelse, straffekast, regelnummer og et "mere"-felt der kan foldes ud.
2. **Eksamen** trækker 25 spørgsmål efter kategorifordelingen i
   `src/config/eksamen.ts`. Ingen feedback undervejs, alle svar med forklaring
   og regelreference til sidst. Resultatet gemmes i historikken.
3. **Træning** kører 5, 10 eller 20 spørgsmål, eventuelt kun fra udvalgte
   kategorier. "Forfaldne spørgsmål" trækker kun det der er due i spaced
   repetition, og "Forklar reglen først" skjuler svarmulighederne indtil du
   trykker videre.
4. **Regler** er en søgbar liste over regelafsnit med mine egne resuméer og
   link til den officielle tekst på pdga.com.
5. **Statistik** viser rigtig-procent pr. kategori, en graf over eksamener
   over tid, de spørgsmål der oftest svares forkert, og importfeltet.

## Spaced repetition

Leitner med 5 bokse og intervallerne 1, 3, 7, 14 og 30 dage. Et rigtigt svar
rykker spørgsmålet én boks op, et forkert svar rykker det tilbage til boks 1.
Både eksamen og træning opdaterer boksene. Svarmulighederne blandes ved hver
visning, så rækkefølgen ikke kan huskes.

## Data

Spørgsmålene ligger i `src/data/questions.json` og indlæses i Dexie ved første
start. Skemaet valideres ved hver indlæsning, og ugyldige poster afvises:

```json
{
  "id": "q-0001",
  "kategori": "OB og hazard",
  "spoergsmaal": "...",
  "svar": ["...", "...", "...", "..."],
  "korrekt": 1,
  "forklaring": "...",
  "regel": "806.02",
  "kilde": "https://www.pdga.com/rules/official-rules-disc-golf/80602",
  "verificeret": false
}
```

`kategori` skal være en af de otte kategorier i `src/config/eksamen.ts`, og
`korrekt` er indekset 0 til 3 i `svar`.

Spørgsmål med `"verificeret": false` får en gul markering i appen. Markeringen
betyder at regelnummeret endnu ikke er slået efter på pdga.com.

Banesituationerne ligger i `src/data/banesituationer.json` og regelopslaget i
`src/data/regler.json`.

### Tilføj flere spørgsmål uden at bygge appen om

Gå til Statistik, indsæt en JSON-liste i importfeltet og tryk "Importér
spørgsmål". Gyldige spørgsmål lægges i databasen med det samme, og afviste
poster vises med en begrundelse. Spørgsmål med et id der allerede findes,
bliver opdateret.

## Deploy

Appen er en ren statisk build i `dist/`. Begge platforme finder selv
`npm run build`.

### Vercel

```bash
npm i -g vercel
vercel
```

Framework: Vite. Build: `npm run build`. Output: `dist`. `vercel.json` i roden
sørger for at alle ruter serveres af `index.html`.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

Build: `npm run build`. Publish: `dist`. Indstillingerne står i
`netlify.toml`.

Begge steder skal siden serveres over HTTPS, ellers registrerer iOS ikke
service workeren.

## Installation på iPhone

Åbn siden i Safari, tryk på del-ikonet og vælg "Føj til hjemmeskærm". Start
appen fra hjemmeskærmen én gang med netværk, så alt bliver cachet. Derefter
kan du slå flytilstand til og bruge den offline.

## Ophavsret

PDGA's regeltekst står ikke i appen. Alt indhold er mine egne resuméer på
dansk plus regelnummer og link til pdga.com.
