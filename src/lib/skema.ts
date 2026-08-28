import { KATEGORIER, type Kategori } from '../config/eksamen'
import type { Spoergsmaal } from '../types'

export interface Valideringsfejl {
  indeks: number
  id: string
  besked: string
}

export interface Valideringsresultat {
  gyldige: Spoergsmaal[]
  fejl: Valideringsfejl[]
}

const erTekst = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

/**
 * Validerer rå JSON mod spørgsmålsskemaet.
 * Skema: id, kategori, spoergsmaal, svar (4 stk.), korrekt, forklaring,
 * regel, kilde, verificeret.
 */
export function validerSpoergsmaal(raa: unknown): Valideringsresultat {
  const gyldige: Spoergsmaal[] = []
  const fejl: Valideringsfejl[] = []

  if (!Array.isArray(raa)) {
    return { gyldige, fejl: [{ indeks: 0, id: '', besked: 'JSON skal være en liste af spørgsmål.' }] }
  }

  const setteIder = new Set<string>()

  raa.forEach((post, indeks) => {
    const p = post as Record<string, unknown>
    const id = typeof p?.id === 'string' ? p.id : ''
    const problemer: string[] = []

    if (!p || typeof p !== 'object') problemer.push('posten er ikke et objekt')
    if (!erTekst(id)) problemer.push('id mangler')
    else if (setteIder.has(id)) problemer.push('id går igen i samme fil')
    if (!KATEGORIER.includes(p?.kategori as Kategori)) problemer.push('ukendt kategori')
    if (!erTekst(p?.spoergsmaal)) problemer.push('spoergsmaal mangler')
    if (!Array.isArray(p?.svar) || p.svar.length !== 4 || !p.svar.every(erTekst)) {
      problemer.push('svar skal være præcis 4 tekster')
    }
    if (!Number.isInteger(p?.korrekt) || (p.korrekt as number) < 0 || (p.korrekt as number) > 3) {
      problemer.push('korrekt skal være et helt tal fra 0 til 3')
    }
    if (!erTekst(p?.forklaring)) problemer.push('forklaring mangler')
    if (!erTekst(p?.regel)) problemer.push('regel mangler')
    if (!erTekst(p?.kilde)) problemer.push('kilde mangler')
    if (typeof p?.verificeret !== 'boolean') problemer.push('verificeret skal være true eller false')

    if (problemer.length > 0) {
      fejl.push({ indeks, id, besked: problemer.join(', ') })
      return
    }

    setteIder.add(id)
    gyldige.push({
      id,
      kategori: p.kategori as Kategori,
      spoergsmaal: p.spoergsmaal as string,
      svar: p.svar as string[],
      korrekt: p.korrekt as number,
      forklaring: p.forklaring as string,
      regel: p.regel as string,
      kilde: p.kilde as string,
      verificeret: p.verificeret as boolean,
    })
  })

  return { gyldige, fejl }
}
