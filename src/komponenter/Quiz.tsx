import { useMemo, useRef, useState } from 'react'
import { blandSvar } from '../lib/bland'
import { registrerSvar, type Svarlog } from '../lib/session'
import type { Spoergsmaal } from '../types'
import { Regellink, Uverificeret } from '../komponenter/Maerker'
import { Knap } from './Knap'

interface Props {
  spoergsmaal: Spoergsmaal[]
  tilstand: 'eksamen' | 'træning'
  /** Træning viser svaret med det samme. Eksamen viser først alt til sidst. */
  feedback: boolean
  /** Skjuler svarmulighederne indtil jeg selv har tænkt svaret igennem. */
  forklarFoerst: boolean
  onFaerdig: (log: Svarlog[]) => void
  onAfbryd: () => void
}

const bogstaver = ['A', 'B', 'C', 'D']

export function Quiz({ spoergsmaal, tilstand, feedback, forklarFoerst, onFaerdig, onAfbryd }: Props) {
  const [indeks, setIndeks] = useState(0)
  const [valgt, setValgt] = useState<number | null>(null)
  const [visSvar, setVisSvar] = useState(!forklarFoerst)
  const log = useRef<Svarlog[]>([])

  const aktuelt = spoergsmaal[indeks]
  // Rækkefølgen blandes ved hver visning, og det korrekte indeks flytter med.
  const blandet = useMemo(() => blandSvar(aktuelt), [aktuelt])

  function vaelg(i: number) {
    if (valgt !== null) return
    const rigtigt = i === blandet.korrekt
    log.current.push({ spoergsmaal: aktuelt, valgt: blandet.indekser[i], rigtigt })
    void registrerSvar(aktuelt, rigtigt, tilstand)
    setValgt(i)
    if (!feedback) videre()
  }

  function videre() {
    if (indeks + 1 >= spoergsmaal.length) {
      onFaerdig(log.current)
      return
    }
    setIndeks(indeks + 1)
    setValgt(null)
    setVisSvar(!forklarFoerst)
  }

  const rigtigt = valgt !== null && valgt === blandet.korrekt

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-kant px-4 py-3">
        <span className="text-sm font-semibold text-daempet">
          Spørgsmål {indeks + 1} af {spoergsmaal.length}
        </span>
        <button onClick={onAfbryd} className="rounded-lg border border-kant px-3 py-1.5 text-sm text-daempet">
          Afbryd
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-kant bg-flade px-2 py-1 text-xs font-semibold text-daempet">
            {aktuelt.kategori}
          </span>
          <Uverificeret verificeret={aktuelt.verificeret} />
        </div>

        <p className="text-xl leading-snug font-semibold">{aktuelt.spoergsmaal}</p>

        {!visSvar ? (
          <div className="mt-6">
            <p className="mb-3 text-base text-daempet">
              Tænk selv afgørelsen igennem først, og vis så svarmulighederne.
            </p>
            <Knap variant="primaer" onClick={() => setVisSvar(true)} className="text-center">
              Vis svarmuligheder
            </Knap>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {blandet.svar.map((tekst, i) => {
              let stil = 'border-kant bg-flade'
              if (valgt !== null) {
                if (i === blandet.korrekt) stil = 'border-groen bg-groen/15'
                else if (i === valgt) stil = 'border-roed bg-roed/15'
                else stil = 'border-kant bg-flade opacity-60'
              }
              return (
                <button
                  key={i}
                  onClick={() => vaelg(i)}
                  disabled={valgt !== null}
                  className={`flex min-h-16 w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${stil}`}
                >
                  <span className="mt-0.5 text-base font-bold text-daempet">{bogstaver[i]}</span>
                  <span className="text-base leading-snug">{tekst}</span>
                </button>
              )
            })}
          </div>
        )}

        {feedback && valgt !== null && (
          <div
            className={`mt-4 rounded-xl border p-4 ${rigtigt ? 'border-groen/60 bg-groen/10' : 'border-roed/60 bg-roed/10'}`}
          >
            <p className={`text-lg font-bold ${rigtigt ? 'text-groen' : 'text-roed'}`}>
              {rigtigt ? 'Rigtigt' : 'Forkert'}
            </p>
            <p className="mt-2 text-base leading-relaxed text-tekst">{aktuelt.forklaring}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Regellink regel={aktuelt.regel} kilde={aktuelt.kilde} />
              <Uverificeret verificeret={aktuelt.verificeret} />
            </div>
          </div>
        )}
      </div>

      {feedback && valgt !== null && (
        <div className="border-t border-kant p-4">
          <Knap variant="primaer" onClick={videre} className="text-center">
            {indeks + 1 >= spoergsmaal.length ? 'Se resultat' : 'Næste'}
          </Knap>
        </div>
      )}
    </div>
  )
}
