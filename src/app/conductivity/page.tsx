'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  BookOpen,
  FlaskConical,
  Smartphone,
  TableProperties,
  Award,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Scan,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  calculateConductivity,
  SOLUTIONS_DATABASE,
} from '@/lib/conductivityPhysics';

export default function ConductivityHomePage() {
  const [selectedSolutionId, setSelectedSolutionId] = useState('nacl');
  const [concentration, setConcentration] = useState(0.1);

  const calc = calculateConductivity({
    solutionId: selectedSolutionId,
    concentration,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    appliedVoltage: 6.0,
    isPowerOn: true,
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-cyan-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Physical Chemistry & Electrochemistry Virtual Lab</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Electrical Conductivity of{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-300 bg-clip-text text-transparent">
              Ionic Solutions
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Investigate how acids, bases, salts, and non-electrolytes conduct electric current. Immerse electrodes, observe microscopic ion drift, measure cell constant, specific conductivity (κ), and molar conductivity (Λₘ), and test circuit bulbs in real-time 3D and Augmented Reality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/conductivity/lab"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all flex items-center gap-2 group"
            >
              <FlaskConical className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Start Conductivity Lab</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/conductivity/learn"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#0e1628] hover:bg-[#152038] text-amber-300 border border-amber-500/30 hover:border-amber-400/50 shadow-lg transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Electrolyte Theory</span>
            </Link>

            <Link
              href="/conductivity/ar"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-[#0a0f1d] hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>AR Beaker Mode</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-14 relative z-10 max-w-4xl mx-auto rounded-2xl bg-[#080d19]/90 border border-amber-900/40 p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Solution Conductivity Tester
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Select Electrolyte:</span>
              <select
                value={selectedSolutionId}
                onChange={(e) => setSelectedSolutionId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                {SOLUTIONS_DATABASE.map((sol) => (
                  <option key={sol.id} value={sol.id}>
                    {sol.name} ({sol.formula})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Solution Profile & Live Meter Readouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Classification
              </span>
              <div
                className={`text-sm font-bold uppercase tracking-wider ${
                  calc.solution.type === 'strong'
                    ? 'text-emerald-400'
                    : calc.solution.type === 'weak'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {calc.solution.type}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{calc.solution.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                Electrical Circuit Readout
              </span>
              <div className="text-2xl font-bold text-amber-300">{calc.circuitCurrent_mA} mA</div>
              <div className="text-xs text-slate-400">
                Resistance: <span className="text-white font-bold">{calc.cellResistance} Ω</span>
              </div>
              <div className="text-xs text-slate-400">
                Bulb: <span className="text-emerald-300 font-bold">{calc.bulbState} ({calc.bulbBrightnessPercent}%)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                Physical Conductivity
              </span>
              <div className="text-2xl font-bold text-cyan-300">{calc.specificConductivity_mS_cm} mS/cm</div>
              <div className="text-xs text-slate-400">
                Molar Cond. Λₘ: <span className="text-white font-bold">{calc.molarConductivity} S cm² mol⁻¹</span>
              </div>
              <div className="text-xs text-slate-400">
                Dissociation α: <span className="text-white font-bold">{(calc.degreeOfDissociation * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Electrode Distance l = 2.0 cm • Area A = 4.0 cm² • Applied Voltage = 6.0 V</span>
            <Link
              href="/conductivity/lab"
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Open 3D Electrochemical Cell</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Modules Grid: Learn, Experiment, Measure */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Master Electrolyte Theory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand Arrhenius ionization, strong vs weak electrolytes, Grotthuss proton hopping, Kohlrausch’s law of independent migration, and the Ostwald dilution equation.
              </p>
            </div>
            <Link
              href="/conductivity/learn"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-3 border-t border-slate-800"
            >
              <span>Explore Theory & Formulas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#090e1a] border border-amber-500/30 space-y-4 shadow-[0_0_20px_rgba(251,191,36,0.1)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Conduct 3D & AR Practical</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Switch solutions, slide electrode spacing and depth, observe real-time tungsten filament illumination, and watch animated ions migrate toward cathode and anode.
              </p>
            </div>
            <Link
              href="/conductivity/lab"
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 pt-3 border-t border-amber-900/50"
            >
              <span>Launch Virtual Cell</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <TableProperties className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Record & Generate Lab Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log readings into your electronic lab notebook. Plot Debye-Hückel-Onsager (Λₘ vs √C) curves, export CSV data, and print school lab reports.
              </p>
            </div>
            <Link
              href="/conductivity/observations"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pt-3 border-t border-slate-800"
            >
              <span>View Measurement Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Switcher back to Optics Lab */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Want to study Optical Physics instead?</h4>
            <p className="text-xs text-slate-400">
              Switch to Experiment 1: Refraction Through a Convex Lens (Optical Bench & Ray Tracing).
            </p>
          </div>
          <Link
            href="/lab"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Go to Optics Lab</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
