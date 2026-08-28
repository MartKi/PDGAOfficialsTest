import { useMemo, useState } from 'react'
import raaRegler from '../data/regler.json'
import type { Regelafsnit } from '../types'
import { Uverificeret } from '../komponenter/Maerker'

const regler = raaRegler as Regelafsnit[]

function passer(afsnit: Regelafsnit, soeg: string): boolean {
  if (soeg.trim() === '') return true
  const n = soeg.toLowerCase().trim()
  return (
    afsnit.regel.toLowerCase().includes(n) ||
    afsnit.titel.toLowerCase().includes(n) ||
    afsnit.resume.toLowerCase().includes(n)
  )
}

export function Regelopslag() {
  const [soeg, setSoeg] = useState('')
  const fundne = useMemo(() => regler.filter((r) => passer(r, soeg)), [soeg])

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <h1 className="mb-3 text-2xl font-bold">Regelopslag</h1>
        <input
          value={soeg}
          onChange={(e) => setSoeg(e.target.value)}
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Søg på regelnummer eller ord"
          className="w-full rounded-xl border border-kant bg-flade px-4 py-4 text-lg text-tekst placeholder:text-daempet/70 focus:border-blaa focus:outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-3 text-sm text-daempet">
          Resuméerne er mine egne. Tryk på et afsnit for at åbne den officielle tekst på pdga.com.
        </p>
        <div className="flex flex-col gap-2">
          {fundne.map((afsnit) => (
            <a
              key={afsnit.regel}
              href={afsnit.kilde}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-kant bg-flade p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-kant bg-bund px-2 py-1 text-sm font-bold text-blaa">
                  {afsnit.regel}
                </span>
                <span className="text-base font-semibold">{afsnit.titel}</span>
                <Uverificeret verificeret={afsnit.verificeret} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-daempet">{afsnit.resume}</p>
            </a>
          ))}

          {fundne.length === 0 && (
            <p className="mt-6 text-center text-daempet">Ingen regelafsnit matcher søgningen.</p>
          )}
        </div>
      </div>
    </div>
  )
}
