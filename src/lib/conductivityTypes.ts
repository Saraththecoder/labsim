import { z } from 'zod';

export interface ConductivityObservation {
  id: string;
  serialNumber: number;
  solutionId: string;
  solutionName: string;
  concentration: number; // M (mol / L)
  temperature: number; // °C
  electrodeDistance: number; // l (cm)
  electrodeArea: number; // A (cm^2)
  cellConstant: number; // G* = l / A (cm^-1)
  appliedVoltage: number; // V
  current_mA: number; // mA
  resistance_ohm: number; // R (Ohms)
  conductance_mS: number; // G (mS)
  specificConductivity_mS_cm: number; // kappa (mS / cm)
  molarConductivity: number; // Lambda_m (S cm^2 mol^-1)
  degreeOfDissociation: number; // alpha
  bulbGlow: string;
  timestamp: number;
  notes?: string;
}

export const ConductivityObservationSchema = z.object({
  id: z.string(),
  serialNumber: z.number().int().positive(),
  solutionId: z.string(),
  solutionName: z.string(),
  concentration: z.number().positive(),
  temperature: z.number(),
  electrodeDistance: z.number().positive(),
  electrodeArea: z.number().positive(),
  cellConstant: z.number().positive(),
  appliedVoltage: z.number().nonnegative(),
  current_mA: z.number().nonnegative(),
  resistance_ohm: z.number().nonnegative(),
  conductance_mS: z.number().nonnegative(),
  specificConductivity_mS_cm: z.number().nonnegative(),
  molarConductivity: z.number().nonnegative(),
  degreeOfDissociation: z.number().nonnegative(),
  bulbGlow: z.string(),
  timestamp: z.number(),
  notes: z.string().optional(),
});
