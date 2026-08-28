import { db } from '../db/db'
import { opdaterFremdrift } from './leitner'
import type { Eksamensresultat, Fremdrift, Spoergsmaal } from '../types'
import type { Kategori } from '../config/eksamen'

export interface Svarlog {
  spoergsmaal: Spoergsmaal
  valgt: number | null
  rigtigt: boolean
}

/** Logger en besvarelse og rykker spørgsmålet i Leitner-boksene. */
export async function registrerSvar(
  spoergsmaal: Spoergsmaal,
  rigtigt: boolean,
  tilstand: 'eksamen' | 'træning',
): Promise<void> {
  const nu = Date.now()
  await db.transaction('rw', db.besvarelser, db.fremdrift, async () => {
    await db.besvarelser.add({
      spoergsmaalId: spoergsmaal.id,
      kategori: spoergsmaal.kategori,
      rigtigt: rigtigt ? 1 : 0,
      dato: nu,
      tilstand,
    })
    const tidligere = await db.fremdrift.get(spoergsmaal.id)
    await db.fremdrift.put(opdaterFremdrift(spoergsmaal.id, tidligere, rigtigt, nu))
  })
}

/** Gemmer et eksamensresultat i historikken med score pr. kategori. */
export async function gemEksamen(log: Svarlog[]): Promise<Eksamensresultat> {
  const perKategori: Eksamensresultat['perKategori'] = {}
  for (const post of log) {
    const kategori = post.spoergsmaal.kategori as Kategori
    const nu = perKategori[kategori] ?? { rigtige: 0, antal: 0 }
    perKategori[kategori] = {
      rigtige: nu.rigtige + (post.rigtigt ? 1 : 0),
      antal: nu.antal + 1,
    }
  }

  const rigtige = log.filter((p) => p.rigtigt).length
  const resultat: Eksamensresultat = {
    dato: Date.now(),
    antal: log.length,
    rigtige,
    procent: log.length === 0 ? 0 : Math.round((rigtige / log.length) * 100),
    perKategori,
  }
  const id = await db.eksamener.add(resultat)
  return { ...resultat, id }
}

/** Slår fremdriften op for en liste af spørgsmål. */
export async function hentFremdrift(ider: string[]): Promise<Map<string, Fremdrift>> {
  const poster = await db.fremdrift.where('spoergsmaalId').anyOf(ider).toArray()
  return new Map(poster.map((p) => [p.spoergsmaalId, p]))
}
