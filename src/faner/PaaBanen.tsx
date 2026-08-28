import { useMemo, useState } from 'react'
import raaSituationer from '../data/banesituationer.json'
import type { Banesituation } from '../types'
import { Regellink, Uverificeret } from '../komponenter/Maerker'

const situationer = raaSituationer as Banesituation[]

const straffetekst: Record<Banesituation['straffekast'], string> = {
  '0': 'Ingen straf',
  '1': '1 straffekast',
  'afhænger': 'Afhænger',
}

const straffefarve: Record<Banesituation['straffekast'], string> = {
  '0': 'border-groen/50 bg-groen/10 text-groen',
  '1': 'border-roed/50 bg-roed/10 text-roed',
  'afhænger': 'border-gul/50 bg-gul/10 text-gul',
}

function passer(situation: Banesituation, soeg: string): boolean {
  if (soeg.trim() === '') return true
  const n = soeg.toLowerCase().trim()
  return (
    situation.titel.toLowerCase().includes(n) ||
    situation.afgoerelse.toLowerCase().includes(n) ||
    situation.soegeord.some((ord) => ord.toLowerCase().includes(n))
  )
}

/** Detaljen fylder én skærm. Kun "mere" kan folde ud og scrolle for sig selv. */
function Detalje({ situation, luk }: { situation: Banesituation; luk: () => void }) {
  const [aaben, setAaben] = useState(false)

  return (
    <div className="flex h-full flex-col p-4">
      <button
        onClick={luk}
        className="mb-3 min-h-11 self-start rounded-lg border border-kant px-4 py-2 text-sm font-semibold text-daempet"
      >
        Tilbage
      </button>

      <h1 className="text-2xl leading-tight font-bold">{situation.titel}</h1>

      <p className="mt-3 text-xl leading-snug text-tekst">{situation.afgoerelse}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-lg border px-3 py-1.5 text-base font-bold ${straffefarve[situation.straffekast]}`}
        >
          {straffetekst[situation.straffekast]}
        </span>
        <Regellink regel={situation.regel} kilde={situation.kilde} />
        <Uverificeret verificeret={situation.verificeret} />
      </div>

      <button
        onClick={() => setAaben((v) => !v)}
        className="mt-4 min-h-14 w-full rounded-xl border border-kant bg-flade px-4 py-3 text-left text-base font-semibold"
      >
        {aaben ? 'Skjul mere' : 'Mere'}
      </button>

      {aaben && (
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-xl border border-kant bg-flade p-4 text-base leading-relaxed text-daempet">
          {situation.uddybning}
        </div>
      )}
    </div>
  )
}

export function PaaBanen() {
  const [soeg, setSoeg] = useState('')
  const [valgt, setValgt] = useState<Banesituation | null>(null)

  const fundne = useMemo(() => situationer.filter((s) => passer(s, soeg)), [soeg])

  if (valgt) return <Detalje situation={valgt} luk={() => setValgt(null)} />

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <input
          value={soeg}
          onChange={(e) => setSoeg(e.target.value)}
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Søg, for eksempel OB eller tabt disc"
          className="w-full rounded-xl border border-kant bg-flade px-4 py-4 text-lg text-tekst placeholder:text-daempet/70 focus:border-blaa focus:outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-2">
          {fundne.map((situation) => (
            <button
              key={situation.id}
              onClick={() => setValgt(situation)}
              className="min-h-16 w-full rounded-xl border border-kant bg-flade px-4 py-3 text-left"
            >
              <span className="block text-lg leading-tight font-semibold">{situation.titel}</span>
              <span className="mt-1 block text-sm text-daempet">
                {straffetekst[situation.straffekast]} · Regel {situation.regel}
              </span>
            </button>
          ))}

          {fundne.length === 0 && (
            <p className="mt-6 text-center text-daempet">Ingen situationer matcher søgningen.</p>
          )}

          {situationer.length < 15 && (
            <p className="mt-4 text-center text-sm text-daempet">
              {situationer.length} af 15 situationer er lagt ind indtil videre.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
