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
import {
  calculateOptics,
  LAB_PRESETS,
  LensSystemState,
  getCanonicalCase,
  calculateLensPower,
  getCartesianSignBreakdown,
} from '@/lib/physics';
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

  const [showSignHelp, setShowSignHelp] = useState<boolean>(false);

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
  const canonical = getCanonicalCase(u, focalLength);
  const power = calculateLensPower(focalLength);
  const signBreakdown = getCartesianSignBreakdown(u, calc.cartesianV, focalLength);

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
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden">
      {/* Toast Notification */}
      {recordedToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#17231B] border border-[#B8D96B] text-[#FFFFFF] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#B8D96B]" />
          <span className="text-xs font-bold">{recordedToast}</span>
          <Link
            href="/observations"
            className="text-[11px] underline font-bold text-[#B8D96B] ml-2 hover:text-[#FFFFFF]"
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
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Experiment Steps</span>
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono bg-[#B8D96B]/30 px-2 py-0.5 rounded-full font-bold">
                Step {activeStep} of 4
              </span>
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
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B]'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:text-[#17231B] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        activeStep === s.step ? 'bg-[#17231B] text-[#FFFFFF]' : 'bg-[#E2E8DF] text-[#647067]'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span>{s.title}</span>
                  </div>
                  <p className="text-[11px] text-[#647067] mt-1 pl-6">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Presets Selector */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Standard Lab Presets</span>
            </h3>

            <div className="space-y-1.5">
              {LAB_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#F4F7F2] hover:bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] text-xs transition-all flex flex-col gap-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17231B] group-hover:text-[#17231B]">{p.label}</span>
                    <span className="text-[10px] font-mono text-[#647067] font-semibold">{p.category}</span>
                  </div>
                  <span className="text-[10px] text-[#647067] line-clamp-1">{p.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lens Selection */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
              Lens Focal Length (f)
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 15, 20, 25].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFocalLength(fl)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                    focalLength === fl
                      ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
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
            className="flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-[#E2E8DF] shadow-xs"
          />

          {/* Bottom Drawer: Live 2D Ray Diagram & Quick Observation Counter */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Live 2D Ray Diagram & Focus Analysis
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRayDiagramDrawer(!showRayDiagramDrawer)}
                  className="text-xs text-[#647067] hover:text-[#17231B] flex items-center gap-1 font-semibold"
                >
                  <span>{showRayDiagramDrawer ? 'Hide Diagram' : 'Show Diagram'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRayDiagramDrawer ? 'rotate-180' : ''}`} />
                </button>

                <Link
                  href="/observations"
                  className="px-3 py-1 rounded-lg bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold flex items-center gap-1.5 border border-[#E2E8DF]"
                >
                  <TableProperties className="w-3.5 h-3.5 text-[#17231B]" />
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
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 Board Optical Readouts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                NCERT CH. 10
              </span>
            </div>

            {/* CLASS 10 CANONICAL CASE LIVE BADGE */}
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
                  <span>💡 Metaphor:</span>
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
                  Sign: {calc.cartesianV > 0 ? `+${calc.cartesianV.toFixed(1)}` : `${calc.cartesianV.toFixed(1)}`} cm
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#647067] block text-[10px] font-sans font-semibold">Focal (f)</span>
                  <span className="text-[9px] text-[#17231B] font-bold bg-[#B8D96B]/30 px-1 rounded">
                    {power.formatted}
                  </span>
                </div>
                <span className="text-base font-bold text-[#17231B]">+{focalLength.toFixed(1)} cm</span>
                <span className="text-[10px] text-[#647067] block">Power P = {power.formatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Magnification (m)</span>
                <span className="text-base font-bold text-[#17231B]">
                  {isFinite(calc.magnification) ? calc.magnification.toFixed(2) : '∞'}
                </span>
                <span className="text-[10px] text-[#647067] block">hᵢ = {calc.imageHeight.toFixed(1)} cm</span>
              </div>
            </div>

            {/* Cartesian Sign Convention Box */}
            <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#647067] text-[10px] uppercase font-bold flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#17231B]" />
                  <span>Cartesian Sign Formula</span>
                </span>
                <button
                  onClick={() => setShowSignHelp(!showSignHelp)}
                  className="text-[10px] text-[#17231B] font-bold hover:underline"
                >
                  {showSignHelp ? 'Hide' : 'Explain'}
                </button>
              </div>

              <div className="p-2 rounded bg-[#FFFFFF] font-mono text-[11px] text-[#17231B] font-bold border border-[#E2E8DF]">
                1/f = 1/v - 1/u ➔ 1/{focalLength} = 1/{isFinite(calc.imageDistance) ? (calc.cartesianV > 0 ? `+${calc.cartesianV.toFixed(1)}` : `${calc.cartesianV.toFixed(1)}`) : '∞'} - 1/(-{u.toFixed(1)})
              </div>

              {showSignHelp && (
                <div className="space-y-1 text-[11px] text-[#647067] pt-1 border-t border-[#E2E8DF]">
                  <p>• <strong className="text-[#17231B]">u = -{u.toFixed(1)} cm</strong>: Object is to the left of optical centre (against incident light).</p>
                  <p>• <strong className="text-[#17231B]">f = +{focalLength} cm</strong>: Real focus of convex lens lies behind the lens.</p>
                  <p>• <strong className="text-[#17231B]">v = {calc.cartesianV > 0 ? `+${calc.cartesianV.toFixed(1)}` : `${calc.cartesianV.toFixed(1)}`} cm</strong>: {calc.isReal ? 'Real inverted image formed on screen' : 'Virtual erect image on same side'}.</p>
                </div>
              )}
            </div>

            {/* Screen Sharpness Meter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#647067] font-semibold">Screen Sharpness</span>
                <span className="font-mono font-bold text-[#17231B]">
                  {calc.screenFocusMatchPercent || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E2E8DF] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    calc.isFocused ? 'bg-[#B8D96B]' : 'bg-[#17231B]'
                  }`}
                  style={{ width: `${calc.screenFocusMatchPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Record Observation Button */}
            <button
              onClick={handleRecordObservation}
              className="w-full py-3 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#17231B]" />
              <span>Record to Lab Notebook</span>
            </button>
          </div>

          {/* Bench Slider Sliders */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <h3 className="font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Upright Bench Controls</span>
              </h3>
              <button
                onClick={handleResetBench}
                className="text-[11px] text-[#647067] hover:text-[#17231B] flex items-center gap-1 font-semibold"
                title="Reset bench positions"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Object Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#17231B]" />
                  <span>Object Position (xₒ)</span>
                </span>
                <span className="font-mono text-[#17231B] font-bold">{objectPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min="0"
                max={lensPos - 5}
                step="0.5"
                value={objectPos}
                onChange={(e) => setObjectPos(Number(e.target.value))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Lens Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B]" />
                  <span>Lens Position (xₗ)</span>
                </span>
                <span className="font-mono text-[#17231B] font-bold">{lensPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={objectPos + 5}
                max={screenPos - 5}
                step="0.5"
                value={lensPos}
                onChange={(e) => setLensPos(Number(e.target.value))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Screen Position Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#647067]" />
                  <span>Screen Position (xₛ)</span>
                </span>
                <span className="font-mono text-[#17231B] font-bold">{screenPos.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min={lensPos + 5}
                max="100"
                step="0.5"
                value={screenPos}
                onChange={(e) => setScreenPos(Number(e.target.value))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Object Height */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8DF]">
              <div className="flex justify-between items-center">
                <span className="text-[#647067] font-semibold">Object Height (hₒ)</span>
                <span className="font-mono text-[#17231B] font-bold">{objectHeight} cm</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={objectHeight}
                onChange={(e) => setObjectHeight(Number(e.target.value))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
