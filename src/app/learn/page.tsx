'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
  Maximize2,
  Eye,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
import { LAB_PRESETS } from '@/lib/physics';

const LENS_CASES = [
  {
    caseNo: 1,
    title: 'Object at Infinity (u = ∞)',
    condition: 'u = ∞',
    imagePos: 'At the second focus (v = f)',
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
    application: 'Film projector, cinema auditorium projection, compound microscope objective',
    presetU: 22.5,
    presetF: 15,
  },
  {
    caseNo: 5,
    title: 'Object at Principal Focus F₁ (u = f)',
    condition: 'u = f',
    imagePos: 'At Infinity (v = ∞)',
    nature: 'Real and Inverted (refracted rays parallel)',
    size: 'Extremely magnified',
    magnification: 'm = -∞',
    application: 'Searchlights, lighthouse beacons, theater spotlights producing parallel beam',
    presetU: 15,
    presetF: 15,
  },
  {
    caseNo: 6,
    title: 'Object Between Focus and Optical Centre (u < f)',
    condition: 'u < f',
    imagePos: 'Behind the object on same side (v < 0)',
    nature: 'Virtual and Erect',
    size: 'Magnified (enlarged)',
    magnification: 'm > +1 (positive)',
    application: 'Simple magnifier, jeweler’s loupe, reading glass, microscope eyepiece',
    presetU: 10,
    presetF: 15,
  },
];

export default function LearnPage() {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(1); // default Case 2 (u > 2f)
  const [interactiveU, setInteractiveU] = useState(30);
  const [interactiveF, setInteractiveF] = useState(15);
  const [interactiveHo, setInteractiveHo] = useState(5);

  const activeCase = LENS_CASES[selectedCaseIndex];

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curriculum Module: Geometric Optics & Refraction</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Theoretical Principles of Convex Lenses
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          A convex (biconvex) lens is thicker at the centre than at the edges. Because it bends incident parallel light rays toward the central axis, it is known as a <strong>converging lens</strong>.
        </p>
      </div>

      {/* =========================================
          INTERACTIVE 6 CASES EXPLORER
         ========================================= */}
      <section className="p-6 rounded-2xl bg-[#090e1a] border border-cyan-900/40 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interactive Ray Tracer: The 6 Image Formation Cases</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
                Interactive
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any of the 6 standard cases to see how image position, nature, and size evolve as the object approaches the lens.
            </p>
          </div>

          <Link
            href="/lab"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Test in 3D Lab</span>
          </Link>
        </div>

        {/* Case Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LENS_CASES.map((item, idx) => (
            <button
              key={item.caseNo}
              onClick={() => {
                setSelectedCaseIndex(idx);
                setInteractiveU(item.presetU);
                setInteractiveF(item.presetF);
              }}
              className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                selectedCaseIndex === idx
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-[#0f172a] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">Case {item.caseNo}</span>
                <span className="text-[10px] font-mono text-cyan-400">{item.condition}</span>
              </div>
              <p className="text-[11px] line-clamp-1 font-medium">{item.nature}</p>
            </button>
          ))}
        </div>

        {/* Active Case Details & Ray Diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Ray Diagram */}
          <div className="lg:col-span-2 space-y-3">
            <RayDiagramSvg
              state={{
                focalLength: interactiveF,
                objectDistance: interactiveU,
                objectHeight: interactiveHo,
              }}
              height={320}
            />

            {/* Slider to fine-tune u */}
            <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Fine-tune Distance u:</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="0.5"
                  value={interactiveU}
                  onChange={(e) => setInteractiveU(Number(e.target.value))}
                  className="w-44 accent-cyan-400"
                />
                <span className="font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  u = {interactiveU} cm
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Object Height:</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={interactiveHo}
                  onChange={(e) => setInteractiveHo(Number(e.target.value))}
                  className="w-24 accent-amber-400"
                />
                <span className="font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  {interactiveHo} cm
                </span>
              </div>
            </div>
          </div>

          {/* Case Scientific Profile */}
          <div className="p-5 rounded-xl bg-[#0b1220] border border-slate-800 space-y-4 text-xs">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Case {activeCase.caseNo} Profile
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{activeCase.title}</h3>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block font-medium">Image Position:</span>
                <span className="font-semibold text-slate-200">{activeCase.imagePos}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Nature of Image:</span>
                <span className={`font-bold ${activeCase.nature.includes('Real') ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {activeCase.nature}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Relative Size:</span>
                <span className="font-semibold text-amber-300">{activeCase.size}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Magnification (m):</span>
                <span className="font-mono font-bold text-cyan-300">{activeCase.magnification}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Real-World Application:</span>
                <span className="text-slate-300 italic">{activeCase.application}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          KEY TERMINOLOGY GRID
         ========================================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Essential Optical Terminology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">1. Optical Centre (O)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The central point of the lens through which any ray of light passes undeviated (without suffering any lateral displacement in a thin lens).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">2. Principal Axis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The imaginary straight line passing through both centres of curvature (C₁ and C₂) and the optical centre of the lens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">3. Principal Focus (F)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A point on the principal axis where rays of light parallel to the principal axis converge after undergoing refraction through the convex lens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">4. Focal Length (f)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The distance between the optical centre (O) and the principal focus (F) of the lens. For a convex lens, f is always positive (+).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">5. Real vs Virtual Image</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Real images</strong> are formed where refracted rays actually intersect and can be captured on a screen. <strong>Virtual images</strong> are formed where diverging rays only appear to intersect when projected backward.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300">6. Aperture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The effective diameter of the light-transmitting circular boundary of the lens. It determines the light-gathering power and image brightness.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          NEW CARTESIAN SIGN CONVENTION
         ========================================= */}
      <section className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>New Cartesian Sign Convention</span>
          <span className="text-xs font-normal text-slate-400">(Standard School Practical Rules)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <ul className="space-y-2.5 list-disc list-inside">
            <li>
              <strong>Pole / Optical Centre as Origin:</strong> All distances are measured along the principal axis from the optical centre (O).
            </li>
            <li>
              <strong>Direction of Incident Light:</strong> Distances measured in the same direction as incident light (to the right of O) are taken as <strong>positive (+)</strong>.
            </li>
            <li>
              <strong>Opposite to Incident Light:</strong> Distances measured against the direction of incident light (to the left of O) are taken as <strong>negative (-)</strong>.
            </li>
            <li>
              <strong>Object Distance (u):</strong> Because the object is always placed to the left of the lens, <strong>u is always negative (-u)</strong>.
            </li>
          </ul>

          <ul className="space-y-2.5 list-disc list-inside">
            <li>
              <strong>Convex Lens Focal Length:</strong> The principal focus lies to the right (in the direction of incident light), so <strong>f is always positive (+f)</strong>.
            </li>
            <li>
              <strong>Heights Above Axis:</strong> Distances measured upward and perpendicular to the principal axis (erect) are taken as <strong>positive (+hₒ)</strong>.
            </li>
            <li>
              <strong>Heights Below Axis:</strong> Distances measured downward (inverted) are taken as <strong>negative (-hᵢ)</strong>.
            </li>
            <li>
              <strong>Magnification Sign:</strong> Negative magnification (m &lt; 0) signifies a <strong>real & inverted</strong> image; positive magnification (m &gt; 0) signifies a <strong>virtual & erect</strong> image.
            </li>
          </ul>
        </div>
      </section>

      {/* =========================================
          MATHEMATICAL FORMULAS
         ========================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-800/60 space-y-3">
          <span className="text-xs uppercase font-bold text-cyan-400">1. Lens Formula</span>
          <div className="text-2xl font-mono font-bold text-white py-2">
            1/v - 1/u = 1/f
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Relates the object distance (u), image distance (v), and focal length (f) under the Cartesian sign convention.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-800/60 space-y-3">
          <span className="text-xs uppercase font-bold text-amber-400">2. Practical Focal Length Formula</span>
          <div className="text-2xl font-mono font-bold text-white py-2">
            f = (u × v) / (u + v)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Formula used in lab notebooks to directly calculate focal length from positive distance magnitudes u and v.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-800/60 space-y-3">
          <span className="text-xs uppercase font-bold text-emerald-400">3. Linear Magnification</span>
          <div className="text-2xl font-mono font-bold text-white py-2">
            m = hᵢ / hₒ = v / u
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The ratio of the height of the image (hᵢ) to the height of the object (hₒ). Also equal to the ratio of v to u.
          </p>
        </div>
      </section>
    </div>
  );
}
