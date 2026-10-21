'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  RotateCcw,
  Sliders,
  Crosshair,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  TableProperties,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { OpticalBench3D } from '@/components/OpticalBench3D';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
import { calculateOptics, LAB_PRESETS, LensSystemState } from '@/lib/physics';
import { addObservation, getSavedObservations } from '@/lib/storage';

export default function LabPage() {
  // Optical bench positions (in cm along 100 cm rail)
  const [focalLength, setFocalLength] = useState<number>(15);
  const [lensPos, setLensPos] = useState<number>(50);
  const [objectPos, setObjectPos] = useState<number>(20); // u = 50 - 20 = 30 cm (2f)
  const [screenPos, setScreenPos] = useState<number>(80); // v = 80 - 50 = 30 cm
  const [objectHeight, setObjectHeight] = useState<number>(5);

  const [recordedToast, setRecordedToast] = useState<string | null>(null);
  const [observationCount, setObservationCount] = useState<number>(0);
  const [showRayDiagramDrawer, setShowRayDiagramDrawer] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Sync saved observation count
  useEffect(() => {
    setObservationCount(getSavedObservations().length);
  }, []);

  // Compute live physics
  const u = Math.max(0.1, lensPos - objectPos);
  const screenDist = Math.max(0, screenPos - lensPos);
  const state: LensSystemState = {
    focalLength,
    objectDistance: u,
    objectHeight,
    screenDistance: screenDist,
    lensPosition: lensPos,
  };
  const calc = calculateOptics(state);

  // Apply a curriculum preset
  const applyPreset = (presetId: string) => {
    const preset = LAB_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setFocalLength(preset.focalLength);
    const newLens = 50;
    const newObj = Math.max(0, newLens - preset.objectDistance);
    setLensPos(newLens);
    setObjectPos(newObj);
    setObjectHeight(preset.objectHeight);

    // Position screen at or near theoretical v if real
    if (preset.expectedV > 0 && isFinite(preset.expectedV)) {
      setScreenPos(Math.min(100, newLens + preset.expectedV));
    } else {
      setScreenPos(90);
    }
  };

  // Record observation into lab notebook
  const handleRecordObservation = () => {
    const newObs = addObservation({
      objectPos,
      lensPos,
      screenPos,
      u: Number(u.toFixed(2)),
      v: Number(screenDist.toFixed(2)),
      fCalculated: Number(((u * screenDist) / (u + screenDist)).toFixed(2)),
      ho: objectHeight,
      hi: calc.imageHeight,
      magnification: calc.magnification,
      imageNature: calc.imageDescription,
      isFocused: !!calc.isFocused,
      notes: calc.isFocused
        ? 'Sharp focused image recorded'
        : `Recorded with blur (${calc.screenFocusMatchPercent || 0}% match)`,
    });

    setObservationCount((prev) => prev + 1);
    setRecordedToast(`Observation #${newObs.serialNumber} recorded to notebook!`);
    setTimeout(() => setRecordedToast(null), 3500);
  };

  // Reset to default standard state (u = 2f)
  const handleResetBench = () => {
    setFocalLength(15);
    setLensPos(50);
    setObjectPos(20);
    setScreenPos(80);
    setObjectHeight(5);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 overflow-hidden">
      {/* Toast Notification */}
      {recordedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{recordedToast}</span>
          <Link
            href="/observations"
            className="text-[11px] underline font-bold text-white ml-2 hover:text-emerald-300"
          >
            View Table
          </Link>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* =========================================
            LEFT COLUMN: STEPS & PRESETS
           ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Experiment Steps Card */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                <span>Experiment Steps</span>
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">Step {activeStep} of 4</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { step: 1, title: 'Mount & Zero Align', desc: 'Fix convex lens at 50 cm mark on the bench.' },
                { step: 2, title: 'Position Object', desc: 'Place candle/arrow beyond 2F (e.g. u = 35-45 cm).' },
                { step: 3, title: 'Focus Screen', desc: 'Move screen back & forth until image is sharp.' },
                { step: 4, title: 'Record Data', desc: 'Log u, v and calculate f = uv/(u+v).' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    activeStep === s.step
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                      : 'bg-[#0f172a] border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        activeStep === s.step ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-6">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Presets Selector */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard Lab Presets</span>
            </h3>

            <div className="space-y-1.5">
              {LAB_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#142036] border border-slate-800 hover:border-cyan-500/40 text-xs transition-all flex flex-col gap-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300">{p.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{p.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{p.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lens Selection */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Lens Focal Length (f)
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 15, 20, 25].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFocalLength(fl)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                    focalLength === fl
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  +{fl}cm
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* =========================================
            CENTER COLUMN: 3D OPTICAL BENCH VIEWPORT
           ========================================= */}
        <main className="flex-1 flex flex-col gap-4">
          <OpticalBench3D
            focalLength={focalLength}
            objectPos={objectPos}
            lensPos={lensPos}
            screenPos={screenPos}
            objectHeight={objectHeight}
            onObjectPosChange={setObjectPos}
            onLensPosChange={setLensPos}
            onScreenPosChange={setScreenPos}
            className="flex-1 min-h-[460px]"
          />

          {/* Bottom Drawer: Live 2D Ray Diagram & Quick Observation Counter */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live 2D Ray Diagram & Focus Analysis
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRayDiagramDrawer(!showRayDiagramDrawer)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>{showRayDiagramDrawer ? 'Hide Diagram' : 'Show Diagram'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRayDiagramDrawer ? 'rotate-180' : ''}`} />
                </button>

                <Link
                  href="/observations"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>Notebook ({observationCount})</span>
                </Link>
              </div>
            </div>

            {showRayDiagramDrawer && (
              <RayDiagramSvg
                state={state}
                height={220}
              />
            )}
          </div>
        </main>

        {/* =========================================
            RIGHT COLUMN: CONTROLS & LIVE MEASUREMENTS
           ========================================= */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          {/* Live Physics Measurement Panel */}
          <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-900/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Optical Readouts</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">REAL-TIME</span>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Object Dist (u)</span>
                <span className="text-base font-bold text-amber-300">{u.toFixed(1)} cm</span>
                <span className="text-[10px] text-slate-500 block">Sign: -{u.toFixed(1)} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Image Dist (v)</span>
                <span className="text-base font-bold text-emerald-300">
                  {isFinite(calc.imageDistance) ? `${calc.imageDistance.toFixed(1)} cm` : '∞'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Sign: {calc.cartesianV > 0 ? `+${calc.cartesianV.toFixed(1)}` : `${calc.cartesianV.toFixed(1)}`} cm
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Focal Length (f)</span>
                <span className="text-base font-bold text-cyan-300">+{focalLength.toFixed(1)} cm</span>
                <span className="text-[10px] text-slate-500 block">Convex (+ve)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px]">Magnification (m)</span>
                <span className="text-base font-bold text-purple-300">
                  {isFinite(calc.magnification) ? calc.magnification.toFixed(2) : '∞'}
                </span>
                <span className="text-[10px] text-slate-500 block">hᵢ = {calc.imageHeight.toFixed(1)} cm</span>
              </div>
            </div>

            {/* Image Nature Tag */}
            <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Image Description</span>
              <p className="font-semibold text-slate-200">{calc.imageDescription}</p>
            </div>

            {/* Screen Sharpness Meter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Screen Sharpness</span>
                <span
                  className={`font-mono font-bold ${
                    calc.isFocused ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {calc.screenFocusMatchPercent || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    calc.isFocused ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400'
                  }`}
                  style={{ width: `${calc.screenFocusMatchPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Record Observation Button */}
            <button
              onClick={handleRecordObservation}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(52,211,153,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Record to Lab Notebook</span>
            </button>
          </div>

          {/* Bench Slider Sliders */}
          <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upright Bench Controls</span>
              </h3>
              <button
                onClick={handleResetBench}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Reset bench positions"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Object Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Object Position (xₒ)</span>
                </span>
                <span className="font-mono text-amber-300 font-bold">{objectPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min="0"
                max={lensPos - 5}
                step="0.5"
                value={objectPos}
                onChange={(e) => setObjectPos(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Lens Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Lens Position (xₗ)</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">{lensPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={objectPos + 5}
                max={screenPos - 5}
                step="0.5"
                value={lensPos}
                onChange={(e) => setLensPos(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Screen Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>Screen Position (xₛ)</span>
                </span>
                <span className="font-mono text-white font-bold">{screenPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={lensPos + 5}
                max="100"
                step="0.5"
                value={screenPos}
                onChange={(e) => setScreenPos(Number(e.target.value))}
                className="w-full accent-slate-200 cursor-pointer"
              />
            </div>

            {/* Object Height */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Object Height (hₒ)</span>
                <span className="font-mono text-amber-300 font-bold">{objectHeight} cm</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={objectHeight}
                onChange={(e) => setObjectHeight(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
