import { ConductivityObservation } from './conductivityTypes';

const STORAGE_KEY = 'ar_conductivity_observations_v1';
const QUIZ_KEY = 'ar_conductivity_quiz_score_v1';

export const DEFAULT_CONDUCTIVITY_OBSERVATIONS: ConductivityObservation[] = [
  {
    id: 'cond-1',
    serialNumber: 1,
    solutionId: 'nacl',
    solutionName: 'Sodium Chloride (NaCl)',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    cellConstant: 0.5,
    appliedVoltage: 6.0,
    current_mA: 112.4,
    resistance_ohm: 38.4,
    conductance_mS: 26.04,
    specificConductivity_mS_cm: 13.02,
    molarConductivity: 130.2,
    degreeOfDissociation: 1.0,
    bulbGlow: 'Bright (100%)',
    timestamp: 1771500000000,
    notes: 'Strong electrolyte: Complete ionization into Na⁺ & Cl⁻',
  },
  {
    id: 'cond-2',
    serialNumber: 2,
    solutionId: 'hcl',
    solutionName: 'Hydrochloric Acid (HCl)',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    cellConstant: 0.5,
    appliedVoltage: 6.0,
    current_mA: 218.6,
    resistance_ohm: 12.4,
    conductance_mS: 80.64,
    specificConductivity_mS_cm: 40.32,
    molarConductivity: 403.2,
    degreeOfDissociation: 1.0,
    bulbGlow: 'Very Bright (100%)',
    timestamp: 1771500000000,
    notes: 'Exceptionally high conductance due to proton jumping (Grotthuss mechanism)',
  },
  {
    id: 'cond-3',
    serialNumber: 3,
    solutionId: 'ch3cooh',
    solutionName: 'Acetic Acid (CH₃COOH)',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    cellConstant: 0.5,
    appliedVoltage: 6.0,
    current_mA: 8.6,
    resistance_ohm: 682.0,
    conductance_mS: 1.47,
    specificConductivity_mS_cm: 0.73,
    molarConductivity: 7.33,
    degreeOfDissociation: 0.0134,
    bulbGlow: 'Dim (Faint Red Filament)',
    timestamp: 1771500000000,
    notes: 'Weak electrolyte: Only ~1.3% molecules dissociated at 0.1M',
  },
  {
    id: 'cond-4',
    serialNumber: 4,
    solutionId: 'glucose',
    solutionName: 'Glucose (C₆H₁₂O₆)',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    cellConstant: 0.5,
    appliedVoltage: 6.0,
    current_mA: 0.0,
    resistance_ohm: 999999,
    conductance_mS: 0.0,
    specificConductivity_mS_cm: 0.0,
    molarConductivity: 0.0,
    degreeOfDissociation: 0.0,
    bulbGlow: 'OFF (No Glow)',
    timestamp: 1771500000000,
    notes: 'Non-electrolyte: Covalent sugar molecules produce no ions',
  },
  {
    id: 'cond-5',
    serialNumber: 5,
    solutionId: 'distilled_water',
    solutionName: 'Pure Deionized Water (H₂O)',
    concentration: 0.0000001,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    cellConstant: 0.5,
    appliedVoltage: 6.0,
    current_mA: 0.0,
    resistance_ohm: 909090,
    conductance_mS: 0.001,
    specificConductivity_mS_cm: 0.00005,
    molarConductivity: 548.7,
    degreeOfDissociation: 0.0000001,
    bulbGlow: 'OFF (No Glow)',
    timestamp: 1771500000000,
    notes: 'Negligible ionic conduction (Kw = 10⁻¹⁴). Insulating liquid.',
  },
];

export function getConductivityObservations(): ConductivityObservation[] {
  if (typeof window === 'undefined') return DEFAULT_CONDUCTIVITY_OBSERVATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONDUCTIVITY_OBSERVATIONS));
      return DEFAULT_CONDUCTIVITY_OBSERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONDUCTIVITY_OBSERVATIONS;
  }
}

export function saveConductivityObservations(list: ConductivityObservation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save conductivity observations:', err);
  }
}

export function addConductivityObservation(
  obs: Omit<ConductivityObservation, 'id' | 'serialNumber' | 'timestamp'>
): ConductivityObservation {
  const current = getConductivityObservations();
  const newObs: ConductivityObservation = {
    ...obs,
    id: 'cond-obs-' + Date.now(),
    serialNumber: current.length + 1,
    timestamp: Date.now(),
  };
  const updated = [...current, newObs];
  saveConductivityObservations(updated);
  return newObs;
}

export function deleteConductivityObservation(id: string): ConductivityObservation[] {
  const current = getConductivityObservations();
  const filtered = current
    .filter((o) => o.id !== id)
    .map((o, idx) => ({ ...o, serialNumber: idx + 1 }));
  saveConductivityObservations(filtered);
  return filtered;
}

export function clearConductivityObservations(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function resetConductivityObservations(): ConductivityObservation[] {
  saveConductivityObservations(DEFAULT_CONDUCTIVITY_OBSERVATIONS);
  return DEFAULT_CONDUCTIVITY_OBSERVATIONS;
}

export function getConductivityQuizScore(): { score: number; total: number; percentage: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConductivityQuizScore(score: number, total: number): void {
  if (typeof window === 'undefined') return;
  const data = {
    score,
    total,
    percentage: Math.round((score / total) * 100),
    timestamp: Date.now(),
  };
  localStorage.setItem(QUIZ_KEY, JSON.stringify(data));
}

export function exportConductivityCSV(observations: ConductivityObservation[]): string {
  const headers = [
    'S.No',
    'Solution Name',
    'Concentration C (mol/L)',
    'Temperature (°C)',
    'Electrode Distance l (cm)',
    'Electrode Area A (cm²)',
    'Cell Constant G* (cm⁻¹)',
    'Applied Voltage V (V)',
    'Circuit Current I (mA)',
    'Resistance R (Ω)',
    'Conductance G (mS)',
    'Specific Conductivity κ (mS/cm)',
    'Molar Conductivity Λm (S cm² mol⁻¹)',
    'Degree of Dissociation α',
    'Bulb State',
    'Notes',
  ];

  const rows = observations.map((o) => [
    o.serialNumber,
    `"${o.solutionName}"`,
    o.concentration,
    o.temperature,
    o.electrodeDistance,
    o.electrodeArea,
    o.cellConstant,
    o.appliedVoltage,
    o.current_mA,
    o.resistance_ohm,
    o.conductance_mS,
    o.specificConductivity_mS_cm,
    o.molarConductivity,
    o.degreeOfDissociation,
    `"${o.bulbGlow}"`,
    `"${o.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
