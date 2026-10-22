/**
 * Class 10 Physics Syllabus - Master Suite Data
 * Aligned with NCERT Science Class 10 (CBSE / ICSE / State Boards)
 */

export interface PhysicsExperimentMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  chapter: string;
  ncertSection: string;
  aim: string;
  apparatus: string[];
  keyFormulae: { name: string; formula: string; note: string }[];
  route: string;
  status: 'live' | 'in-progress' | 'planned';
  category: 'Optics' | 'Electricity & Magnetism';
  colorGradient: string;
  iconName: string;
  badge: string;
}

export const CLASS_10_PHYSICS_EXPERIMENTS: PhysicsExperimentMeta[] = [
  {
    id: 'convex-lens',
    number: 1,
    title: 'Image Formation by a Convex Lens & Focal Length Determination',
    shortTitle: 'Convex Lens Lab',
    chapter: 'Chapter 10: Light – Reflection and Refraction',
    ncertSection: 'Section 10.3.3 & Activity 10.11',
    aim: 'To determine the focal length of a convex lens by obtaining real, inverted images on a screen for varying object distances (u-v method).',
    apparatus: [
      'Dual-rail optical bench (100 cm)',
      'Double convex lens (f ~ 15 cm)',
      'Lens upright & holder',
      'Illuminated arrow / candle flame object',
      'Ground-glass projection screen',
      'Index pointer scale (least count 0.1 cm)',
    ],
    keyFormulae: [
      { name: 'Lens Formula', formula: '1/v - 1/u = 1/f', note: 'u is negative; v is positive for real image' },
      { name: 'Magnification', formula: 'm = v / u = hi / ho', note: 'Negative sign implies inverted image' },
      { name: 'Power of Lens', formula: 'P = 1 / f (in meters) Dioptres (D)', note: 'P > 0 for convex lens' },
    ],
    route: '/lab',
    status: 'live',
    category: 'Optics',
    colorGradient: 'from-cyan-500 to-sky-600',
    iconName: 'Lens',
    badge: '6 Canonical Cases',
  },
  {
    id: 'concave-mirror',
    number: 2,
    title: 'Reflection & Image Formation by a Concave Spherical Mirror',
    shortTitle: 'Concave Mirror Lab',
    chapter: 'Chapter 10: Light – Reflection and Refraction',
    ncertSection: 'Section 10.2.1 & Activity 10.3',
    aim: 'To determine the focal length of a concave mirror by finding the image distance (v) for various object distances (u) and observe real vs virtual image formation.',
    apparatus: [
      'Optical bench with calibrated mm-scale',
      'Concave spherical mirror (f ~ -15 cm)',
      'Mirror holder upright',
      'Illuminated object needle / pin',
      'White projection screen',
      'Center of curvature pointer',
    ],
    keyFormulae: [
      { name: 'Mirror Formula', formula: '1/v + 1/u = 1/f', note: 'f is negative; u is negative; v is negative for real image' },
      { name: 'Magnification', formula: 'm = -v / u = hi / ho', note: 'm is negative for inverted; positive for erect' },
      { name: 'Radius of Curvature', formula: 'R = 2f', note: 'Center of Curvature C is at distance 2f from Pole P' },
    ],
    route: '/physics/concave-mirror',
    status: 'live',
    category: 'Optics',
    colorGradient: 'from-purple-500 to-indigo-600',
    iconName: 'Mirror',
    badge: 'Mirror Formula & 6 Cases',
  },
  {
    id: 'glass-slab',
    number: 3,
    title: 'Refraction & Lateral Displacement Through a Rectangular Glass Slab',
    shortTitle: 'Glass Slab Lab',
    chapter: 'Chapter 10: Light – Reflection and Refraction',
    ncertSection: 'Section 10.3.1 & Activity 10.10',
    aim: 'To trace the path of a ray of light passing obliquely through a rectangular glass slab for various angles of incidence, measure ∠i, ∠r, ∠e, and verify lateral displacement.',
    apparatus: [
      'Soft drawing board with pins & white sheet',
      'Rectangular glass slab (crown glass, n ~ 1.52)',
      'Four steel optical pins (P1, P2, P3, P4)',
      'Protractor (360° circular degree scale)',
      'Millimeter ruler',
    ],
    keyFormulae: [
      { name: 'Snell’s Law', formula: 'n = sin(i) / sin(r)', note: 'Constant ratio of sine of incidence to refraction' },
      { name: 'Parallel Emergence', formula: '∠i = ∠e', note: 'Angle of incidence equals angle of emergence' },
      { name: 'Lateral Displacement', formula: 'd = [t · sin(i - r)] / cos(r)', note: 'Perpendicular shift between incident & emergent ray' },
    ],
    route: '/physics/glass-slab',
    status: 'live',
    category: 'Optics',
    colorGradient: 'from-emerald-500 to-teal-600',
    iconName: 'Square',
    badge: 'Snell’s Law & Lateral Shift',
  },
  {
    id: 'glass-prism',
    number: 4,
    title: 'Refraction, Angle of Deviation & Dispersion Through a Triangular Glass Prism',
    shortTitle: 'Glass Prism Lab',
    chapter: 'Chapter 11: The Human Eye and the Colourful World',
    ncertSection: 'Section 11.2 & Activity 11.1',
    aim: 'To trace the path of rays through an equilateral triangular glass prism, measure angle of incidence (i) vs angle of deviation (D), and observe white light dispersion.',
    apparatus: [
      'Equilateral glass prism (A = 60°)',
      'Drawing board & fixer pins',
      'Collimated white light slit source',
      'Protractor & sharp drawing pencil',
    ],
    keyFormulae: [
      { name: 'Prism Formula', formula: 'A + D = i + e', note: 'Angle of Prism + Deviation = Incidence + Emergence' },
      { name: 'Refractive Index', formula: 'n = sin[(A + Dm)/2] / sin(A/2)', note: 'Determined at angle of minimum deviation Dm' },
    ],
    route: '/physics/glass-prism',
    status: 'live',
    category: 'Optics',
    colorGradient: 'from-amber-500 to-orange-600',
    iconName: 'Triangle',
    badge: 'i-D Curve & VIBGYOR',
  },
  {
    id: 'ohms-law',
    number: 5,
    title: 'Verification of Ohm’s Law & Determination of Resistor Combinations',
    shortTitle: 'Ohm’s Law & Circuits Lab',
    chapter: 'Chapter 12: Electricity',
    ncertSection: 'Section 12.4 & Activity 12.1',
    aim: 'To determine the resistance of a given resistor by plotting potential difference (V) vs current (I), and verify series and parallel combination laws.',
    apparatus: [
      'DC battery eliminator (0-6V)',
      'Unknown resistance coil (nichrome wire)',
      'Standard resistors R1, R2',
      'DC Milliammeter (0-500 mA)',
      'DC Voltmeter (0-5 V)',
      'Rheostat & plug key',
    ],
    keyFormulae: [
      { name: 'Ohm’s Law', formula: 'V = I · R', note: 'V is directly proportional to current I at constant temperature' },
      { name: 'Series Resistance', formula: 'Rs = R1 + R2', note: 'Equivalent resistance increases in series' },
      { name: 'Parallel Resistance', formula: '1/Rp = 1/R1 + 1/R2', note: 'Equivalent resistance decreases in parallel' },
    ],
    route: '/physics/ohms-law',
    status: 'live',
    category: 'Electricity & Magnetism',
    colorGradient: 'from-blue-500 to-indigo-600',
    iconName: 'Zap',
    badge: 'V-I Graph & Circuits',
  },
];
