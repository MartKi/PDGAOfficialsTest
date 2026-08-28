# Generering af spørgsmålsbanken

Denne fil er den eneste kilde til hvad der mangler. Den opdateres efter hver
batch. Session A laver 114 spørgsmål, session B laver de sidste 86.

## Status

| Kategori | Målantal | Genereret | Status | Filnavne |
| --- | --- | --- | --- | --- |
| kastning og stance | 30 | 30 | færdig | batches/kastning-og-stance-01.json |
| lie og marker | 30 | 30 | færdig | batches/lie-og-marker-01.json |
| OB og hazard | 30 | 0 | mangler | batches/ob-og-hazard-01.json |
| obstakler og lempelse | 24 | 0 | mangler | batches/obstakler-og-lempelse-01.json |
| straf og misplay | 24 | 0 | session B |  |
| putting og Circle 1 | 20 | 0 | session B |  |
| etikette 810 | 20 | 0 | session B |  |
| Competition Manual | 22 | 0 | session B |  |
| **I alt** | **200** | **60** | | |

De 15 seed-spørgsmål i `src/data/questions.json` tælles ikke med her. De
bliver erstattet af den flettede bank i session B.

## Vigtigt om verifikation

pdga.com er blokeret af netværkspolitikken i det miljø sessionerne kører i.
Et direkte opslag svarer 403 gennem proxyen. Regelnumre og officielle
overskrifter er derfor bekræftet gennem sidetitler og uddrag i søgeresultater
fra pdga.com, ikke ved at åbne reglen selv.

Derfor står **alle spørgsmål med `"verificeret": false`**. Det er ikke en
formalitet, det er den faktiske tilstand. Før banken bruges til alvor, skal
hvert regelnummer slås efter på pdga.com fra en maskine med adgang.

Punkter der især skal tjekkes, fordi kilderne var uklare eller ændrede sig:

- **802.07 Stance**: giver en stanceovertrædelse ét straffekast med det samme,
  eller en advarsel første gang? Reglens egen ordlyd peger på ét straffekast.
  Alle stancespørgsmål er skrevet efter ét straffekast.
- **802.03 For lang tid**: 30 sekunder fra teested, drop zone og inden for 20
  meter fra kurven, 45 sekunder fra andre lies. Tallene ser ud til at være
  ændret i en nyere udgave af reglerne.
- **806.02 OB**: muligheden for at gå direkte til en drop zone mod to
  straffekast er beskrevet som noget turneringslederen kan tillade. Den er
  aldrig brugt som korrekt svar.
- **806.03 Casual område**: lempelse gives til nærmeste punkt på spillelinjen
  uden for området, ikke op til fem meter. Fem meter var den gamle regel.

## Relevante regelnumre pr. kategori

Listen er lavet før spørgsmålene blev skrevet. Bredde før dybde, så hvert
regelnummer i kategorien har mindst ét spørgsmål.

### kastning og stance

| Regel | Officiel overskrift | Spørgsmål |
| --- | --- | --- |
| 801.02 | Enforcement | 2 |
| 801.03 | Appeals | 1 |
| 802.01 | Throw | 3 |
| 802.02 | Order of Play | 5 |
| 802.03 | Excessive Time | 5 |
| 802.04 | Teeing Off | 6 |
| 802.07 | Stance | 8 |

### lie og marker

| Regel | Officiel overskrift | Spørgsmål |
| --- | --- | --- |
| 802.05 | Lie | 8 |
| 802.06 | Marking the Lie | 9 |
| 803.03 | Optional Line of Play Relief | 3 |
| 805.01 | Establishing a Position | 6 |
| 809.01 | Abandoned Throw | 2 |
| 809.02 | Provisional Throw | 2 |

### OB og hazard

| Regel | Officiel overskrift | Spørgsmål |
| --- | --- | --- |
| 804.01 | Mandatory Routes | 4 |
| 806.02 | Out-of-Bounds | 13 |
| 806.04 | Required Relief Area | 4 |
| 806.05 | Hazard | 6 |
| 809.02 | Provisional Throw | 3 |

Mandoer hører formelt til 804 Regulated Routes. De ligger i denne kategori,
fordi de i praksis handler om det samme som OB, altså om hvor discen må være,
og om hvad det koster når den ikke er der.

### obstakler og lempelse

| Regel | Officiel overskrift | Spørgsmål |
| --- | --- | --- |
| 803.01 | Moving Obstacles | 7 |
| 803.02 | Relief from Obstacles | 4 |
| 803.03 | Optional Line of Play Relief | 4 |
| 805.02 | Disc Above Two Meters | 3 |
| 806.03 | Casual Area | 6 |

803.03 optræder i to kategorier. I "lie og marker" handler spørgsmålene om
hvor det nye lie havner, i "obstakler og lempelse" om hvornår det kan betale
sig at tage lempelsen. Teksterne er holdt tydeligt forskellige.

## Konventioner

Session B skal matche stilen her.

### Filformat

Én JSON-liste pr. batch i `src/data/batches/<kategori>-01.json`. Hvert
spørgsmål har præcis disse felter, i denne rækkefølge:

```json
{
  "id": "ks-01",
  "kategori": "kastning og stance",
  "spoergsmaal": "...",
  "svar": ["...", "...", "...", "..."],
  "korrekt": 2,
  "forklaring": "...",
  "regel": "802.07",
  "kilde": "https://www.pdga.com/rules/official-rules-disc-golf/80207",
  "verificeret": false
}
```

`id` er et kort kategoripræfiks plus løbenummer i batchen: `ks` for kastning
og stance, `lm` for lie og marker, `ob` for OB og hazard, `ol` for obstakler
og lempelse. Session B fortsætter med `sm` for straf og misplay, `pc` for
putting og Circle 1, `et` for etikette 810 og `cm` for Competition Manual.
Flettescriptet i session B giver alligevel alle spørgsmål nye id'er af typen
`q-0001`, så præfikset er kun til at holde styr på batchene.

`kilde` er `https://www.pdga.com/rules/official-rules-disc-golf/<nummer uden
punktum>`, altså 802.07 bliver til `.../80207`. Competition Manual-spørgsmål
peger på `https://www.pdga.com/rules/competition-manual/<nummer uden
punktum>`.

### Sprog og stil

- Alt på dansk. Ingen tankestreger i brødtekst.
- Spørgsmålet beskriver en konkret situation på banen i to til fire linjer og
  slutter med et spørgsmål om afgørelsen. Ikke udenadslære.
- Andenperson, "du", som var det din egen runde.
- Regelnumre står ikke i selve spørgsmålsteksten, kun i `regel`-feltet og
  eventuelt i forklaringen.
- Forklaring på to til fire sætninger i egne ord. PDGA's regeltekst
  kopieres aldrig ordret.

### Svarmuligheder

- Præcis fire, alle plausible og alle nogenlunde lige lange.
- Distraktorerne er almindelige misforståelser: forkert antal straffekast,
  gammel regel fra før 2018, forveksling af OB og hazard, tro på at kastet
  skal gentages, eller tro på at gruppen kan stemme om en afgørelse.
- Aldrig "alle ovenstående", "ingen af ovenstående" eller "både A og B".
- Det korrekte svar fordeles jævnt over de fire pladser. Appen blander
  alligevel rækkefølgen ved hver visning, men fordelingen holdes jævn, så
  banken også er brugbar uden appen.

### Variationstyper

Hver regel dækkes med mindst én af disse, og gentagne regler får forskellige
typer:

1. Hvad er den korrekte afgørelse?
2. Hvor mange straffekast?
3. Hvor placeres lien?
4. Hvad gør en official i denne situation?
5. Hvilken af fire situationer er IKKE en overtrædelse?

Type 5 bruges sparsomt, højst to gange pr. kategori, og de fire situationer
skrives korte så spørgsmålet kan læses på en telefon.

## Opsummering

Skrives når session A er færdig.
