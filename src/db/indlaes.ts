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

/**
 * Kort, stabilt fingeraftryk af den bank der følger med appen. Ændrer et
 * spørgsmål sig, eller bliver et markeret som verificeret, ændrer aftrykket sig.
 */
function fingeraftryk(raa: unknown): string {
  const liste = Array.isArray(raa) ? raa : []
  let hash = 2166136261
  for (const post of liste as Record<string, unknown>[]) {
    const tekst = `${post.id}|${post.regel}|${post.verificeret}|${post.spoergsmaal}`
    for (let i = 0; i < tekst.length; i++) {
      hash ^= tekst.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
  }
  return `${liste.length}:${(hash >>> 0).toString(16)}`
}

/**
 * Kører ved appens start. Lægger banken ind første gang, og opdaterer den igen
 * når questions.json er ændret, for eksempel efter en ny fletning eller når
 * spørgsmål er markeret som verificeret. Fremdrift og historik røres ikke, og
 * spørgsmål jeg selv har importeret i appen, bliver liggende.
 */
export async function synkroniserSpoergsmaal(): Promise<void> {
  const aftryk = fingeraftryk(raaSpoergsmaal)
  const gemt = await db.meta.get('bank')
  if (gemt?.vaerdi === aftryk && (await db.spoergsmaal.count()) > 0) return

  const resultat = await gemSpoergsmaal(raaSpoergsmaal)
  if (resultat.afvist.length > 0) {
    console.warn('Spørgsmål afvist ved indlæsning:', resultat.afvist)
  }
  await db.meta.put({ noegle: 'bank', vaerdi: aftryk })
  await db.meta.put({ noegle: 'senest indlæst', vaerdi: new Date().toISOString() })
}
