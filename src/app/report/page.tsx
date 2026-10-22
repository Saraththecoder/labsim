'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  FlaskConical,
  Zap,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';

export type PhysicsExpId = 'convex-lens' | 'concave-mirror' | 'glass-slab' | 'glass-prism' | 'ohms-law';

interface VivaQuestion {
  id: number;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ExperimentReportData {
  id: PhysicsExpId;
  expNumber: number;
  title: string;
  shortName: string;
  syllabusRef: string;
  aim: string;
  apparatus: string;
  theoryTitle: string;
  theoryFormula: string;
  theoryDescription: string;
  diagramType: 'convex-ray' | 'mirror-diagram' | 'slab-diagram' | 'prism-diagram' | 'circuit-diagram';
  observationHeaders: string[];
  observations: Array<Record<string, string | number>>;
  calculations: Array<{ label: string; value: string }>;
  conclusion: string;
  precautions: string[];
  sourcesOfError: string[];
  vivaQuestions: VivaQuestion[];
}

const EXPERIMENTS_DATA: Record<PhysicsExpId, ExperimentReportData> = {
  'convex-lens': {
    id: 'convex-lens',
    expNumber: 1,
    title: 'Determination of Focal Length of a Convex Lens by u-v Method',
    shortName: 'Convex Lens',
    syllabusRef: 'Class 10 CBSE / ICSE • NCERT Chapter 10: Light – Reflection & Refraction (Activity 10.11)',
    aim: 'To determine the focal length of a given convex lens by obtaining real, inverted images of an illuminated object on a ground-glass screen for varying object distances (u-v method) and verify using reciprocal graphical plots.',
    apparatus: 'Dual-rail optical bench (length 100 cm) with millimeter scale, double convex lens (nominal f = 15.0 cm) mounted on an upright lens clamp, illuminated cross-wire/arrow object source, ground-glass projection screen, and index pointer needle.',
    theoryTitle: 'Thin Lens Formula & New Cartesian Sign Convention',
    theoryFormula: '1/v - 1/u = 1/f   ⇒   f = (u × v) / (u + v)',
    theoryDescription: 'Distances measured in the direction of incident light from the optical centre (O) are positive, while those opposite are negative. For a convex lens forming a real inverted image, object distance u is negative, image distance v is positive, and focal length f is positive. Magnification is given by m = v / u = hi / ho.',
    diagramType: 'convex-ray',
    observationHeaders: ['Obs #', 'Object Pos (cm)', 'Lens Pos (cm)', 'Screen Pos (cm)', 'u (cm)', 'v (cm)', 'f = uv/(u+v) (cm)', 'Mag (m)', 'Nature of Image'],
    observations: [
      { sNo: 1, xObj: 5.0, xLens: 50.0, xScr: 72.5, u: 45.0, v: 22.5, f: 15.0, m: -0.50, nature: 'Real, Inverted, Diminished' },
      { sNo: 2, xObj: 15.0, xLens: 50.0, xScr: 76.3, u: 35.0, v: 26.3, f: 15.0, m: -0.75, nature: 'Real, Inverted, Diminished' },
      { sNo: 3, xObj: 20.0, xLens: 50.0, xScr: 80.0, u: 30.0, v: 30.0, f: 15.0, m: -1.00, nature: 'Real, Inverted, Same Size (at 2F)' },
      { sNo: 4, xObj: 25.0, xLens: 50.0, xScr: 87.5, u: 25.0, v: 37.5, f: 15.0, m: -1.50, nature: 'Real, Inverted, Magnified' },
      { sNo: 5, xObj: 28.0, xLens: 50.0, xScr: 97.1, u: 22.0, v: 47.1, f: 15.0, m: -2.14, nature: 'Real, Inverted, Highly Magnified' },
    ],
    calculations: [
      { label: 'Mean Focal Length (f̄)', value: '15.00 cm' },
      { label: 'Standard Deviation (σ)', value: '±0.04 cm' },
      { label: 'Percentage Error', value: '0.27%' },
    ],
    conclusion: 'The experimental focal length of the convex lens determined by obtaining sharp inverted images across varying object distances is 15.00 ± 0.04 cm. The reciprocal 1/v vs 1/u plot confirms a linear slope of unity with mutual intercepts at 1/f = 0.0667 cm⁻¹.',
    precautions: [
      'The optical centre of the lens and the tip of the object source must lie precisely on the same horizontal optical axis.',
      'Parallax between the real image plane and the screen cross-wire must be completely removed by micro-adjustments.',
      'The lens surface should be thoroughly wiped with lens paper to avoid dust diffraction fringes.',
    ],
    sourcesOfError: [
      'Index error between the upright pointer mark and the actual centre of the lens thickness.',
      'Subjective judgment error while identifying the point of maximum focal sharpness on the ground-glass screen.',
    ],
    vivaQuestions: [
      {
        id: 1,
        q: 'What is the nature and size of the image when an object is placed at 2F₁ of a convex lens?',
        options: [
          'Virtual, erect, and magnified behind the lens.',
          'Real, inverted, and same size as object (m = -1.0) formed at 2F₂ on the opposite side.',
          'Real, inverted, and point-sized at the principal focus F₂.',
        ],
        correct: 1,
        explanation: 'When u = 2f, the image distance v = +2f and magnification m = -v/u = -1.0. This is the canonical benchmark case used in board exams.',
      },
      {
        id: 2,
        q: 'Why is the focal length (f) of a convex lens always taken as POSITIVE under Cartesian convention?',
        options: [
          'Because the object needle is placed on the left side of the bench.',
          'Because incident parallel rays converge at the real focus F₂ on the right side, along the positive direction of incident light.',
          'Because convex lenses are thicker in the middle.',
        ],
        correct: 1,
        explanation: 'All distances measured in the direction of incident light from O are positive. The convex lens focuses light on the right side, hence f > 0.',
      },
      {
        id: 3,
        q: 'If the lower half of the convex lens is covered with opaque black paper, what happens to the image?',
        options: [
          'The lower half of the image disappears completely from the screen.',
          'A complete image of the entire object is still formed, but its brightness and intensity are reduced by ~50%.',
          'The image becomes completely virtual and upright.',
        ],
        correct: 1,
        explanation: 'Light rays from every point of the object pass through every part of the lens. Covering half only reduces the total light collected, reducing intensity without truncating the image.',
      },
    ],
  },
  'concave-mirror': {
    id: 'concave-mirror',
    expNumber: 2,
    title: 'Determination of Focal Length of a Concave Spherical Mirror by u-v Method',
    shortName: 'Concave Mirror',
    syllabusRef: 'Class 10 CBSE / ICSE • NCERT Chapter 10: Light – Reflection & Refraction (Activity 10.3)',
    aim: 'To determine the focal length of a concave spherical mirror by finding the real image distance (v) for various object distances (u) on an optical bench, and verify using the mirror formula and 1/v vs 1/u graphs.',
    apparatus: 'Optical bench with millimeter scale, concave spherical mirror (nominal f = -15.0 cm) with upright clamp, illuminated object needle, white screen upright, center-of-curvature pointer, and index needle for parallax removal.',
    theoryTitle: 'Spherical Mirror Formula & Sign Convention',
    theoryFormula: '1/v + 1/u = 1/f   ⇒   f = (u × v) / (u + v)',
    theoryDescription: 'Under the New Cartesian Sign Convention, the pole P of the spherical mirror is taken as origin. Since light travels from left to right, distances measured to the left are negative. For a concave mirror forming a real inverted image, u < 0, v < 0, and f < 0. Magnification is given by m = -v / u = hi / ho. The radius of curvature R = 2f.',
    diagramType: 'mirror-diagram',
    observationHeaders: ['Obs #', 'Object Pos (cm)', 'Mirror Pos (cm)', 'Screen Pos (cm)', 'u (cm)', 'v (cm)', 'f = uv/(u+v) (cm)', 'Mag (m)', 'Nature of Image'],
    observations: [
      { sNo: 1, xObj: 5.0, xLens: 50.0, xScr: 27.5, u: -45.0, v: -22.5, f: -15.0, m: -0.50, nature: 'Real, Inverted, Diminished' },
      { sNo: 2, xObj: 15.0, xLens: 50.0, xScr: 23.7, u: -35.0, v: -26.3, f: -15.0, m: -0.75, nature: 'Real, Inverted, Diminished' },
      { sNo: 3, xObj: 20.0, xLens: 50.0, xScr: 20.0, u: -30.0, v: -30.0, f: -15.0, m: -1.00, nature: 'Real, Inverted, Same Size (at C)' },
      { sNo: 4, xObj: 25.0, xLens: 50.0, xScr: 12.5, u: -25.0, v: -37.5, f: -15.0, m: -1.50, nature: 'Real, Inverted, Magnified' },
      { sNo: 5, xObj: 28.0, xLens: 50.0, xScr: 2.9, u: -22.0, v: -47.1, f: -15.0, m: -2.14, nature: 'Real, Inverted, Highly Magnified' },
    ],
    calculations: [
      { label: 'Mean Focal Length (f̄)', value: '-15.00 cm' },
      { label: 'Radius of Curvature (R = 2f)', value: '-30.00 cm' },
      { label: 'Percentage Error', value: '0.33%' },
    ],
    conclusion: 'The focal length of the concave spherical mirror determined using the optical bench method is -15.00 ± 0.05 cm. When the object was placed at the center of curvature (u = -30.0 cm), the inverted image formed at the identical position with magnification m = -1.00.',
    precautions: [
      'The optical axis of the concave mirror must remain strictly parallel to the bench rails.',
      'Parallax between the illuminated object tip and the real inverted image must be eliminated by moving the screen until no relative shift occurs on moving the eye sideways.',
      'Observations should be recorded only after sharp focus has been visually confirmed.',
    ],
    sourcesOfError: [
      'Index error between the upright pointer mark and the reflective silver pole of the concave mirror.',
      'Slight spherical aberration at the mirror periphery for wide incident aperture angles.',
    ],
    vivaQuestions: [
      {
        id: 1,
        q: 'Why is the focal length of a concave spherical mirror considered negative?',
        options: [
          'Because the reflective coating is on the outside surface.',
          'Because the focus lies in front of the mirror on the left, opposite to the direction of incident light.',
          'Because it always produces smaller images than plane mirrors.',
        ],
        correct: 1,
        explanation: 'The pole P is the origin. The concave focus lies on the left side where light converges before reaching the mirror, hence f is negative under Cartesian convention.',
      },
      {
        id: 2,
        q: 'Under what specific object distance does a concave mirror produce a virtual, erect, and magnified image?',
        options: [
          'When the object is placed between the Pole (P) and Principal Focus (F).',
          'When the object is placed exactly at the Center of Curvature (C).',
          'When the object is placed at infinity.',
        ],
        correct: 0,
        explanation: 'When 0 < u < f, reflected rays diverge and appear to meet behind the mirror, forming a virtual, erect, and magnified image (used as a shaving/dentist mirror).',
      },
      {
        id: 3,
        q: 'What is the relationship between the radius of curvature (R) and focal length (f) of a concave mirror?',
        options: [
          'R = f / 2',
          'R = 2f',
          'R = f²',
        ],
        correct: 1,
        explanation: 'For spherical mirrors with small aperture, the principal focus F lies midway between the pole P and the center of curvature C, so R = 2f.',
      },
    ],
  },
  'glass-slab': {
    id: 'glass-slab',
    expNumber: 3,
    title: 'Refraction & Lateral Displacement of Light Through a Rectangular Glass Slab',
    shortName: 'Glass Slab',
    syllabusRef: 'Class 10 CBSE / ICSE • NCERT Chapter 10: Light – Reflection & Refraction (Activity 10.10)',
    aim: 'To trace the path of a ray of light passing obliquely through a rectangular glass slab for various angles of incidence (30°, 45°, 60°), measure ∠i, ∠r, ∠e, verify that ∠i ≈ ∠e, and calculate lateral displacement.',
    apparatus: 'Soft drawing board, drawing pins, white paper sheet, rectangular crown glass slab (refractive index n ≈ 1.52, thickness t = 1.8 cm), four steel optical pins (P₁, P₂, P₃, P₄), 360° circular protractor, and millimeter ruler.',
    theoryTitle: 'Snell’s Law of Refraction & Lateral Displacement Formula',
    theoryFormula: 'n = sin(i) / sin(r)   |   ∠i = ∠e   |   d = [t · sin(i - r)] / cos(r)',
    theoryDescription: 'When light passes from an optically rarer medium (air) to a denser medium (glass), it bends towards the normal. At the second parallel interface, it bends away from the normal by the exact reciprocal ratio. Therefore, the emergent ray is strictly parallel to the incident ray, experiencing a perpendicular lateral displacement d.',
    diagramType: 'slab-diagram',
    observationHeaders: ['Trial #', 'Angle of Incidence (∠i)', 'Angle of Refraction (∠r)', 'Angle of Emergence (∠e)', 'sin(i)', 'sin(r)', 'Refractive Index (n = sin i / sin r)', 'Lateral Shift d (cm)'],
    observations: [
      { sNo: 1, angleI: '30.0°', angleR: '19.2°', angleE: '30.0°', sinI: '0.500', sinR: '0.329', n: '1.520', shiftD: '0.36 cm' },
      { sNo: 2, angleI: '40.0°', angleR: '25.0°', angleE: '40.0°', sinI: '0.643', sinR: '0.423', n: '1.520', shiftD: '0.50 cm' },
      { sNo: 3, angleI: '45.0°', angleR: '27.7°', angleE: '45.0°', sinI: '0.707', sinR: '0.465', n: '1.520', shiftD: '0.60 cm' },
      { sNo: 4, angleI: '50.0°', angleR: '30.3°', angleE: '50.0°', sinI: '0.766', sinR: '0.505', n: '1.517', shiftD: '0.71 cm' },
      { sNo: 5, angleI: '60.0°', angleR: '34.7°', angleE: '60.0°', sinI: '0.866', sinR: '0.569', n: '1.522', shiftD: '0.94 cm' },
    ],
    calculations: [
      { label: 'Mean Refractive Index (n̄)', value: '1.520' },
      { label: 'Parallelism Error (|∠i - ∠e|)', value: '0.0°' },
      { label: 'Max Lateral Shift (at 60°)', value: '0.94 cm' },
    ],
    conclusion: 'Snell’s Law is verified with a constant ratio sin(i)/sin(r) = 1.520 for crown glass. The angle of emergence matches the angle of incidence (∠i = ∠e) across all trials, confirming parallel emergence with lateral displacement increasing with angle of incidence.',
    precautions: [
      'The optical pins P₁, P₂, P₃, P₄ must be fixed vertically and separated by at least 4–5 cm to ensure precise alignment.',
      'The glass slab must remain fixed in position without sliding while drawing its perimeter outline.',
      'A very sharp pencil must be used for tracing lines and measuring angles to minimize protractor error.',
    ],
    sourcesOfError: [
      'Parallax error in sighting the feet of optical pins through the glass slab.',
      'Non-uniform thickness or non-parallel opposing faces in cheap commercial glass blocks.',
    ],
    vivaQuestions: [
      {
        id: 1,
        q: 'Why is the emergent ray strictly parallel to the incident ray when passing through a glass slab?',
        options: [
          'Because glass absorbs higher frequency wavelengths.',
          'Because the two refracting surfaces are parallel, so the bending towards normal at the first surface is cancelled by the bending away at the second surface.',
          'Because light speeds up inside the glass block.',
        ],
        correct: 1,
        explanation: 'At the first air-glass surface, sin(i)/sin(r) = n. At the second glass-air surface, sin(r)/sin(e) = 1/n. Multiplying gives sin(i) = sin(e), hence ∠i = ∠e.',
      },
      {
        id: 2,
        q: 'What happens to the lateral displacement (d) as the thickness (t) of the glass slab increases?',
        options: [
          'Lateral displacement decreases proportionally.',
          'Lateral displacement remains identical regardless of thickness.',
          'Lateral displacement increases directly proportional to the thickness of the slab.',
        ],
        correct: 2,
        explanation: 'Lateral displacement formula d = t · sin(i - r) / cos(r) is directly proportional to slab thickness t.',
      },
      {
        id: 3,
        q: 'What is the angle of refraction if a light ray falls normally (perpendicularly) on a glass slab?',
        options: [
          '∠r = 0° (passes undeviated with zero lateral shift)',
          '∠r = 90° (total internal reflection)',
          '∠r = 45°',
        ],
        correct: 0,
        explanation: 'When incident ray is normal to the surface, angle of incidence i = 0°. By Snell’s Law, sin(r) = sin(0°)/n = 0, so r = 0° and the ray passes straight through without deviation.',
      },
    ],
  },
  'glass-prism': {
    id: 'glass-prism',
    expNumber: 4,
    title: 'Refraction & Determination of Angle of Minimum Deviation Through a Triangular Glass Prism',
    shortName: 'Glass Prism',
    syllabusRef: 'Class 10 CBSE / ICSE • NCERT Chapter 11: The Human Eye and the Colourful World (Activity 11.1)',
    aim: 'To trace the path of rays of light through an equilateral triangular glass prism (A = 60°), measure the angle of deviation (D) for various angles of incidence (i), plot the i-D curve, determine the angle of minimum deviation (Dm), and observe white light dispersion.',
    apparatus: 'Equilateral crown glass prism (A = 60°), drawing board, fixer pins, white sheet, optical pins, circular 360° protractor, sharp pencil, and millimeter ruler.',
    theoryTitle: 'Prism Geometry Equation & Minimum Deviation Refraction Index',
    theoryFormula: 'A + D = i + e   |   n = sin[(A + Dm) / 2] / sin(A / 2)',
    theoryDescription: 'Unlike a rectangular slab where faces are parallel, a triangular prism has two refracting faces inclined at angle A (here 60°). The ray bends toward the base on entry and further toward the base on exit. As angle of incidence i increases, deviation D first decreases to a minimum value Dm, and then increases. At minimum deviation, i = e and the refracted ray passes symmetrically parallel to the prism base.',
    diagramType: 'prism-diagram',
    observationHeaders: ['Trial #', 'Angle of Incidence (∠i)', 'Angle of Emergence (∠e)', 'Angle of Deviation (∠D)', 'A + D', 'i + e', 'Verification (|A+D - (i+e)|)', 'Refracted Ray State'],
    observations: [
      { sNo: 1, angleI: '35.0°', angleE: '63.8°', angleD: '38.8°', sumAD: '98.8°', sumIE: '98.8°', diff: '0.0°', state: 'Inclined to base' },
      { sNo: 2, angleI: '40.0°', angleE: '57.2°', angleD: '37.2°', sumAD: '97.2°', sumIE: '97.2°', diff: '0.0°', state: 'Approaching parallel' },
      { sNo: 3, angleI: '48.6°', angleE: '48.6°', angleD: '37.2°', sumAD: '97.2°', sumIE: '97.2°', diff: '0.0°', state: 'Symmetric & Parallel (Dm)' },
      { sNo: 4, angleI: '55.0°', angleE: '43.1°', angleD: '38.1°', sumAD: '98.1°', sumIE: '98.1°', diff: '0.0°', state: 'Inclined to base' },
      { sNo: 5, angleI: '60.0°', angleE: '40.2°', angleD: '40.2°', sumAD: '100.2°', sumIE: '100.2°', diff: '0.0°', state: 'Steeply inclined' },
    ],
    calculations: [
      { label: 'Angle of Prism (A)', value: '60.0°' },
      { label: 'Min Deviation (Dm)', value: '37.2°' },
      { label: 'Refractive Index (n)', value: '1.500' },
    ],
    conclusion: 'The prism equation A + D = i + e is precisely verified across all trials. The angle of minimum deviation Dm obtained from the i-D curve is 37.2°, yielding a refractive index n = 1.500 for the glass prism.',
    precautions: [
      'The optical pins should be placed at least 4 cm apart and aligned strictly along the line of sight.',
      'The angle of incidence must be measured accurately between the incident ray and the normal, not between the ray and the prism face.',
      'The prism outline must be traced with precision to maintain the 60° reference base.',
    ],
    sourcesOfError: [
      'Rounding error in measuring small deviations with a standard school protractor.',
      'Slight edge beveling on the prism apex altering the true angle of prism A.',
    ],
    vivaQuestions: [
      {
        id: 1,
        q: 'What is the fundamental prism formula relating A, D, i, and e?',
        options: [
          'A + i = D + e',
          'A + D = i + e',
          'D = A · (i + e)',
        ],
        correct: 1,
        explanation: 'By applying angle sum properties to the quadrilateral and triangles formed by normals and prism faces, A + D = i + e.',
      },
      {
        id: 2,
        q: 'At the position of minimum deviation (Dm), what is the orientation of the refracted ray inside an equilateral prism?',
        options: [
          'It is strictly parallel to the base of the prism.',
          'It passes perpendicularly through the apex.',
          'It undergoes total internal reflection.',
        ],
        correct: 0,
        explanation: 'At minimum deviation, the ray path is perfectly symmetrical: ∠i = ∠e and ∠r₁ = ∠r₂ = A/2 = 30°, making the ray parallel to the base.',
      },
      {
        id: 3,
        q: 'Why does white light split into a spectrum of 7 colours (VIBGYOR) when passing through a glass prism?',
        options: [
          'Because the prism generates new photons of different frequencies.',
          'Because different wavelengths travel at different speeds in glass, causing violet (shortest λ) to bend most and red (longest λ) to bend least.',
          'Because glass contains seven chemical dye coatings.',
        ],
        correct: 1,
        explanation: 'Refractive index is wavelength-dependent (Cauchy’s dispersion). Violet light has the highest refractive index in glass, so it deviates most, while red deviates least.',
      },
    ],
  },
  'ohms-law': {
    id: 'ohms-law',
    expNumber: 5,
    title: 'Verification of Ohm’s Law & Resistance Determination of Resistor Combinations',
    shortName: 'Ohm’s Law',
    syllabusRef: 'Class 10 CBSE / ICSE • NCERT Chapter 12: Electricity (Section 12.4 & Activity 12.1)',
    aim: 'To determine the resistance per unit length of a given resistor wire by plotting a graph of potential difference (V) versus current (I), verify Ohm’s Law, and verify the laws of series and parallel combinations of resistances.',
    apparatus: 'DC battery eliminator (0-6V), unknown resistor wire (nichrome coil), standard resistors R₁ (10 Ω) and R₂ (15 Ω), DC milliammeter (0-500 mA, least count 10 mA), DC voltmeter (0-5 V, least count 0.1 V), rheostat, plug key, and connecting wires.',
    theoryTitle: 'Ohm’s Law & Resistor Combination Laws',
    theoryFormula: 'V = I · R   ⇒   R = V / I   |   Rs = R1 + R2   |   1/Rp = 1/R1 + 1/R2',
    theoryDescription: 'Ohm’s Law states that electric current flowing through a metallic conductor is directly proportional to the potential difference applied across its ends, provided temperature and other physical conditions remain constant. The V-I graph is a straight line passing through the origin, where slope gives the resistance R.',
    diagramType: 'circuit-diagram',
    observationHeaders: ['Reading #', 'Number of Cells', 'Current I (A)', 'Voltage V (V)', 'Resistance R = V/I (Ω)', 'Series Equiv Rs (Ω)', 'Parallel Equiv Rp (Ω)'],
    observations: [
      { sNo: 1, cells: '1 Cell (1.5V)', current: '0.060 A', voltage: '0.60 V', r: '10.00 Ω', rs: '25.00 Ω', rp: '6.00 Ω' },
      { sNo: 2, cells: '2 Cells (3.0V)', current: '0.120 A', voltage: '1.20 V', r: '10.00 Ω', rs: '25.00 Ω', rp: '6.00 Ω' },
      { sNo: 3, cells: '3 Cells (4.5V)', current: '0.180 A', voltage: '1.80 V', r: '10.00 Ω', rs: '25.00 Ω', rp: '6.00 Ω' },
      { sNo: 4, cells: '4 Cells (6.0V)', current: '0.240 A', voltage: '2.40 V', r: '10.00 Ω', rs: '25.00 Ω', rp: '6.00 Ω' },
    ],
    calculations: [
      { label: 'Mean Resistance (R̄)', value: '10.00 Ω' },
      { label: 'Series Resistance (Rs)', value: '25.00 Ω (Theory: 25.0 Ω)' },
      { label: 'Parallel Resistance (Rp)', value: '6.00 Ω (Theory: 6.00 Ω)' },
    ],
    conclusion: 'The ratio V/I is constant at 10.00 Ω across all applied voltages, confirming Ohm’s Law. The V-I graph is a linear straight line passing through the origin. Experimental series and parallel combination values match theoretical predictions with 0.0% variance.',
    precautions: [
      'The voltmeter must always be connected in parallel across the resistor, and the ammeter in series.',
      'The plug key should be inserted only while taking readings to prevent resistor heating (which increases resistance).',
      'Zero error on the analog ammeter and voltmeter must be deducted before recording values.',
    ],
    sourcesOfError: [
      'Joule heating (I²Rt) if current is allowed to flow continuously for extended periods.',
      'Contact resistance at terminal binding screws if wires are loosely clamped.',
    ],
    vivaQuestions: [
      {
        id: 1,
        q: 'Under what physical condition does Ohm’s Law strictly hold true for metallic conductors?',
        options: [
          'Only when the conductor is kept at absolute zero temperature.',
          'Provided temperature, mechanical strain, and physical dimensions of the conductor remain constant.',
          'Only when alternating current (AC) is applied.',
        ],
        correct: 1,
        explanation: 'Resistance is temperature-dependent (R = R₀(1 + αΔT)). If temperature rises due to heating, resistance increases and the V-I curve bends.',
      },
      {
        id: 2,
        q: 'Why is an ammeter connected in series and a voltmeter connected in parallel in an electrical circuit?',
        options: [
          'An ammeter has very low resistance so it does not alter circuit current; a voltmeter has very high resistance so it draws negligible current.',
          'Because ammeters can only withstand low voltage.',
          'It is purely an arbitrary convention.',
        ],
        correct: 0,
        explanation: 'An ideal ammeter has zero internal resistance, ensuring it doesn’t add resistance in series. An ideal voltmeter has infinite resistance so it doesn’t divert current in parallel.',
      },
      {
        id: 3,
        q: 'What physical quantity does the slope of a V versus I graph represent?',
        options: [
          'Electrical Conductance (G)',
          'Electrical Resistance (R) of the conductor',
          'Electric Charge (Q)',
        ],
        correct: 1,
        explanation: 'Since V = I · R, the gradient ΔV / ΔI of the voltage versus current graph directly equals the electrical resistance R in Ohms (Ω).',
      },
    ],
  },
};

function ReportContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as PhysicsExpId) || 'convex-lens';
  const [selectedExpId, setSelectedExpId] = useState<PhysicsExpId>(
    EXPERIMENTS_DATA[initialExp] ? initialExp : 'convex-lens'
  );

  const [studentName, setStudentName] = useState<string>('Aarav Patel');
  const [rollNumber, setRollNumber] = useState<string>('1014298');
  const [gradeClass, setGradeClass] = useState<string>('Class 10-B (Secondary)');
  const [institution, setInstitution] = useState<string>('Delhi Public School');
  const [date, setDate] = useState<string>('2026-10-22');

  // Viva Voce state
  const [vivaAnswers, setVivaAnswers] = useState<Record<number, number>>({});
  const [vivaSubmitted, setVivaSubmitted] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    const expParam = searchParams.get('exp') as PhysicsExpId;
    if (expParam && EXPERIMENTS_DATA[expParam]) {
      setSelectedExpId(expParam);
    }
  }, [searchParams]);

  // Reset viva answers when changing experiment
  const handleExpChange = (id: PhysicsExpId) => {
    setSelectedExpId(id);
    setVivaAnswers({});
    setVivaSubmitted(false);
  };

  const expData = EXPERIMENTS_DATA[selectedExpId];

  const handleVivaSelect = (qId: number, optIdx: number) => {
    setVivaAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setVivaSubmitted(true);
  };

  const vivaScore = expData.vivaQuestions.filter((q) => vivaAnswers[q.id] === q.correct).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/physics"
            className="p-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] transition-colors border border-[#E2E8DF]"
            title="Back to Physics Suite"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[#17231B] flex items-center gap-2">
              <span>Class 10 Practical Lab Report</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/50 uppercase font-mono font-bold">
                CBSE / ICSE Board Format
              </span>
            </h1>
            <p className="text-xs text-[#647067]">
              Select an experiment tab below, edit student details, and click &quot;Print / Save as PDF&quot;.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#17231B]" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Experiment Selector Tab Bar (Hidden during print) */}
      <div className="no-print flex items-center justify-between gap-2 overflow-x-auto p-1.5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs text-xs font-semibold">
        {(Object.keys(EXPERIMENTS_DATA) as PhysicsExpId[]).map((id) => {
          const item = EXPERIMENTS_DATA[id];
          const active = selectedExpId === id;
          return (
            <button
              key={id}
              onClick={() => handleExpChange(id)}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                active
                  ? 'bg-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                  : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
              }`}
            >
              <span>Exp {item.expNumber}: {item.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================
          PRACTICAL REPORT DOCUMENT (PRINT OPTIMIZED)
         ========================================= */}
      <div className="print-page p-8 sm:p-12 rounded-2xl bg-white text-slate-900 shadow-sm space-y-8 font-sans border border-[#E2E8DF]">
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Secondary School Examination • Class 10 Science Practical Record
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Experiment {expData.expNumber}: {expData.title}
          </h2>
          <p className="text-xs text-slate-600 font-medium italic">
            {expData.syllabusRef}
          </p>
        </div>

        {/* Student Metadata Box (Editable in web view) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Student Name:</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Roll / Student ID:</span>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full font-mono"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Class / Grade:</span>
            <input
              type="text"
              value={gradeClass}
              onChange={(e) => setGradeClass(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">School / Institution:</span>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Date of Experiment:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Oral Defense (Viva):</span>
            <span className="font-bold text-slate-900 block font-mono">
              {vivaSubmitted ? `${vivaScore}/3 (${Math.round((vivaScore / 3) * 100)}%) Verified` : '3 Viva Questions Below'}
            </span>
          </div>
        </div>

        {/* 1. Aim */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            1. Aim of the Experiment
          </h3>
          <p className="leading-relaxed">
            {expData.aim}
          </p>
        </div>

        {/* 2. Apparatus Required */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            2. Apparatus Required
          </h3>
          <p className="leading-relaxed">
            {expData.apparatus}
          </p>
        </div>

        {/* 3. Principle & Formulae */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            3. Principle and Formulae: {expData.theoryTitle}
          </h3>
          <p className="leading-relaxed">
            {expData.theoryDescription}
          </p>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-center space-y-1 text-slate-900 font-bold border border-slate-300 text-sm">
            {expData.theoryFormula}
          </div>
        </div>

        {/* 4. Optical / Circuit Diagram */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            4. Experimental Diagram & Ray Configuration
          </h3>
          <div className="border border-slate-300 rounded-xl overflow-hidden p-3 bg-slate-950 flex items-center justify-center">
            {expData.diagramType === 'convex-ray' && (
              <RayDiagramSvg
                state={{
                  focalLength: 15,
                  objectDistance: 30,
                  objectHeight: 5,
                }}
                height={200}
              />
            )}

            {expData.diagramType === 'mirror-diagram' && (
              <div className="w-full text-center py-6 text-slate-200 font-mono text-xs space-y-2">
                <div className="text-emerald-400 font-bold text-sm">Concave Spherical Mirror Ray Tracing (f = -15 cm)</div>
                <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                  Object placed beyond Center of Curvature C (u = -45 cm) → Reflected rays converge between F and C (v = -22.5 cm). Real & Inverted.
                </p>
                <div className="p-2 border border-slate-700 bg-slate-900 rounded max-w-sm mx-auto text-amber-300">
                  Pole P(0,0) • Focus F(-15, 0) • Center of Curvature C(-30, 0)
                </div>
              </div>
            )}

            {expData.diagramType === 'slab-diagram' && (
              <div className="w-full text-center py-6 text-slate-200 font-mono text-xs space-y-2">
                <div className="text-cyan-400 font-bold text-sm">Rectangular Glass Slab Refraction & Lateral Shift</div>
                <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                  Ray bends toward normal at Air-Glass boundary (n = 1.52), then away from normal at Glass-Air boundary.
                </p>
                <div className="p-2 border border-slate-700 bg-slate-900 rounded max-w-sm mx-auto text-emerald-300">
                  Incident Angle ∠i = 45.0° • Refraction Angle ∠r = 27.7° • Lateral Shift d = 0.60 cm
                </div>
              </div>
            )}

            {expData.diagramType === 'prism-diagram' && (
              <div className="w-full text-center py-6 text-slate-200 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold text-sm">Equilateral Glass Prism Ray Tracing (A = 60°)</div>
                <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                  Light enters first inclined face, refracts towards base, emerges with net angle of deviation D.
                </p>
                <div className="p-2 border border-slate-700 bg-slate-900 rounded max-w-sm mx-auto text-amber-300">
                  A = 60.0° • Minimum Deviation Dm = 37.2° • n = 1.500
                </div>
              </div>
            )}

            {expData.diagramType === 'circuit-diagram' && (
              <div className="w-full text-center py-6 text-slate-200 font-mono text-xs space-y-2">
                <div className="text-lime-400 font-bold text-sm">Ohm’s Law Verification Circuit Diagram</div>
                <p className="text-slate-400 max-w-md mx-auto text-[11px]">
                  Battery (+) → Plug Key → Rheostat → Resistor (with Voltmeter in parallel) → Milliammeter (in series) → Battery (-)
                </p>
                <div className="p-2 border border-slate-700 bg-slate-900 rounded max-w-sm mx-auto text-emerald-300">
                  Linear V-I Slope R = ΔV / ΔI = 10.00 Ω (Ohms)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Observation Table */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            5. Observation Table and Measurements
          </h3>
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                <tr>
                  {expData.observationHeaders.map((head, i) => (
                    <th key={i} className="p-2 border-r border-slate-300 last:border-r-0">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {expData.observations.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx} className="p-2 border-r border-slate-200 last:border-r-0">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Calculations & Results */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            6. Calculations and Result Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg">
            {expData.calculations.map((calc, i) => (
              <div key={i}>
                <span className="text-slate-600 block text-[10px] uppercase font-bold">{calc.label}:</span>
                <span className="text-base font-bold text-slate-900 font-mono">{calc.value}</span>
              </div>
            ))}
          </div>
          <p className="leading-relaxed">
            <strong>Conclusion:</strong> {expData.conclusion}
          </p>
        </div>

        {/* 7. Class 10 Board Viva Voce Oral Defense */}
        <div className="no-print space-y-3 p-4 rounded-xl bg-cyan-50/70 border border-cyan-300 text-xs">
          <div className="flex items-center justify-between border-b border-cyan-200 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-700" />
              <h4 className="font-bold text-cyan-950 uppercase tracking-wide">
                7. Class 10 Board Viva Voce Oral Defense ({expData.shortName})
              </h4>
            </div>
            <span className="text-[11px] font-bold text-cyan-900 font-mono">
              Score: {vivaScore} / {expData.vivaQuestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {expData.vivaQuestions.map((q) => {
              const selected = vivaAnswers[q.id];
              const isCorrect = selected === q.correct;
              const hasAnswered = selected !== undefined;

              return (
                <div key={q.id} className="p-3 rounded-lg bg-white border border-cyan-200 space-y-2">
                  <p className="font-bold text-slate-900 text-xs">
                    Q{q.id}. {q.q}
                  </p>
                  <div className="space-y-1.5 pl-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                          selected === optIdx
                            ? isCorrect
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                              : 'bg-red-50 text-red-900 font-bold border border-red-300'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`viva-q-${expData.id}-${q.id}`}
                          checked={selected === optIdx}
                          onChange={() => handleVivaSelect(q.id, optIdx)}
                          className="mt-0.5 accent-cyan-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {hasAnswered && (
                    <div
                      className={`text-[11px] p-2 rounded flex items-start gap-1.5 ${
                        isCorrect
                          ? 'bg-emerald-100/70 text-emerald-900 font-semibold'
                          : 'bg-red-100/70 text-red-900'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0 mt-0.5" />
                      )}
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. Precautions & Sources of Error */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-800 pt-2 border-t border-slate-300">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Precautions:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {expData.precautions.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Sources of Error:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {expData.sourcesOfError.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 9. Teacher Evaluation & Signature Block */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="space-y-3">
            <span className="font-bold uppercase text-[11px] block">9. Teacher&apos;s Remarks & Grade:</span>
            <div className="p-3 border border-dashed border-slate-400 rounded-lg min-h-[50px] italic text-slate-600">
              Verified for CBSE/ICSE practical examination portfolio. Accurate calculations, ray alignments, and verified viva voce oral defense.
            </div>
          </div>

          <div className="flex flex-col justify-end items-end space-y-1 text-right">
            <div className="w-48 border-b border-slate-900 pb-1 font-mono text-center">
              Dr. M. Ramanathan
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase">
              Examiner / Physics Instructor
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Date Verified: {date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#647067]">Loading Lab Report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
