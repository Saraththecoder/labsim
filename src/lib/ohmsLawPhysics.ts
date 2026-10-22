/**
 * Ohm's Law & Circuit Physics Engine
 * Class 10 NCERT Chapter 12 (Electricity)
 * Implements:
 * 1. Ohm's Law: V = I * R (V proportional to I at constant temperature)
 * 2. Series Resistance: Rs = R1 + R2
 * 3. Parallel Resistance: 1/Rp = 1/R1 + 1/R2 => Rp = (R1 * R2) / (R1 + R2)
 * 4. Rheostat control, voltmeter/ammeter deflections, and V-I graph generator.
 */

export type CircuitConfig = 'single' | 'series' | 'parallel';

export interface OhmsLawState {
  config: CircuitConfig;
  r1: number; // Resistance of R1 in Ohms (e.g. 5.0)
  r2: number; // Resistance of R2 in Ohms (e.g. 10.0)
  rheostatResistance: number; // Resistance of rheostat in Ohms (0 to 50 Ohms)
  cellCount: number; // 1 to 4 cells (1.5V each, total 1.5V to 6.0V)
  isPlugKeyClosed: boolean; // Circuit closed or open
}

export interface CircuitReading {
  sNo: number;
  rheostatOhms: number;
  voltageV: number;
  currentMA: number;
  resistanceCalculated: number;
}

export interface OhmsLawCalculationResult {
  config: CircuitConfig;
  circuitResistance: number; // Equivalent R in Ohms
  appliedVoltageV: number; // Battery voltage
  totalCircuitResistance: number; // R_circuit + R_rh
  currentA: number; // Circuit current in Amperes
  currentMA: number; // Circuit current in Milliamperes
  measuredVoltageV: number; // Voltmeter reading across resistor
  measuredCurrentMA: number; // Ammeter reading
  ohmsRatio: number; // V / I in Ohms
  isOhmic: boolean;
  powerWatts: number;
  formulaNote: string;
}

/**
 * Calculate electrical circuit parameters
 */
export function calculateOhmsLaw(state: OhmsLawState): OhmsLawCalculationResult {
  const cellVoltage = 1.5;
  const appliedVoltage = state.isPlugKeyClosed ? state.cellCount * cellVoltage : 0;

  // Calculate equivalent test resistance based on configuration
  let circuitR = state.r1;
  let formulaNote = 'Single Resistor: R = R₁';

  if (state.config === 'series') {
    circuitR = state.r1 + state.r2;
    formulaNote = `Series Combination: Rₛ = R₁ + R₂ (${state.r1}Ω + ${state.r2}Ω = ${circuitR.toFixed(1)}Ω)`;
  } else if (state.config === 'parallel') {
    circuitR = (state.r1 * state.r2) / (state.r1 + state.r2);
    formulaNote = `Parallel Combination: 1/Rₚ = 1/R₁ + 1/R₂ ➔ Rₚ = ${circuitR.toFixed(2)}Ω`;
  }

  // Total resistance including rheostat and internal resistance (~0.2 Ohms)
  const rInternal = 0.2;
  const totalR = circuitR + state.rheostatResistance + rInternal;

  // Circuit current I = V / R_total
  let currentA = 0;
  if (state.isPlugKeyClosed && totalR > 0) {
    currentA = appliedVoltage / totalR;
  }
  const currentMA = currentA * 1000;

  // Voltmeter measures potential difference across the test resistor network
  const measuredV = currentA * circuitR;
  const measuredIMA = currentMA;

  const ohmsRatio = currentA > 0 ? measuredV / currentA : circuitR;
  const powerW = measuredV * currentA;

  return {
    config: state.config,
    circuitResistance: circuitR,
    appliedVoltageV: appliedVoltage,
    totalCircuitResistance: totalR,
    currentA,
    currentMA,
    measuredVoltageV: Number(measuredV.toFixed(2)),
    measuredCurrentMA: Number(measuredIMA.toFixed(1)),
    ohmsRatio: Number(ohmsRatio.toFixed(2)),
    isOhmic: true,
    powerWatts: Number(powerW.toFixed(3)),
    formulaNote,
  };
}

/**
 * Generate 5 standard readings across rheostat positions for plotting V-I curve
 */
export function generateOhmsLawReadings(
  config: CircuitConfig,
  r1: number,
  r2: number,
  cells: number = 3 // 4.5V standard lab supply
): CircuitReading[] {
  const rheostatSteps = [40, 28, 18, 10, 4]; // Adjusting rheostat from high to low resistance

  return rheostatSteps.map((rh, index) => {
    const res = calculateOhmsLaw({
      config,
      r1,
      r2,
      rheostatResistance: rh,
      cellCount: cells,
      isPlugKeyClosed: true,
    });

    return {
      sNo: index + 1,
      rheostatOhms: rh,
      voltageV: res.measuredVoltageV,
      currentMA: res.measuredCurrentMA,
      resistanceCalculated: Number((res.measuredVoltageV / (res.measuredCurrentMA / 1000)).toFixed(2)),
    };
  });
}
