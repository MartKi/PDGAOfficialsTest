import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { EKSAMEN_ANTAL, KATEGORIFORDELING, KORT_NAVN, MAAL_PROCENT, type Kategori } from '../config/eksamen'
import { traekVaegtet } from '../lib/bland'
import { gemEksamen, type Svarlog } from '../lib/session'
import { datoTekst, pct, procentFarve } from '../lib/statistik'
import { Quiz } from '../komponenter/Quiz'
import { Knap } from '../komponenter/Knap'
import { Regellink, Uverificeret } from '../komponenter/Maerker'
import type { Spoergsmaal } from '../types'

type Tilstand =
  | { fase: 'start' }
  | { fase: 'igang'; spoergsmaal: Spoergsmaal[] }
  | { fase: 'resultat'; log: Svarlog[] }

function Resultat({ log, igen, luk }: { log: Svarlog[]; igen: () => void; luk: () => void }) {
  const rigtige = log.filter((p) => p.rigtigt).length
  const procent = pct(rigtige, log.length)

  const perKategori = new Map<Kategori, { rigtige: number; antal: number }>()
  for (const post of log) {
    const k = post.spoergsmaal.kategori
    const nu = perKategori.get(k) ?? { rigtige: 0, antal: 0 }
    perKategori.set(k, { rigtige: nu.rigtige + (post.rigtigt ? 1 : 0), antal: nu.antal + 1 })
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-2xl font-bold">Resultat</h1>
      <p className={`mt-2 text-5xl font-bold ${procentFarve(procent)}`}>{procent} %</p>
      <p className="mt-1 text-daempet">
        {rigtige} rigtige ud af {log.length}. Min målsætning er {MAAL_PROCENT} procent.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Pr. kategori</h2>
      <div className="flex flex-col gap-1">
        {[...perKategori.entries()].map(([kategori, tal]) => {
          const p = pct(tal.rigtige, tal.antal)
          return (
            <div
              key={kategori}
              className="flex items-center justify-between rounded-lg border border-kant bg-flade px-3 py-2"
            >
              <span className="text-sm">{KORT_NAVN[kategori]}</span>
              <span className={`text-sm font-bold ${procentFarve(p)}`}>
                {tal.rigtige}/{tal.antal}
              </span>
            </div>
          )
        })}
      </div>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Alle svar</h2>
      <div className="flex flex-col gap-3">
        {log.map((post, i) => (
          <div
            key={post.spoergsmaal.id}
            className={`rounded-xl border p-3 ${post.rigtigt ? 'border-groen/50 bg-groen/5' : 'border-roed/50 bg-roed/5'}`}
          >
            <p className="text-sm font-semibold text-daempet">
              {i + 1}. {post.rigtigt ? 'Rigtigt' : 'Forkert'}
            </p>
            <p className="mt-1 text-base leading-snug font-medium">{post.spoergsmaal.spoergsmaal}</p>
            {!post.rigtigt && post.valgt !== null && (
              <p className="mt-2 text-sm text-roed">
                Dit svar: {post.spoergsmaal.svar[post.valgt]}
              </p>
            )}
            <p className="mt-1 text-sm text-groen">
              Rigtigt svar: {post.spoergsmaal.svar[post.spoergsmaal.korrekt]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-daempet">{post.spoergsmaal.forklaring}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Regellink regel={post.spoergsmaal.regel} kilde={post.spoergsmaal.kilde} />
              <Uverificeret verificeret={post.spoergsmaal.verificeret} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 pb-4">
        <Knap variant="primaer" onClick={igen} className="text-center">
          Tag en ny eksamen
        </Knap>
        <Knap onClick={luk} className="text-center">
          Tilbage
        </Knap>
      </div>
    </div>
  )
}

export function Eksamen() {
  const [tilstand, setTilstand] = useState<Tilstand>({ fase: 'start' })
  // Uden startværdi er den undefined indtil Dexie svarer, så visningen ikke
  // når at påstå at banken er tom.
  const hentet = useLiveQuery(() => db.spoergsmaal.toArray())
  const bank: Spoergsmaal[] = hentet ?? []
  const indlaest = hentet !== undefined
  const historik = useLiveQuery(() => db.eksamener.orderBy('dato').reverse().toArray(), [], [])

  function start() {
    const valgte = traekVaegtet(bank, KATEGORIFORDELING, EKSAMEN_ANTAL)
    if (valgte.length === 0) return
    setTilstand({ fase: 'igang', spoergsmaal: valgte })
  }

  if (tilstand.fase === 'igang') {
    return (
      <Quiz
        spoergsmaal={tilstand.spoergsmaal}
        tilstand="eksamen"
        feedback={false}
        forklarFoerst={false}
        onAfbryd={() => setTilstand({ fase: 'start' })}
        onFaerdig={(log) => {
          void gemEksamen(log)
          setTilstand({ fase: 'resultat', log })
        }}
      />
    )
  }

  if (tilstand.fase === 'resultat') {
    return <Resultat log={tilstand.log} igen={start} luk={() => setTilstand({ fase: 'start' })} />
  }

  const antal = Math.min(EKSAMEN_ANTAL, bank.length)

  return (
    <div className="h-full overflow-y-auto p-4">
      <h1 className="text-2xl font-bold">Eksamenssimulering</h1>
      <p className="mt-2 text-daempet">
        {EKSAMEN_ANTAL} spørgsmål trukket tilfældigt efter kategorifordelingen. Ingen feedback
        undervejs, alle svar vises til sidst.
      </p>

      {indlaest && bank.length < EKSAMEN_ANTAL && (
        <p className="mt-3 rounded-xl border border-gul/50 bg-gul/10 p-3 text-sm text-gul">
          Banken indeholder {bank.length} spørgsmål. Eksamen køres med {antal} spørgsmål, indtil der
          er flere i banken.
        </p>
      )}

      <div className="mt-4">
        <Knap variant="primaer" onClick={start} disabled={!indlaest || bank.length === 0} className="text-center">
          Start eksamen
        </Knap>
      </div>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Fordeling</h2>
      <div className="flex flex-col gap-1">
        {(Object.entries(KATEGORIFORDELING) as [Kategori, number][]).map(([kategori, n]) => (
          <div
            key={kategori}
            className="flex items-center justify-between rounded-lg border border-kant bg-flade px-3 py-2 text-sm"
          >
            <span>{KORT_NAVN[kategori]}</span>
            <span className="text-daempet">{n} spørgsmål</span>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-2 text-lg font-semibold">Historik</h2>
      {historik.length === 0 ? (
        <p className="text-daempet">Ingen eksamener taget endnu.</p>
      ) : (
        <div className="flex flex-col gap-1 pb-4">
          {historik.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-kant bg-flade px-3 py-2"
            >
              <span className="text-sm text-daempet">{datoTekst(e.dato)}</span>
              <span className={`text-sm font-bold ${procentFarve(e.procent)}`}>
                {e.procent} % ({e.rigtige}/{e.antal})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
