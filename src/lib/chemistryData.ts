export interface ChemicalSolution {
  id: string;
  name: string;
  formula: string;
  ph: number;
  type: 'strong-acid' | 'weak-acid' | 'neutral' | 'weak-base' | 'strong-base';
  description: string;
  universalColor: string;
  redLitmusResult: 'red' | 'blue';
  blueLitmusResult: 'red' | 'blue';
  phenolphthaleinResult: 'colorless' | 'pink';
  methylOrangeResult: 'red' | 'yellow';
}

export interface pHIndicatorTest {
  id: string;
  name: string;
  type: 'paper' | 'liquid';
  description: string;
}

export const CHEMICAL_SOLUTIONS: ChemicalSolution[] = [
  {
    id: 'hcl',
    name: 'Dilute Hydrochloric Acid',
    formula: 'HCl (aq)',
    ph: 1.2,
    type: 'strong-acid',
    description: 'Completely ionises in aqueous solution to yield high concentration of H⁺ (aq) hydronium ions.',
    universalColor: '#dc2626',
    redLitmusResult: 'red',
    blueLitmusResult: 'red',
    phenolphthaleinResult: 'colorless',
    methylOrangeResult: 'red',
  },
  {
    id: 'ch3cooh',
    name: 'Dilute Ethanoic Acid (Acetic Acid)',
    formula: 'CH₃COOH (aq)',
    ph: 3.5,
    type: 'weak-acid',
    description: 'Partially ionises in solution; common component of vinegar with pungent odour.',
    universalColor: '#f97316',
    redLitmusResult: 'red',
    blueLitmusResult: 'red',
    phenolphthaleinResult: 'colorless',
    methylOrangeResult: 'red',
  },
  {
    id: 'lemon',
    name: 'Lemon Juice (Citric Acid)',
    formula: 'C₆H₈O₇ (aq)',
    ph: 2.4,
    type: 'weak-acid',
    description: 'Natural organic tri-carboxylic acid found in citrus fruits.',
    universalColor: '#ea580c',
    redLitmusResult: 'red',
    blueLitmusResult: 'red',
    phenolphthaleinResult: 'colorless',
    methylOrangeResult: 'red',
  },
  {
    id: 'water',
    name: 'Distilled Water',
    formula: 'H₂O (l)',
    ph: 7.0,
    type: 'neutral',
    description: 'Deionised pure neutral solvent where [H⁺] = [OH⁻] = 10⁻⁷ mol/L at 25°C.',
    universalColor: '#22c55e',
    redLitmusResult: 'red',
    blueLitmusResult: 'blue',
    phenolphthaleinResult: 'colorless',
    methylOrangeResult: 'yellow',
  },
  {
    id: 'nahco3',
    name: 'Sodium Hydrogen Carbonate Solution',
    formula: 'NaHCO₃ (aq)',
    ph: 8.5,
    type: 'weak-base',
    description: 'Baking soda solution; basic salt formed by strong base (NaOH) and weak acid (H₂CO₃).',
    universalColor: '#0284c7',
    redLitmusResult: 'blue',
    blueLitmusResult: 'blue',
    phenolphthaleinResult: 'pink',
    methylOrangeResult: 'yellow',
  },
  {
    id: 'naoh',
    name: 'Dilute Sodium Hydroxide Solution',
    formula: 'NaOH (aq)',
    ph: 13.5,
    type: 'strong-base',
    description: 'Caustic soda; fully dissociates to provide high OH⁻ (aq) hydroxide ion concentration.',
    universalColor: '#7c3aed',
    redLitmusResult: 'blue',
    blueLitmusResult: 'blue',
    phenolphthaleinResult: 'pink',
    methylOrangeResult: 'yellow',
  },
];

export const INDICATORS: pHIndicatorTest[] = [
  { id: 'universal', name: 'Universal Indicator Paper', type: 'paper', description: 'Broad spectrum mixture showing distinct color across pH 1 to 14' },
  { id: 'red-litmus', name: 'Red Litmus Paper', type: 'paper', description: 'Turns blue in alkaline/basic solutions (pH > 7); unaffected by acid' },
  { id: 'blue-litmus', name: 'Blue Litmus Paper', type: 'paper', description: 'Turns red in acidic solutions (pH < 7); unaffected by base' },
  { id: 'phenolphthalein', name: 'Phenolphthalein Solution', type: 'liquid', description: 'Colorless in acidic/neutral media; turns vivid magenta pink in alkaline medium' },
  { id: 'methyl-orange', name: 'Methyl Orange Solution', type: 'liquid', description: 'Turns red-pink in acidic solutions; yellow in neutral and basic solutions' },
];

export const PH_CHART_SCALE = [
  { ph: 1, color: '#b91c1c', label: 'Strong Acid' },
  { ph: 2, color: '#dc2626', label: 'Acidic' },
  { ph: 3, color: '#ea580c', label: 'Acidic' },
  { ph: 4, color: '#f97316', label: 'Moderate Acid' },
  { ph: 5, color: '#f59e0b', label: 'Weak Acid' },
  { ph: 6, color: '#84cc16', label: 'Very Weak Acid' },
  { ph: 7, color: '#22c55e', label: 'Neutral (Pure Water)' },
  { ph: 8, color: '#10b981', label: 'Very Weak Base' },
  { ph: 9, color: '#06b6d4', label: 'Weak Base' },
  { ph: 10, color: '#0284c7', label: 'Moderate Base' },
  { ph: 11, color: '#2563eb', label: 'Basic' },
  { ph: 12, color: '#4f46e5', label: 'Basic' },
  { ph: 13, color: '#7c3aed', label: 'Strong Base' },
  { ph: 14, color: '#581c87', label: 'Extremely Alkaline' },
];

export interface DisplacementState {
  timeMinutes: number;
  nailSubmerged: boolean;
  solutionTempC: number;
}

export function calculateDisplacement(timeMinutes: number) {
  const fraction = Math.min(1.0, timeMinutes / 25.0);
  
  // Color transition from vibrant azure blue (CuSO4) to pale green (FeSO4)
  const r = Math.round(30 + fraction * (140 - 30));
  const g = Math.round(144 + fraction * (225 - 144));
  const b = Math.round(255 - fraction * (255 - 180));
  const solutionColor = `rgb(${r}, ${g}, ${b})`;

  const copperCoatingOpacity = fraction * 0.95;
  const ironDepositThicknessMm = (fraction * 0.45).toFixed(2);
  const tempRise = (24 + fraction * 3.8).toFixed(1);

  return {
    fraction,
    solutionColor,
    copperCoatingOpacity,
    ironDepositThicknessMm,
    tempRise,
    isComplete: fraction >= 0.95,
  };
}
