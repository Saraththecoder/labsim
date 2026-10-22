/**
 * Triangular Glass Prism Physics & Dispersion Engine
 * Class 10 NCERT Chapter 11 (Human Eye and the Colourful World)
 * Implements:
 * 1. Monochromatic Refraction: A + D = i + e
 * 2. Minimum Deviation (Dm) and Refractive Index: n = sin((A + Dm)/2) / sin(A/2)
 * 3. White Light Dispersion into VIBGYOR spectrum (Newton's Spectrum)
 */

export interface PrismState {
  angleIncidenceDeg: number; // ∠i in degrees (typically 30° to 70°)
  prismAngleDeg?: number; // Apex angle A (typically 60° for equilateral prism)
  refractiveIndex: number; // n (e.g. 1.52 for Crown Glass)
  mode: 'monochromatic' | 'dispersion'; // Single ray vs VIBGYOR
}

export interface SpectralRay {
  colorName: string;
  colorHex: string;
  wavelengthNm: number;
  refractiveIndex: number;
  r1Deg: number;
  r2Deg: number;
  eDeg: number;
  deviationDeg: number;
}

export interface PrismCalculationResult {
  angleIncidenceDeg: number;
  angleIncidenceRad: number;
  prismAngleDeg: number;
  prismAngleRad: number;
  r1Deg: number;
  r1Rad: number;
  r2Deg: number;
  r2Rad: number;
  angleEmergenceDeg: number;
  angleEmergenceRad: number;
  angleDeviationDeg: number;
  angleDeviationRad: number;
  minimumDeviationDeg: number;
  isMinimumDeviation: boolean;
  isTotalInternalReflection: boolean;
  spectralRays?: SpectralRay[];
  inferences: string[];
}

/**
 * Standard VIBGYOR wavelengths and Cauchy dispersion model for glass
 */
export const VIBGYOR_SPECTRUM = [
  { name: 'Red', hex: '#ef4444', wavelength: 700, cauchyOffset: -0.015 },
  { name: 'Orange', hex: '#f97316', wavelength: 620, cauchyOffset: -0.008 },
  { name: 'Yellow', hex: '#eab308', wavelength: 580, cauchyOffset: 0.0 },
  { name: 'Green', hex: '#10b981', wavelength: 530, cauchyOffset: +0.007 },
  { name: 'Blue', hex: '#06b6d4', wavelength: 480, cauchyOffset: +0.015 },
  { name: 'Indigo', hex: '#4f46e5', wavelength: 440, cauchyOffset: +0.022 },
  { name: 'Violet', hex: '#8b5cf6', wavelength: 400, cauchyOffset: +0.030 },
];

/**
 * Calculate ray path through a triangular prism
 */
export function calculatePrismRay(
  iDeg: number,
  A_deg: number,
  n: number
): {
  r1Deg: number;
  r2Deg: number;
  eDeg: number;
  devDeg: number;
  tir: boolean;
} {
  const iRad = (iDeg * Math.PI) / 180;
  const ARad = (A_deg * Math.PI) / 180;

  // Face 1: Air -> Glass
  // 1.0 * sin(i) = n * sin(r1) => sin(r1) = sin(i) / n
  const sinR1 = Math.sin(iRad) / n;
  if (sinR1 > 1.0) {
    return { r1Deg: 0, r2Deg: 0, eDeg: 0, devDeg: 0, tir: true };
  }
  const r1Rad = Math.asin(sinR1);
  const r1Deg = (r1Rad * 180) / Math.PI;

  // Geometry inside triangular prism: r1 + r2 = A => r2 = A - r1
  const r2Rad = ARad - r1Rad;
  const r2Deg = (r2Rad * 180) / Math.PI;

  // Face 2: Glass -> Air
  // n * sin(r2) = 1.0 * sin(e) => sin(e) = n * sin(r2)
  const sinE = n * Math.sin(r2Rad);
  if (sinE > 1.0 || r2Rad < 0) {
    // Total internal reflection at face 2
    return { r1Deg, r2Deg, eDeg: 90, devDeg: 90, tir: true };
  }
  const eRad = Math.asin(sinE);
  const eDeg = (eRad * 180) / Math.PI;

  // Angle of Deviation D: D = i + e - A
  const devRad = iRad + eRad - ARad;
  const devDeg = (devRad * 180) / Math.PI;

  return { r1Deg, r2Deg, eDeg, devDeg, tir: false };
}

/**
 * Full calculation for single ray and VIBGYOR dispersion
 */
export function calculateGlassPrism(state: PrismState): PrismCalculationResult {
  const iDeg = Math.max(25, Math.min(75, state.angleIncidenceDeg));
  const A_deg = state.prismAngleDeg ?? 60.0; // Standard 60° equilateral prism
  const n = Math.max(1.1, state.refractiveIndex);

  const baseRay = calculatePrismRay(iDeg, A_deg, n);

  // Minimum deviation Dm occurs when i = e and r1 = r2 = A/2 = 30°
  // n = sin((A + Dm)/2) / sin(A/2) => sin((A + Dm)/2) = n * sin(A/2)
  const sinHalfADm = n * Math.sin(((A_deg / 2) * Math.PI) / 180);
  let DmDeg = 0;
  if (sinHalfADm <= 1.0) {
    const halfADmRad = Math.asin(sinHalfADm);
    DmDeg = 2 * ((halfADmRad * 180) / Math.PI) - A_deg;
  }

  const isMinDev = Math.abs(baseRay.devDeg - DmDeg) <= 0.8;

  // Calculate VIBGYOR spectrum if mode is dispersion
  let spectralRays: SpectralRay[] | undefined = undefined;
  if (state.mode === 'dispersion') {
    spectralRays = VIBGYOR_SPECTRUM.map((col) => {
      const colN = n + col.cauchyOffset;
      const res = calculatePrismRay(iDeg, A_deg, colN);
      return {
        colorName: col.name,
        colorHex: col.hex,
        wavelengthNm: col.wavelength,
        refractiveIndex: colN,
        r1Deg: res.r1Deg,
        r2Deg: res.r2Deg,
        eDeg: res.eDeg,
        deviationDeg: res.devDeg,
      };
    });
  }

  const inferences = [
    `Relation Verified: A + D = i + e (${A_deg.toFixed(1)}° + ${baseRay.devDeg.toFixed(1)}° = ${(A_deg + baseRay.devDeg).toFixed(1)}° ≈ ${(iDeg + baseRay.eDeg).toFixed(1)}°).`,
    `Angle of Minimum Deviation (Dm) = ${DmDeg.toFixed(1)}°: At minimum deviation, the refracted ray inside is parallel to the base of the prism.`,
    `VIBGYOR Dispersion: Red bends least (lowest n), Violet bends most (highest n), splitting white light into 7 colors.`,
  ];

  return {
    angleIncidenceDeg: iDeg,
    angleIncidenceRad: (iDeg * Math.PI) / 180,
    prismAngleDeg: A_deg,
    prismAngleRad: (A_deg * Math.PI) / 180,
    r1Deg: baseRay.r1Deg,
    r1Rad: (baseRay.r1Deg * Math.PI) / 180,
    r2Deg: baseRay.r2Deg,
    r2Rad: (baseRay.r2Deg * Math.PI) / 180,
    angleEmergenceDeg: baseRay.eDeg,
    angleEmergenceRad: (baseRay.eDeg * Math.PI) / 180,
    angleDeviationDeg: baseRay.devDeg,
    angleDeviationRad: (baseRay.devDeg * Math.PI) / 180,
    minimumDeviationDeg: DmDeg,
    isMinimumDeviation: isMinDev,
    isTotalInternalReflection: baseRay.tir,
    spectralRays,
    inferences,
  };
}
