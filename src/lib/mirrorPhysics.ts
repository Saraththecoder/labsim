/**
 * Concave Mirror Physics Engine
 * Class 10 NCERT Chapter 10 (Reflection by Spherical Mirrors)
 * Implements Mirror Formula: 1/f = 1/v + 1/u, Magnification: m = -v/u,
 * New Cartesian Sign Convention, and 6 Canonical Reflection Cases.
 */

export interface MirrorSystemState {
  focalLength: number; // Positive magnitude in cm, e.g. 15 cm (signed: -15 cm)
  objectDistance: number; // Positive magnitude u in cm, e.g. 30 cm (signed: -30 cm)
  objectHeight?: number; // ho in cm, default 5 cm
  screenDistance?: number; // Screen position relative to mirror in cm
  mirrorPosition?: number; // Position on 100 cm bench (e.g. 50 cm)
}

export interface MirrorCalculationResult {
  focalLengthMagnitude: number;
  objectDistanceMagnitude: number;
  cartesianF: number; // -f
  cartesianU: number; // -u
  cartesianV: number; // v from mirror formula
  imageDistance: number; // Magnitude of v
  imageHeight: number; // hi = m * ho
  magnification: number; // m = -v/u
  radiusOfCurvature: number; // R = 2f
  isReal: boolean;
  isFocused: boolean;
  screenFocusMatchPercent: number;
  imageDescription: string;
}

export interface MirrorCanonicalCase {
  caseNumber: number;
  name: string;
  objectPositionText: string;
  imagePositionText: string;
  natureText: string;
  sizeText: string;
  magnificationRange: string;
  metaphor: string;
  boardNote: string;
  caseBadge: string;
}

/**
 * Identify the NCERT Canonical Case for a Concave Mirror
 */
export function getMirrorCanonicalCase(u: number, f: number): MirrorCanonicalCase {
  const C = 2 * f;
  const tolerance = 0.8;

  if (u > 60) {
    return {
      caseNumber: 1,
      name: 'Case 1: Object at Infinity',
      objectPositionText: 'At Infinity (u >> 2f)',
      imagePositionText: `At Principal Focus F (${f.toFixed(0)} cm in front of mirror)`,
      natureText: 'Real and Inverted',
      sizeText: 'Highly Diminished (Point-sized)',
      magnificationRange: 'm << -1',
      metaphor: 'Solar Furnace / Astronomical Parabolic Reflector',
      boardNote: 'Parallel sunlight rays converge at F, producing intense heat.',
      caseBadge: 'Case 1: Solar Collector',
    };
  }

  if (u > C + tolerance) {
    return {
      caseNumber: 2,
      name: 'Case 2: Object Beyond Center of Curvature (C)',
      objectPositionText: `Beyond C (u = ${u.toFixed(1)} cm > ${C.toFixed(0)} cm)`,
      imagePositionText: `Between F and C (${f.toFixed(0)} cm to ${C.toFixed(0)} cm)`,
      natureText: 'Real and Inverted',
      sizeText: 'Diminished',
      magnificationRange: '-1 < m < 0',
      metaphor: 'Optical Sensor / Camera setup',
      boardNote: 'Screen captures an inverted sharp image smaller than object.',
      caseBadge: 'Case 2: Diminished Inverted',
    };
  }

  if (Math.abs(u - C) <= tolerance) {
    return {
      caseNumber: 3,
      name: 'Case 3: Object Exactly at Center of Curvature (C = 2F)',
      objectPositionText: `At Center of Curvature C (${C.toFixed(0)} cm)`,
      imagePositionText: `Exactly at C (${C.toFixed(0)} cm)`,
      natureText: 'Real and Inverted',
      sizeText: 'SAME SIZE as object (|hᵢ| = |hₒ|)',
      magnificationRange: 'm = -1.00',
      metaphor: 'Standard 1:1 Inverted Benchmark',
      boardNote: 'Mandatory practical verification case: image coincides with object at C.',
      caseBadge: 'Case 3: 1:1 Inverted at C',
    };
  }

  if (u > f + tolerance && u < C - tolerance) {
    return {
      caseNumber: 4,
      name: 'Case 4: Object Between Focus (F) and Center of Curvature (C)',
      objectPositionText: `Between F and C (${f.toFixed(0)} < u < ${C.toFixed(0)} cm)`,
      imagePositionText: `Beyond C (> ${C.toFixed(0)} cm)`,
      natureText: 'Real and Inverted',
      sizeText: 'Magnified / Enlarged',
      magnificationRange: 'm < -1',
      metaphor: 'Projector Reflector',
      boardNote: 'Screen must be moved far back to catch large inverted image.',
      caseBadge: 'Case 4: Projector (Enlarged)',
    };
  }

  if (Math.abs(u - f) <= tolerance) {
    return {
      caseNumber: 5,
      name: 'Case 5: Object Exactly at Principal Focus (F)',
      objectPositionText: `At Focus F (${f.toFixed(0)} cm)`,
      imagePositionText: 'At Infinity (Parallel reflected rays)',
      natureText: 'Real and Inverted',
      sizeText: 'Infinitely Large (Highly Enlarged)',
      magnificationRange: 'm -> -Infinity',
      metaphor: 'Torch, Searchlight & Car Headlight Reflector',
      boardNote: 'Bulb is placed at F of concave reflector to produce powerful parallel beam.',
      caseBadge: 'Case 5: Headlight Parallel Beam',
    };
  }

  // u < f: Between Pole P and Focus F
  return {
    caseNumber: 6,
    name: 'Case 6: Object Between Pole (P) and Focus (F)',
    objectPositionText: `Between P and F (u = ${u.toFixed(1)} cm < ${f.toFixed(0)} cm)`,
    imagePositionText: 'BEHIND the Mirror (Virtual side)',
    natureText: 'VIRTUAL and ERECT',
    sizeText: 'Magnified / Enlarged',
    magnificationRange: 'm > +1.0',
    metaphor: 'Dentist Mirror & Shaving Mirror Principle',
    boardNote: 'Cannot be caught on screen! Look into mirror to see large upright face.',
    caseBadge: 'Case 6: Dentist / Shaving Mirror',
  };
}

/**
 * Full Mirror Formula Calculation
 */
export function calculateMirrorOptics(state: MirrorSystemState): MirrorCalculationResult {
  const fMag = Math.max(0.1, state.focalLength);
  const uMag = Math.max(0.1, state.objectDistance);
  const ho = state.objectHeight ?? 5;
  const screenDist = state.screenDistance ?? uMag;

  // Cartesian sign conventions for Concave Mirror:
  // Mirror sits at origin (0,0). Light travels left-to-right.
  // Focal point F is in front (left) => f = -fMag
  // Object is in front (left) => u = -uMag
  const cartesianF = -fMag;
  const cartesianU = -uMag;

  // Mirror Formula: 1/f = 1/v + 1/u => 1/v = 1/f - 1/u => v = (u * f) / (u - f)
  // v = ( (-uMag) * (-fMag) ) / ( (-uMag) - (-fMag) ) = (uMag * fMag) / (fMag - uMag)
  const denom = fMag - uMag;
  let cartesianV: number;
  let isReal: boolean;

  if (Math.abs(denom) < 0.001) {
    cartesianV = -Infinity;
    isReal = true;
  } else {
    cartesianV = (uMag * fMag) / denom;
    isReal = cartesianV < 0; // Negative v means in front of mirror (real)
  }

  const vMag = Math.abs(cartesianV);

  // Magnification m = -v/u
  // m = -(cartesianV) / (cartesianU) = -cartesianV / (-uMag) = cartesianV / uMag
  const magnification = isFinite(cartesianV) ? -(cartesianV / cartesianU) : -Infinity;
  const imageHeight = isFinite(magnification) ? ho * magnification : -Infinity;

  // Focus matching on projection screen
  let isFocused = false;
  let screenFocusMatchPercent = 0;

  if (isReal && isFinite(vMag)) {
    const error = Math.abs(screenDist - vMag);
    screenFocusMatchPercent = Math.max(0, Math.min(100, Math.round(100 - (error / 1.5) * 50)));
    isFocused = error <= 0.6;
  }

  let imageDescription = '';
  if (!isReal) {
    imageDescription = `Virtual, erect, enlarged image formed behind mirror (m = +${magnification.toFixed(2)})`;
  } else if (!isFinite(vMag)) {
    imageDescription = 'Parallel rays reflecting to infinity (searchlight beam)';
  } else {
    const sizeWord = Math.abs(magnification - 1) < 0.05 ? 'same size' : Math.abs(magnification) > 1 ? 'magnified' : 'diminished';
    imageDescription = `Real, inverted, ${sizeWord} image formed at ${vMag.toFixed(1)} cm in front of mirror (m = ${magnification.toFixed(2)})`;
  }

  return {
    focalLengthMagnitude: fMag,
    objectDistanceMagnitude: uMag,
    cartesianF,
    cartesianU,
    cartesianV,
    imageDistance: vMag,
    imageHeight,
    magnification,
    radiusOfCurvature: 2 * fMag,
    isReal,
    isFocused,
    screenFocusMatchPercent,
    imageDescription,
  };
}

/**
 * Generate 3D Principal Ray Points for Concave Mirror
 */
export function generateMirrorPrincipalRays(
  uMag: number,
  fMag: number,
  ho: number
): {
  ray1: [number, number, number][]; // Parallel -> Focus
  ray2: [number, number, number][]; // Through Focus -> Parallel
  ray3: [number, number, number][]; // Through Center of Curvature
  ray4: [number, number, number][]; // Oblique at Pole
} {
  const objX = -uMag;
  const objY = ho;
  const focusX = -fMag;
  const cX = -2 * fMag;

  const denom = fMag - uMag;
  const cartesianV = Math.abs(denom) < 0.001 ? -100 : (uMag * fMag) / denom;
  const imgX = cartesianV;
  const m = -(cartesianV / -uMag);
  const imgY = ho * m;

  // Ray 1: From object top (objX, objY, 0) parallel to axis, hits mirror at (0, objY, 0)
  // Reflects through focus (focusX, 0, 0) to image plane
  const ray1: [number, number, number][] = [
    [objX, objY, 0],
    [0, objY, 0],
    [focusX, 0, 0],
    [isFinite(imgX) ? imgX : -80, isFinite(imgY) ? imgY : -80, 0],
  ];

  // Ray 2: From object top, towards focus or through focus
  // Hits mirror at (0, -ho * (fMag / (uMag - fMag)), 0) and reflects parallel
  const hitY2 = uMag !== fMag ? -ho * (fMag / (uMag - fMag)) : -ho;
  const ray2: [number, number, number][] = [
    [objX, objY, 0],
    [0, Math.max(-20, Math.min(20, hitY2)), 0],
    [isFinite(imgX) ? imgX : -80, Math.max(-20, Math.min(20, hitY2)), 0],
  ];

  // Ray 3: Through Center of Curvature C (-2f, 0)
  const ray3: [number, number, number][] = [
    [objX, objY, 0],
    [cX, 0, 0],
    [0, -objY, 0],
    [objX, objY, 0], // Retraces path
  ];

  // Ray 4: Incident obliquely on Pole P (0,0)
  const ray4: [number, number, number][] = [
    [objX, objY, 0],
    [0, 0, 0],
    [isFinite(imgX) ? imgX : -80, isFinite(imgY) ? -imgY : -ho, 0],
  ];

  return { ray1, ray2, ray3, ray4 };
}
