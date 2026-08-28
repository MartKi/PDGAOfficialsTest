import type { Kategori } from './config/eksamen'

/** Et spørgsmål, præcis som det ligger i src/data/questions.json. */
export interface Spoergsmaal {
  id: string
  kategori: Kategori
  spoergsmaal: string
  svar: string[]
  korrekt: number
  forklaring: string
  regel: string
  kilde: string
  verificeret: boolean
}

/** En tvivlssituation til "På banen". */
export interface Banesituation {
  id: string
  titel: string
  afgoerelse: string
  straffekast: '0' | '1' | 'afhænger'
  regel: string
  uddybning: string
  soegeord: string[]
  kilde: string
  verificeret: boolean
}

/** Et regelafsnit til opslagsfanen. Kun mit eget resumé, aldrig regelteksten. */
export interface Regelafsnit {
  regel: string
  titel: string
  resume: string
  kilde: string
  verificeret: boolean
}

/** Leitner-tilstand for ét spørgsmål. */
export interface Fremdrift {
  spoergsmaalId: string
  boks: number
  forfalder: number
  sidstSet: number
  rigtige: number
  forkerte: number
}

/** Én besvarelse, logges både i eksamen og træning. */
export interface Besvarelse {
  id?: number
  spoergsmaalId: string
  kategori: Kategori
  rigtigt: number
  dato: number
  tilstand: 'eksamen' | 'træning'
}

/** Et gemt eksamensresultat. */
export interface Eksamensresultat {
  id?: number
  dato: number
  antal: number
  rigtige: number
  procent: number
  perKategori: Partial<Record<Kategori, { rigtige: number; antal: number }>>
}
