import { db } from './db'
import raaSpoergsmaal from '../data/questions.json'
import { validerSpoergsmaal, type Valideringsfejl } from '../lib/skema'

export interface Indlaesningsresultat {
  tilfoejet: number
  opdateret: number
  afvist: Valideringsfejl[]
}

/**
 * Indlæser spørgsmål i Dexie. Skemaet valideres altid før noget skrives,
 * så en ugyldig post aldrig lander i databasen.
 */
export async function gemSpoergsmaal(raa: unknown): Promise<Indlaesningsresultat> {
  const { gyldige, fejl } = validerSpoergsmaal(raa)
  if (gyldige.length === 0) return { tilfoejet: 0, opdateret: 0, afvist: fejl }

  const ider = gyldige.map((s) => s.id)
  const eksisterende = await db.spoergsmaal.where('id').anyOf(ider).primaryKeys()
  const kendte = new Set(eksisterende)

  await db.spoergsmaal.bulkPut(gyldige)

  return {
    tilfoejet: gyldige.filter((s) => !kendte.has(s.id)).length,
    opdateret: gyldige.filter((s) => kendte.has(s.id)).length,
    afvist: fejl,
  }
}

/** Kører ved appens start. Seeder banken første gang, ellers gør den intet. */
export async function seedFoersteGang(): Promise<void> {
  const antal = await db.spoergsmaal.count()
  if (antal > 0) return

  const resultat = await gemSpoergsmaal(raaSpoergsmaal)
  if (resultat.afvist.length > 0) {
    console.warn('Spørgsmål afvist ved seed:', resultat.afvist)
  }
  await db.meta.put({ noegle: 'seedet', vaerdi: new Date().toISOString() })
}
