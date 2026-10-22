'use client';

import React, { useState, Suspense } from 'react';
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

function LearnContent() {
  const searchParams = useSearchParams();
  const expParam = searchParams.get('exp');

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

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Page Header */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-[#17231B]" />
          <span>Class 10 CBSE & ICSE • Master Practical Theory & Viva Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal text-[#17231B] tracking-tight font-serif">
          Physics Practical <span className="italic">Theory & Principles</span>
        </h1>
        <p className="text-sm sm:text-base text-[#647067] leading-relaxed">
          Select an experiment below to master its optical principles, mathematical derivations, sign conventions, canonical ray cases, and board viva questions.
        </p>
      </div>

      {/* =========================================
          EXPERIMENT SELECTOR TABS (All 5 Experiments)
         ========================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#E2E8DF]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#647067]">
            Select Prescribed Practical (1 of 5)
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
                onClick={() => setSelectedExpIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#B8D96B] ring-2 ring-[#B8D96B]/50 shadow-md'
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
                    {isSelected ? '● Reading' : 'View Theory'}
                  </span>
                  <ChevronRight className={`w-3 h-3 ${isSelected ? 'text-[#B8D96B]' : 'text-[#8C988F]'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================
          EXPERIMENT BANNER & QUICK LAUNCH ACTIONS
         ========================================= */}
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
          {/* Theoretical Foundations & Lens Formula */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Lens Formula & Sign Convention</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects focal length (<code className="font-bold text-[#17231B]">f</code>), object distance (<code className="font-bold text-[#17231B]">u</code>), and image distance (<code className="font-bold text-[#17231B]">v</code>) using the New Cartesian Sign Convention:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/v - 1/u = 1/f
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Object distance <code className="font-bold text-[#17231B]">u</code> is always negative (-).</li>
                <li>• Real image distance <code className="font-bold text-[#17231B]">v</code> is positive (+).</li>
                <li>• Focal length <code className="font-bold text-[#17231B]">f</code> of convex lens is positive (+).</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Linear Magnification (m)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Ratio of height of image (<code className="font-bold text-[#17231B]">hᵢ</code>) to height of object (<code className="font-bold text-[#17231B]">hₒ</code>):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                m = v / u = hᵢ / hₒ
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Negative magnification indicates a real, inverted image.</li>
                <li>• Positive magnification indicates a virtual, erect image.</li>
                <li>• If |m| &gt; 1: magnified; if |m| &lt; 1: diminished.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Power of a Lens (P)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Measure of the degree of convergence of light rays, defined as reciprocal of focal length in meters:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                P = 1 / f (in metres) Dioptres (D)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• 1 Dioptre (1 D) = 1 m⁻¹.</li>
                <li>• Power is positive (+) for convex lens (converging).</li>
                <li>• For f = 20 cm = 0.2 m, P = +5.0 D.</li>
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
          {/* Mathematical & Physical Laws */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Spherical Mirror Formula</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects focal length (<code className="font-bold text-[#17231B]">f</code>), object distance (<code className="font-bold text-[#17231B]">u</code>), and image distance (<code className="font-bold text-[#17231B]">v</code>) for spherical reflection:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/v + 1/u = 1/f
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Focal length <code className="font-bold text-[#17231B]">f</code> of concave mirror is negative (-).</li>
                <li>• Real image distance <code className="font-bold text-[#17231B]">v</code> is negative (-).</li>
                <li>• Virtual image distance <code className="font-bold text-[#17231B]">v</code> is positive (+).</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Radius of Curvature (R = 2f)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Centre of Curvature <code className="font-bold text-[#17231B]">C</code> is the centre of the sphere of which the mirror forms a part. The focal point <code className="font-bold text-[#17231B]">F</code> lies exactly halfway between the Pole <code className="font-bold text-[#17231B]">P</code> and <code className="font-bold text-[#17231B]">C</code>:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                R = 2f  ⟺  f = R / 2
              </div>
              <p className="text-[11px] text-[#647067]">
                A ray passing through C reflects back along its own path because it strikes normally (i = 0, r = 0).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Mirror Magnification</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Ratio of image height to object height (note the negative sign):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                m = -v / u = hᵢ / hₒ
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• For real, inverted image: m is negative (-).</li>
                <li>• For virtual, erect image: m is positive (+).</li>
                <li>• Shaving mirror operates in virtual zone (u &lt; f, m &gt; +1).</li>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Snell’s Law of Refraction</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                When light passes obliquely from an optically rarer medium (air, n₁ ≈ 1) into a denser medium (crown glass, n₂ ≈ 1.52), it bends toward the normal:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                n = sin(i) / sin(r)
              </div>
              <p className="text-[11px] text-[#647067]">
                The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Parallel Emergence (∠i = ∠e)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                At the first surface (air-to-glass), the ray bends toward the normal (∠r &lt; ∠i). At the second parallel surface (glass-to-air), it bends away from the normal by the exact same angular magnitude:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                ∠i = ∠e (Angle of Emergence)
              </div>
              <p className="text-[11px] text-[#647067]">
                Hence, the emergent ray is strictly parallel to the original direction of the incident ray.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Lateral Displacement (d)</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                The perpendicular distance between the original incident ray and the emergent ray:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                d = [t · sin(i - r)] / cos(r)
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Directly proportional to slab thickness <code className="font-bold text-[#17231B]">t</code>.</li>
                <li>• Increases as angle of incidence <code className="font-bold text-[#17231B]">i</code> increases.</li>
                <li>• Directly proportional to refractive index <code className="font-bold text-[#17231B]">n</code>.</li>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>The Prism Equation</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Connects Angle of Prism (<code className="font-bold text-[#17231B]">A</code> = 60°), Angle of Deviation (<code className="font-bold text-[#17231B]">D</code>), Angle of Incidence (<code className="font-bold text-[#17231B]">i</code>), and Angle of Emergence (<code className="font-bold text-[#17231B]">e</code>):
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                A + D = i + e
              </div>
              <p className="text-[11px] text-[#647067]">
                Unlike a parallel slab, non-parallel refracting faces cause the emergent ray to bend permanently toward the base of the prism.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Minimum Deviation & Refractive Index</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                At the angle of minimum deviation (<code className="font-bold text-[#17231B]">Dₘ</code>), the ray travels parallel to the base inside the prism, and <code className="font-bold text-[#17231B]">i = e</code>:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                n = sin[(A + Dₘ)/2] / sin(A/2)
              </div>
              <p className="text-[11px] text-[#647067]">
                For crown glass (n ≈ 1.5) with A = 60°, Dₘ is approximately 37°–38°.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>VIBGYOR Dispersion of White Light</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                White light consists of seven primary spectral colours. In glass, speed of light varies inversely with refractive index:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold text-center">
                λ_red &gt; λ_violet ⟹ D_violet &gt; D_red
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Red light has longest wavelength (~700 nm) and deviates the least.</li>
                <li>• Violet light has shortest wavelength (~400 nm) and deviates the most.</li>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Ohm’s Law Statement</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                The electric current (<code className="font-bold text-[#17231B]">I</code>) flowing through a metallic conductor is directly proportional to the potential difference (<code className="font-bold text-[#17231B]">V</code>) across its ends, provided its temperature and physical conditions remain constant:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                V = I · R  ⟺  R = V / I
              </div>
              <p className="text-[11px] text-[#647067]">
                SI unit of resistance is Ohm (Ω). 1 Ω = 1 Volt / 1 Ampere.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Series Resistor Combination</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Resistors connected end-to-end. Current is identical through each resistor, while total potential difference is divided:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                Rₛ = R₁ + R₂ + ... + Rₙ
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Equivalent resistance is greater than the largest individual resistance.</li>
                <li>• If one resistor fails, the entire circuit is broken.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                <span>Parallel Resistor Combination</span>
              </h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Resistors connected across common points. Potential difference is identical across each, while total current is the sum:
              </p>
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-sm text-[#17231B] font-bold text-center">
                1/Rₚ = 1/R₁ + 1/R₂ + ...
              </div>
              <ul className="text-[11px] text-[#647067] space-y-1">
                <li>• Equivalent resistance is less than the smallest individual resistance.</li>
                <li>• Household appliances are connected in parallel so each operates independently.</li>
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
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#647067]">Loading physics theory guide...</div>}>
      <LearnContent />
    </Suspense>
  );
}
