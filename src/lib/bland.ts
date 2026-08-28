import type { Kategori } from '../config/eksamen'
import type { Spoergsmaal } from '../types'

/** Fisher-Yates. Returnerer en ny liste, rører ikke den oprindelige. */
export function bland<T>(liste: readonly T[]): T[] {
  const ud = [...liste]
  for (let i = ud.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ud[i], ud[j]] = [ud[j], ud[i]]
  }
  return ud
}

export interface BlandetSpoergsmaal {
  spoergsmaal: Spoergsmaal
  svar: string[]
  korrekt: number
  /** Viser hvilket oprindeligt svarindeks hver viste plads kommer fra. */
  indekser: number[]
}

/**
 * Anti-genkendelse: rækkefølgen af de fire svarmuligheder blandes ved hver
 * visning, og det korrekte indeks flytter med.
 */
export function blandSvar(spoergsmaal: Spoergsmaal): BlandetSpoergsmaal {
  const indekser = bland(spoergsmaal.svar.map((_, i) => i))
  return {
    spoergsmaal,
    svar: indekser.map((i) => spoergsmaal.svar[i]),
    korrekt: indekser.indexOf(spoergsmaal.korrekt),
    indekser,
  }
}

/**
 * Trækker spørgsmål efter en kategorifordeling. Mangler der spørgsmål i en
 * kategori, fyldes der op med tilfældige spørgsmål fra de andre kategorier.
 */
export function traekVaegtet(
  bank: Spoergsmaal[],
  fordeling: Record<Kategori, number>,
  maks: number,
): Spoergsmaal[] {
  const valgte: Spoergsmaal[] = []
  const brugte = new Set<string>()

  for (const [kategori, antal] of Object.entries(fordeling) as [Kategori, number][]) {
    const puljen = bland(bank.filter((s) => s.kategori === kategori))
    for (const s of puljen.slice(0, antal)) {
      valgte.push(s)
      brugte.add(s.id)
    }
  }

  const rest = bland(bank.filter((s) => !brugte.has(s.id)))
  for (const s of rest) {
    if (valgte.length >= maks) break
    valgte.push(s)
  }

  return bland(valgte).slice(0, maks)
}
