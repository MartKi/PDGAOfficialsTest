interface Punkt {
  dato: number
  procent: number
}

/** Enkel linjegraf over eksamensresultater. Tegnes som ren SVG, uden bibliotek. */
export function Graf({ punkter }: { punkter: Punkt[] }) {
  if (punkter.length === 0) {
    return <p className="text-daempet">Ingen eksamener endnu.</p>
  }

  const b = 320
  const h = 140
  const pad = 8
  const skridt = punkter.length > 1 ? (b - pad * 2) / (punkter.length - 1) : 0
  const y = (procent: number) => pad + (1 - procent / 100) * (h - pad * 2)

  const koordinater = punkter.map((p, i) => ({
    x: punkter.length > 1 ? pad + i * skridt : b / 2,
    y: y(p.procent),
    procent: p.procent,
  }))

  const linje = koordinater.map((k) => `${k.x.toFixed(1)},${k.y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${b} ${h}`} className="w-full" role="img" aria-label="Eksamensresultater over tid">
      <line x1={pad} x2={b - pad} y1={y(80)} y2={y(80)} stroke="#34d399" strokeDasharray="4 4" strokeWidth="1" />
      <line x1={pad} x2={b - pad} y1={y(0)} y2={y(0)} stroke="#24303f" strokeWidth="1" />
      {punkter.length > 1 && (
        <polyline points={linje} fill="none" stroke="#7cc4ff" strokeWidth="2" />
      )}
      {koordinater.map((k, i) => (
        <circle key={i} cx={k.x} cy={k.y} r="4" fill="#7cc4ff" />
      ))}
      <text x={pad} y={y(80) - 4} fill="#34d399" fontSize="12">
        80 %
      </text>
    </svg>
  )
}
