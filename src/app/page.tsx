'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  BookOpen,
  Smartphone,
  TableProperties,
  Award,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Scan,
  Compass,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';

export default function HomePage() {
  // Mini interactive state on hero
  const [focalLength] = useState(15);
  const [objectDist, setObjectDist] = useState(30);

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 overflow-hidden">
      {/* =========================================
          HERO SECTION
         ========================================= */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-sky-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Virtual & WebXR Physics Laboratory</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Explore Convex Lenses in{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Augmented Reality
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Step onto a virtual optical bench to move real-time light sources, refract light through curved glass, observe sharp and blurred inverted images on screen, and perform authentic school physics practicals right in your browser or on your physical tabletop.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/lab"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 group"
            >
              <FlaskConical className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Start Experiment</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/learn"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#0e1628] hover:bg-[#152038] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 shadow-lg transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Explore the Theory</span>
            </Link>

            <Link
              href="/ar"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-[#0a0f1d] hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Launch AR Mode</span>
            </Link>
          </div>
        </div>

        {/* =========================================
            HERO VISUAL PREVIEW: INTERACTIVE RAY BENCH
           ========================================= */}
        <div className="mt-14 relative z-10 max-w-5xl mx-auto rounded-2xl bg-[#080d19]/90 border border-cyan-900/40 p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Ray-Tracing Optics Preview
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Drag Object Distance u:</span>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={objectDist}
                onChange={(e) => setObjectDist(Number(e.target.value))}
                className="w-36 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                u = {objectDist} cm
              </span>
            </div>
          </div>

          <RayDiagramSvg
            state={{
              focalLength,
              objectDistance: objectDist,
              objectHeight: 5,
            }}
            height={280}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Ray 1: Parallel → Focus F₂</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Ray 2: Undeviated through O</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Ray 3: F₁ → Parallel</span>
              </span>
            </div>
            <Link
              href="/lab"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Open in Full 3D Optical Bench</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          THREE FEATURE CARDS: LEARN, EXPERIMENT, MEASURE
         ========================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Designed for School Practical Curricula
          </h2>
          <p className="text-sm text-slate-400">
            A comprehensive pedagogical laboratory workflow covering theory, execution, measurement, and assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Learn */}
          <div className="rounded-2xl bg-[#090e1a] border border-slate-800/80 p-6 space-y-4 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Master the Theory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore the 6 fundamental cases of convex lenses, Snell&apos;s law of refraction, New Cartesian Sign Conventions, thin lens formulas, and linear magnification through animated 2D and 3D ray diagrams.
              </p>
            </div>
            <Link
              href="/learn"
              className="pt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 border-t border-slate-800"
            >
              <span>Read Theory Modules</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Experiment */}
          <div className="rounded-2xl bg-[#090e1a] border border-cyan-500/30 p-6 space-y-4 shadow-[0_0_25px_rgba(0,240,255,0.1)] flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase rounded-bl-xl border-l border-b border-cyan-500/30">
              Interactive 3D
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Conduct 3D & AR Practical</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Move illuminated cross-wires, brass-mounted convex lenses, and ground-glass screens along dual rails. Observe authentic focal blur, circle of confusion, and snap to razor-sharp focus.
              </p>
            </div>
            <Link
              href="/lab"
              className="pt-4 text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 border-t border-cyan-900/50"
            >
              <span>Launch Virtual Optical Bench</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Measure */}
          <div className="rounded-2xl bg-[#090e1a] border border-slate-800/80 p-6 space-y-4 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <TableProperties className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Record & Generate Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log real-time observations directly into your electronic lab notebook. Plot interactive v vs u hyperbola and 1/v vs 1/u linear graphs, compute percentage error, and print an academic practical sheet.
              </p>
            </div>
            <Link
              href="/observations"
              className="pt-4 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 border-t border-slate-800"
            >
              <span>View Observation Table</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          HOW AUGMENTED REALITY WORKS SECTION
         ========================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950 text-cyan-400 text-xs font-semibold border border-cyan-800">
              <Scan className="w-3.5 h-3.5" />
              <span>Markerless Surface Hit-Testing</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Bring the Physics Laboratory to Your Study Desk
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Traditional physics labs are often restricted by limited apparatus, fragile glassware, and crowded bench sharing. With WebXR technology, students can place a 1.0-meter precision optical bench directly on their classroom table.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Real-world Scale & Proportions</h4>
                  <p className="text-xs text-slate-400">Accurately calibrated 100 cm bench with authentic focal lengths (10 cm to 25 cm).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">360-Degree Ray Inspection</h4>
                  <p className="text-xs text-slate-400">Walk around the table to see how light rays converge to form a real inverted focal image.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Zero App Installation</h4>
                  <p className="text-xs text-slate-400">Runs directly inside modern mobile browsers (Android Chrome with ARCore) and WebXR viewers.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/ar"
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test AR Compatibility</span>
              </Link>
            </div>
          </div>

          {/* AR Diagnostic / Illustration Card */}
          <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-cyan-900/50 shadow-2xl space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Device Compatibility Diagnostic</span>
              <span className="text-[11px] text-cyan-400 font-mono">WebXR API v1</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Android Mobile (Chrome / Edge)</span>
                  <span className="text-slate-400 text-[11px]">Supports WebXR surface hit-testing with ARCore</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                  FULL AR SUPPORT
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Apple iOS (Safari)</span>
                  <span className="text-slate-400 text-[11px]">Live Camera fallback & WebXR Viewer App</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                  CAMERA AR / 3D
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Desktop & Laptop Browsers</span>
                  <span className="text-slate-400 text-[11px]">Hardware-accelerated 3D Virtual Optics Bench</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold text-[10px]">
                  3D STUDIO MODE
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] text-cyan-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <span>
                Transparent Educational Policy: If surface placement is unavailable on your device, the app seamlessly provides a full-featured 3D studio without any degraded physics.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          EXPERIMENT OVERVIEW & APPARATUS SUMMARY
         ========================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Practical Experiment Specification
          </h2>
          <p className="text-xs text-slate-400">
            CBSE / ICSE / IB Class 10 & 12 Physics Standard Practical Reference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Aim</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To find the focal length of a convex lens by obtaining the image of an illuminated object on a screen and plotting graphs between u and v, and between 1/u and 1/v.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Apparatus</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Optical bench with dual rails and 100 cm scale, three uprights with vernier clamps, double convex lens, illuminated wire mesh/candle object, and ground-glass screen.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Formula</h4>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              1/f = 1/v - 1/u<br />
              f = (u × v) / (u + v)<br />
              m = v / u = hᵢ / hₒ
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Sign Convention</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              New Cartesian: Object distance u is negative (-), Real image distance v is positive (+), Focal length f of convex lens is always positive (+).
            </p>
          </div>
        </div>

        {/* Quick jump banner */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-sky-950/30 to-[#080d19] border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Ready to begin the investigation?</h3>
            <p className="text-xs text-slate-300">
              Start by aligning the optical bench, setting the lens position at 50 cm, and focusing the screen.
            </p>
          </div>
          <Link
            href="/lab"
            className="px-6 py-3 rounded-xl font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all shrink-0"
          >
            <span>Open Virtual 3D Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
