'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Compass,
  Sliders,
  Sparkles,
  Layers,
  Crosshair,
  CheckCircle2,
  TableProperties,
  BookOpen,
  Info,
  Maximize2,
  Smartphone,
  Eye,
  Scale,
  FileText,
} from 'lucide-react';
import { ConcaveMirrorBench3D } from '@/components/ConcaveMirrorBench3D';
import {
  calculateMirrorOptics,
  getMirrorCanonicalCase,
  MirrorSystemState,
} from '@/lib/mirrorPhysics';

export default function ConcaveMirrorLabPage() {
  const [focalLength, setFocalLength] = useState<number>(15);
  const [mirrorPos, setMirrorPos] = useState<number>(80);
  const [objectPos, setObjectPos] = useState<number>(50); // u = 30 cm (at C!)
  const [screenPos, setScreenPos] = useState<number>(50); // v = 30 cm
  const [objectHeight, setObjectHeight] = useState<number>(5);
  const [showRays, setShowRays] = useState<boolean>(true);
  const [showSignHelp, setShowSignHelp] = useState<boolean>(false);

  // Physics calculation
  const u = Math.max(0.1, mirrorPos - objectPos);
  const screenDist = Math.max(0, mirrorPos - screenPos);

  const state: MirrorSystemState = {
    focalLength,
    objectDistance: u,
    objectHeight,
    screenDistance: screenDist,
    mirrorPosition: mirrorPos,
  };
  const calc = calculateMirrorOptics(state);
  const canonical = getMirrorCanonicalCase(u, focalLength);

  // Canonical Case Presets
  const applyPreset = (presetCase: number) => {
    const f = focalLength;
    const mPos = 80;
    setMirrorPos(mPos);

    if (presetCase === 1) {
      // Infinity
      setObjectPos(10);
      setScreenPos(mPos - f);
    } else if (presetCase === 2) {
      // Beyond C (u = 40 cm, 2f = 30 cm)
      setObjectPos(mPos - 40);
      setScreenPos(mPos - 24);
    } else if (presetCase === 3) {
      // At C (u = 30 cm)
      setObjectPos(mPos - 30);
      setScreenPos(mPos - 30);
    } else if (presetCase === 4) {
      // Between C and F (u = 20 cm)
      setObjectPos(mPos - 20);
      setScreenPos(mPos - 60);
    } else if (presetCase === 5) {
      // At F (u = 15 cm)
      setObjectPos(mPos - 15);
      setScreenPos(10);
    } else if (presetCase === 6) {
      // Between P and F (u = 10 cm, virtual)
      setObjectPos(mPos - 10);
      setScreenPos(60);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden">
      {/* Top Breadcrumb & Status Header */}
      <div className="border-b border-[#E2E8DF] bg-[#FFFFFF]/90 backdrop-blur-md px-4 sm:px-6 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/physics"
              className="p-1.5 rounded-lg bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] transition-colors flex items-center gap-1.5 font-semibold border border-[#E2E8DF]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Physics Hub</span>
            </Link>
            <span className="text-[#647067]">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17231B] text-sm">Concave Mirror Laboratory</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50 font-mono uppercase font-bold">
                NCERT Chapter 10 • Experiment 2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/report?exp=concave-mirror"
              className="px-3 py-1 rounded-lg bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold border border-[#B8D96B] flex items-center gap-1 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Report</span>
            </Link>
            <Link
              href="/lab"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Switch: Convex Lens</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* =========================================
            LEFT COLUMN: PRESETS & STEPS
           ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* NCERT Canonical Case Presets */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
                <span>NCERT 6 Canonical Cases</span>
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono font-bold bg-[#B8D96B]/30 px-1.5 py-0.5 rounded">f = {focalLength} cm</span>
            </div>

            <div className="space-y-1.5">
              {[
                { caseNum: 1, label: 'Case 1: At Infinity', sub: 'u >> 2F ➔ Image at Focus F (Point)', uVal: '> 60 cm' },
                { caseNum: 2, label: 'Case 2: Beyond C', sub: 'u = 40 cm ➔ Between C and F (Diminished)', uVal: '40 cm' },
                { caseNum: 3, label: 'Case 3: At C (Center)', sub: 'u = 30 cm ➔ Same Size at C (m = -1.0)', uVal: '30 cm' },
                { caseNum: 4, label: 'Case 4: Between C & F', sub: 'u = 20 cm ➔ Beyond C (Magnified)', uVal: '20 cm' },
                { caseNum: 5, label: 'Case 5: At Focus F', sub: 'u = 15 cm ➔ Image at Infinity (Headlight)', uVal: '15 cm' },
                { caseNum: 6, label: 'Case 6: Between P & F', sub: 'u = 10 cm ➔ Virtual Behind Mirror', uVal: '10 cm' },
              ].map((p) => (
                <button
                  key={p.caseNum}
                  onClick={() => applyPreset(p.caseNum)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-0.5 group cursor-pointer ${
                    canonical.caseNumber === p.caseNum
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold'
                      : 'bg-[#F4F7F2] hover:bg-[#FFFFFF] border-[#E2E8DF] text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17231B]">{p.label}</span>
                    <span className="text-[10px] font-mono text-[#647067] font-semibold">{p.uVal}</span>
                  </div>
                  <span className="text-[10px] text-[#647067] line-clamp-1">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Focal Length Selector */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
              Mirror Focal Length (|f|)
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 15, 20, 25].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFocalLength(fl)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    focalLength === fl
                      ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                  }`}
                >
                  {fl} cm
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#647067] italic">
              Center of Curvature: C = 2f = {2 * focalLength} cm
            </p>
          </div>
        </aside>

        {/* =========================================
            CENTER: 3D INTERACTIVE APPARATUS
           ========================================= */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <ConcaveMirrorBench3D
            focalLength={focalLength}
            objectPos={objectPos}
            mirrorPos={mirrorPos}
            screenPos={screenPos}
            objectHeight={objectHeight}
            onObjectPosChange={setObjectPos}
            onMirrorPosChange={setMirrorPos}
            onScreenPosChange={setScreenPos}
            showRays={showRays}
            className="flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-[#E2E8DF] shadow-xs"
          />

          {/* Sliders Controller Bar */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Object Position Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17231B]" />
                    <span>Object Position (xₒ)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">{objectPos.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="75"
                  step="0.5"
                  value={objectPos}
                  onChange={(e) => setObjectPos(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>5 cm</span>
                  <span>u = {u.toFixed(1)} cm</span>
                  <span>75 cm</span>
                </div>
              </div>

              {/* Mirror Position Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B]" />
                    <span>Mirror Position (xₘ)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">{mirrorPos.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="0.5"
                  value={mirrorPos}
                  onChange={(e) => setMirrorPos(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>50 cm</span>
                  <span>Pole P at origin</span>
                  <span>95 cm</span>
                </div>
              </div>

              {/* Screen Position Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#647067]" />
                    <span>Screen Position (xₛ)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">{screenPos.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="0.5"
                  value={screenPos}
                  onChange={(e) => setScreenPos(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>10 cm</span>
                  <span>Screen dist: {screenDist.toFixed(1)} cm</span>
                  <span>80 cm</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* =========================================
            RIGHT COLUMN: LIVE READOUTS & FORMULAS
           ========================================= */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 Mirror Readouts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                1/v + 1/u = 1/f
              </span>
            </div>

            {/* Canonical Case Live Badge */}
            <div className="p-3.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#17231B] font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                  <span>{canonical.caseBadge}</span>
                </span>
                <span className="text-[10px] text-[#17231B] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF]">
                  {canonical.sizeText}
                </span>
              </div>
              <p className="text-xs font-bold text-[#17231B] leading-snug">
                {canonical.name} ➔ {canonical.imagePositionText}
              </p>
              <div className="pt-1 border-t border-[#E2E8DF] flex flex-col gap-0.5">
                <p className="text-[11px] text-[#647067] font-medium flex items-center gap-1">
                  <span>💡 Application:</span>
                  <span className="text-[#17231B] font-semibold">{canonical.metaphor}</span>
                </p>
                <p className="text-[10px] text-[#647067] italic">
                  Board Note: {canonical.boardNote}
                </p>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Object Dist (u)</span>
                <span className="text-base font-bold text-[#17231B]">{u.toFixed(1)} cm</span>
                <span className="text-[10px] text-[#647067] block">Sign: -{u.toFixed(1)} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Image Dist (v)</span>
                <span className="text-base font-bold text-[#17231B]">
                  {isFinite(calc.imageDistance) ? `${calc.imageDistance.toFixed(1)} cm` : '∞'}
                </span>
                <span className="text-[10px] text-[#647067] block">
                  Sign: {calc.cartesianV < 0 ? `${calc.cartesianV.toFixed(1)} (Real)` : `+${calc.cartesianV.toFixed(1)} (Virt)`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Focal Length (f)</span>
                <span className="text-base font-bold text-[#17231B]">-{focalLength.toFixed(1)} cm</span>
                <span className="text-[10px] text-[#647067] block">C = 2f = -{2 * focalLength} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Magnification (m)</span>
                <span className="text-base font-bold text-[#17231B]">
                  {isFinite(calc.magnification) ? calc.magnification.toFixed(2) : '∞'}
                </span>
                <span className="text-[10px] text-[#647067] block">
                  {calc.magnification < 0 ? 'Inverted' : 'Erect'}
                </span>
              </div>
            </div>

            {/* Cartesian Sign Convention Box */}
            <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#647067] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#17231B]" />
                  <span>Cartesian Mirror Formula</span>
                </span>
                <button
                  onClick={() => setShowSignHelp(!showSignHelp)}
                  className="text-[10px] text-[#17231B] font-bold hover:underline cursor-pointer"
                >
                  {showSignHelp ? 'Hide' : 'Explain'}
                </button>
              </div>

              <div className="font-mono text-center p-2 rounded bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] font-bold">
                1/v + 1/u = 1/f
              </div>

              {showSignHelp && (
                <div className="text-[11px] text-[#647067] space-y-1 leading-relaxed border-t border-[#E2E8DF] pt-2 animate-in fade-in">
                  <p>
                    • <strong className="text-[#17231B]">f is Negative (-{focalLength} cm):</strong> The focus F lies in front of the concave mirror.
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">u is Negative (-{u.toFixed(1)} cm):</strong> The illuminated arrow object is placed in front of mirror.
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">v = {calc.cartesianV < 0 ? `${calc.cartesianV.toFixed(1)} cm (Real, in front)` : `+${calc.cartesianV.toFixed(1)} cm (Virtual, behind)`}</strong>
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">m = -v/u = {calc.magnification.toFixed(2)}</strong> (Negative sign means inverted image).
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
