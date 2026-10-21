/**
 * Physics Engine for AR Convex Lens Virtual Lab
 * Implements thin lens equation, Cartesian sign conventions,
 * circle of confusion blur modeling, and ray-tracing geometry.
 */

export interface LensSystemState {
  focalLength: number; // in cm, positive for convex lens (e.g. 15 cm)
  objectDistance: number; // magnitude in cm (distance from lens, u > 0)
  objectHeight: number; // in cm (ho > 0, e.g. 5 cm)
  screenDistance?: number; // distance of screen from lens in cm (optional)
  lensPosition?: number; // position on 100cm bench (e.g. 50cm)
}

export type ImageNature = 'real-inverted' | 'virtual-erect' | 'at-infinity';

export interface OpticsCalculation {
  focalLength: number;
  objectDistance: number; // u magnitude (cm)
  imageDistance: number; // v magnitude (cm); signed in cartesian (+ for real, - for virtual)
  cartesianU: number; // negative by convention, e.g. -30
  cartesianV: number; // positive for real (+30), negative for virtual (-30)
  magnification: number; // signed (negative = inverted, positive = erect)
  magnificationMagnitude: number; // |m|
  objectHeight: number; // ho (cm)
  imageHeight: number; // hi (cm), signed
  imageNature: ImageNature;
  imageDescription: string;
  isReal: boolean;
  isInverted: boolean;
  isMagnified: boolean;
  isSameSize: boolean;
  isDiminished: boolean;
  // Screen focus metrics (if screen is positioned)
  screenFocusDistance?: number;
  screenFocusMatchPercent?: number; // 0% to 100%
  blurRadiusPx?: number; // circle of confusion in pixels
  isFocused?: boolean;
}

export interface RayPoint {
  x: number; // along optical bench / optical axis (cm)
  y: number; // perpendicular height from optical axis (cm)
  z?: number;
}

export interface LightRay {
  id: string;
  name: string;
  color: string;
  points: RayPoint[]; // key control points
  virtualPoints?: RayPoint[]; // dotted virtual extensions back to virtual image
  description: string;
}

/**
 * Calculates optical parameters based on the thin lens formula:
 * 1/v - 1/u = 1/f (with Cartesian sign convention)
 * Here:
 * u_cartesian = -u_dist
 * 1/v_cartesian = 1/f + 1/u_cartesian = 1/f - 1/u_dist
 */
export function calculateOptics(state: LensSystemState): OpticsCalculation {
  const f = Math.max(1, state.focalLength);
  const u = Math.max(0.1, state.objectDistance);
  const ho = state.objectHeight || 5;

  const cartesianU = -u;
  const diff = u - f;

  // Case 1: Object at Principal Focus (u = f) -> Rays emerge parallel, image at infinity
  if (Math.abs(diff) < 0.05) {
    return {
      focalLength: f,
      objectDistance: u,
      imageDistance: Infinity,
      cartesianU,
      cartesianV: Infinity,
      magnification: Infinity,
      magnificationMagnitude: Infinity,
      objectHeight: ho,
      imageHeight: Infinity,
      imageNature: 'at-infinity',
      imageDescription: 'At Infinity (Highly Magnified, Real & Inverted, Parallel Refracted Rays)',
      isReal: true,
      isInverted: true,
      isMagnified: true,
      isSameSize: false,
      isDiminished: false,
      screenFocusMatchPercent: 0,
      blurRadiusPx: 40,
      isFocused: false,
    };
  }

  // Thin lens formula:
  // 1/v = 1/f + 1/(-u) = 1/f - 1/u = (u - f) / (u * f)
  // v = (u * f) / (u - f)
  const cartesianV = (u * f) / diff;
  const imageDistance = Math.abs(cartesianV);
  const magnification = cartesianV / cartesianU; // m = v / u (Cartesian)
  const magnificationMagnitude = Math.abs(magnification);
  const imageHeight = ho * magnification;

  const isReal = cartesianV > 0;
  const isInverted = isReal;
  const isMagnified = magnificationMagnitude > 1.05;
  const isSameSize = Math.abs(magnificationMagnitude - 1.0) <= 0.05;
  const isDiminished = magnificationMagnitude < 0.95;

  let imageDescription = '';
  if (isReal) {
    if (u > 2 * f + 0.1) {
      imageDescription = `Between F and 2F (${imageDistance.toFixed(1)} cm) — Real, Inverted, Diminished (m = ${magnificationMagnitude.toFixed(2)})`;
    } else if (Math.abs(u - 2 * f) <= 0.1) {
      imageDescription = `At 2F (${imageDistance.toFixed(1)} cm) — Real, Inverted, Same Size (m = 1.00)`;
    } else {
      imageDescription = `Beyond 2F (${imageDistance.toFixed(1)} cm) — Real, Inverted, Magnified (m = ${magnificationMagnitude.toFixed(2)})`;
    }
  } else {
    imageDescription = `Behind Object (${imageDistance.toFixed(1)} cm) — Virtual, Erect, Magnified (Magnifying Glass effect, m = ${magnificationMagnitude.toFixed(2)})`;
  }

  // Calculate screen focus if screenDistance is provided
  let screenFocusMatchPercent: number | undefined;
  let blurRadiusPx: number | undefined;
  let isFocused: boolean | undefined;

  if (state.screenDistance !== undefined) {
    if (!isReal) {
      // Virtual image cannot be formed on a physical screen!
      screenFocusMatchPercent = 0;
      blurRadiusPx = 50;
      isFocused = false;
    } else {
      const delta = Math.abs(state.screenDistance - imageDistance);
      // Lens aperture estimate (e.g. 5cm diameter)
      const aperture = 5.0;
      // Circle of confusion relative to screen distance
      const coc = (aperture * delta) / Math.max(state.screenDistance, 5);
      blurRadiusPx = Math.min(60, coc * 8);
      screenFocusMatchPercent = Math.max(0, Math.min(100, Math.round(100 - delta * 5)));
      isFocused = delta < 0.4;
    }
  }

  return {
    focalLength: f,
    objectDistance: u,
    imageDistance: Number(imageDistance.toFixed(2)),
    cartesianU,
    cartesianV: Number(cartesianV.toFixed(2)),
    magnification: Number(magnification.toFixed(3)),
    magnificationMagnitude: Number(magnificationMagnitude.toFixed(3)),
    objectHeight: ho,
    imageHeight: Number(imageHeight.toFixed(2)),
    imageNature: isReal ? 'real-inverted' : 'virtual-erect',
    imageDescription,
    isReal,
    isInverted,
    isMagnified,
    isSameSize,
    isDiminished,
    screenFocusDistance: state.screenDistance,
    screenFocusMatchPercent,
    blurRadiusPx,
    isFocused,
  };
}

/**
 * Generates the geometry for the three principal rays:
 * 1. Ray 1 (Cyan): Parallel to principal axis -> refractor passes through secondary focus F2
 * 2. Ray 2 (Yellow/Gold): Passes straight through optical centre O without deviation
 * 3. Ray 3 (Magenta/Pink): Passes through primary focus F1 -> emerges parallel to principal axis
 */
export function generatePrincipalRays(state: LensSystemState, calc: OpticsCalculation): LightRay[] {
  const { focalLength: f, objectDistance: u, objectHeight: ho } = state;
  const { isReal, cartesianV, imageHeight: hi } = calc;

  // Let Lens be at x = 0
  // Object is at x = -u, tip is at y = ho
  // Optical centre O is at (0, 0)
  // First focus F1 is at (-f, 0)
  // Second focus F2 is at (+f, 0)

  const rays: LightRay[] = [];
  const benchEndRight = Math.max(60, isReal ? cartesianV + 20 : 60);

  // RAY 1: Parallel to axis, then through F2
  // Enters lens at (0, ho)
  // Passes through F2 at (f, 0)
  // Refracted ray line: y - 0 = m_slope * (x - f) where m_slope = (0 - ho) / (f - 0) = -ho / f
  const slope1 = -ho / f;
  const ray1Points: RayPoint[] = [
    { x: -u, y: ho },
    { x: 0, y: ho },
    { x: f, y: 0 },
  ];

  let ray1Virtual: RayPoint[] | undefined;

  if (isReal && cartesianV < 1000) {
    ray1Points.push({ x: cartesianV, y: hi });
    ray1Points.push({ x: benchEndRight, y: slope1 * (benchEndRight - f) });
  } else if (!isReal) {
    // Diverges forward
    ray1Points.push({ x: benchEndRight, y: slope1 * (benchEndRight - f) });
    // Dotted extension backwards to virtual image at (cartesianV, hi)
    ray1Virtual = [
      { x: 0, y: ho },
      { x: cartesianV, y: hi },
    ];
  } else {
    // Parallel rays
    ray1Points.push({ x: benchEndRight, y: slope1 * (benchEndRight - f) });
  }

  rays.push({
    id: 'ray1',
    name: 'Parallel Ray',
    color: '#00f0ff', // Cyan
    points: ray1Points,
    virtualPoints: ray1Virtual,
    description: 'Travels parallel to the principal axis, then refracts through the second focus F₂',
  });

  // RAY 2: Central ray through Optical Centre (0, 0)
  // Straight line from (-u, ho) through (0, 0)
  // Slope = (0 - ho) / (0 - (-u)) = -ho / u
  const slope2 = -ho / u;
  const ray2Points: RayPoint[] = [
    { x: -u, y: ho },
    { x: 0, y: 0 },
  ];

  let ray2Virtual: RayPoint[] | undefined;

  if (isReal && cartesianV < 1000) {
    ray2Points.push({ x: cartesianV, y: hi });
    ray2Points.push({ x: benchEndRight, y: slope2 * benchEndRight });
  } else if (!isReal) {
    ray2Points.push({ x: benchEndRight, y: slope2 * benchEndRight });
    ray2Virtual = [
      { x: 0, y: 0 },
      { x: cartesianV, y: hi },
    ];
  } else {
    ray2Points.push({ x: benchEndRight, y: slope2 * benchEndRight });
  }

  rays.push({
    id: 'ray2',
    name: 'Central Ray',
    color: '#fbbf24', // Amber/Gold
    points: ray2Points,
    virtualPoints: ray2Virtual,
    description: 'Passes directly through optical centre O without suffering any deviation',
  });

  // RAY 3: Focus ray
  // For u > f: Passes through F1 (-f, 0) to lens at x = 0
  // Line: y - 0 = (ho - 0) / (-u - (-f)) * (x - (-f)) = ho / (f - u) * (x + f)
  // At x = 0, y_lens = ho * f / (f - u)
  if (Math.abs(u - f) > 0.5) {
    const yLens3 = (ho * f) / (f - u);
    const ray3Points: RayPoint[] = [{ x: -u, y: ho }];
    let ray3Virtual: RayPoint[] | undefined;

    if (u > f) {
      ray3Points.push({ x: -f, y: 0 });
      ray3Points.push({ x: 0, y: yLens3 });
      ray3Points.push({ x: benchEndRight, y: yLens3 }); // emerges parallel to axis
    } else {
      // For u < f: Ray appears to come from F1
      ray3Points.push({ x: 0, y: yLens3 });
      ray3Points.push({ x: benchEndRight, y: yLens3 });
      ray3Virtual = [
        { x: 0, y: yLens3 },
        { x: cartesianV, y: hi },
      ];
    }

    rays.push({
      id: 'ray3',
      name: 'Focal Ray',
      color: '#f43f5e', // Rose/Magenta
      points: ray3Points,
      virtualPoints: ray3Virtual,
      description: 'Directed through focus F₁, emerges parallel to the principal axis after refraction',
    });
  }

  return rays;
}

/**
 * Calculates focal length from recorded measurements:
 * f = (u * v) / (u + v)
 */
export function calculateFocalLengthFromUV(u: number, v: number): number {
  if (u <= 0 || v <= 0) return 0;
  return Number(((u * v) / (u + v)).toFixed(2));
}

/**
 * Standard experiment presets for school curriculum
 */
export interface LabPreset {
  id: string;
  label: string;
  subtitle: string;
  objectDistance: number;
  focalLength: number;
  objectHeight: number;
  expectedV: number;
  category: 'u > 2f' | 'u = 2f' | 'f < u < 2f' | 'u = f' | 'u < f';
}

export const LAB_PRESETS: LabPreset[] = [
  {
    id: 'preset-beyond-2f',
    label: 'Object Beyond 2F (u > 2f)',
    subtitle: 'Real, inverted, diminished image formed between F and 2F',
    objectDistance: 45,
    focalLength: 15,
    objectHeight: 5,
    expectedV: 22.5,
    category: 'u > 2f',
  },
  {
    id: 'preset-at-2f',
    label: 'Object at 2F (u = 2f)',
    subtitle: 'Real, inverted, same size image formed exactly at 2F',
    objectDistance: 30,
    focalLength: 15,
    objectHeight: 5,
    expectedV: 30,
    category: 'u = 2f',
  },
  {
    id: 'preset-between-f-2f',
    label: 'Object Between F and 2F (f < u < 2f)',
    subtitle: 'Real, inverted, magnified image formed beyond 2F',
    objectDistance: 22.5,
    focalLength: 15,
    objectHeight: 5,
    expectedV: 45,
    category: 'f < u < 2f',
  },
  {
    id: 'preset-at-f',
    label: 'Object at Focus (u = f)',
    subtitle: 'Refracted rays become parallel; image formed at infinity',
    objectDistance: 15,
    focalLength: 15,
    objectHeight: 5,
    expectedV: Infinity,
    category: 'u = f',
  },
  {
    id: 'preset-within-f',
    label: 'Object Within Focus (u < f)',
    subtitle: 'Virtual, erect, magnified image (Simple Magnifier / Hand Lens)',
    objectDistance: 10,
    focalLength: 15,
    objectHeight: 5,
    expectedV: -30,
    category: 'u < f',
  },
];
