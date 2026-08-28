import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { KATEGORIER, KORT_NAVN, type Kategori } from '../config/eksamen'
import { bland } from '../lib/bland'
import { erForfalden } from '../lib/leitner'
import { hentFremdrift, type Svarlog } from '../lib/session'
import { pct, procentFarve } from '../lib/statistik'
import { Quiz } from '../komponenter/Quiz'
import { Knap } from '../komponenter/Knap'
import type { Spoergsmaal } from '../types'

const ANTAL_VALG = [5, 10, 20]

type Tilstand =
  | { fase: 'start' }
  | { fase: 'igang'; spoergsmaal: Spoergsmaal[] }
  | { fase: 'resultat'; log: Svarlog[] }

export function Traening() {
  const [tilstand, setTilstand] = useState<Tilstand>({ fase: 'start' })
  const [antal, setAntal] = useState(10)
  const [valgteKategorier, setValgteKategorier] = useState<Kategori[]>([])
  const [forklarFoerst, setForklarFoerst] = useState(false)
  const [besked, setBesked] = useState('')

  const hentet = useLiveQuery(() => db.spoergsmaal.toArray())
  const bank: Spoergsmaal[] = hentet ?? []
  const indlaest = hentet !== undefined
  const forfaldne = useLiveQuery(async () => {
    const alle = await db.spoergsmaal.toArray()
    const fremdrift = await hentFremdrift(alle.map((s) => s.id))
    return alle.filter((s) => erForfalden(fremdrift.get(s.id))).length
  }, [], 0)

  function filtreret(): Spoergsmaal[] {
    if (valgteKategorier.length === 0) return bank
    return bank.filter((s) => valgteKategorier.includes(s.kategori))
  }

  function start(puljen: Spoergsmaal[]) {
    if (puljen.length === 0) {
      setBesked('Der er ingen spørgsmål i det valg.')
      return
    }
    setBesked('')
    setTilstand({ fase: 'igang', spoergsmaal: bland(puljen).slice(0, antal) })
  }

  async function startForfaldne() {
    const puljen = filtreret()
    const fremdrift = await hentFremdrift(puljen.map((s) => s.id))
    const due = puljen.filter((s) => erForfalden(fremdrift.get(s.id)))
    if (due.length === 0) {
      setBesked('Ingen spørgsmål er forfaldne lige nu. Kom tilbage senere.')
      return
    }
    start(due)
  }

  function vaelgKategori(kategori: Kategori) {
    setValgteKategorier((nu) =>
      nu.includes(kategori) ? nu.filter((k) => k !== kategori) : [...nu, kategori],
    )
  }

  if (tilstand.fase === 'igang') {
    return (
      <Quiz
        spoergsmaal={tilstand.spoergsmaal}
        tilstand="træning"
        feedback
        forklarFoerst={forklarFoerst}
        onAfbryd={() => setTilstand({ fase: 'start' })}
        onFaerdig={(log) => setTilstand({ fase: 'resultat', log })}
      />
    )
  }

  if (tilstand.fase === 'resultat') {
    const rigtige = tilstand.log.filter((p) => p.rigtigt).length
    const procent = pct(rigtige, tilstand.log.length)
    return (
      <div className="h-full overflow-y-auto p-4">
        <h1 className="text-2xl font-bold">Træning slut</h1>
        <p className={`mt-2 text-5xl font-bold ${procentFarve(procent)}`}>{procent} %</p>
        <p className="mt-1 text-daempet">
          {rigtige} rigtige ud af {tilstand.log.length}. Boksene er opdateret.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Knap variant="primaer" onClick={() => start(filtreret())} className="text-center">
            Træn videre
          </Knap>
          <Knap onClick={() => setTilstand({ fase: 'start' })} className="text-center">
            Tilbage
          </Knap>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-2xl font-bold">Træning</h1>

      <h2 className="mt-5 mb-2 text-sm font-semibold tracking-wide text-daempet uppercase">
        Antal spørgsmål
      </h2>
      <div className="flex gap-2">
        {ANTAL_VALG.map((n) => (
          <button
            key={n}
            onClick={() => setAntal(n)}
            className={`min-h-14 flex-1 rounded-xl border text-lg font-bold ${
              antal === n ? 'border-groen bg-groen/15 text-groen' : 'border-kant bg-flade text-tekst'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-daempet uppercase">
        Kategorier, valgfrit
      </h2>
      <div className="flex flex-wrap gap-2">
        {KATEGORIER.map((kategori) => {
          const valgt = valgteKategorier.includes(kategori)
          return (
            <button
              key={kategori}
              onClick={() => vaelgKategori(kategori)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold ${
                valgt ? 'border-groen bg-groen/15 text-groen' : 'border-kant bg-flade text-tekst'
              }`}
            >
              {KORT_NAVN[kategori]}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-daempet">
        Ingen valgt betyder alle kategorier.{indlaest && ` ${filtreret().length} spørgsmål i valget.`}
      </p>

      <button
        onClick={() => setForklarFoerst((v) => !v)}
        className={`mt-6 flex min-h-14 w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
          forklarFoerst ? 'border-groen bg-groen/15' : 'border-kant bg-flade'
        }`}
      >
        <span>
          <span className="block text-base font-semibold">Forklar reglen først</span>
          <span className="block text-sm text-daempet">
            Svarmulighederne skjules, indtil jeg trykker videre
          </span>
        </span>
        <span className={`text-sm font-bold ${forklarFoerst ? 'text-groen' : 'text-daempet'}`}>
          {forklarFoerst ? 'til' : 'fra'}
        </span>
      </button>

      {besked && (
        <p className="mt-4 rounded-xl border border-gul/50 bg-gul/10 p-3 text-sm text-gul">{besked}</p>
      )}

      <div className="mt-6 flex flex-col gap-2 pb-4">
        <Knap variant="primaer" onClick={() => start(filtreret())} className="text-center">
          Start træning
        </Knap>
        <Knap onClick={() => void startForfaldne()} className="text-center">
          Forfaldne spørgsmål ({forfaldne})
        </Knap>
      </div>
    </div>
  )
}
