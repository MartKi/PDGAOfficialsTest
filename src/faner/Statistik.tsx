import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { gemSpoergsmaal } from '../db/indlaes'
import { KORT_NAVN } from '../config/eksamen'
import { ANTAL_BOKSE } from '../lib/leitner'
import { kategoristatistik, oftestForkerte, procentBaggrund, procentFarve } from '../lib/statistik'
import { Graf } from '../komponenter/Graf'
import { Knap } from '../komponenter/Knap'
import { Backup } from '../komponenter/Backup'
import { Uverificeret } from '../komponenter/Maerker'
import type { Besvarelse, Fremdrift, Spoergsmaal } from '../types'

function Import() {
  const [tekst, setTekst] = useState('')
  const [svar, setSvar] = useState<string[]>([])

  async function importer() {
    let data: unknown
    try {
      data = JSON.parse(tekst)
    } catch {
      setSvar(['JSON kunne ikke læses. Tjek at det er en gyldig liste af spørgsmål.'])
      return
    }
    const resultat = await gemSpoergsmaal(data)
    const linjer = [
      `${resultat.tilfoejet} nye spørgsmål tilføjet, ${resultat.opdateret} opdateret.`,
      ...resultat.afvist.map((f) => `Afvist nr. ${f.indeks + 1} ${f.id}: ${f.besked}`),
    ]
    setSvar(linjer)
    if (resultat.afvist.length === 0) setTekst('')
  }

  return (
    <div>
      <p className="mb-2 text-sm text-daempet">
        Indsæt JSON med flere spørgsmål her. Skemaet valideres, og kun gyldige spørgsmål gemmes.
      </p>
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        rows={5}
        placeholder='[{"id": "q-0101", "kategori": "OB og hazard", ...}]'
        className="w-full rounded-xl border border-kant bg-flade p-3 font-mono text-sm text-tekst placeholder:text-daempet/60 focus:border-blaa focus:outline-none"
      />
      <div className="mt-2">
        <Knap onClick={() => void importer()} disabled={tekst.trim() === ''} className="text-center">
          Importér spørgsmål
        </Knap>
      </div>
      {svar.length > 0 && (
        <div className="mt-3 rounded-xl border border-kant bg-flade p-3 text-sm text-daempet">
          {svar.map((linje, i) => (
            <p key={i}>{linje}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export function Statistik() {
  const besvarelser = useLiveQuery(() => db.besvarelser.toArray(), [], [] as Besvarelse[])
  const hentet = useLiveQuery(() => db.spoergsmaal.toArray())
  const bank: Spoergsmaal[] = hentet ?? []
  const eksamener = useLiveQuery(() => db.eksamener.orderBy('dato').toArray(), [], [])
  const fremdrift = useLiveQuery(() => db.fremdrift.toArray(), [], [] as Fremdrift[])

  const tal = kategoristatistik(besvarelser)
  const fejl = oftestForkerte(besvarelser, bank)
  const uverificerede = bank.filter((s) => !s.verificeret).length

  const bokse = Array.from({ length: ANTAL_BOKSE }, (_, i) => ({
    boks: i + 1,
    antal: fremdrift.filter((f) => f.boks === i + 1).length,
  }))

  return (
    <div className="h-full overflow-y-auto p-4 pb-6">
      <h1 className="text-2xl font-bold">Statistik</h1>
      {hentet !== undefined && (
        <p className="mt-1 text-sm text-daempet">
          {bank.length} spørgsmål i banken, {besvarelser.length} besvarelser i alt.
          {uverificerede > 0 && ` ${uverificerede} mangler verifikation.`}
        </p>
      )}

      <h2 className="mt-6 mb-2 text-lg font-semibold">Rigtige pr. kategori</h2>
      <div className="flex flex-col gap-2">
        {tal.map((t) => (
          <div key={t.kategori} className="rounded-xl border border-kant bg-flade p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{KORT_NAVN[t.kategori]}</span>
              <span className={`text-sm font-bold ${procentFarve(t.procent)}`}>
                {t.antal === 0 ? 'ingen svar' : `${t.procent} %`}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bund">
              <div
                className={`h-full ${procentBaggrund(t.procent)}`}
                style={{ width: `${t.antal === 0 ? 0 : t.procent}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-daempet">
              {t.rigtige} rigtige af {t.antal}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Eksamener over tid</h2>
      <div className="rounded-xl border border-kant bg-flade p-3">
        <Graf punkter={eksamener.map((e) => ({ dato: e.dato, procent: e.procent }))} />
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Leitner-bokse</h2>
      <div className="flex gap-2">
        {bokse.map((b) => (
          <div key={b.boks} className="flex-1 rounded-xl border border-kant bg-flade p-2 text-center">
            <p className="text-sm text-daempet">Boks {b.boks}</p>
            <p className="text-lg font-bold">{b.antal}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Oftest forkert</h2>
      {fejl.length === 0 ? (
        <p className="text-daempet">Ingen fejl registreret endnu.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {fejl.map((f) => (
            <div key={f.spoergsmaal.id} className="rounded-xl border border-kant bg-flade p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-daempet">{KORT_NAVN[f.spoergsmaal.kategori]}</span>
                <span className="text-sm font-bold text-roed">
                  {f.forkerte} forkerte af {f.antal}
                </span>
              </div>
              <p className="mt-1 text-sm leading-snug">{f.spoergsmaal.spoergsmaal}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-blaa">Regel {f.spoergsmaal.regel}</span>
                <Uverificeret verificeret={f.spoergsmaal.verificeret} />
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-6 mb-2 text-lg font-semibold">Importér flere spørgsmål</h2>
      <Import />

      <h2 className="mt-6 mb-2 text-lg font-semibold">Backup af fremdrift</h2>
      <Backup />
    </div>
  )
}
