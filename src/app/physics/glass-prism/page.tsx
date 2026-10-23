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
import { GlassPrism3D } from '@/components/GlassPrism3D';
import { LabSimAssistant } from '@/components/LabSimAssistant';
import {
  calculateGlassPrism,
  VIBGYOR_SPECTRUM,
} from '@/lib/prismPhysics';

export default function GlassPrismLabPage() {
  const [angleIncidence, setAngleIncidence] = useState<number>(48.6); // Minimum deviation default
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.52); // Crown glass
  const [mode, setMode] = useState<'monochromatic' | 'dispersion'>('monochromatic');
  const [showDeviationAngle, setShowDeviationAngle] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [showPrismHelp, setShowPrismHelp] = useState<boolean>(false);

  const calc = calculateGlassPrism({
    angleIncidenceDeg: angleIncidence,
    refractiveIndex,
    mode,
  });

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden">
      {/* Top Header */}
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
              <span className="font-bold text-[#17231B] text-sm">Glass Prism: Refraction & Dispersion</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50 font-mono uppercase font-bold">
                NCERT Chapter 11 • Experiment 4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ar?exp=glass-prism"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-1.5 shadow-xs"
              title="Launch Tabletop Augmented Reality"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Tabletop AR</span>
            </Link>
            <Link
              href="/report?exp=glass-prism"
              className="px-3 py-1 rounded-lg bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold border border-[#B8D96B] flex items-center gap-1 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Report</span>
            </Link>
            <Link
              href="/physics/glass-slab"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Prev: Glass Slab</span>
            </Link>
            <Link
              href="/physics/ohms-law"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Next: Ohm’s Law</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* =========================================
            LEFT COLUMN: MODE & PRESETS
           ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Mode Switcher */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Experiment Mode</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setMode('monochromatic')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'monochromatic'
                    ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                    : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                }`}
              >
                Monochromatic (i-D)
              </button>
              <button
                onClick={() => setMode('dispersion')}
                className={`py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'dispersion'
                    ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                    : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                }`}
              >
                VIBGYOR Rainbow
              </button>
            </div>
            <p className="text-[11px] text-[#647067] italic">
              {mode === 'monochromatic'
                ? 'Trace single ray and measure Angle of Deviation ∠D.'
                : 'Demonstrate white light splitting into 7 rainbow colors.'}
            </p>
          </div>

          {/* NCERT Angle of Incidence Presets */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                i - D Curve Presets
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono font-bold bg-[#B8D96B]/30 px-1.5 py-0.5 rounded">∠i Points</span>
            </div>

            <div className="space-y-1.5">
              {[
                { deg: 35, note: 'High deviation (D ~ 41.5°)' },
                { deg: 40, note: 'Decreasing deviation (D ~ 38.6°)' },
                { deg: 48.6, note: '★ MINIMUM DEVIATION (Dm = 37.2°)', highlight: true },
                { deg: 55, note: 'Deviation increasing (D ~ 39.2°)' },
                { deg: 65, note: 'High deviation (D ~ 45.0°)' },
              ].map((p) => (
                <button
                  key={p.deg}
                  onClick={() => setAngleIncidence(p.deg)}
                  className={`w-full text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    Math.abs(angleIncidence - p.deg) < 0.5
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                  }`}
                >
                  <span className="font-mono">i = {p.deg}°</span>
                  <span className={`text-[10px] ${p.highlight ? 'text-[#17231B] font-bold' : 'text-[#647067]'}`}>
                    {p.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Apparatus Display Toggles */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2.5 text-xs">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
              Display Overlays
            </h3>
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] cursor-pointer">
              <span className="text-[#17231B] font-medium">Deviation Angle Extensions</span>
              <input
                type="checkbox"
                checked={showDeviationAngle}
                onChange={(e) => setShowDeviationAngle(e.target.checked)}
                className="accent-[#B8D96B]"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] cursor-pointer">
              <span className="text-[#17231B] font-medium">Optical Pins (P₁ to P₄)</span>
              <input
                type="checkbox"
                checked={showPins}
                onChange={(e) => setShowPins(e.target.checked)}
                className="accent-[#B8D96B]"
              />
            </label>
          </div>
        </aside>

        {/* =========================================
            CENTER: 3D PRISM & APPARATUS
           ========================================= */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <GlassPrism3D
            angleIncidence={angleIncidence}
            refractiveIndex={refractiveIndex}
            mode={mode}
            showDeviationAngle={showDeviationAngle}
            showPins={showPins}
            className="flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-[#E2E8DF] shadow-xs"
          />

          {/* Sliders Controller Bar */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Angle of Incidence Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17231B]" />
                    <span>Angle of Incidence (∠i)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">{angleIncidence.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="0.5"
                  value={angleIncidence}
                  onChange={(e) => setAngleIncidence(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>30°</span>
                  <span>Min Deviation at ~48.6°</span>
                  <span>70°</span>
                </div>
              </div>

              {/* Refractive Index Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B]" />
                    <span>Prism Refractive Index (n)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">n = {refractiveIndex.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.45"
                  max="1.70"
                  step="0.01"
                  value={refractiveIndex}
                  onChange={(e) => setRefractiveIndex(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>1.45 (Light glass)</span>
                  <span>1.52 (Crown Glass)</span>
                  <span>1.70 (Dense Flint)</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* =========================================
            RIGHT COLUMN: READOUTS & FORMULAS
           ========================================= */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 Prism Readouts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                A + D = i + e
              </span>
            </div>

            {/* Minimum Deviation Live Badge */}
            <div className="p-3.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#17231B] font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                  <span>{calc.isMinimumDeviation ? '★ Minimum Deviation' : 'Prism Refraction'}</span>
                </span>
                <span className="text-[10px] text-[#17231B] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF]">
                  Apex A = 60°
                </span>
              </div>
              <p className="text-xs font-bold text-[#17231B] leading-snug">
                Angle of Deviation ∠D = {calc.angleDeviationDeg.toFixed(1)}° (Dm = {calc.minimumDeviationDeg.toFixed(1)}°)
              </p>
              <div className="pt-1 border-t border-[#E2E8DF] flex flex-col gap-0.5">
                <p className="text-[11px] text-[#647067] font-medium">
                  {calc.isMinimumDeviation
                    ? '✓ Refracted ray inside is perfectly PARALLEL to the prism base!'
                    : `Deviation is ${(calc.angleDeviationDeg - calc.minimumDeviationDeg).toFixed(1)}° above minimum.`}
                </p>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Incidence (∠i)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleIncidenceDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">r₁ = {calc.r1Deg.toFixed(1)}°</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Emergence (∠e)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleEmergenceDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">r₂ = {calc.r2Deg.toFixed(1)}°</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Deviation (∠D)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleDeviationDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">Min Dm = {calc.minimumDeviationDeg.toFixed(1)}°</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">A + D Sum</span>
                <span className="text-base font-bold text-[#17231B]">{(60 + calc.angleDeviationDeg).toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">i + e = {(calc.angleIncidenceDeg + calc.angleEmergenceDeg).toFixed(1)}°</span>
              </div>
            </div>

            {/* Formula Explanation Box */}
            <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#647067] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#17231B]" />
                  <span>Prism Formula Verification</span>
                </span>
                <button
                  onClick={() => setShowPrismHelp(!showPrismHelp)}
                  className="text-[10px] text-[#17231B] font-bold hover:underline cursor-pointer"
                >
                  {showPrismHelp ? 'Hide' : 'Explain'}
                </button>
              </div>

              <div className="font-mono text-center p-2 rounded bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] font-bold">
                A + D = i + e ➔ 60° + {calc.angleDeviationDeg.toFixed(1)}° = {(60 + calc.angleDeviationDeg).toFixed(1)}°
              </div>

              {showPrismHelp && (
                <div className="text-[11px] text-[#647067] space-y-1 leading-relaxed border-t border-[#E2E8DF] pt-2 animate-in fade-in">
                  <p>
                    • <strong className="text-[#17231B]">Angle of Deviation (D):</strong> The angle between the incident ray produced forward and the emergent ray produced backward.
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">Minimum Deviation (Dm):</strong> As ∠i increases from 35°, ∠D first decreases, reaches a minimum Dm at i = e, and then increases.
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">Refractive Index:</strong> <code>n = sin((A + Dm)/2) / sin(A/2)</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Labby AI Science Tutor */}
      <LabSimAssistant experimentId="glass-prism" />
    </div>
  );
}
