import { useEffect, useState } from 'react'
import { seedFoersteGang } from './db/indlaes'
import { PaaBanen } from './faner/PaaBanen'
import { Eksamen } from './faner/Eksamen'
import { Traening } from './faner/Traening'
import { Regelopslag } from './faner/Regelopslag'
import { Statistik } from './faner/Statistik'

const faner = [
  { id: 'bane', navn: 'På banen', ikon: '🥏' },
  { id: 'eksamen', navn: 'Eksamen', ikon: '📝' },
  { id: 'traening', navn: 'Træning', ikon: '🎯' },
  { id: 'regler', navn: 'Regler', ikon: '📖' },
  { id: 'statistik', navn: 'Statistik', ikon: '📊' },
] as const

type FaneId = (typeof faner)[number]['id']

export default function App() {
  // "På banen" er standardvisningen ved åbning.
  const [fane, setFane] = useState<FaneId>('bane')

  useEffect(() => {
    void seedFoersteGang()
  }, [])

  return (
    <div className="flex h-[100dvh] flex-col bg-bund text-tekst">
      <main className="min-h-0 flex-1 overflow-hidden">
        {fane === 'bane' && <PaaBanen />}
        {fane === 'eksamen' && <Eksamen />}
        {fane === 'traening' && <Traening />}
        {fane === 'regler' && <Regelopslag />}
        {fane === 'statistik' && <Statistik />}
      </main>

      <nav className="flex border-t border-kant bg-flade pb-[env(safe-area-inset-bottom)]">
        {faner.map((f) => (
          <button
            key={f.id}
            onClick={() => setFane(f.id)}
            aria-current={fane === f.id}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 ${
              fane === f.id ? 'text-groen' : 'text-daempet'
            }`}
          >
            <span className="text-xl leading-none">{f.ikon}</span>
            <span className="text-[11px] leading-none font-semibold">{f.navn}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
