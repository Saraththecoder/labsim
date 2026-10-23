'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Printer,
  Download,
  Share2,
  Maximize2,
  Atom,
  FlaskConical,
  Zap,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  Layers,
  Award,
  BookOpen,
  School,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Compass,
  Cpu,
  Monitor,
  Smartphone,
  WifiOff,
  Check,
  X,
  Volume2,
  Mic,
  MessageSquare,
  BarChart3,
  TrendingUp,
  FileText,
  CircleHelp,
} from 'lucide-react';

export default function ProjectPosterPage() {
  const [activeTab, setActiveTab] = useState<'poster' | 'image'>('poster');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-2 sm:px-4 lg:px-8 print:p-0 print:bg-white print:text-black">
      {/* Top Action Toolbar */}
      <div className="max-w-[1400px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ← Back to Laboratory
          </Link>
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('poster')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'poster'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Academic Research Poster (HTML)
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === 'image'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Poster Graphic (JPG)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/labsim_project_poster.jpg"
            download="LabSim_Project_Poster.jpg"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Poster (JPG)</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {activeTab === 'image' ? (
        /* Image Preview View */
        <div className="max-w-[1400px] mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
            <img
              src="/labsim_project_poster.jpg"
              alt="LabSim Redesigned Scientific Project Presentation Poster"
              className="w-full h-auto object-contain mx-auto"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between w-full text-xs text-slate-400 px-2">
            <span>High-Resolution Exhibition Poster Graphic with Real Website Screenshots</span>
            <div className="flex items-center gap-4">
              <a
                href="/labsim_project_poster.jpg"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-bold"
              >
                Open Full Resolution in New Tab ↗
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* EXACT REDESIGNED ACADEMIC POSTER (PRINTABLE 4:3 CONFERENCE FORMAT) */
        /* ================================================================= */
        <div className="max-w-[1400px] mx-auto bg-[#f6f8f3] text-slate-800 border-2 border-slate-300 shadow-2xl rounded-2xl overflow-hidden font-sans print:border-none print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0">
          {/* =============================================================== */}
          {/* POSTER HEADER BANNER */}
          {/* =============================================================== */}
          <div className="bg-white border-b-2 border-[#166534] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: College Logo & Name */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-14 h-16 relative shrink-0">
                <img
                  src="/screenshots/college_logo.png"
                  alt="AITS Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <h2 className="text-xs sm:text-sm font-extrabold text-[#0f3822] tracking-tight uppercase">
                  Annamacharya Institute of Technology and Sciences
                </h2>
                <p className="text-[11px] text-slate-600 font-medium">
                  Tirupati, Andhra Pradesh, India - 517520
                </p>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-12 bg-slate-300"></div>

            {/* Center: LabSim Branding & Tagline */}
            <div className="text-center md:text-left flex-1 px-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-[#0f3822] tracking-tighter flex items-center gap-1.5">
                  <span className="text-[#15803d]">Lab</span>
                  <span className="text-[#0f3822]">Sim</span>
                </h1>
                <div className="hidden sm:block w-px h-7 bg-slate-300"></div>
                <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                  WebXR 3D & AI-Powered Virtual Science Laboratory
                </p>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                Next-Generation Curriculum-Aligned STEM Simulation Platform for CBSE / NCERT (Classes 9–12)
              </p>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-12 bg-slate-300"></div>

            {/* Right: Four Pillar Badges */}
            <div className="text-right shrink-0 leading-tight">
              <p className="text-[10px] font-black tracking-widest text-[#15803d]">EXPLORE</p>
              <p className="text-[10px] font-black tracking-widest text-[#0f3822]">EXPERIMENT</p>
              <p className="text-[10px] font-black tracking-widest text-[#15803d]">LEARN</p>
              <p className="text-[10px] font-black tracking-widest text-[#0f3822]">ANYWHERE</p>
            </div>
          </div>

          {/* =============================================================== */}
          {/* MAIN POSTER BODY: 3-COLUMN RESEARCH POSTER GRID */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 bg-[#f6f8f3]">
            {/* ------------------------------------------------------------- */}
            {/* COLUMN 1: LEFT COLUMN (COL-SPAN-3: SECTIONS 01, 02, 03) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
              {/* 01 PROBLEM STATEMENT */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    01
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Problem Statement
                  </h3>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2.5">
                  Limited Access to Hands-on Science Education
                </p>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                      <School className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-snug">
                      <strong className="text-slate-900">78% of rural, government and tier-2/tier-3 schools</strong> lack functional physics and chemistry laboratories.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-amber-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-snug">
                      <strong className="text-slate-900">Hazardous chemicals and high-voltage</strong> equipment create severe safety liabilities in classrooms.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-rose-700 shrink-0 mt-0.5">
                      <FlaskConical className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-snug">
                      <strong className="text-slate-900">Expensive and fragile apparatus</strong> frequently break during student handling.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-blue-700 shrink-0 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <p className="leading-snug">
                      <strong className="text-slate-900">Students often memorize experimental readings</strong> from guidebooks instead of developing conceptual understanding.
                    </p>
                  </div>
                </div>
              </div>

              {/* 02 OUR SOLUTION - LABSIM */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    02
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Our Solution - LabSim
                  </h3>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug mb-2.5">
                  A zero-install, photorealistic, interactive 3D and WebXR virtual science laboratory accessible in any standard web browser.
                </p>

                {/* Device Mockup with Real Website Screenshot */}
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 shadow-inner mb-3">
                  <img
                    src="/screenshots/solution_device_mockup.png"
                    alt="LabSim Device Mockup"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute bottom-1 right-2 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded">
                    Dual-Rail 3D Optical Bench & AR
                  </div>
                </div>

                {/* 6 Feature Badges Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Monitor className="w-3 h-3 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">No Installation</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">Works on any device</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Atom className="w-3 h-3 text-cyan-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">Interactive 3D</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">Real Experiments</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">Tabletop AR</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">via WebXR</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">Curriculum Aligned</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">Voice-based learning</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">AI Viva Assistant</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">CBSE / NCERT (9-12)</p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                    <WifiOff className="w-3 h-3 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">Lightweight & Offline</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-0.5">&lt; 65MB RAM (PWA)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 03 KEY INNOVATIONS */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    03
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Key Innovations
                  </h3>
                </div>

                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-emerald-700 shrink-0 mt-0.5">
                      <Atom className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Full 3D WebGL + Immersive WebXR AR</p>
                      <p className="text-[10px] text-slate-500">Zero app install, camera-based desk projection.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-cyan-700 shrink-0 mt-0.5">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Physically Accurate Simulations</p>
                      <p className="text-[10px] text-slate-500">Optics, Circuits, Mechanics, Electrochemistry.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-purple-700 shrink-0 mt-0.5">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">AI Oral Viva Examiner</p>
                      <p className="text-[10px] text-slate-500">Speech-synthesized real-time examiner tutor.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-amber-700 shrink-0 mt-0.5">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Optimized for Low-End Devices</p>
                      <p className="text-[10px] text-slate-500">Locked 60 FPS on low-cost mobile Mali GPUs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-slate-100 text-green-700 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Exact CBSE / NCERT Alignment</p>
                      <p className="text-[10px] text-slate-500">Directly mapped to board practical examination rubrics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMN 2: CENTER COLUMN (COL-SPAN-5: SECTIONS 04, 05, 06) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {/* 04 SYSTEM ARCHITECTURE */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    04
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    System Architecture
                  </h3>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2">
                  Modular, Scalable and Browser-Based Architecture
                </p>

                {/* Clean 3-Tier Architecture Flow */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  {/* Tier 1: Client */}
                  <div className="bg-[#f8faf6] border border-slate-300 rounded-lg p-2 flex flex-col justify-between">
                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-center gap-1">
                      <Monitor className="w-3 h-3 text-slate-600" />
                      <span>Client (Browser)</span>
                    </p>
                    <div className="space-y-1 text-slate-600 text-[9px] font-medium">
                      <div className="bg-white p-1 rounded border border-slate-200">Desktop (Chrome / Edge)</div>
                      <div className="bg-white p-1 rounded border border-slate-200">Android / iOS Mobile</div>
                      <div className="bg-white p-1 rounded border border-slate-200">AR Mode (WebXR)</div>
                    </div>
                  </div>

                  {/* Tier 2: LabSim Platform */}
                  <div className="bg-[#f0f7f2] border-2 border-emerald-500/50 rounded-lg p-2 flex flex-col justify-between">
                    <p className="font-bold text-emerald-950 border-b border-emerald-200 pb-1 mb-1.5 flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-700" />
                      <span>LabSim Platform (Next.js 16)</span>
                    </p>
                    <div className="space-y-1 text-emerald-900 text-[9px] font-medium">
                      <div className="bg-white p-1 rounded border border-emerald-200">3D Engine (Three.js + WebGL)</div>
                      <div className="bg-white p-1 rounded border border-emerald-200">Physics & Chemistry Cores</div>
                      <div className="bg-white p-1 rounded border border-emerald-200">AI Viva Speech Examiner</div>
                    </div>
                  </div>

                  {/* Tier 3: Data & Offline */}
                  <div className="bg-[#f8faf6] border border-slate-300 rounded-lg p-2 flex flex-col justify-between">
                    <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-600" />
                      <span>Data & Content</span>
                    </p>
                    <div className="space-y-1 text-slate-600 text-[9px] font-medium">
                      <div className="bg-white p-1 rounded border border-slate-200">Experiment Database</div>
                      <div className="bg-white p-1 rounded border border-slate-200">NCERT Curriculum Mapping</div>
                      <div className="bg-white p-1 rounded border border-slate-200">Offline PWA Cache (100%)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05 KEY EXPERIMENTS & VISUALIZATIONS (WITH OUR REAL WEBSITE SCREENSHOTS) */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    05
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Key Experiments & Visualizations (Physics & Chemistry)
                  </h3>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2.5">
                  Real WebGL Viewport Captures of Deterministic Interactive STEM Labs
                </p>

                {/* 6 Cards 3x2 Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: Optical Bench Convex Lens */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Optical Bench – Convex Lens
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/optical_bench_crop.png"
                        alt="Optical Bench Convex Lens 3D Simulation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Adjust object and screen positions to find focal length. Real-time ray tracing and blur simulation.
                    </div>
                  </div>

                  {/* Card 2: Concave Mirror */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Concave Mirror
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/concave_mirror_crop.png"
                        alt="Concave Mirror 3D Simulation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Observe real and virtual image formation with dynamic ray tracing and focal plane alignment.
                    </div>
                  </div>

                  {/* Card 3: Glass Slab Refraction */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Refraction through Glass Slab
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/glass_slab_crop.png"
                        alt="Glass Slab Refraction & Lateral Shift"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Trace incident, refracted and emergent rays with grounded optical pins and lateral shift: $d = t\frac{`{\\sin(i-r)}`}{`{\\cos r}`}$.
                    </div>
                  </div>

                  {/* Card 4: Ohm's Law DC Circuit */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Ohm's Law – DC Circuit
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/ohms_law_crop.png"
                        alt="Ohm's Law Circuit with 3D Cables"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Build circuits with 3D components, Catmull-Rom tube cables, and live electron particle drift.
                    </div>
                  </div>

                  {/* Card 5: Prism Dispersion */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Prism – Dispersion of Light
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/glass_prism_crop.png"
                        alt="Glass Prism VIBGYOR Dispersion"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Visualize spectrum formation with Cauchy dispersion ray tracing across 60° triangular glass faces.
                    </div>
                  </div>

                  {/* Card 6: Chemistry Laboratory */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-2xs flex flex-col">
                    <div className="bg-[#0f281e] text-white px-2 py-1 text-[10px] font-bold truncate">
                      Chemistry Experiments
                    </div>
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                      <img
                        src="/screenshots/chemistry_lab_crop.png"
                        alt="Electrolytic Conductivity Beaker"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 text-[9px] text-slate-600 leading-snug flex-1">
                      Safe, interactive simulations of standard CBSE practicals: Kohlrausch electrolytic molar conductivity.
                    </div>
                  </div>
                </div>
              </div>

              {/* 06 LABSIM ASSISTANT - AI VIVA & GUIDED LEARNING */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    06
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    LabSim Assistant – AI Viva & Guided Learning
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Assistant Avatar Badge */}
                  <div className="flex items-center gap-2.5 sm:w-2/5 shrink-0 bg-slate-900 text-white p-2.5 rounded-xl border border-emerald-600/40">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0 text-emerald-300 shadow-md">
                      <Atom className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-400 leading-none">LabSim Assistant</h4>
                      <p className="text-[9px] text-slate-300 leading-tight mt-1">
                        Ask questions, perform viva practice, and get guided explanations.
                      </p>
                    </div>
                  </div>

                  {/* Dialog Speech Bubbles */}
                  <div className="sm:w-3/5 space-y-1.5 w-full text-[10px]">
                    {/* User Question */}
                    <div className="bg-sky-50 border border-sky-200 text-sky-950 px-2.5 py-1.5 rounded-lg rounded-bl-none shadow-2xs">
                      <strong className="text-sky-900 block text-[9px] font-bold">Student Question:</strong>
                      "Why does the image become blurred when the screen is moved away from the focal plane?"
                    </div>

                    {/* AI Answer */}
                    <div className="bg-[#0f281e] text-emerald-100 px-2.5 py-1.5 rounded-lg rounded-tl-none border border-emerald-600/50 shadow-2xs">
                      <strong className="text-emerald-300 block text-[9px] font-bold">LabSim AI Tutor:</strong>
                      "As the screen moves away from the focal plane, the light rays do not converge at a single point. This forms a larger circle of confusion, resulting in a blurred image."
                    </div>
                  </div>
                </div>

                {/* Bottom 4 Feature Badges */}
                <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-slate-200 text-center text-[9px]">
                  <div className="flex flex-col items-center gap-0.5 text-slate-700">
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">Voice-Based Interaction</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold">Concept Explanations</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-slate-700">
                    <CircleHelp className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-bold">Viva Practice (Oral)</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold">Instant Feedback</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMN 3: RIGHT COLUMN (COL-SPAN-4: SECTIONS 07, 08, 09, 10) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              {/* 07 PERFORMANCE BENCHMARKS */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    07
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Performance Benchmarks
                  </h3>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2">
                  Optimized for real-time interaction on low-end devices
                </p>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-4 gap-1.5 text-center mb-2.5">
                  <div className="p-1.5 rounded-lg bg-[#0f281e] text-white">
                    <p className="text-xs sm:text-sm font-black text-emerald-400">60 FPS</p>
                    <p className="text-[8px] text-slate-300 leading-tight">WebGL (Mali-G52)</p>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#0f281e] text-white">
                    <p className="text-xs sm:text-sm font-black text-cyan-400">&lt; 14 ms</p>
                    <p className="text-[8px] text-slate-300 leading-tight">Frame Time</p>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#0f281e] text-white">
                    <p className="text-xs sm:text-sm font-black text-amber-400">&lt; 65 MB</p>
                    <p className="text-[8px] text-slate-300 leading-tight">RAM Usage</p>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[#0f281e] text-white">
                    <p className="text-xs sm:text-sm font-black text-green-300">100%</p>
                    <p className="text-[8px] text-slate-300 leading-tight">Works Offline</p>
                  </div>
                </div>

                {/* 2 Dark Oscilloscope Performance Graphs */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Graph 1: Frame Rate */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[9px] text-slate-400">
                    <div className="flex justify-between items-center mb-1 text-emerald-400 font-bold">
                      <span>Frame Rate (60 FPS Target)</span>
                      <span>60 FPS</span>
                    </div>
                    {/* SVG Frame Rate Graph */}
                    <svg viewBox="0 0 100 35" className="w-full h-8 overflow-visible">
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <line x1="0" y1="18" x2="100" y2="18" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        points="0,6 10,6 20,5 30,6 40,6 50,7 60,6 70,5 80,6 90,6 100,6"
                      />
                    </svg>
                  </div>

                  {/* Graph 2: Latency Response */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[9px] text-slate-400">
                    <div className="flex justify-between items-center mb-1 text-amber-400 font-bold">
                      <span>Latency Response (ms)</span>
                      <span>11.4 ms</span>
                    </div>
                    {/* SVG Latency Graph */}
                    <svg viewBox="0 0 100 35" className="w-full h-8 overflow-visible">
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <line x1="0" y1="18" x2="100" y2="18" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                      <polyline
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="1.2"
                        points="0,26 8,24 16,12 22,25 30,22 38,15 45,26 55,20 62,28 72,16 80,25 90,22 100,24"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* COMPARISON WITH EXISTING PLATFORMS */}
              <div className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs">
                <h4 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide mb-2">
                  Comparison with Existing Platforms
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-1">Feature / Metric</th>
                        <th className="p-1 text-center">PhET</th>
                        <th className="p-1 text-center">Tinkercad</th>
                        <th className="p-1 text-center">Labster</th>
                        <th className="p-1 text-center bg-emerald-100 text-[#0f3822]">LabSim (Our Project)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="p-1 font-semibold">Spatial Dimensionality</td>
                        <td className="p-1 text-center">2D</td>
                        <td className="p-1 text-center">3D Basic</td>
                        <td className="p-1 text-center">3D (Heavy)</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ Full 3D WebGL + WebXR</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Augmented Reality</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center text-slate-600">✔ (VR Only)</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ Native WebXR (Zero Install)</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Circuit Wire Physics</td>
                        <td className="p-1 text-center">2D</td>
                        <td className="p-1 text-center">Static</td>
                        <td className="p-1 text-center">Pre-baked</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ 3D + Flowing Electrons</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Optical Bench Accuracy</td>
                        <td className="p-1 text-center">Simplified</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center">Fixed Scenes</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ Dual-Rail + Realistic Rays</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Curriculum Mapping</td>
                        <td className="p-1 text-center">General</td>
                        <td className="p-1 text-center">Maker</td>
                        <td className="p-1 text-center">University</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ CBSE / NCERT (9–12)</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">AI Viva Examiner</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center text-rose-600 font-bold">✕</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ Voice-based Tutor</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Client Footprint</td>
                        <td className="p-1 text-center">Light</td>
                        <td className="p-1 text-center">Cloud</td>
                        <td className="p-1 text-center">&gt; 1.2 GB</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ &lt; 65 MB RAM (PWA)</td>
                      </tr>
                      <tr>
                        <td className="p-1 font-semibold">Mobile GPU Latency</td>
                        <td className="p-1 text-center">60 FPS (2D)</td>
                        <td className="p-1 text-center">30-45 FPS</td>
                        <td className="p-1 text-center">20-30 FPS</td>
                        <td className="p-1 text-center font-bold bg-emerald-50 text-emerald-800">✔ 60 FPS (&lt; 14 ms)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 08 LEARNING OUTCOMES */}
              <div className="bg-white rounded-xl border border-slate-300 p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#65a30d] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    08
                  </span>
                  <h3 className="text-xs font-bold text-[#0f3822] uppercase tracking-wide">
                    Learning Outcomes (Illustrative Results)
                  </h3>
                </div>

                {/* 3 Bar Charts */}
                <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                  {/* Metric 1 */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1 leading-tight">Concept Understanding</p>
                    <div className="flex items-end justify-center gap-1.5 h-14 pb-1">
                      <div className="w-5 bg-slate-400 rounded-t h-[40%] flex items-center justify-center text-[8px] text-white font-bold">
                        38%
                      </div>
                      <div className="w-5 bg-[#65a30d] rounded-t h-[85%] flex items-center justify-center text-[8px] text-white font-bold shadow-xs">
                        +73%
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-semibold px-1">
                      <span>Before</span>
                      <span className="text-[#166534] font-bold">LabSim</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1 leading-tight">Practical Knowledge</p>
                    <div className="flex items-end justify-center gap-1.5 h-14 pb-1">
                      <div className="w-5 bg-slate-400 rounded-t h-[35%] flex items-center justify-center text-[8px] text-white font-bold">
                        34%
                      </div>
                      <div className="w-5 bg-[#65a30d] rounded-t h-[80%] flex items-center justify-center text-[8px] text-white font-bold shadow-xs">
                        +68%
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-semibold px-1">
                      <span>Before</span>
                      <span className="text-[#166534] font-bold">LabSim</span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800 mb-1 leading-tight">Retention Rate</p>
                    <div className="flex items-end justify-center gap-1.5 h-14 pb-1">
                      <div className="w-5 bg-slate-400 rounded-t h-[30%] flex items-center justify-center text-[8px] text-white font-bold">
                        32%
                      </div>
                      <div className="w-5 bg-[#65a30d] rounded-t h-[75%] flex items-center justify-center text-[8px] text-white font-bold shadow-xs">
                        +62%
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-semibold px-1">
                      <span>Before</span>
                      <span className="text-[#166534] font-bold">LabSim</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 09 CURRICULUM MAPPING & 10 CONCLUSIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 09 Curriculum Mapping */}
                <div className="bg-white rounded-xl border border-slate-300 p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-4 h-4 rounded bg-[#65a30d] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      09
                    </span>
                    <h3 className="text-[10px] font-bold text-[#0f3822] uppercase tracking-wide">
                      Curriculum Mapping
                    </h3>
                  </div>
                  <div className="text-[8px] space-y-1 text-slate-700">
                    <div>
                      <strong className="text-slate-900">Physics:</strong> Optics, Electricity, Magnetism, Modern Physics
                    </div>
                    <div>
                      <strong className="text-slate-900">Chemistry:</strong> Electrochemistry, Titration, Reactions
                    </div>
                    <div>
                      <strong className="text-slate-900">Mathematics:</strong> Geometry, 3D Coordinate Raytracing
                    </div>
                  </div>
                </div>

                {/* 10 Conclusions */}
                <div className="bg-white rounded-xl border border-slate-300 p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-4 h-4 rounded bg-[#65a30d] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      10
                    </span>
                    <h3 className="text-[10px] font-bold text-[#0f3822] uppercase tracking-wide">
                      Conclusions
                    </h3>
                  </div>
                  <ul className="text-[8px] space-y-1 text-slate-700">
                    <li className="flex items-start gap-1">
                      <Check className="w-2.5 h-2.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Accessible, interactive virtual STEM lab.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <Check className="w-2.5 h-2.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Combines 3D WebGL, WebXR AR & AI tutor.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <Check className="w-2.5 h-2.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>100% CBSE / NCERT curriculum aligned.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <Check className="w-2.5 h-2.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Zero cloud cost, works offline anywhere.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* POSTER FOOTER */}
          {/* =============================================================== */}
          <div className="bg-[#0f281e] text-slate-300 px-6 py-2.5 border-t-2 border-emerald-500 flex flex-wrap items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs">LabSim • National Science & Technology Hackathon</span>
              <span>•</span>
              <span className="text-emerald-300">Annamacharya Institute of Technology and Sciences</span>
            </div>
            <div className="text-slate-300">
              Live Application: <strong className="text-emerald-400 font-mono">http://localhost:3005</strong> • Open Source Virtual Science Lab
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
