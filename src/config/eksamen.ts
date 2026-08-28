// Kategorier, eksamensfordeling og målantal for hele spørgsmålsbanken.

export const KATEGORIER = [
  'kastning og stance',
  'lie og marker',
  'OB og hazard',
  'obstakler og lempelse',
  'straf og misplay',
  'putting og Circle 1',
  'etikette 810',
  'Competition Manual',
] as const

export type Kategori = (typeof KATEGORIER)[number]

/** Antal spørgsmål i en eksamenssimulering. */
export const EKSAMEN_ANTAL = 25

/**
 * Kategorifordeling for en eksamen. Summen skal svare til EKSAMEN_ANTAL.
 * Fordelingen følger målantallet for den samlede bank.
 */
export const KATEGORIFORDELING: Record<Kategori, number> = {
  'kastning og stance': 4,
  'lie og marker': 4,
  'OB og hazard': 4,
  'obstakler og lempelse': 3,
  'straf og misplay': 3,
  'putting og Circle 1': 3,
  'etikette 810': 2,
  'Competition Manual': 2,
}

/** Målantal spørgsmål pr. kategori i den færdige bank, i alt 200. */
export const MAALANTAL: Record<Kategori, number> = {
  'kastning og stance': 30,
  'lie og marker': 30,
  'OB og hazard': 30,
  'obstakler og lempelse': 24,
  'straf og misplay': 24,
  'putting og Circle 1': 20,
  'etikette 810': 20,
  'Competition Manual': 22,
}

/** Min egen målsætning for en eksamen, i procent. */
export const MAAL_PROCENT = 80

/** Kortere labels til grafer og tabeller, hvor der ikke er plads. */
export const KORT_NAVN: Record<Kategori, string> = {
  'kastning og stance': 'Kast og stance',
  'lie og marker': 'Lie og marker',
  'OB og hazard': 'OB og hazard',
  'obstakler og lempelse': 'Obstakler',
  'straf og misplay': 'Straf og misplay',
  'putting og Circle 1': 'Putting og C1',
  'etikette 810': 'Etikette',
  'Competition Manual': 'Comp. Manual',
}
