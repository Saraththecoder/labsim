import { QuizQuestion } from './types';

export const CONDUCTIVITY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cq1',
    question: 'Why does an aqueous solution of glucose (C₆H₁₂O₆) fail to conduct electric current and keep the bulb OFF?',
    options: [
      'Glucose is a solid at room temperature',
      'Glucose forms covalent molecular bonds and does not dissociate into free, mobile ions in water',
      'The water reacts with glucose to neutralize all charges',
      'Glucose has a high dielectric constant',
    ],
    correctIndex: 1,
    explanation:
      'Electrical conduction in liquids requires charged charge carriers (cations and anions) free to move under an electric field. Glucose is a covalent molecular compound that dissolves as intact neutral molecules, producing zero free ions.',
    conceptTag: 'Non-Electrolytes',
  },
  {
    id: 'cq2',
    question: 'What happens to the Specific Conductivity (κ) and Molar Conductivity (Λₘ) of an electrolyte solution upon dilution (adding water)?',
    options: [
      'Both κ and Λₘ increase',
      'Both κ and Λₘ decrease',
      'Specific conductivity (κ) decreases, while molar conductivity (Λₘ) increases',
      'Specific conductivity (κ) increases, while molar conductivity (Λₘ) decreases',
    ],
    correctIndex: 2,
    explanation:
      'Specific conductivity (κ) is the conductance of 1 cm³ of solution; upon dilution, the number of ions per unit volume decreases, so κ decreases. In contrast, molar conductivity (Λm = 1000κ/C) increases because volume increases and inter-ionic hindrances decrease (or degree of dissociation α increases).',
    conceptTag: 'Dilution Effect',
  },
  {
    id: 'cq3',
    question: 'The cell constant (G*) of a conductivity cell is given by which relationship?',
    options: [
      'G* = A / l',
      'G* = l / A',
      'G* = R × κ',
      'Both G* = l / A and G* = R × κ are correct',
    ],
    correctIndex: 3,
    explanation:
      'Geometrically, cell constant is the ratio of distance between electrodes (l) to their cross-sectional area (A): G* = l / A. Electrically, since R = ρ(l/A) = (1/κ)G*, we have G* = R × κ.',
    conceptTag: 'Cell Constant',
  },
  {
    id: 'cq4',
    question: 'Why does hydrochloric acid (HCl) exhibit a significantly higher molar conductivity (426 S cm² mol⁻¹) than sodium chloride (126 S cm² mol⁻¹)?',
    options: [
      'Chloride ions move faster in acid',
      'H⁺ ions are smaller than Na⁺ ions',
      'H⁺ ions conduct via the rapid Grotthuss proton-hopping mechanism across hydrogen-bonded water networks',
      'Hydrochloric acid has a higher dielectric constant',
    ],
    correctIndex: 2,
    explanation:
      'Protons (H⁺) do not simply drift mechanically like sodium ions; they transfer rapidly by proton-hopping (Grotthuss mechanism) along hydrogen bonds connecting neighboring water molecules, resulting in anomalous high ionic mobility (λ° = 349.6 S cm² mol⁻¹).',
    conceptTag: 'Ionic Mobility',
  },
  {
    id: 'cq5',
    question: 'According to Kohlrausch’s Law of Independent Migration of Ions, the limiting molar conductivity of acetic acid (CH₃COOH) can be calculated from:',
    options: [
      'Λ°(CH₃COOH) = Λ°(CH₃COONa) + Λ°(HCl) - Λ°(NaCl)',
      'Λ°(CH₃COOH) = Λ°(CH₃COONa) - Λ°(HCl) + Λ°(NaCl)',
      'Λ°(CH₃COOH) = Λ°(NaCl) + Λ°(HCl) - Λ°(CH₃COONa)',
      'Λ°(CH₃COOH) = Λ°(CH₃COONa) × Λ°(HCl) / Λ°(NaCl)',
    ],
    correctIndex: 0,
    explanation:
      'By Kohlrausch’s law: Λ°(CH₃COONa) + Λ°(HCl) - Λ°(NaCl) = (λ°_CH₃COO⁻ + λ°_Na⁺) + (λ°_H⁺ + λ°_Cl⁻) - (λ°_Na⁺ + λ°_Cl⁻) = λ°_CH₃COO⁻ + λ°_H⁺ = Λ°(CH₃COOH). This is crucial because weak electrolytes cannot be extrapolated directly to zero concentration.',
    conceptTag: 'Kohlrausch Law',
  },
  {
    id: 'cq6',
    question: 'How does an increase in solution temperature affect the electrical conductivity of an electrolytic solution?',
    options: [
      'Conductivity decreases due to increased ion collisions',
      'Conductivity increases because ionic mobility increases and solvent viscosity decreases',
      'Conductivity remains strictly constant',
      'Conductivity drops to zero above 50°C',
    ],
    correctIndex: 1,
    explanation:
      'Unlike metallic conductors where resistance increases with temperature, electrolytic conductivity increases by roughly 2% per °C rise because thermal energy reduces solvent viscosity and enhances average kinetic mobility of hydrated ions.',
    conceptTag: 'Temperature Dependence',
  },
  {
    id: 'cq7',
    question: 'For a weak electrolyte like acetic acid, the degree of dissociation (α) is related to molar conductivities by:',
    options: [
      'α = Λₘ° / Λₘ',
      'α = Λₘ / Λₘ°',
      'α = Λₘ × Λₘ°',
      'α = (Λₘ - Λₘ°) / 1000',
    ],
    correctIndex: 1,
    explanation:
      'According to Arrhenius and Ostwald, the degree of dissociation α equals the ratio of molar conductivity at concentration C (Λm) to the limiting molar conductivity at infinite dilution (Λm°): α = Λm / Λm°.',
    conceptTag: 'Degree of Dissociation',
  },
  {
    id: 'cq8',
    question: 'Why is an Alternating Current (AC) source preferred over Direct Current (DC) when measuring electrolytic conductivity in analytical laboratories?',
    options: [
      'DC current is too dangerous',
      'AC current produces more light in the indicator bulb',
      'DC current causes chemical electrolysis and electrode polarization, altering solution composition and creating back-EMF',
      'AC current eliminates water molecules',
    ],
    correctIndex: 2,
    explanation:
      'Continuous DC causes electrochemical decomposition (electrolysis), gas bubble deposition, and polarization impedance. High-frequency AC reverses direction rapidly, avoiding net chemical change and polarization layers.',
    conceptTag: 'Laboratory Technique',
  },
];
