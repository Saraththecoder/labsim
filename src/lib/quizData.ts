import { QuizQuestion } from './types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'A convex lens always converges rays parallel to the principal axis at which point?',
    options: [
      'The optical centre (O)',
      'The principal focus (F)',
      'Twice the focal length (2F)',
      'The surface of the lens',
    ],
    correctIndex: 1,
    explanation:
      'By definition, a convex (converging) lens refracts light rays that are parallel to the principal axis so that they intersect at the principal focus (F) on the opposite side.',
    conceptTag: 'Focal Point',
  },
  {
    id: 'q2',
    question: 'An object is placed at a distance of 30 cm in front of a convex lens of focal length 15 cm. Where is the real image formed?',
    options: [
      'At 15 cm on the same side',
      'At 30 cm on the opposite side (at 2F)',
      'At 60 cm on the opposite side',
      'At infinity',
    ],
    correctIndex: 1,
    explanation:
      'Since u = 2f (30 cm = 2 × 15 cm), using 1/v - 1/(-30) = 1/15 gives 1/v = 1/15 - 1/30 = 1/30, so v = +30 cm (at 2F on the opposite side). The image is real, inverted, and the exact same size (m = -1).',
    conceptTag: 'Lens Formula',
  },
  {
    id: 'q3',
    question: 'What is the nature of the image formed when an object is placed within the focal length of a convex lens (u < f)?',
    options: [
      'Real, inverted, and diminished',
      'Real, inverted, and magnified',
      'Virtual, erect, and magnified',
      'Virtual, inverted, and diminished',
    ],
    correctIndex: 2,
    explanation:
      'When an object is placed between the optical centre and principal focus (u < f), the refracted rays diverge. When projected backward, they form a virtual, erect, and magnified image on the same side as the object (magnifying glass principle).',
    conceptTag: 'Virtual Images',
  },
  {
    id: 'q4',
    question: 'According to the New Cartesian Sign Convention, the focal length of a convex lens is taken as:',
    options: [
      'Always positive (+)',
      'Always negative (-)',
      'Zero',
      'Positive or negative depending on object height',
    ],
    correctIndex: 0,
    explanation:
      'Under the New Cartesian Sign Convention, distances measured in the direction of incident light (to the right of the optical centre) are positive. Because parallel incident rays converge to the right-side principal focus, the focal length of a convex lens is always positive (+f).',
    conceptTag: 'Sign Convention',
  },
  {
    id: 'q5',
    question: 'If the linear magnification m produced by a lens is -0.5, what does this indicate about the image?',
    options: [
      'Virtual, erect, half the size of the object',
      'Real, inverted, half the size of the object',
      'Real, erect, twice the size of the object',
      'Virtual, inverted, twice the size of the object',
    ],
    correctIndex: 1,
    explanation:
      'The negative sign indicates the image is inverted (and therefore real for a single lens). The magnitude |m| = 0.5 indicates the image is diminished to half the object’s height (hi = -0.5 × ho).',
    conceptTag: 'Magnification',
  },
  {
    id: 'q6',
    question: 'In an optical bench experiment, why is it impossible to capture the image on a screen when u < f?',
    options: [
      'The lens becomes opaque',
      'Virtual images cannot be projected onto a physical screen because real light rays do not actually intersect there',
      'The screen is too small to fit the rays',
      'The focal length decreases to zero',
    ],
    correctIndex: 1,
    explanation:
      'A physical screen requires real light rays to converge and strike the screen surface. For u < f, refracted rays diverge, producing a virtual image that can only be seen by looking through the lens with the eye or a camera.',
    conceptTag: 'Virtual Images',
  },
  {
    id: 'q7',
    question: 'If the lower half of a convex lens is covered with black paper, how will the image formed change?',
    options: [
      'The top half of the image disappears',
      'The bottom half of the image disappears',
      'The full image is still formed, but its brightness (intensity) is reduced by half',
      'The image shifts to twice the focal length',
    ],
    correctIndex: 2,
    explanation:
      'Every part of the lens receives light from every point of the object and refracts it to form the complete image. Covering half the lens reduces the total light gathered by 50%, producing a complete but less luminous image.',
    conceptTag: 'Lens Optics',
  },
  {
    id: 'q8',
    question: 'When plotting a graph of 1/v versus 1/u for a convex lens (using Cartesian coordinates), what shape is obtained?',
    options: [
      'A parabola passing through the origin',
      'A straight line with slope +1 and intercept equal to 1/f',
      'A rectangular hyperbola',
      'A circular arc',
    ],
    correctIndex: 1,
    explanation:
      'From 1/v - 1/u = 1/f, we have 1/v = 1/u + 1/f. Comparing this with y = mx + c gives a straight line with a slope m = 1 and vertical/horizontal intercepts of magnitude 1/f.',
    conceptTag: 'Graphical Analysis',
  },
];
