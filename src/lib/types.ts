import { z } from 'zod';

export interface LabObservation {
  id: string;
  serialNumber: number;
  objectPos: number; // bench position (cm)
  lensPos: number; // bench position (cm)
  screenPos: number; // bench position (cm)
  u: number; // object distance magnitude (cm)
  v: number; // image distance magnitude (cm)
  fCalculated: number; // f = uv / (u + v)
  ho: number; // object height
  hi: number; // image height
  magnification: number; // v / u
  imageNature: string;
  isFocused: boolean;
  timestamp: number;
  notes?: string;
}

export const LabObservationSchema = z.object({
  id: z.string(),
  serialNumber: z.number().int().positive(),
  objectPos: z.number(),
  lensPos: z.number(),
  screenPos: z.number(),
  u: z.number().positive(),
  v: z.number().positive(),
  fCalculated: z.number().positive(),
  ho: z.number(),
  hi: z.number(),
  magnification: z.number(),
  imageNature: z.string(),
  isFocused: z.boolean(),
  timestamp: z.number(),
  notes: z.string().optional(),
});

export interface LabReportData {
  studentName: string;
  rollNumber: string;
  gradeClass: string;
  institution: string;
  date: string;
  aim: string;
  apparatus: string[];
  nominalFocalLength: number;
  observations: LabObservation[];
  meanFocalLength: number;
  percentError: number;
  quizScore?: {
    score: number;
    total: number;
    percentage: number;
  };
  conclusion: string;
  precautions: string[];
  sourcesOfError: string[];
  teacherRemarks?: string;
  teacherGrade?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  diagramSvg?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag: string;
}

export interface ARCapabilities {
  supported: boolean;
  webXR: boolean;
  immersiveAR: boolean;
  hitTest: boolean;
  cameraAccess: boolean;
  deviceOrientation: boolean;
  errorMessage?: string;
}
