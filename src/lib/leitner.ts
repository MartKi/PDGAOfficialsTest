import type { Fremdrift } from '../types'

/** Leitner med 5 bokse. Intervallerne er i dage. */
export const ANTAL_BOKSE = 5
export const INTERVALLER_DAGE = [1, 3, 7, 14, 30]

const DAG_I_MS = 24 * 60 * 60 * 1000

/** Korrekt svar rykker én boks op, forkert svar rykker tilbage til boks 1. */
export function naesteBoks(nuvaerende: number | undefined, rigtigt: boolean): number {
  if (!rigtigt) return 1
  const boks = nuvaerende ?? 1
  return Math.min(boks + 1, ANTAL_BOKSE)
}

export function forfaldsdato(boks: number, fra = Date.now()): number {
  const dage = INTERVALLER_DAGE[Math.min(Math.max(boks, 1), ANTAL_BOKSE) - 1]
  return fra + dage * DAG_I_MS
}

/** Bygger den nye fremdrift for et spørgsmål efter en besvarelse. */
export function opdaterFremdrift(
  spoergsmaalId: string,
  tidligere: Fremdrift | undefined,
  rigtigt: boolean,
  nu = Date.now(),
): Fremdrift {
  const boks = naesteBoks(tidligere?.boks, rigtigt)
  return {
    spoergsmaalId,
    boks,
    forfalder: forfaldsdato(boks, nu),
    sidstSet: nu,
    rigtige: (tidligere?.rigtige ?? 0) + (rigtigt ? 1 : 0),
    forkerte: (tidligere?.forkerte ?? 0) + (rigtigt ? 0 : 1),
  }
}

/** Et spørgsmål er forfaldent, hvis det aldrig er set eller er due i dag. */
export function erForfalden(fremdrift: Fremdrift | undefined, nu = Date.now()): boolean {
  return !fremdrift || fremdrift.forfalder <= nu
}
