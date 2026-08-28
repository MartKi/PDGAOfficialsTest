import { db } from '../db/db'
import type { Besvarelse, Eksamensresultat, Fremdrift } from '../types'

/** Backup af min fremdrift. Spørgsmålene selv er ikke med, de ligger i appen. */
export interface Backup {
  app: 'pdga-quiz'
  version: 1
  dato: string
  fremdrift: Fremdrift[]
  besvarelser: Besvarelse[]
  eksamener: Eksamensresultat[]
}

export async function lavBackup(): Promise<Backup> {
  const [fremdrift, besvarelser, eksamener] = await Promise.all([
    db.fremdrift.toArray(),
    db.besvarelser.toArray(),
    db.eksamener.toArray(),
  ])
  return { app: 'pdga-quiz', version: 1, dato: new Date().toISOString(), fremdrift, besvarelser, eksamener }
}

export function filnavn(nu = new Date()): string {
  const dato = nu.toISOString().slice(0, 10)
  return `pdga-quiz-backup-${dato}.json`
}

export interface Valideret {
  backup: Backup | null
  fejl: string[]
}

/** Kontrollerer en indsat backup, før noget som helst skrives i databasen. */
export function validerBackup(raa: unknown): Valideret {
  const fejl: string[] = []
  const b = raa as Partial<Backup>

  if (!b || typeof b !== 'object') return { backup: null, fejl: ['Filen indeholder ikke et objekt.'] }
  if (b.app !== 'pdga-quiz') fejl.push('Filen er ikke en backup fra denne app.')
  if (b.version !== 1) fejl.push('Ukendt backupversion.')
  for (const noegle of ['fremdrift', 'besvarelser', 'eksamener'] as const) {
    if (!Array.isArray(b[noegle])) fejl.push(`Feltet ${noegle} mangler eller er ikke en liste.`)
  }
  if (fejl.length > 0) return { backup: null, fejl }

  const fremdrift = (b.fremdrift as Fremdrift[]).filter(
    (f) => typeof f?.spoergsmaalId === 'string' && Number.isInteger(f.boks) && typeof f.forfalder === 'number',
  )
  const besvarelser = (b.besvarelser as Besvarelse[]).filter(
    (s) => typeof s?.spoergsmaalId === 'string' && typeof s.dato === 'number',
  )
  const eksamener = (b.eksamener as Eksamensresultat[]).filter(
    (e) => typeof e?.dato === 'number' && typeof e.procent === 'number',
  )

  const kasseret =
    (b.fremdrift as Fremdrift[]).length - fremdrift.length +
    ((b.besvarelser as Besvarelse[]).length - besvarelser.length) +
    ((b.eksamener as Eksamensresultat[]).length - eksamener.length)
  if (kasseret > 0) fejl.push(`${kasseret} poster kunne ikke læses og bliver ikke gendannet.`)

  return { backup: { app: 'pdga-quiz', version: 1, dato: b.dato ?? '', fremdrift, besvarelser, eksamener }, fejl }
}

/** Erstatter fremdrift, besvarelser og eksamenshistorik med indholdet af en backup. */
export async function gendanBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', db.fremdrift, db.besvarelser, db.eksamener, async () => {
    await Promise.all([db.fremdrift.clear(), db.besvarelser.clear(), db.eksamener.clear()])
    await db.fremdrift.bulkPut(backup.fremdrift)
    await db.besvarelser.bulkPut(backup.besvarelser)
    await db.eksamener.bulkPut(backup.eksamener)
  })
}
