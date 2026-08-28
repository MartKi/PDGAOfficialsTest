/** Lille markering på indhold hvor regelnummeret endnu ikke er verificeret. */
export function Uverificeret({ verificeret }: { verificeret: boolean }) {
  if (verificeret) return null
  return (
    <span
      title="Regelnummeret er ikke verificeret på pdga.com endnu"
      className="rounded-full border border-gul/50 bg-gul/10 px-2 py-0.5 text-xs font-medium text-gul"
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
      className="rounded-lg border border-kant bg-bund px-2 py-1 text-sm font-semibold text-blaa"
    >
      Regel {regel}
    </a>
  )
}
