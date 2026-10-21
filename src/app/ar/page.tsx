'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Scan,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Camera,
  Info,
} from 'lucide-react';
import { WebXROpticalBench } from '@/components/WebXROpticalBench';

export default function ARPage() {
  const [focalLength, setFocalLength] = useState<number>(15);
  const [lensPos, setLensPos] = useState<number>(50);
  const [objectPos, setObjectPos] = useState<number>(20);
  const [screenPos, setScreenPos] = useState<number>(80);

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebXR Immersive Augmented Reality Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Augmented Reality Optics Bench
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Project and anchor a full 1.0-meter physical optical bench onto your study desk or classroom floor using real-time plane detection and WebXR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
          >
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            <span>Switch to 3D Studio Lab</span>
          </Link>
        </div>
      </div>

      {/* AR Component & Viewport */}
      <WebXROpticalBench
        focalLength={focalLength}
        objectPos={objectPos}
        lensPos={lensPos}
        screenPos={screenPos}
        onObjectPosChange={setObjectPos}
        onLensPosChange={setLensPos}
        onScreenPosChange={setScreenPos}
      />

      {/* Quick Sliders for AR Uprights */}
      <div className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>AR Optical Bench Slider Adjustments</span>
          <span className="text-xs font-normal text-cyan-400 font-mono">Real-time sync</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Object Slider */}
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
              className="w-full accent-amber-400"
            />
            <span className="text-[11px] text-slate-500">u = {(lensPos - objectPos).toFixed(1)} cm</span>
          </div>

          {/* Lens Slider */}
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
              className="w-full accent-cyan-400"
            />
            <span className="text-[11px] text-slate-500">f = +{focalLength} cm</span>
          </div>

          {/* Screen Slider */}
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
              className="w-full accent-slate-200"
            />
            <span className="text-[11px] text-slate-500">v = {(screenPos - lensPos).toFixed(1)} cm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
