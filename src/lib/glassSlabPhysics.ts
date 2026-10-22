/**
 * Rectangular Glass Slab Physics Engine
 * Class 10 NCERT Chapter 10 (Refraction of Light)
 * Implements Snell's Law (n = sin i / sin r), Parallel Emergence (∠i = ∠e),
 * Lateral Displacement: d = t * sin(i - r) / cos(r), and 4 Optical Pins geometry.
 */

export interface GlassSlabState {
  angleIncidenceDeg: number; // Angle of incidence ∠i in degrees (0° to 75°)
  slabThicknessCm: number; // Thickness t of rectangular glass slab in cm (4.0 to 12.0 cm)
  refractiveIndex: number; // n (e.g. 1.52 for crown glass)
  slabWidthCm?: number; // Width of slab in cm (default 16.0 cm)
}

export interface GlassSlabCalculationResult {
  angleIncidenceDeg: number;
  angleIncidenceRad: number;
  angleRefractionDeg: number;
  angleRefractionRad: number;
  angleEmergenceDeg: number;
  angleEmergenceRad: number;
  lateralDisplacementCm: number;
  refractiveIndex: number;
  speedOfLightInGlass: number; // in m/s (approx, e.g. 1.97 x 10^8)
  criticalAngleDeg: number;
  isTotalInternalReflection: boolean;
  snellVerificationRatio: number; // sin(i) / sin(r)
  inferences: string[];
}

/**
 * Standard Glass Types for Class 10 experiments
 */
export const GLASS_TYPES = [
  { id: 'crown', name: 'Crown Glass (Standard Laboratory Slab)', n: 1.52, description: 'Standard high-clarity optical glass used in CBSE school labs.' },
  { id: 'flint', name: 'Dense Flint Glass', n: 1.66, description: 'High density optical glass with higher refractive power and greater lateral shift.' },
  { id: 'acrylic', name: 'Perspex / Acrylic Plastic Slab', n: 1.49, description: 'Lightweight synthetic polymer slab frequently used in school kits.' },
  { id: 'water_cell', name: 'Water-filled Hollow Glass Cell', n: 1.33, description: 'Demonstrates refraction through an aqueous liquid medium.' },
];

/**
 * Perform Snell's Law & Lateral Displacement calculations
 */
export function calculateGlassSlab(state: GlassSlabState): GlassSlabCalculationResult {
  const iDeg = Math.max(0, Math.min(85, state.angleIncidenceDeg));
  const t = Math.max(1, state.slabThicknessCm);
  const n = Math.max(1.0, state.refractiveIndex);

  const iRad = (iDeg * Math.PI) / 180;

  // Snell's Law at Air -> Glass interface (n1 = 1.0, n2 = n):
  // 1.0 * sin(i) = n * sin(r) => sin(r) = sin(i) / n
  const sinR = Math.sin(iRad) / n;
  const rRad = Math.asin(Math.min(1.0, sinR));
  const rDeg = (rRad * 180) / Math.PI;

  // At Glass -> Air bottom interface:
  // Since top and bottom refracting faces are parallel, angle of incidence inside is r
  // n * sin(r) = 1.0 * sin(e) => sin(e) = n * sin(r) = sin(i) => ∠e = ∠i
  const eRad = iRad;
  const eDeg = iDeg;

  // Lateral Displacement (perpendicular distance d):
  // In right triangle ABC formed between ray inside and normal:
  // d = t * sin(i - r) / cos(r)
  let d = 0;
  if (Math.cos(rRad) > 0.0001) {
    d = (t * Math.sin(iRad - rRad)) / Math.cos(rRad);
  }

  // Speed of light in medium v = c / n (c = 3.0 x 10^8 m/s)
  const c = 3.0e8;
  const speedOfLight = c / n;

  // Critical angle for glass-to-air interface: sin(c) = 1/n
  const critRad = Math.asin(1.0 / n);
  const critDeg = (critRad * 180) / Math.PI;

  const snellRatio = Math.sin(rRad) > 0 ? Math.sin(iRad) / Math.sin(rRad) : n;

  const inferences = [
    `∠i (${iDeg.toFixed(1)}°) = ∠e (${eDeg.toFixed(1)}°): The emergent ray is strictly parallel to the incident ray.`,
    `Lateral Displacement d = ${d.toFixed(2)} cm: The ray shifts sideways by ${d.toFixed(2)} cm without changing direction.`,
    `Refraction at Surface 1: Light bends towards the normal as it travels from optically rarer (air) to denser (glass, n = ${n.toFixed(2)}).`,
    `Refraction at Surface 2: Light bends away from the normal as it emerges from denser (glass) to rarer (air).`,
  ];

  return {
    angleIncidenceDeg: iDeg,
    angleIncidenceRad: iRad,
    angleRefractionDeg: rDeg,
    angleRefractionRad: rRad,
    angleEmergenceDeg: eDeg,
    angleEmergenceRad: eRad,
    lateralDisplacementCm: d,
    refractiveIndex: n,
    speedOfLightInGlass: speedOfLight,
    criticalAngleDeg: critDeg,
    isTotalInternalReflection: false,
    snellVerificationRatio: snellRatio,
    inferences,
  };
}
