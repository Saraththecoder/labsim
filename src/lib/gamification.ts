export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StudentProgress {
  xp: number;
  level: number;
  completedPracticals: string[];
  badges: string[]; // Badge IDs
}

export const ALL_BADGES: StudentBadge[] = [
  {
    id: 'optics-pioneer',
    title: 'Optics Pioneer',
    description: 'Calibrated a real-time optical bench with zero parallax error.',
    icon: '🔍',
  },
  {
    id: 'circuit-master',
    title: 'Circuit Master',
    description: 'Verified Ohm’s Law and calibrated moving-coil meters.',
    icon: '⚡',
  },
  {
    id: 'ph-alchemist',
    title: 'Acid-Base Alchemist',
    description: 'Tested sample solutions across the complete pH 1–14 spectrum.',
    icon: '🧪',
  },
  {
    id: 'reactivity-detective',
    title: 'Reactivity Detective',
    description: 'Observed single displacement reaction of Iron in Copper Sulphate.',
    icon: '⚗️',
  },
  {
    id: 'safety-hero',
    title: 'Laboratory Safety Hero',
    description: 'Avoided or resolved a simulated hazard with Labby AI’s guidance.',
    icon: '🛡️',
  },
  {
    id: 'sandbox-inventor',
    title: 'Sandbox Prototyper',
    description: 'Designed and simulated an open sandbox circuit from scratch.',
    icon: '🚀',
  },
];

const STORAGE_KEY = 'labsim_student_progress_v1';

export function getStudentProgress(): StudentProgress {
  if (typeof window === 'undefined') {
    return { xp: 150, level: 1, completedPracticals: ['convex-lens'], badges: ['optics-pioneer'] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: StudentProgress = {
        xp: 250,
        level: 2,
        completedPracticals: ['convex-lens', 'ohms-law'],
        badges: ['optics-pioneer', 'circuit-master'],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { xp: 0, level: 1, completedPracticals: [], badges: [] };
  }
}

export function saveStudentProgress(progress: StudentProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export function addXP(points: number): { newXP: number; newLevel: number; leveledUp: boolean } {
  const current = getStudentProgress();
  const oldLevel = current.level;
  const newXP = current.xp + points;
  const newLevel = Math.floor(newXP / 200) + 1;
  const leveledUp = newLevel > oldLevel;

  current.xp = newXP;
  current.level = newLevel;
  saveStudentProgress(current);

  return { newXP, newLevel, leveledUp };
}

export function unlockBadge(badgeId: string): boolean {
  const current = getStudentProgress();
  if (current.badges.includes(badgeId)) return false;

  current.badges.push(badgeId);
  current.xp += 100; // Bonus 100 XP
  current.level = Math.floor(current.xp / 200) + 1;
  saveStudentProgress(current);
  return true;
}
