/** Lille markering på indhold hvor regelnummeret endnu ikke er verificeret. */
export function Uverificeret({ verificeret }: { verificeret: boolean }) {
  if (verificeret) return null
  return (
    <span
      title="Regelnummeret er ikke verificeret på pdga.com endnu"
      className="inline-flex min-h-11 items-center rounded-full border border-gul/50 bg-gul/10 px-3 py-1 text-sm font-medium text-gul"
    >
      ikke verificeret
    </span>
  )
}

/** Regelnummer med link til pdga.com. Regelteksten selv står aldrig i appen. */
export function Regellink({ regel, kilde }: { regel: string; kilde: string }) {
  return (
    <a
      href={kilde}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center rounded-lg border border-kant bg-bund px-3 py-2 text-base font-semibold text-blaa"
    >
      Regel {regel}
    </a>
  )
}
