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
import { GlassSlab3D } from '@/components/GlassSlab3D';
import { LabSimAssistant } from '@/components/LabSimAssistant';
import { calculateGlassSlab, GLASS_TYPES } from '@/lib/glassSlabPhysics';

export default function GlassSlabLabPage() {
  const [angleIncidence, setAngleIncidence] = useState<number>(45); // 45 degrees default
  const [slabThickness, setSlabThickness] = useState<number>(6.0); // 6 cm
  const [refractiveIndex, setRefractiveIndex] = useState<number>(1.52); // Crown glass
  const [showNormals, setShowNormals] = useState<boolean>(true);
  const [showDottedOriginal, setShowDottedOriginal] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [showSnellHelp, setShowSnellHelp] = useState<boolean>(false);

  const calc = calculateGlassSlab({
    angleIncidenceDeg: angleIncidence,
    slabThicknessCm: slabThickness,
    refractiveIndex,
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
              <span className="font-bold text-[#17231B] text-sm">Rectangular Glass Slab Refraction</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50 font-mono uppercase font-bold">
                NCERT Chapter 10 • Experiment 3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ar?exp=glass-slab"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-1.5 shadow-xs"
              title="Launch Tabletop Augmented Reality"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Tabletop AR</span>
            </Link>
            <Link
              href="/report?exp=glass-slab"
              className="px-3 py-1 rounded-lg bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold border border-[#B8D96B] flex items-center gap-1 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Report</span>
            </Link>
            <Link
              href="/physics/concave-mirror"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Prev: Concave Mirror</span>
            </Link>
            <Link
              href="/lab"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Next: Convex Lens</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* =========================================
            LEFT COLUMN: PRESETS & REAGENTS/GLASS
           ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Standard Board Exam Angles */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
                <span>CBSE Benchmark Angles</span>
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono font-bold bg-[#B8D96B]/30 px-1.5 py-0.5 rounded">∠i Presets</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((deg) => (
                <button
                  key={deg}
                  onClick={() => setAngleIncidence(deg)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    angleIncidence === deg
                      ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                  }`}
                >
                  i = {deg}°
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#647067] italic">
              NCERT Activity 10.10: Record ∠i, ∠r, ∠e for 30°, 45°, and 60°.
            </p>
          </div>

          {/* Optical Medium Selection */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
              Optical Medium (Refractive Index n)
            </h3>
            <div className="space-y-1.5">
              {GLASS_TYPES.map((glass) => (
                <button
                  key={glass.id}
                  onClick={() => setRefractiveIndex(glass.n)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                    refractiveIndex === glass.n
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold'
                      : 'bg-[#F4F7F2] hover:bg-[#FFFFFF] border-[#E2E8DF] text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17231B]">{glass.name}</span>
                    <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF]">n = {glass.n}</span>
                  </div>
                  <span className="text-[10px] text-[#647067] line-clamp-1">{glass.description}</span>
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
              <span className="text-[#17231B] font-medium">Normal Lines (N₁N₂)</span>
              <input
                type="checkbox"
                checked={showNormals}
                onChange={(e) => setShowNormals(e.target.checked)}
                className="accent-[#B8D96B]"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] cursor-pointer">
              <span className="text-[#17231B] font-medium">Original Ray & Lateral Shift (d)</span>
              <input
                type="checkbox"
                checked={showDottedOriginal}
                onChange={(e) => setShowDottedOriginal(e.target.checked)}
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
            CENTER: 3D SLAB & DRAWING SHEET
           ========================================= */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <GlassSlab3D
            angleIncidence={angleIncidence}
            slabThickness={slabThickness}
            refractiveIndex={refractiveIndex}
            showNormals={showNormals}
            showDottedOriginal={showDottedOriginal}
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
                  min="0"
                  max="75"
                  step="1"
                  value={angleIncidence}
                  onChange={(e) => setAngleIncidence(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>0° (Normal)</span>
                  <span>Board angles: 30° - 60°</span>
                  <span>75°</span>
                </div>
              </div>

              {/* Slab Thickness Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B]" />
                    <span>Slab Thickness (t)</span>
                  </span>
                  <span className="font-mono text-[#17231B] font-bold">{slabThickness.toFixed(1)} cm</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={slabThickness}
                  onChange={(e) => setSlabThickness(parseFloat(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>3.0 cm</span>
                  <span>d increases with thickness t</span>
                  <span>10.0 cm</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* =========================================
            RIGHT COLUMN: SNELL'S LAW & DATA READOUTS
           ========================================= */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 Snell’s Law Readouts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                n = sin i / sin r
              </span>
            </div>

            {/* Parallel Emergence Live Badge */}
            <div className="p-3.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#17231B] font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                  <span>∠i = ∠e Verified</span>
                </span>
                <span className="text-[10px] text-[#17231B] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF]">
                  Parallel Rays
                </span>
              </div>
              <p className="text-xs font-bold text-[#17231B] leading-snug">
                Incident Ray || Emergent Ray (No angular deviation)
              </p>
              <div className="pt-1 border-t border-[#E2E8DF] flex flex-col gap-0.5">
                <p className="text-[11px] text-[#647067] font-medium">
                  Lateral Shift: <strong className="text-[#17231B]">{calc.lateralDisplacementCm.toFixed(2)} cm</strong>
                </p>
                <p className="text-[10px] text-[#647067] italic">
                  Speed in glass: {(calc.speedOfLightInGlass / 1e8).toFixed(2)} × 10⁸ m/s
                </p>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Incidence (∠i)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleIncidenceDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">sin(i) = {Math.sin(calc.angleIncidenceRad).toFixed(3)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Refraction (∠r)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleRefractionDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">sin(r) = {Math.sin(calc.angleRefractionRad).toFixed(3)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Emergence (∠e)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.angleEmergenceDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-[#647067] block">∠e = ∠i = {calc.angleEmergenceDeg.toFixed(1)}°</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Displacement (d)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.lateralDisplacementCm.toFixed(2)} cm</span>
                <span className="text-[10px] text-[#647067] block">t = {slabThickness.toFixed(1)} cm</span>
              </div>
            </div>

            {/* Snell's Law Verification Box */}
            <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#647067] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#17231B]" />
                  <span>Snell’s Law Verification</span>
                </span>
                <button
                  onClick={() => setShowSnellHelp(!showSnellHelp)}
                  className="text-[10px] text-[#17231B] font-bold hover:underline cursor-pointer"
                >
                  {showSnellHelp ? 'Hide' : 'Explain'}
                </button>
              </div>

              <div className="font-mono text-center p-2 rounded bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] font-bold">
                sin(i) / sin(r) = {calc.snellVerificationRatio.toFixed(2)} = n
              </div>

              {showSnellHelp && (
                <div className="text-[11px] text-[#647067] space-y-1 leading-relaxed border-t border-[#E2E8DF] pt-2 animate-in fade-in">
                  <p>
                    • <strong className="text-[#17231B]">Snell’s First Law:</strong> The incident ray, refracted ray, and normal at the point of incidence all lie in the same plane (the drawing sheet).
                  </p>
                  <p>
                    • <strong className="text-[#17231B]">Snell’s Second Law:</strong> The ratio of sine of angle of incidence to sine of angle of refraction is constant for a given pair of media:
                    <br />
                    <code>sin({calc.angleIncidenceDeg.toFixed(1)}°) / sin({calc.angleRefractionDeg.toFixed(1)}°) = {Math.sin(calc.angleIncidenceRad).toFixed(3)} / {Math.sin(calc.angleRefractionRad).toFixed(3)} = {calc.snellVerificationRatio.toFixed(2)}</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Labby AI Science Tutor */}
      <LabSimAssistant experimentId="glass-slab" />
    </div>
  );
}
