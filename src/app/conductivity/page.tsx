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
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
            <span>Class 10 Chemistry • Electrolyte Conductance Lab</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-[#17231B] leading-tight font-serif">
            Electrical Conductivity of <span className="italic">Ionic Solutions</span>
          </h1>

          <p className="text-base sm:text-lg text-[#647067] leading-relaxed font-normal">
            Investigate how acids, bases, salts, and non-electrolytes conduct electric current. Immerse electrodes, observe microscopic ion drift, measure cell constant, specific conductivity (κ), and molar conductivity (Λₘ), and test circuit bulbs in real-time 3D and Augmented Reality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/conductivity/lab"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] shadow-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-[#17231B] group-hover:rotate-12 transition-transform" />
              <span>Start Conductivity Lab</span>
              <ArrowRight className="w-4 h-4 text-[#17231B] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/conductivity/learn"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF] shadow-xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#17231B]" />
              <span>Electrolyte Theory</span>
            </Link>

            <Link
              href="/conductivity/ar"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF] transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-[#17231B]" />
              <span>AR Beaker Mode</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-14 relative z-10 max-w-4xl mx-auto rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E8DF]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B8D96B]" />
              <h3 className="text-sm font-bold text-[#17231B] tracking-wide">
                Live Solution Conductivity Tester
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#647067] font-semibold">Select Electrolyte:</span>
              <select
                value={selectedSolutionId}
                onChange={(e) => setSelectedSolutionId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-semibold cursor-pointer"
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
            <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider">
                Classification
              </span>
              <div
                className={`text-sm font-bold uppercase tracking-wider ${
                  calc.solution.type === 'strong'
                    ? 'text-emerald-700'
                    : calc.solution.type === 'weak'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {calc.solution.type}
              </div>
              <p className="text-xs text-[#647067] leading-relaxed">{calc.solution.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-2 font-mono">
              <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider font-sans">
                Electrical Circuit Readout
              </span>
              <div className="text-2xl font-bold text-[#17231B]">{calc.circuitCurrent_mA} mA</div>
              <div className="text-xs text-[#647067]">
                Resistance: <span className="text-[#17231B] font-bold">{calc.cellResistance} Ω</span>
              </div>
              <div className="text-xs text-[#647067]">
                Bulb: <span className="text-[#17231B] font-bold">{calc.bulbState} ({calc.bulbBrightnessPercent}%)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-2 font-mono">
              <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider font-sans">
                Physical Conductivity
              </span>
              <div className="text-2xl font-bold text-[#17231B]">{calc.specificConductivity_mS_cm} mS/cm</div>
              <div className="text-xs text-[#647067]">
                Molar Cond. Λₘ: <span className="text-[#17231B] font-bold">{calc.molarConductivity} S cm² mol⁻¹</span>
              </div>
              <div className="text-xs text-[#647067]">
                Dissociation α: <span className="text-[#17231B] font-bold">{(calc.degreeOfDissociation * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#647067] pt-2 border-t border-[#E2E8DF]">
            <span>Electrode Distance l = 2.0 cm • Area A = 4.0 cm² • Applied Voltage = 6.0 V</span>
            <Link
              href="/conductivity/lab"
              className="text-[#17231B] font-bold hover:underline flex items-center gap-1"
            >
              <span>Open 3D Electrochemical Cell</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Modules Grid: Learn, Experiment, Measure */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E2E8DF]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] space-y-4 hover:border-[#B8D96B] transition-all flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17231B]">1. Master Electrolyte Theory</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Understand Arrhenius ionization, strong vs weak electrolytes, Grotthuss proton hopping, Kohlrausch’s law of independent migration, and the Ostwald dilution equation.
              </p>
            </div>
            <Link
              href="/conductivity/learn"
              className="text-xs font-bold text-[#17231B] hover:underline flex items-center gap-1 pt-3 border-t border-[#E2E8DF]"
            >
              <span>Explore Theory & Formulas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#B8D96B] space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#B8D96B]/25 border border-[#B8D96B] flex items-center justify-center text-[#17231B]">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17231B]">2. Conduct 3D & AR Practical</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Switch solutions, slide electrode spacing and depth, observe real-time tungsten filament illumination, and watch animated ions migrate toward cathode and anode.
              </p>
            </div>
            <Link
              href="/conductivity/lab"
              className="text-xs font-bold text-[#17231B] hover:underline flex items-center gap-1 pt-3 border-t border-[#E2E8DF]"
            >
              <span>Launch Virtual Cell</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] space-y-4 hover:border-[#B8D96B] transition-all flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B]">
                <TableProperties className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17231B]">3. Record & Generate Lab Reports</h3>
              <p className="text-xs text-[#647067] leading-relaxed">
                Log readings into your electronic lab notebook. Plot Debye-Hückel-Onsager (Λₘ vs √C) curves, export CSV data, and print school lab reports.
              </p>
            </div>
            <Link
              href="/conductivity/observations"
              className="text-xs font-bold text-[#17231B] hover:underline flex items-center gap-1 pt-3 border-t border-[#E2E8DF]"
            >
              <span>View Measurement Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Switcher back to Optics Lab */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#17231B]">Want to study Optical Physics instead?</h4>
            <p className="text-xs text-[#647067]">
              Switch to Experiment 1: Refraction Through a Convex Lens (Optical Bench & Ray Tracing).
            </p>
          </div>
          <Link
            href="/lab"
            className="px-5 py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <FlaskConical className="w-4 h-4 text-[#17231B]" />
            <span>Go to Optics Lab</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
