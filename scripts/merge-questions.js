#!/usr/bin/env node
// Fletter alle batchfiler i src/data/batches/ til src/data/questions.json.
//
// Scriptet tildeler fortløbende id'er fra q-0001, fejler hvis to spørgsmål har
// samme regelnummer og næsten identisk spørgsmålstekst, printer optælling pr.
// kategori mod målantallet, og lister de spørgsmål der ikke er verificeret.
//
//   node scripts/merge-questions.js

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rod = join(dirname(fileURLToPath(import.meta.url)), '..')
const batchMappe = join(rod, 'src/data/batches')
const udfil = join(rod, 'src/data/questions.json')

// Skal stemme med KATEGORIER og MAALANTAL i src/config/eksamen.ts
const MAALANTAL = {
  'kastning og stance': 30,
  'lie og marker': 30,
  'OB og hazard': 30,
  'obstakler og lempelse': 24,
  'straf og misplay': 24,
  'putting og Circle 1': 20,
  'etikette 810': 20,
  'Competition Manual': 22,
}
const KATEGORIER = Object.keys(MAALANTAL)

/** Hvor ens to spørgsmålstekster er, målt på fælles ord. */
const LIGHEDSGRAENSE = 0.62

const ord = (tekst) => new Set(tekst.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])

function lighed(a, b) {
  const faelles = [...a].filter((o) => b.has(o)).length
  const samlet = new Set([...a, ...b]).size
  return samlet === 0 ? 0 : faelles / samlet
}

function laesBatches() {
  const filer = readdirSync(batchMappe).filter((f) => f.endsWith('.json')).sort()
  if (filer.length === 0) {
    console.error('Ingen batchfiler fundet i src/data/batches/')
    process.exit(1)
  }
  const poster = []
  for (const fil of filer) {
    const data = JSON.parse(readFileSync(join(batchMappe, fil), 'utf8'))
    if (!Array.isArray(data)) {
      console.error(`${fil}: filen skal indeholde en liste af spørgsmål`)
      process.exit(1)
    }
    data.forEach((post, i) => poster.push({ post, fil, nr: i + 1 }))
  }
  return poster
}

function validerSkema(poster) {
  const fejl = []
  const setteIder = new Set()
  for (const { post, fil, nr } of poster) {
    const hvor = `${fil} nr. ${nr} (${post.id ?? 'uden id'})`
    if (typeof post.id !== 'string' || post.id.trim() === '') fejl.push(`${hvor}: id mangler`)
    else if (setteIder.has(post.id)) fejl.push(`${hvor}: id går igen i batchene`)
    else setteIder.add(post.id)
    if (!KATEGORIER.includes(post.kategori)) fejl.push(`${hvor}: ukendt kategori ${post.kategori}`)
    if (typeof post.spoergsmaal !== 'string' || !post.spoergsmaal.trim()) fejl.push(`${hvor}: spoergsmaal mangler`)
    if (!Array.isArray(post.svar) || post.svar.length !== 4 || post.svar.some((s) => typeof s !== 'string' || !s.trim())) {
      fejl.push(`${hvor}: svar skal være præcis fire tekster`)
    }
    if (!Number.isInteger(post.korrekt) || post.korrekt < 0 || post.korrekt > 3) fejl.push(`${hvor}: korrekt skal være 0 til 3`)
    if (typeof post.forklaring !== 'string' || !post.forklaring.trim()) fejl.push(`${hvor}: forklaring mangler`)
    if (typeof post.regel !== 'string' || !post.regel.trim()) fejl.push(`${hvor}: regel mangler`)
    if (typeof post.kilde !== 'string' || !post.kilde.startsWith('https://www.pdga.com/')) fejl.push(`${hvor}: kilde skal pege på pdga.com`)
    if (typeof post.verificeret !== 'boolean') fejl.push(`${hvor}: verificeret skal være true eller false`)
  }
  return fejl
}

/** Fejler hvis to spørgsmål har samme regelnummer og næsten identisk tekst. */
function findDubletter(poster) {
  const efterRegel = new Map()
  for (const p of poster) {
    const liste = efterRegel.get(p.post.regel) ?? []
    liste.push({ ...p, ord: ord(p.post.spoergsmaal) })
    efterRegel.set(p.post.regel, liste)
  }
  const fundne = []
  for (const [regel, liste] of efterRegel) {
    for (let i = 0; i < liste.length; i++) {
      for (let j = i + 1; j < liste.length; j++) {
        const grad = lighed(liste[i].ord, liste[j].ord)
        if (grad > LIGHEDSGRAENSE) {
          fundne.push(
            `regel ${regel}: ${liste[i].fil} nr. ${liste[i].nr} (${liste[i].post.id}) og ` +
            `${liste[j].fil} nr. ${liste[j].nr} (${liste[j].post.id}) er ${Math.round(grad * 100)} procent ens`,
          )
        }
      }
    }
  }
  return fundne
}

const poster = laesBatches()

const skemafejl = validerSkema(poster)
if (skemafejl.length > 0) {
  console.error(`Skemafejl i ${skemafejl.length} spørgsmål:`)
  for (const f of skemafejl) console.error('  ' + f)
  process.exit(1)
}

const dubletter = findDubletter(poster)
if (dubletter.length > 0) {
  console.error(`Fandt ${dubletter.length} næsten identiske spørgsmål på samme regel:`)
  for (const d of dubletter) console.error('  ' + d)
  console.error('\nFletningen er afbrudt. Ret eller fjern spørgsmålene og kør igen.')
  process.exit(1)
}

// Sortér efter kategorirækkefølgen og bevar batchenes indbyrdes rækkefølge.
poster.sort((a, b) => KATEGORIER.indexOf(a.post.kategori) - KATEGORIER.indexOf(b.post.kategori))

const bank = poster.map(({ post }, i) => ({
  id: `q-${String(i + 1).padStart(4, '0')}`,
  kategori: post.kategori,
  spoergsmaal: post.spoergsmaal,
  svar: post.svar,
  korrekt: post.korrekt,
  forklaring: post.forklaring,
  regel: post.regel,
  kilde: post.kilde,
  verificeret: post.verificeret,
}))

writeFileSync(udfil, JSON.stringify(bank, null, 2) + '\n', 'utf8')

console.log(`Flettede ${poster.length} spørgsmål fra ${new Set(poster.map((p) => p.fil)).size} batchfiler`)
console.log(`Skrevet til src/data/questions.json med id'er ${bank[0].id} til ${bank[bank.length - 1].id}\n`)

console.log('Optælling pr. kategori')
let ialt = 0
let maalIalt = 0
for (const kategori of KATEGORIER) {
  const antal = bank.filter((p) => p.kategori === kategori).length
  const maal = MAALANTAL[kategori]
  ialt += antal
  maalIalt += maal
  const status = antal === maal ? 'ok' : antal < maal ? `mangler ${maal - antal}` : `${antal - maal} for mange`
  console.log(`  ${kategori.padEnd(22)} ${String(antal).padStart(3)} af ${String(maal).padStart(3)}   ${status}`)
}
console.log(`  ${'I alt'.padEnd(22)} ${String(ialt).padStart(3)} af ${String(maalIalt).padStart(3)}\n`)

const uverificerede = bank.filter((p) => !p.verificeret)
if (uverificerede.length === 0) {
  console.log('Alle spørgsmål er verificeret.')
} else {
  console.log(`Ikke verificeret: ${uverificerede.length} af ${bank.length} spørgsmål`)
  for (const p of uverificerede) {
    const tekst = p.spoergsmaal.length > 64 ? p.spoergsmaal.slice(0, 61) + '...' : p.spoergsmaal
    console.log(`  ${p.id}  regel ${p.regel.padEnd(20)} ${tekst}`)
  }
}
