import { useState } from 'react'
import { filnavn, gendanBackup, lavBackup, validerBackup } from '../lib/backup'
import { Knap } from './Knap'

/**
 * Eksport og import af min fremdrift som JSON. Filen kan hentes ned, men på
 * iOS er det nemmest bare at kopiere teksten, så begge dele er med.
 */
export function Backup() {
  const [tekst, setTekst] = useState('')
  const [indsat, setIndsat] = useState('')
  const [besked, setBesked] = useState('')
  const [bekraeft, setBekraeft] = useState(false)

  async function eksporter() {
    const backup = await lavBackup()
    setTekst(JSON.stringify(backup, null, 2))
    setBesked(
      `Backup med ${backup.fremdrift.length} spørgsmål i bokse, ${backup.besvarelser.length} besvarelser og ${backup.eksamener.length} eksamener.`,
    )
  }

  async function kopier() {
    try {
      await navigator.clipboard.writeText(tekst)
      setBesked('Kopieret til udklipsholderen.')
    } catch {
      setBesked('Kunne ikke kopiere automatisk. Markér teksten og kopiér den selv.')
    }
  }

  function hentFil() {
    const blob = new Blob([tekst], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filnavn()
    link.click()
    URL.revokeObjectURL(url)
  }

  async function gendan() {
    let data: unknown
    try {
      data = JSON.parse(indsat)
    } catch {
      setBesked('JSON kunne ikke læses. Tjek at hele teksten er med.')
      setBekraeft(false)
      return
    }
    const { backup, fejl } = validerBackup(data)
    if (!backup) {
      setBesked(fejl.join(' '))
      setBekraeft(false)
      return
    }
    if (!bekraeft) {
      setBekraeft(true)
      setBesked(
        `Klar til at gendanne ${backup.fremdrift.length} bokse, ${backup.besvarelser.length} besvarelser og ${backup.eksamener.length} eksamener. Din nuværende fremdrift bliver overskrevet. Tryk igen for at bekræfte.`,
      )
      return
    }
    await gendanBackup(backup)
    setBekraeft(false)
    setIndsat('')
    setBesked('Fremdriften er gendannet.' + (fejl.length > 0 ? ' ' + fejl.join(' ') : ''))
  }

  return (
    <div>
      <p className="mb-2 text-sm text-daempet">
        Backup af bokse, besvarelser og eksamenshistorik. Spørgsmålene selv følger med appen og
        fylder ikke i filen.
      </p>

      <div className="flex flex-col gap-2">
        <Knap onClick={() => void eksporter()} className="text-center">
          Eksportér fremdrift
        </Knap>

        {tekst !== '' && (
          <>
            <textarea
              value={tekst}
              readOnly
              rows={4}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-xl border border-kant bg-flade p-3 font-mono text-sm text-daempet"
            />
            <div className="flex gap-2">
              <Knap onClick={() => void kopier()} className="text-center">
                Kopiér
              </Knap>
              <Knap onClick={hentFil} className="text-center">
                Hent som fil
              </Knap>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 mb-2 text-sm text-daempet">
        Gendan fra en tidligere backup. Indsæt hele JSON-teksten her.
      </p>
      <textarea
        value={indsat}
        onChange={(e) => {
          setIndsat(e.target.value)
          setBekraeft(false)
        }}
        rows={4}
        placeholder='{"app": "pdga-quiz", "version": 1, ...}'
        className="w-full rounded-xl border border-kant bg-flade p-3 font-mono text-sm text-tekst placeholder:text-daempet/60 focus:border-blaa focus:outline-none"
      />
      <div className="mt-2">
        <Knap
          onClick={() => void gendan()}
          disabled={indsat.trim() === ''}
          variant={bekraeft ? 'primaer' : 'sekundaer'}
          className="text-center"
        >
          {bekraeft ? 'Bekræft gendannelse' : 'Gendan fremdrift'}
        </Knap>
      </div>

      {besked && (
        <p className="mt-3 rounded-xl border border-kant bg-flade p-3 text-sm text-daempet">{besked}</p>
      )}
    </div>
  )
}
