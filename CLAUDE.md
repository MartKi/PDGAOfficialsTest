# CLAUDE.md

Faste rammer for dette projekt. De gælder for al udvikling i repoet og må
kun ændres, hvis jeg beder om det.

## Projektet

En PWA til træning til PDGA Certified Rules Official-eksamen.
Stack: Vite, React, TypeScript, Tailwind og Dexie.

## Sprog

- Al UI-tekst og alt indhold er på dansk.
- Ingen tankestreger i dansk brødtekst. Brug komma, punktum eller omskrivning.

## Arkitektur

- Ingen backend, ingen login og ingen eksterne API-kald i den færdige app.
- Al data ligger lokalt i IndexedDB via Dexie.
- Appen skal virke fuldt offline efter første indlæsning.

## Indhold og ophavsret

- PDGA's regeltekst må ALDRIG kopieres ind i appen.
- Kun mine egne resuméer på dansk plus regelnummer og link til pdga.com.
- Regelnumre skal verificeres på pdga.com. Gæt aldrig et regelnummer.

## Design

- Mørkt tema.
- Store touch-venlige knapper. Appen bruges på iPhone.
- Mobil først. Ingen unødige animationer og ingen mærkbar indlæsningstid.

## Arbejdsgang

- Commit efter hvert færdigt delmål med en kort beskrivende besked.
- Følg promptplanen i docs/promptplan.md. En prompt ad gangen.
