import Dexie, { type Table } from 'dexie'
import type { Besvarelse, Eksamensresultat, Fremdrift, Spoergsmaal } from '../types'

export interface Metapost {
  noegle: string
  vaerdi: string
}

/**
 * Al data ligger lokalt i IndexedDB. Ingen backend og ingen synkronisering.
 * Booleans kan ikke indekseres i IndexedDB, derfor er de holdt ude af nøglerne.
 */
export class QuizDb extends Dexie {
  spoergsmaal!: Table<Spoergsmaal, string>
  fremdrift!: Table<Fremdrift, string>
  besvarelser!: Table<Besvarelse, number>
  eksamener!: Table<Eksamensresultat, number>
  meta!: Table<Metapost, string>

  constructor() {
    super('pdga-quiz')
    this.version(1).stores({
      spoergsmaal: 'id, kategori, regel',
      fremdrift: 'spoergsmaalId, boks, forfalder',
      besvarelser: '++id, spoergsmaalId, kategori, dato',
      eksamener: '++id, dato',
      meta: 'noegle',
    })
  }
}

export const db = new QuizDb()
