'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  Scale,
  Zap,
  Smartphone,
  Eye,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
import { CLASS_10_PHYSICS_EXPERIMENTS } from '@/lib/physicsSuiteData';

// Convex Lens 6 Canonical Cases
const CONVEX_LENS_CASES = [
  {
    caseNo: 1,
    title: 'Object at Infinity (u = ∞)',
    condition: 'u = ∞',
    imagePos: 'At the second focus F₂ (v = f)',
    nature: 'Real and Inverted',
    size: 'Highly diminished, point-sized',
    magnification: 'm ≪ -1 (approaching 0)',
    application: 'Astronomical telescope objective, burning glass focusing sunlight',
    presetU: 80,
    presetF: 15,
  },
  {
    caseNo: 2,
    title: 'Object Beyond 2F₁ (u > 2f)',
    condition: 'u > 2f',
    imagePos: 'Between F₂ and 2F₂ (f < v < 2f)',
    nature: 'Real and Inverted',
    size: 'Diminished',
    magnification: '|m| < 1 (negative)',
    application: 'Photographic camera lens, human eye crystalline lens',
    presetU: 45,
    presetF: 15,
  },
  {
    caseNo: 3,
    title: 'Object at 2F₁ (u = 2f)',
    condition: 'u = 2f',
    imagePos: 'At 2F₂ on other side (v = 2f)',
    nature: 'Real and Inverted',
    size: 'Same size as object (hᵢ = hₒ)',
    magnification: 'm = -1.00',
    application: 'Terrestrial telescope (erecting lens), photocopier 1:1 duplicator',
    presetU: 30,
    presetF: 15,
  },
  {
    caseNo: 4,
    title: 'Object Between F₁ and 2F₁ (f < u < 2f)',
    condition: 'f < u < 2f',
    imagePos: 'Beyond 2F₂ (v > 2f)',
    nature: 'Real and Inverted',
    size: 'Magnified (enlarged)',
    magnification: '|m| > 1 (negative)',
    application: 'Cinema projector, compound microscope objective',
    presetU: 22.5,
    presetF: 15,
  },
  {
    caseNo: 5,
    title: 'Object at Principal Focus F₁ (u = f)',
    condition: 'u = f',
    imagePos: 'At Infinity (v = ∞)',
    nature: 'Real and Inverted (parallel refracted beam)',
    size: 'Extremely magnified',
    magnification: 'm = -∞',
    application: 'Searchlights, lighthouse beacons, theatre spotlights',
    presetU: 15,
    presetF: 15,
  },
  {
    caseNo: 6,
    title: 'Object Between Focus and Optical Centre (u < f)',
    condition: 'u < f',
    imagePos: 'Behind object on same side (v < 0)',
    nature: 'Virtual and Erect',
    size: 'Magnified (enlarged)',
    magnification: 'm > +1 (positive)',
    application: 'Simple reading magnifier, jeweler’s loupe, microscope eyepiece',
    presetU: 10,
    presetF: 15,
  },
];

// Concave Mirror 6 Canonical Cases
const CONCAVE_MIRROR_CASES = [
  {
    caseNo: 1,
    title: 'Object at Infinity (u = ∞)',
    condition: 'u = ∞',
    imagePos: 'At the Focus F (v = f)',
    nature: 'Real and Inverted',
    size: 'Highly diminished, point-sized',
    magnification: 'm ≪ -1',
    application: 'Solar furnace concentrator, astronomical reflecting telescope',
  },
  {
    caseNo: 2,
    title: 'Object Beyond Centre of Curvature (u > 2f)',
    condition: 'u > 2f',
    imagePos: 'Between Focus F and Centre of Curvature C (f < v < 2f)',
    nature: 'Real and Inverted',
    size: 'Diminished',
    magnification: '|m| < 1 (negative)',
    application: 'Optical bench laboratory imaging',
  },
  {
    caseNo: 3,
    title: 'Object at Centre of Curvature C (u = 2f)',
    condition: 'u = 2f',
    imagePos: 'At Centre of Curvature C (v = 2f)',
    nature: 'Real and Inverted',
    size: 'Same size as object (hᵢ = hₒ)',
    magnification: 'm = -1.00',
    application: 'Inverting reflecting mirrors',
  },
  {
    caseNo: 4,
    title: 'Object Between C and F (f < u < 2f)',
    condition: 'f < u < 2f',
    imagePos: 'Beyond C (v > 2f)',
    nature: 'Real and Inverted',
    size: 'Enlarged (magnified)',
    magnification: '|m| > 1 (negative)',
    application: 'Floodlights and focused beam projectors',
  },
  {
    caseNo: 5,
    title: 'Object at Principal Focus F (u = f)',
    condition: 'u = f',
    imagePos: 'At Infinity (v = ∞)',
    nature: 'Real and Inverted (parallel reflected rays)',
    size: 'Highly enlarged',
    magnification: 'm = -∞',
    application: 'Automobile headlights, torch reflectors producing parallel beams',
  },
  {
    caseNo: 6,
    title: 'Object Between Pole P and Focus F (u < f)',
    condition: 'u < f',
    imagePos: 'Behind the Mirror (v > 0)',
    nature: 'Virtual and Erect',
    size: 'Magnified (enlarged)',
    magnification: 'm > +1 (positive)',
    application: 'Shaving mirror, dentist inspection mirror for teeth examination',
  },
];

interface EverydayExampleItem {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  highlightTag?: string;
}

function RealLifeExampleBanner({
  title,
  subtitle,
  examples,
}: {
  title: string;
  subtitle: string;
  examples: EverydayExampleItem[];
}) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F4F7F2] to-[#FFFFFF] border-2 border-[#B8D96B]/60 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E8DF]">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#17231B] flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B8D96B] text-[#17231B] font-bold uppercase tracking-wider">
                Real-Life Example
              </span>
            </h3>
            <p className="text-xs text-[#647067]">{subtitle}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#17231B] bg-[#B8D96B]/25 border border-[#B8D96B]/50 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto">
          ✨ Easy Everyday Analogy
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {examples.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white border border-[#E2E8DF] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#B8D96B] transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xl">{item.icon}</span>
                {item.highlightTag && (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF]">
                    {item.highlightTag}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-[#17231B]">{item.title}</h4>
              <p className="text-[11px] font-normal text-[#5A685D] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnContent() {
  const searchParams = useSearchParams();
  const expParam = searchParams.get('exp');
  const theoryDetailsRef = useRef<HTMLDivElement>(null);

  // Find index of selected experiment or default to 0 (Convex Lens)
  const initialIndex = CLASS_10_PHYSICS_EXPERIMENTS.findIndex((e) => e.id === expParam);
  const [selectedExpIndex, setSelectedExpIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // For Convex Lens Interactive Cases Explorer
  const [lensCaseIndex, setLensCaseIndex] = useState(1);
  const [interactiveU, setInteractiveU] = useState(30);
  const [interactiveF, setInteractiveF] = useState(15);
  const [interactiveHo, setInteractiveHo] = useState(5);

  // For Concave Mirror Cases Selector
  const [mirrorCaseIndex, setMirrorCaseIndex] = useState(1);

  const currentExp = CLASS_10_PHYSICS_EXPERIMENTS[selectedExpIndex];
  const activeLensCase = CONVEX_LENS_CASES[lensCaseIndex];
  const activeMirrorCase = CONCAVE_MIRROR_CASES[mirrorCaseIndex];

  // Sync query parameter if changed externally
  useEffect(() => {
    if (expParam) {
      const idx = CLASS_10_PHYSICS_EXPERIMENTS.findIndex((e) => e.id === expParam);
      if (idx >= 0) {
        setSelectedExpIndex(idx);
      }
    }
  }, [expParam]);

  const handleSelectExperiment = (idx: number) => {
    setSelectedExpIndex(idx);
    const exp = CLASS_10_PHYSICS_EXPERIMENTS[idx];
    if (typeof window !== 'undefined' && exp) {
      window.history.replaceState(null, '', `/learn?exp=${exp.id}`);
    }
    // Smoothly scroll down directly to the theory matter
    setTimeout(() => {
      if (theoryDetailsRef.current) {
        const navOffset = 80;
        const targetY = theoryDetailsRef.current.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Page Header */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-[#17231B]" />
          <span>Class 10 CBSE & ICSE • Simple & Visual Practical Theory Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal text-[#17231B] tracking-tight font-serif">
          Physics Practical <span className="italic">Theory Made Simple</span>
        </h1>
        <p className="text-sm sm:text-base text-[#647067] leading-relaxed">
          Tap any experiment below. Learn how it works in plain, simple English with everyday examples (like magnifying glasses, spoons, rainbows, and garden water pipes) so you can ace your board practical exams with confidence!
        </p>
      </div>

      {/* =========================================
          EXPERIMENT SELECTOR TABS (All 5 Experiments)
         ========================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#E2E8DF]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#647067]">
            Select an Experiment (Click to Read Theory)
          </span>
          <span className="text-xs text-[#647067] font-medium">
            Active: <strong className="text-[#17231B]">{currentExp.shortTitle}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CLASS_10_PHYSICS_EXPERIMENTS.map((exp, idx) => {
            const isSelected = selectedExpIndex === idx;
            return (
              <button
                key={exp.id}
                type="button"
                id={`exp-tab-${exp.id}`}
                onClick={() => handleSelectExperiment(idx)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#B8D96B] ring-2 ring-[#B8D96B]/50 shadow-md transform scale-[1.02]'
                    : 'bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] border-[#E2E8DF] hover:border-[#CBD5C8] shadow-xs'
                }`}
              >
                {/* Thumbnail Image Header */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#17231B] mb-2.5 border border-[#E2E8DF]/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.imageUrl}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/60 text-[#B8D96B] backdrop-blur-xs">
                    Exp {exp.number}
                  </span>
                </div>

                <div className="space-y-0.5 flex-1">
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#17231B]' : 'text-[#647067] group-hover:text-[#17231B]'}`}>
                    {exp.shortTitle}
                  </h4>
                  <p className="text-[10px] text-[#8C988F] line-clamp-1">{exp.category}</p>
                </div>

                <div className="mt-2 pt-2 border-t border-[#E2E8DF] flex items-center justify-between text-[10px] font-bold">
                  <span className={`${isSelected ? 'text-[#17231B]' : 'text-[#8C988F]'}`}>
                    {isSelected ? '● Reading Below ↓' : 'Click to Read →'}
                  </span>
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-[#B8D96B]' : 'text-[#8C988F]'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================
          EXPERIMENT BANNER & THEORY DETAILS SECTION (Auto-scrolled to)
         ========================================= */}
      <div ref={theoryDetailsRef} className="pt-2 scroll-mt-24 space-y-6">
        {/* Active Experiment Notice Banner */}
        <div className="p-3.5 px-4 rounded-xl bg-[#F4F7F2] border border-[#B8D96B]/60 flex items-center justify-between text-xs font-bold text-[#17231B] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">📖</span>
            <span>You are reading: <strong>Experiment {currentExp.number} — {currentExp.title}</strong></span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-[#B8D96B] text-[#17231B] px-2.5 py-0.5 rounded-full font-extrabold">
            Active Practical
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50">
              Experiment {currentExp.number} • {currentExp.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#F4F7F2] text-[#647067] border border-[#E2E8DF]">
              {currentExp.ncertSection}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#17231B]">
            {currentExp.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
            <strong className="text-[#17231B]">Aim:</strong> {currentExp.aim}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <Link
            href={currentExp.route}
            className="flex-1 md:flex-initial py-2.5 px-4 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Launch 3D Lab</span>
          </Link>

          <Link
            href={`/report?exp=${currentExp.id}`}
            className="py-2.5 px-4 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] font-bold text-xs border border-[#E2E8DF] flex items-center justify-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>View Report</span>
          </Link>

          <Link
            href={currentExp.id === 'convex-lens' ? '/ar' : `${currentExp.route}#ar`}
            className="py-2.5 px-3 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] border border-[#E2E8DF] transition-colors"
            title="Launch WebXR AR Mode"
          >
            <Smartphone className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* =========================================
          DYNAMIC EXPERIMENT THEORY CONTENT
         ========================================= */}
      
      {/* ---------------- 1. CONVEX LENS OPTICS THEORY ---------------- */}
      {currentExp.id === 'convex-lens' && (
        <div className="space-y-8">
          {/* Real-Life Everyday Example Hero Box */}
          <RealLifeExampleBanner
            title="How Convex Lenses Work in Everyday Life"
            subtitle="Before learning the formulas, see where convex lenses are used all around you:"
            examples={[
              {
                icon: '🔍',
                title: 'The Magnifying Glass Sun Trick',
                subtitle: 'Burning paper with sunlight',
                description: 'Ever held a magnifying glass under the sun to burn a tiny bright spot on dry leaves? That hot focused spot is the lens Focus (F), and the distance between the glass and paper is the Focal Length (f)!',
                highlightTag: 'Focus & Focal Length',
              },
              {
                icon: '🎬',
                title: 'Cinema Hall Movie Projector',
                subtitle: 'Small film into giant screen',
                description: 'Inside a cinema projector, a small illuminated film frame placed just behind the focus projects a huge, sharp, colorful real image across the auditorium onto the giant theatre screen!',
                highlightTag: 'Enlarged Real Image',
              },
              {
                icon: '👁️',
                title: 'Your Smartphone Camera & Eyes',
                subtitle: 'Focusing light onto sensors',
                description: 'The camera lens on your smartphone and the natural lens in your eye are convex lenses! They gather light from people far away and shrink it neatly onto the sensor so you see clear photos.',
                highlightTag: 'Camera & Human Eye',
              },
            ]}
          />

          {/* Simple & Clear Theoretical Foundations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>The Lens Formula</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects where the object is (<code className="font-bold text-[#17231B]">u</code>), where the lens focuses (<code className="font-bold text-[#17231B]">f</code>), and where the image appears (<code className="font-bold text-[#17231B]">v</code>):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/v - 1/u = 1/f
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">u (Object distance):</strong> Always negative (-) because light travels from the left.</li>
                <li>• <strong className="text-[#17231B]">v (Image distance):</strong> Positive (+) for real images formed on the screen on the right.</li>
                <li>• <strong className="text-[#17231B]">f (Focal length):</strong> Always positive (+) for a convex converging lens.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Magnification (Zoom Factor)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Tells you how many times bigger or smaller the image is compared to the object:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                m = v / u = Image Height / Object Height
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">Negative (-):</strong> Image is upside down (real and inverted).</li>
                <li>• <strong className="text-[#17231B]">Positive (+):</strong> Image is right-side up (virtual and erect).</li>
                <li>• <strong className="text-[#17231B]">Number &gt; 1:</strong> Image is magnified; <strong className="text-[#17231B]">&lt; 1:</strong> diminished.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Lens Power (Bending Strength)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Measures how strongly the lens bends light rays. Thicker lenses bend rays faster and have a shorter focal length:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                P = 1 / f (in metres) Dioptres (D)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• Unit is <strong className="text-[#17231B]">Dioptre (D)</strong>.</li>
                <li>• Always <strong className="text-[#17231B]">positive (+)</strong> for convex lenses (converging rays).</li>
                <li>• Example: A 20 cm lens (0.2 m) has a power of <strong className="text-[#17231B]">+5.0 D</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Interactive Ray Tracer: 6 Canonical Cases */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
              <div>
                <h3 className="text-base font-bold text-[#17231B] flex items-center gap-2">
                  <span>Interactive Ray Tracer: The 6 Canonical Cases</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/30 text-[#17231B] font-bold uppercase">
                    Interactive
                  </span>
                </h3>
                <p className="text-xs text-[#647067]">
                  Click each case to inspect ray convergence, image location, and real vs virtual characteristics.
                </p>
              </div>
            </div>

            {/* Case Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CONVEX_LENS_CASES.map((item, idx) => (
                <button
                  key={item.caseNo}
                  onClick={() => {
                    setLensCaseIndex(idx);
                    setInteractiveU(item.presetU);
                    setInteractiveF(item.presetF);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    lensCaseIndex === idx
                      ? 'bg-[#17231B] text-white border-[#17231B] shadow-sm'
                      : 'bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] border-[#E2E8DF]'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold block opacity-75">
                    Case {item.caseNo}
                  </span>
                  <span className="text-xs font-bold block truncate">
                    {item.condition}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Case Details Banner */}
            <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
                  Case {activeLensCase.caseNo}: {activeLensCase.title}
                </span>
                <div className="text-xs text-[#17231B] font-semibold flex flex-wrap items-center gap-3">
                  <span>Image Position: <strong className="font-bold">{activeLensCase.imagePos}</strong></span>
                  <span>Nature: <strong className="font-bold">{activeLensCase.nature}</strong></span>
                  <span>Size: <strong className="font-bold">{activeLensCase.size}</strong></span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] shadow-xs">
                {activeLensCase.magnification}
              </span>
            </div>

            {/* SVG Interactive Ray Diagram */}
            <div className="rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] p-4 overflow-hidden">
              <RayDiagramSvg
                state={{
                  focalLength: interactiveF,
                  objectDistance: interactiveU,
                  objectHeight: interactiveHo,
                }}
                height={230}
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 2. CONCAVE MIRROR THEORY ---------------- */}
      {currentExp.id === 'concave-mirror' && (
        <div className="space-y-8">
          {/* Real-Life Everyday Example Hero Box */}
          <RealLifeExampleBanner
            title="How Concave Mirrors Work in Everyday Life"
            subtitle="Before jumping into formulas, discover how curved concave mirrors are used daily:"
            examples={[
              {
                icon: '🥄',
                title: 'The Steel Kitchen Spoon Trick',
                subtitle: 'Inner hollow reflection',
                description: 'Look into the inside hollow bowl of a clean metal spoon. When held at arm’s length, you appear upside-down! But bring it right up to your nose, and suddenly you flip right-side up and look huge!',
                highlightTag: 'Inverted vs Magnified',
              },
              {
                icon: '🚗',
                title: 'Car Headlights & Flashlight Torches',
                subtitle: 'Focusing light into a straight beam',
                description: 'Why can a tiny 12V bulb illuminate dark highways for 200 metres? The bulb is placed right at the mirror’s focus point, bouncing all scattered light into a laser-straight, powerful parallel beam!',
                highlightTag: 'Parallel Beam (u = f)',
              },
              {
                icon: '🪒',
                title: 'Dentist & Shaving Mirror',
                subtitle: 'Magnified upright reflections',
                description: 'When held close to your face (inside the focal point), a concave mirror creates an upright, extra-large virtual image so dentists can examine small teeth and you can shave safely without cuts.',
                highlightTag: 'Virtual Magnified Image',
              },
            ]}
          />

          {/* Simple & Clear Mathematical Laws */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>The Mirror Formula</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects focal point (<code className="font-bold text-[#17231B]">f</code>), object (<code className="font-bold text-[#17231B]">u</code>), and image (<code className="font-bold text-[#17231B]">v</code>). Notice the plus sign:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/v + 1/u = 1/f
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">f (Focal length):</strong> Always negative (-) because the focal point is in front of the mirror.</li>
                <li>• <strong className="text-[#17231B]">u (Object distance):</strong> Always negative (-).</li>
                <li>• <strong className="text-[#17231B]">v (Real image):</strong> Negative (-) in front; positive (+) if virtual behind the glass.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Radius of Curvature (R = 2f)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Imagine the mirror as a slice cut from a hollow shiny sphere. The sphere’s centre is <code className="font-bold text-[#17231B]">C</code>:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                R = 2f  ⟺  f = R / 2
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• The focal point <strong className="text-[#17231B]">F</strong> lies exactly halfway between the mirror Pole and centre <strong className="text-[#17231B]">C</strong>.</li>
                <li>• Any ray passing through <strong className="text-[#17231B]">C</strong> bounces straight back on itself because it hits the curved surface at 90° (normal).</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Mirror Magnification</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                How much bigger or smaller your reflection appears (note the negative sign):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                m = -v / u = Image Height / Object Height
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">Negative (-):</strong> Real and upside down.</li>
                <li>• <strong className="text-[#17231B]">Positive (+):</strong> Virtual, upright, and magnified (like a shaving mirror).</li>
              </ul>
            </div>
          </div>

          {/* 6 Canonical Cases for Concave Mirror */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-6">
            <h3 className="text-base font-bold text-[#17231B] flex items-center gap-2 pb-2 border-b border-[#E2E8DF]">
              <span>6 Canonical Cases of Reflection by a Concave Mirror</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CONCAVE_MIRROR_CASES.map((item, idx) => (
                <button
                  key={item.caseNo}
                  onClick={() => setMirrorCaseIndex(idx)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    mirrorCaseIndex === idx
                      ? 'bg-[#17231B] text-white border-[#17231B] shadow-sm'
                      : 'bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] border-[#E2E8DF]'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold block opacity-75">
                    Case {item.caseNo}
                  </span>
                  <span className="text-xs font-bold block truncate">
                    {item.condition}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Mirror Case Card */}
            <div className="p-5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-[#17231B]">
                  Case {activeMirrorCase.caseNo}: {activeMirrorCase.title}
                </h4>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B]">
                  Magnification: {activeMirrorCase.magnification}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8DF]">
                  <span className="text-[10px] font-bold uppercase text-[#647067] block">Image Position</span>
                  <span className="font-semibold text-[#17231B]">{activeMirrorCase.imagePos}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8DF]">
                  <span className="text-[10px] font-bold uppercase text-[#647067] block">Nature & Size</span>
                  <span className="font-semibold text-[#17231B]">{activeMirrorCase.nature} ({activeMirrorCase.size})</span>
                </div>
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E2E8DF]">
                  <span className="text-[10px] font-bold uppercase text-[#647067] block">Practical Application</span>
                  <span className="font-semibold text-[#17231B]">{activeMirrorCase.application}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. RECTANGULAR GLASS SLAB THEORY ---------------- */}
      {currentExp.id === 'glass-slab' && (
        <div className="space-y-8">
          {/* Real-Life Everyday Example Hero Box */}
          <RealLifeExampleBanner
            title="How Glass Slab Refraction Works in Everyday Life"
            subtitle="Before checking pin angles, look at how light bends in water and glass every day:"
            examples={[
              {
                icon: '🥤',
                title: 'The "Broken" Drinking Straw',
                subtitle: 'Straw inside a glass of water',
                description: 'Put a straight drinking straw into a transparent glass of water. From the outside, the straw looks completely cut, displaced, or bent at the water surface! That is Refraction: light slows down in denser water and glass, shifting its path.',
                highlightTag: 'Refraction Basics',
              },
              {
                icon: '🪙',
                title: 'The Magic Floating Coin Trick',
                subtitle: 'Coin rising in a mug',
                description: 'Drop a coin in a cup and step back until the rim blocks it. Now pour water in — the coin magically appears into view! Light bending away from the normal lifts the apparent position of the coin toward the surface.',
                highlightTag: 'Apparent Depth',
              },
              {
                icon: '📐',
                title: 'The Sideways Step (Lateral Shift)',
                subtitle: 'Parallel entry and exit',
                description: 'Because opposite faces of the glass block are parallel, the ray exits at the exact same angle it entered (∠i = ∠e). It never changes its overall travel direction — it just takes a sideways step!',
                highlightTag: 'Lateral Displacement',
              },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Snell’s Law (Why Light Bends)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Light travels at 300,000 km/s in air, but slows down to 200,000 km/s inside glass. Because it slows down, it bends towards the normal line:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                n = sin(i) / sin(r) ≈ 1.50
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">i (Angle of Incidence):</strong> Entry angle in air.</li>
                <li>• <strong className="text-[#17231B]">r (Angle of Refraction):</strong> Bent angle inside glass (always smaller than i).</li>
                <li>• <strong className="text-[#17231B]">n (Refractive index):</strong> Measure of how much glass slows down light.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Parallel Emergence (∠i = ∠e)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Entering glass bends the ray inward. Exiting glass into air bends it outward by the exact same angle:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                ∠i = ∠e (Angle of Emergence)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• The exiting beam is strictly <strong className="text-[#17231B]">parallel</strong> to the incoming beam.</li>
                <li>• Zero angular deviation occurs because the opposite faces are parallel.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Lateral Displacement (d)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                The perpendicular sideways shift between the original path and the exiting beam:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                d = [t · sin(i - r)] / cos(r)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">Thicker slab (t):</strong> Produces a larger sideways shift.</li>
                <li>• <strong className="text-[#17231B]">Steeper angle (i):</strong> Produces a larger sideways shift.</li>
              </ul>
            </div>
          </div>

          {/* Optical Pins Protocol Diagram Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Standard Laboratory Optical Pins Protocol (P₁, P₂, P₃, P₄)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2 text-xs text-[#647067]">
                <p>
                  1. Fix a white paper sheet on the drawing board using drawing pins. Place the rectangular glass slab in the centre and trace its boundary.
                </p>
                <p>
                  2. Draw a normal line and measure an angle of incidence (e.g. 30°, 45°, 60°). Fix two optical pins <strong>P₁</strong> and <strong>P₂</strong> separated by at least 5 cm on the incident line.
                </p>
                <p>
                  3. Look through the opposite face of the slab with one eye closed. Fix pins <strong>P₃</strong> and <strong>P₄</strong> such that their feet appear to lie in a straight line with the images of P₁ and P₂ (no parallax).
                </p>
                <p>
                  4. Remove the slab, join P₃ and P₄ to the boundary, and connect entry point to exit point. Measure ∠r, ∠e, and lateral shift d.
                </p>
              </div>

              {/* Graphic Preview */}
              <div className="rounded-xl overflow-hidden border border-[#E2E8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/glass-slab.svg"
                  alt="Glass Slab Refraction"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. TRIANGULAR GLASS PRISM THEORY ---------------- */}
      {currentExp.id === 'glass-prism' && (
        <div className="space-y-8">
          {/* Real-Life Everyday Example Hero Box */}
          <RealLifeExampleBanner
            title="How Glass Prisms & Rainbows Work in Everyday Life"
            subtitle="Before measuring deviation angles, see how nature splits white light into colors:"
            examples={[
              {
                icon: '🌈',
                title: 'Real Rainbows After Rain',
                subtitle: 'Nature’s giant raindrops',
                description: 'White sunlight looks colorless, but it is actually 7 vibrant colors bundled together (VIBGYOR). When sunlight enters spherical raindrops, each color bends at a different angle, spreading out into a magical sky rainbow!',
                highlightTag: 'Dispersion of Light',
              },
              {
                icon: '🔺',
                title: 'Permanent Triangular Bending',
                subtitle: 'Why prisms don’t stay straight',
                description: 'Unlike a flat glass window where light exits straight, a triangular prism has slanted sides. This causes light to bend permanently toward the heavy base of the triangle instead of staying parallel!',
                highlightTag: 'Angle of Deviation',
              },
              {
                icon: '💿',
                title: 'Soap Bubbles & Shiny CDs',
                subtitle: 'Rainbow sheen in room light',
                description: 'The swirling rainbow colors on soap bubbles or the back of an audio CD separate ambient room light into its seven component colors using the exact same wave dispersion physics!',
                highlightTag: 'VIBGYOR Spectrum',
              },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>The Prism Equation</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects prism angle (<code className="font-bold text-[#17231B]">A</code> = 60°), bending angle (<code className="font-bold text-[#17231B]">D</code>), entry angle (<code className="font-bold text-[#17231B]">i</code>), and exit angle (<code className="font-bold text-[#17231B]">e</code>):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                A + D = i + e
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• Slanted triangle faces permanently deflect the ray toward the base.</li>
                <li>• <strong className="text-[#17231B]">D (Deviation):</strong> How much the ray turns from its original path.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Minimum Deviation (The Sweet Spot)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                When light passes symmetrically through the prism, the bending angle hits its lowest possible value (<code className="font-bold text-[#17231B]">Dₘ</code>):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                n = sin[(A + Dₘ)/2] / sin(A/2)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• At minimum deviation, <strong className="text-[#17231B]">i = e</strong> and the ray inside runs parallel to the base.</li>
                <li>• For standard glass with A = 60°, Dₘ is roughly <strong className="text-[#17231B]">37° to 38°</strong>.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>VIBGYOR (Why Colors Separate)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Violet light has short waves and slows down the most in glass, so it bends the hardest. Red light has long waves and bends the least:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                Deviation: Violet &gt; Indigo &gt; Blue &gt; Green &gt; Yellow &gt; Orange &gt; Red
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">Red:</strong> Bends least (~700 nm wavelength).</li>
                <li>• <strong className="text-[#17231B]">Violet:</strong> Bends most (~400 nm wavelength).</li>
              </ul>
            </div>
          </div>

          {/* Dispersion Diagram & i-D Curve Analysis */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Spectrum & i-D Characteristic Curve</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3 text-xs text-[#647067]">
                <p>
                  As the angle of incidence <code className="font-bold text-[#17231B]">i</code> increases from 30°, the angle of deviation <code className="font-bold text-[#17231B]">D</code> first decreases, reaches a minimum value <code className="font-bold text-[#17231B]">Dₘ</code>, and then increases.
                </p>
                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1 font-mono text-[11px] text-[#17231B]">
                  <div>• i = 35° ⟹ D ≈ 41°</div>
                  <div>• i = 48° ⟹ D = Dₘ ≈ 37.5° (Symmetric path)</div>
                  <div>• i = 60° ⟹ D ≈ 40°</div>
                </div>
                <p>
                  Natural rainbows in nature arise from dispersion, refraction, and total internal reflection of sunlight inside spherical atmospheric water droplets.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E2E8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/glass-prism.svg"
                  alt="Glass Prism Dispersion"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 5. OHM'S LAW & CIRCUITS THEORY ---------------- */}
      {currentExp.id === 'ohms-law' && (
        <div className="space-y-8">
          {/* Real-Life Everyday Example Hero Box */}
          <RealLifeExampleBanner
            title="How Ohm’s Law & Electricity Work in Everyday Life"
            subtitle="Before connecting meters, see how electrical circuits relate to water and household wiring:"
            examples={[
              {
                icon: '🚰',
                title: 'The Garden Water Pipe Analogy',
                subtitle: 'Voltage = Pressure, Current = Flow',
                description: 'Think of electricity like water flowing in a hose: Voltage (V) is the pump pressure pushing the water, Current (I) is how much water gushes out per second, and Resistance (R) is someone stepping on or squeezing the pipe!',
                highlightTag: 'Core Analogy (V = IR)',
              },
              {
                icon: '🔥',
                title: 'Why Phone Chargers & Toasters Get Warm',
                subtitle: 'Electrical friction generates heat',
                description: 'When millions of electrons struggle through a narrow resistance wire, friction generates heat! That is why your phone charger warms up, and exactly how room heaters, toasters, and hair dryers work.',
                highlightTag: 'Heating Effect (H = I²Rt)',
              },
              {
                icon: '💡',
                title: 'Why Home Lights Don’t All Go Dark',
                subtitle: 'Series vs Parallel wiring',
                description: 'Old decorative holiday string lights wired in series all die if just one bulb burns out! But your household rooms are wired in parallel, so switching off your bedroom lamp leaves the living room fan and TV running.',
                highlightTag: 'Parallel in Homes',
              },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Ohm’s Law Formula</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                The harder you push (Voltage), the more current flows through the wire (Current), unless the wire resists (Resistance):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                V = I · R  ⟺  R = V / I
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• <strong className="text-[#17231B]">V (Voltage in Volts):</strong> Electrical push from the battery.</li>
                <li>• <strong className="text-[#17231B]">I (Current in Amperes):</strong> Rate of electron flow.</li>
                <li>• <strong className="text-[#17231B]">R (Resistance in Ohms Ω):</strong> The wire’s opposition to current.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Series Wiring (End-to-End)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Single chain connection. The same current flows through each resistor, while voltages add up:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                Rₛ = R₁ + R₂ + ... + Rₙ
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• Total resistance increases: <strong className="text-[#17231B]">Rₛ &gt; largest R</strong>.</li>
                <li>• If one component breaks, the entire circuit stops working.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Parallel Wiring (Side-by-Side)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Separate branch connection. Full battery voltage reaches every branch independently:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/Rₚ = 1/R₁ + 1/R₂ + ...
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1.5">
                <li>• Total resistance drops: <strong className="text-[#17231B]">Rₚ &lt; smallest R</strong>.</li>
                <li>• Standard in all house electrical wiring for safe, independent control.</li>
              </ul>
            </div>
          </div>

          {/* V-I Graph & Laboratory Circuit Schematic */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>V-I Characteristic Graph & Slope Analysis</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3 text-xs text-[#647067]">
                <p>
                  Plotting potential difference <code className="font-bold text-[#17231B]">V</code> on the vertical y-axis and current <code className="font-bold text-[#17231B]">I</code> on the horizontal x-axis yields a straight line passing through the origin.
                </p>
                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1 font-mono text-xs text-[#17231B] font-bold">
                  Slope = ΔV / ΔI = R (Resistance in Ohms)
                </div>
                <p>
                  A steeper slope indicates higher electrical resistance. If the plot curves upward at high currents, it indicates temperature increase leading to increased resistivity (non-ohmic behaviour).
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E2E8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/ohms-law.svg"
                  alt="Ohm's Law Circuit and V-I Graph"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          HIGH-YIELD BOARD VIVA VOCE QUESTIONS
         ========================================= */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B8D96B]" />
          <span>High-Yield Board Practical Viva Voce Questions: {currentExp.shortTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {currentExp.id === 'convex-lens' && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q1: What is parallax error and how is it removed?</span>
                <p className="text-[#647067]">
                  Parallax is the apparent shift in relative position of two objects when the observer moves sideways. It is removed when the tips of the object pin and image pin stay aligned as the observer moves their head left and right.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q2: Can a convex lens produce a virtual image?</span>
                <p className="text-[#647067]">
                  Yes, when the object is placed between the optical centre O and the principal focus F₁ (u &lt; f). The image formed is virtual, erect, and magnified on the same side as the object (magnifying glass mode).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q3: Why is focal length positive for a convex lens?</span>
                <p className="text-[#647067]">
                  According to the New Cartesian sign convention, distances measured in the direction of incident light (to the right of optical centre) are taken as positive. Parallel rays converge to focus F₂ on the right side.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q4: What happens if half of the lens is covered with black paper?</span>
                <p className="text-[#647067]">
                  A complete image is still formed because rays from every point of the object pass through the uncovered half. However, the brightness (intensity) of the image is reduced to half.
                </p>
              </div>
            </>
          )}

          {currentExp.id === 'concave-mirror' && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q1: Why is a concave mirror used as a shaving or dental mirror?</span>
                <p className="text-[#647067]">
                  When held close to the face (inside the focal point, u &lt; f), it produces a virtual, erect, and magnified image of small details.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q2: Why does a ray passing through C retrace its path?</span>
                <p className="text-[#647067]">
                  Any line drawn from the centre of curvature C to the spherical mirror surface is a radius and thus perpendicular (normal) to the surface. Angle of incidence is 0°, hence angle of reflection is 0°.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q3: What mirror is used in car headlights?</span>
                <p className="text-[#647067]">
                  Concave mirrors (or parabolic reflectors). The bulb is placed at the principal focus F, so reflected rays form a strong, parallel beam traveling great distances.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q4: Can a concave mirror form a real image at infinity?</span>
                <p className="text-[#647067]">
                  Yes, when the object is placed precisely at the principal focus F (u = f). Reflected rays emerge parallel to each other and converge at infinity.
                </p>
              </div>
            </>
          )}

          {currentExp.id === 'glass-slab' && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q1: Why does a ray entering normally (i = 0) not bend?</span>
                <p className="text-[#647067]">
                  By Snell's law: sin(r) = sin(i) / n. If i = 0°, sin(0°) = 0, so r = 0°. The light slows down but undergoes zero directional deflection.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q2: What is the cause of lateral displacement?</span>
                <p className="text-[#647067]">
                  Refraction at two parallel opposite surfaces: light bends toward the normal upon entering and away from the normal upon exiting by the exact same angle, causing a sideways parallel shift.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q3: How does slab thickness affect lateral displacement?</span>
                <p className="text-[#647067]">
                  Lateral displacement d is directly proportional to slab thickness t. A thicker slab creates a longer path inside glass, yielding a larger parallel shift.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q4: Why should the distance between pins be at least 5 cm?</span>
                <p className="text-[#647067]">
                  Greater distance between pins reduces angular error when drawing ray lines through pinpricks with a ruler, ensuring accurate measurement of ∠i and ∠e.
                </p>
              </div>
            </>
          )}

          {currentExp.id === 'glass-prism' && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q1: Why does white light disperse in a prism but not in a glass slab?</span>
                <p className="text-[#647067]">
                  In a rectangular slab with parallel faces, dispersion occurs at the first face but opposite refraction at the second face recombines all colours parallel to each other. In a prism, the non-parallel faces cause angular separation to increase.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q2: Which colour deviates the most and why?</span>
                <p className="text-[#647067]">
                  Violet light deviates the most because it has the shortest wavelength (~400 nm), travels slowest in glass, and experiences the highest refractive index.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q3: What is the condition for minimum deviation?</span>
                <p className="text-[#647067]">
                  At minimum deviation (Dₘ), the angle of incidence equals the angle of emergence (i = e), the refracted ray travels parallel to the base inside the equilateral prism, and r₁ = r₂ = A/2.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q4: What is monochromatic light?</span>
                <p className="text-[#647067]">
                  Light of a single wavelength/colour (such as a sodium vapor lamp or laser). Monochromatic light refracts and deviates through a prism without splitting into a spectrum.
                </p>
              </div>
            </>
          )}

          {currentExp.id === 'ohms-law' && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q1: Why is an ammeter connected in series and voltmeter in parallel?</span>
                <p className="text-[#647067]">
                  An ammeter measures total current and has very low resistance so it does not alter circuit current. A voltmeter measures potential difference between two points and has very high resistance so it draws negligible current.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q2: Why should current not be passed continuously during the experiment?</span>
                <p className="text-[#647067]">
                  Continuous current causes Joule heating (H = I²Rt). Temperature increases resistance (R = R₀[1 + αΔT]), causing the V-I plot to deviate from a straight line.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q3: How do you determine resistance from a V-I graph?</span>
                <p className="text-[#647067]">
                  By calculating the slope of the straight line: Slope = ΔV / ΔI. The steeper the line on a V vs I plot, the higher the resistance.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
                <span className="font-bold text-[#17231B] block">Q4: What is the function of a rheostat in the circuit?</span>
                <p className="text-[#647067]">
                  A rheostat acts as a variable resistor to smoothly adjust circuit current and potential difference across the unknown coil without changing the battery voltage.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#647067]">Loading physics theory guide...</div>}>
      <LearnContent />
    </Suspense>
  );
}
