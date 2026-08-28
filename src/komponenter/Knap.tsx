import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primaer' | 'sekundaer' | 'daempet'

const stilarter: Record<Variant, string> = {
  primaer: 'bg-groen text-bund border-groen active:bg-groen/80',
  sekundaer: 'bg-flade text-tekst border-kant active:bg-kant',
  daempet: 'bg-transparent text-daempet border-kant active:bg-flade',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

/** Stor, touch-venlig knap. Mindst 56 px høj. */
export function Knap({ variant = 'sekundaer', className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-14 w-full rounded-xl border px-4 py-3 text-left text-base font-semibold disabled:opacity-40 ${stilarter[variant]} ${className}`}
    />
  )
}
