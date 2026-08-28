import { KATEGORIER, type Kategori } from '../config/eksamen'
import type { Besvarelse, Spoergsmaal } from '../types'

export interface Kategorital {
  kategori: Kategori
  rigtige: number
  antal: number
  procent: number
}

/** Farvekode: grøn er godt nok til eksamen, gul er på vippen, rød skal trænes. */
export function procentFarve(procent: number): string {
  if (procent >= 80) return 'text-groen'
  if (procent >= 60) return 'text-gul'
  return 'text-roed'
}

export function procentBaggrund(procent: number): string {
  if (procent >= 80) return 'bg-groen'
  if (procent >= 60) return 'bg-gul'
  return 'bg-roed'
}

export function pct(rigtige: number, antal: number): number {
  return antal === 0 ? 0 : Math.round((rigtige / antal) * 100)
}

export function kategoristatistik(besvarelser: Besvarelse[]): Kategorital[] {
  return KATEGORIER.map((kategori) => {
    const egne = besvarelser.filter((b) => b.kategori === kategori)
    const rigtige = egne.filter((b) => b.rigtigt === 1).length
    return { kategori, rigtige, antal: egne.length, procent: pct(rigtige, egne.length) }
  })
}

export interface Fejltal {
  spoergsmaal: Spoergsmaal
  forkerte: number
  antal: number
}

/** De spørgsmål jeg oftest svarer forkert på, flest fejl først. */
export function oftestForkerte(
  besvarelser: Besvarelse[],
  bank: Spoergsmaal[],
  maks = 10,
): Fejltal[] {
  const efterId = new Map(bank.map((s) => [s.id, s]))
  const tal = new Map<string, { forkerte: number; antal: number }>()

  for (const b of besvarelser) {
    const nu = tal.get(b.spoergsmaalId) ?? { forkerte: 0, antal: 0 }
    tal.set(b.spoergsmaalId, {
      forkerte: nu.forkerte + (b.rigtigt === 1 ? 0 : 1),
      antal: nu.antal + 1,
    })
  }

  return [...tal.entries()]
    .filter(([id, t]) => t.forkerte > 0 && efterId.has(id))
    .map(([id, t]) => ({ spoergsmaal: efterId.get(id)!, forkerte: t.forkerte, antal: t.antal }))
    .sort((a, b) => b.forkerte - a.forkerte || b.antal - a.antal)
    .slice(0, maks)
}

export function datoTekst(ms: number): string {
  return new Date(ms).toLocaleDateString('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
