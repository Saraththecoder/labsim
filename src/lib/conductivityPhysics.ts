/**
 * Electrolytic Conductivity Physics & Chemistry Engine
 * Models ionic dissociation, Kohlrausch's law, Ostwald dilution law for weak electrolytes,
 * Debye-Hückel-Onsager equation for strong electrolytes, cell constant, and electric circuit current.
 */

export type ElectrolyteType = 'strong' | 'weak' | 'non-electrolyte';

export interface ElectrolyteSolution {
  id: string;
  name: string;
  formula: string;
  type: ElectrolyteType;
  description: string;
  colorHex: string;
  cation: { name: string; formula: string; charge: number; lambda0: number; color: string };
  anion: { name: string; formula: string; charge: number; lambda0: number; color: string };
  lambda0: number; // Limiting molar conductivity (S cm^2 mol^-1) at 25°C
  Ka?: number; // Acid/base dissociation constant for weak electrolytes
  defaultConcentration: number; // in mol/L (M)
}

export const SOLUTIONS_DATABASE: ElectrolyteSolution[] = [
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    formula: 'HCl (aq)',
    type: 'strong',
    description: 'Strong acid with exceptionally high conductance due to proton-hopping (Grotthuss mechanism) of H⁺ ions.',
    colorHex: '#e0f2fe',
    cation: { name: 'Hydrogen ion', formula: 'H⁺', charge: 1, lambda0: 349.6, color: '#f59e0b' },
    anion: { name: 'Chloride ion', formula: 'Cl⁻', charge: -1, lambda0: 76.3, color: '#10b981' },
    lambda0: 425.9,
    defaultConcentration: 0.1,
  },
  {
    id: 'nacl',
    name: 'Sodium Chloride (Salt Solution)',
    formula: 'NaCl (aq)',
    type: 'strong',
    description: 'Prototypical strong 1:1 electrolyte. Completely dissociates into Na⁺ and Cl⁻ ions.',
    colorHex: '#f0f9ff',
    cation: { name: 'Sodium ion', formula: 'Na⁺', charge: 1, lambda0: 50.1, color: '#38bdf8' },
    anion: { name: 'Chloride ion', formula: 'Cl⁻', charge: -1, lambda0: 76.3, color: '#10b981' },
    lambda0: 126.4,
    defaultConcentration: 0.1,
  },
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH (aq)',
    type: 'strong',
    description: 'Strong base with high conductance due to the rapid mobility of hydroxide (OH⁻) ions.',
    colorHex: '#eff6ff',
    cation: { name: 'Sodium ion', formula: 'Na⁺', charge: 1, lambda0: 50.1, color: '#38bdf8' },
    anion: { name: 'Hydroxide ion', formula: 'OH⁻', charge: -1, lambda0: 199.1, color: '#ec4899' },
    lambda0: 249.2,
    defaultConcentration: 0.1,
  },
  {
    id: 'cuso4',
    name: 'Copper(II) Sulfate',
    formula: 'CuSO₄ (aq)',
    type: 'strong',
    description: 'Divalent 2:2 strong electrolyte with characteristic deep sky-blue color. Exhibits copper deposition at the cathode.',
    colorHex: '#38bdf8',
    cation: { name: 'Copper(II) ion', formula: 'Cu²⁺', charge: 2, lambda0: 107.2, color: '#0284c7' },
    anion: { name: 'Sulfate ion', formula: 'SO₄²⁻', charge: -2, lambda0: 160.0, color: '#8b5cf6' },
    lambda0: 267.2,
    defaultConcentration: 0.05,
  },
  {
    id: 'ch3cooh',
    name: 'Acetic Acid (Vinegar)',
    formula: 'CH₃COOH (aq)',
    type: 'weak',
    description: 'Weak organic acid. Only partially dissociates into CH₃COO⁻ and H⁺ ions (Ka = 1.8 × 10⁻⁵). Bulb glows dimly.',
    colorHex: '#fefce8',
    cation: { name: 'Hydrogen ion', formula: 'H⁺', charge: 1, lambda0: 349.6, color: '#f59e0b' },
    anion: { name: 'Acetate ion', formula: 'CH₃COO⁻', charge: -1, lambda0: 40.9, color: '#eab308' },
    lambda0: 390.5,
    Ka: 1.8e-5,
    defaultConcentration: 0.1,
  },
  {
    id: 'nh4oh',
    name: 'Ammonium Hydroxide',
    formula: 'NH₄OH (aq)',
    type: 'weak',
    description: 'Weak base with low degree of ionization (Kb = 1.77 × 10⁻⁵). Molar conductivity increases sharply upon dilution.',
    colorHex: '#f8fafc',
    cation: { name: 'Ammonium ion', formula: 'NH₄⁺', charge: 1, lambda0: 73.5, color: '#a855f7' },
    anion: { name: 'Hydroxide ion', formula: 'OH⁻', charge: -1, lambda0: 199.1, color: '#ec4899' },
    lambda0: 272.6,
    Ka: 1.77e-5,
    defaultConcentration: 0.1,
  },
  {
    id: 'glucose',
    name: 'Glucose (Dextrose)',
    formula: 'C₆H₁₂O₆ (aq)',
    type: 'non-electrolyte',
    description: 'Covalent molecular compound. Dissolves as neutral molecules without generating free ions. Zero conductance; bulb stays dark.',
    colorHex: '#fdf4ff',
    cation: { name: 'None', formula: '—', charge: 0, lambda0: 0, color: '#94a3b8' },
    anion: { name: 'None', formula: '—', charge: 0, lambda0: 0, color: '#94a3b8' },
    lambda0: 0,
    defaultConcentration: 0.1,
  },
  {
    id: 'distilled_water',
    name: 'Pure Deionized Water',
    formula: 'H₂O (l)',
    type: 'non-electrolyte',
    description: 'Ultra-pure water has negligible self-ionization (Kw = 10⁻¹⁴). Practically non-conducting; bulb stays completely OFF.',
    colorHex: '#f0fdf4',
    cation: { name: 'Hydronium', formula: 'H₃O⁺', charge: 1, lambda0: 349.6, color: '#f59e0b' },
    anion: { name: 'Hydroxide', formula: 'OH⁻', charge: -1, lambda0: 199.1, color: '#ec4899' },
    lambda0: 548.7,
    defaultConcentration: 0.0000001,
  },
];

export interface ConductivityCellState {
  solutionId: string;
  concentration: number; // Molarity C (mol / L), e.g. 0.01 to 1.0 M
  temperature: number; // in °C, e.g. 25°C
  electrodeDistance: number; // l in cm (e.g. 2.0 cm)
  electrodeArea: number; // A in cm^2 (e.g. 4.0 cm^2)
  appliedVoltage: number; // V in Volts (e.g. 6.0 V)
  isPowerOn: boolean;
}

export interface ConductivityResult {
  solution: ElectrolyteSolution;
  concentration: number;
  temperature: number;
  cellConstant: number; // G* = l / A in cm^-1
  degreeOfDissociation: number; // alpha (0 to 1)
  molarConductivity: number; // Lambda_m in S cm^2 mol^-1
  specificConductivity: number; // kappa in S cm^-1 (or mS cm^-1)
  specificConductivity_mS_cm: number;
  cellConductance: number; // G in S or mS
  cellResistance: number; // R in Ohms
  circuitCurrent: number; // I in Amperes
  circuitCurrent_mA: number; // I in mA
  bulbBrightnessPercent: number; // 0% to 100%
  bulbState: 'OFF' | 'DIM' | 'MODERATE' | 'BRIGHT' | 'VERY_BRIGHT';
  ionsActiveCount: number; // for 3D particle rendering
}

/**
 * Calculates electrolytic parameters, Ohm's law, and circuit behavior
 */
export function calculateConductivity(state: ConductivityCellState): ConductivityResult {
  const solution = SOLUTIONS_DATABASE.find((s) => s.id === state.solutionId) || SOLUTIONS_DATABASE[1];
  const C = Math.max(0.0001, state.concentration);
  const T = state.temperature;
  const l = Math.max(0.5, state.electrodeDistance);
  const A = Math.max(0.5, state.electrodeArea);
  const V = state.isPowerOn ? Math.max(0, state.appliedVoltage) : 0;

  // 1. Cell Constant G* = l / A (cm^-1)
  const cellConstant = l / A;

  // Temperature correction factor (~ 2% per °C relative to 25°C)
  const tempFactor = 1.0 + 0.02 * (T - 25);

  let alpha = 1.0;
  let molarConductivity = 0;

  if (solution.type === 'non-electrolyte') {
    if (solution.id === 'distilled_water') {
      // Self-ionization of pure water: [H+] = [OH-] = 10^-7 M at 25°C
      alpha = 1e-7;
      molarConductivity = solution.lambda0 * tempFactor;
    } else {
      alpha = 0;
      molarConductivity = 0;
    }
  } else if (solution.type === 'weak') {
    // Ostwald's Dilution Law for weak electrolytes:
    // Ka = (C * alpha^2) / (1 - alpha)
    // C * alpha^2 + Ka * alpha - Ka = 0
    // alpha = (-Ka + sqrt(Ka^2 + 4 * C * Ka)) / (2 * C)
    const Ka = solution.Ka || 1.8e-5;
    alpha = (-Ka + Math.sqrt(Ka * Ka + 4 * C * Ka)) / (2 * C);
    alpha = Math.max(0, Math.min(1.0, alpha));
    molarConductivity = alpha * solution.lambda0 * tempFactor;
  } else {
    // Strong Electrolyte: Debye-Hückel-Onsager equation:
    // Lambda_m = Lambda_m^0 - B * sqrt(C)
    alpha = 1.0;
    const B = 60.0; // Onsager constant approximation for aqueous solution
    molarConductivity = Math.max(20, (solution.lambda0 - B * Math.sqrt(C)) * tempFactor);
  }

  // 2. Specific Conductivity (kappa):
  // Lambda_m = (1000 * kappa) / C ==> kappa = (Lambda_m * C) / 1000  [S cm^-1]
  const specificConductivity = (molarConductivity * C) / 1000;
  const specificConductivity_mS_cm = specificConductivity * 1000;

  // 3. Cell Conductance G:
  // G = kappa / G* = kappa * (A / l)  [S]
  const cellConductance = specificConductivity / cellConstant;

  // 4. Cell Resistance R:
  // R = 1 / G = cellConstant / kappa  [Ohms]
  const cellResistance = cellConductance > 1e-9 ? 1 / cellConductance : 1e9;

  // 5. Circuit Current:
  // I = V / (R_cell + R_internal + R_bulb)
  // Let bulb resistance be 15 Ohms, internal resistance 1 Ohm
  const rBulb = 15;
  const rInternal = 1;
  const circuitCurrent = V > 0 ? V / (cellResistance + rBulb + rInternal) : 0;
  const circuitCurrent_mA = circuitCurrent * 1000;

  // 6. Indicator Bulb Glow:
  // Standard 6V 0.3A flashlight bulb reaches full glow at ~250mA (0.25A)
  const fullGlowCurrent = 0.25;
  const bulbBrightnessPercent = Math.min(100, Math.round((circuitCurrent / fullGlowCurrent) * 100));

  let bulbState: ConductivityResult['bulbState'] = 'OFF';
  if (bulbBrightnessPercent > 80) bulbState = 'VERY_BRIGHT';
  else if (bulbBrightnessPercent > 45) bulbState = 'BRIGHT';
  else if (bulbBrightnessPercent > 15) bulbState = 'MODERATE';
  else if (bulbBrightnessPercent > 2) bulbState = 'DIM';
  else bulbState = 'OFF';

  // 7. Microscopic particle count representation (0 to 60 ions)
  const ionsActiveCount = Math.min(60, Math.round(alpha * C * 120) + (solution.type === 'strong' ? 15 : 2));

  return {
    solution,
    concentration: C,
    temperature: T,
    cellConstant: Number(cellConstant.toFixed(3)),
    degreeOfDissociation: Number(alpha.toFixed(4)),
    molarConductivity: Number(molarConductivity.toFixed(2)),
    specificConductivity: Number(specificConductivity.toFixed(6)),
    specificConductivity_mS_cm: Number(specificConductivity_mS_cm.toFixed(3)),
    cellConductance: Number(cellConductance.toFixed(5)),
    cellResistance: Number(cellResistance.toFixed(1)),
    circuitCurrent: Number(circuitCurrent.toFixed(4)),
    circuitCurrent_mA: Number(circuitCurrent_mA.toFixed(1)),
    bulbBrightnessPercent,
    bulbState,
    ionsActiveCount,
  };
}
