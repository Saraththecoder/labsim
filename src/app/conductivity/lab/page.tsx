'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  FlaskConical,
  RotateCcw,
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  TableProperties,
  ArrowRight,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import { ConductivityBench3D } from '@/components/ConductivityBench3D';
import {
  calculateConductivity,
  ConductivityCellState,
  SOLUTIONS_DATABASE,
} from '@/lib/conductivityPhysics';
import {
  addConductivityObservation,
  getConductivityObservations,
} from '@/lib/conductivityStorage';

export default function ConductivityLabPage() {
  const [state, setState] = useState<ConductivityCellState>({
    solutionId: 'nacl',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    appliedVoltage: 6.0,
    isPowerOn: true,
  });

  const [showIons, setShowIons] = useState(true);
  const [recordedToast, setRecordedToast] = useState<string | null>(null);
  const [observationCount, setObservationCount] = useState(0);

  useEffect(() => {
    setObservationCount(getConductivityObservations().length);
  }, []);

  const calc = calculateConductivity(state);

  const handleRecord = () => {
    const created = addConductivityObservation({
      solutionId: state.solutionId,
      solutionName: `${calc.solution.name} (${calc.solution.formula})`,
      concentration: state.concentration,
      temperature: state.temperature,
      electrodeDistance: state.electrodeDistance,
      electrodeArea: state.electrodeArea,
      cellConstant: calc.cellConstant,
      appliedVoltage: state.appliedVoltage,
      current_mA: calc.circuitCurrent_mA,
      resistance_ohm: calc.cellResistance,
      conductance_mS: calc.cellConductance,
      specificConductivity_mS_cm: calc.specificConductivity_mS_cm,
      molarConductivity: calc.molarConductivity,
      degreeOfDissociation: calc.degreeOfDissociation,
      bulbGlow: `${calc.bulbState} (${calc.bulbBrightnessPercent}%)`,
      notes: `${calc.solution.type.toUpperCase()} electrolyte. Current: ${calc.circuitCurrent_mA} mA.`,
    });

    setObservationCount((prev) => prev + 1);
    setRecordedToast(`Observation #${created.serialNumber} recorded to notebook!`);
    setTimeout(() => setRecordedToast(null), 3500);
  };

  const resetCell = () => {
    setState({
      solutionId: 'nacl',
      concentration: 0.1,
      temperature: 25,
      electrodeDistance: 2.0,
      electrodeArea: 4.0,
      appliedVoltage: 6.0,
      isPowerOn: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 overflow-hidden">
      {recordedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{recordedToast}</span>
          <Link
            href="/conductivity/observations"
            className="text-[11px] underline font-bold text-white ml-2 hover:text-emerald-300"
          >
            View Table
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* Left Column: Solution Selector & Curriculum Investigations */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Solution Selector */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Reagent / Solution</span>
            </h3>

            <div className="space-y-1.5">
              {SOLUTIONS_DATABASE.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      solutionId: sol.id,
                      concentration: sol.defaultConcentration,
                    }))
                  }
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                    state.solutionId === sol.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                      : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{sol.name}</span>
                    <span className="font-mono text-[10px] text-cyan-400">{sol.formula}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span
                      className={`uppercase font-bold ${
                        sol.type === 'strong'
                          ? 'text-emerald-400'
                          : sol.type === 'weak'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {sol.type}
                    </span>
                    <span>Λ° = {sol.lambda0}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Curriculum Investigations */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Standard Experiments</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    solutionId: 'nacl',
                    concentration: 0.1,
                    electrodeDistance: 2.0,
                  }))
                }
                className="w-full text-left p-2 rounded-lg bg-[#0f172a] hover:bg-[#142036] border border-slate-800 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-slate-200">1. Strong Salt (NaCl 0.1M)</div>
                <div className="text-[10px] text-slate-400">Complete ionization, bright bulb</div>
              </button>

              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    solutionId: 'ch3cooh',
                    concentration: 0.01,
                    electrodeDistance: 2.0,
                  }))
                }
                className="w-full text-left p-2 rounded-lg bg-[#0f172a] hover:bg-[#142036] border border-slate-800 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-slate-200">2. Dilute Weak Acid (CH₃COOH 0.01M)</div>
                <div className="text-[10px] text-slate-400">Ostwald dilution effect on α</div>
              </button>

              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    solutionId: 'glucose',
                    concentration: 0.2,
                  }))
                }
                className="w-full text-left p-2 rounded-lg bg-[#0f172a] hover:bg-[#142036] border border-slate-800 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-slate-200">3. Non-Electrolyte (Glucose)</div>
                <div className="text-[10px] text-slate-400">Zero ionic charge carriers</div>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Column: 3D Beaker & Circuit Viewport */}
        <main className="flex-1 flex flex-col gap-4">
          <ConductivityBench3D
            state={state}
            showIons={showIons}
            className="flex-1 min-h-[460px]"
          />

          {/* Quick Toolbar */}
          <div className="p-4 rounded-2xl bg-[#090e1a] border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showIons}
                  onChange={(e) => setShowIons(e.target.checked)}
                  className="rounded accent-amber-400 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">Show Animated Ions & Electrolysis</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={state.isPowerOn}
                  onChange={(e) => setState((prev) => ({ ...prev, isPowerOn: e.target.checked }))}
                  className="rounded accent-emerald-400 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold">Circuit Power ({state.isPowerOn ? 'ON' : 'OFF'})</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetCell}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <Link
                href="/conductivity/observations"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Notebook ({observationCount})</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Right Column: Physical Controls & Meters */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          {/* Live Meter Readouts */}
          <div className="p-5 rounded-2xl bg-[#090e1a] border border-amber-900/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Electrochemical Readouts</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">REAL-TIME</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-sans">Current (I)</span>
                <span className="text-base font-bold text-amber-300">{calc.circuitCurrent_mA} mA</span>
                <span className="text-[10px] text-slate-500 block">V = {state.appliedVoltage}V</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-sans">Conductance (G)</span>
                <span className="text-base font-bold text-cyan-300">{calc.cellConductance.toFixed(3)} mS</span>
                <span className="text-[10px] text-slate-500 block">R = {calc.cellResistance} Ω</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-sans">Specific Cond. (κ)</span>
                <span className="text-base font-bold text-emerald-300">{calc.specificConductivity_mS_cm} mS/cm</span>
                <span className="text-[10px] text-slate-500 block">G* = {calc.cellConstant} cm⁻¹</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] font-sans">Molar Cond. (Λₘ)</span>
                <span className="text-base font-bold text-purple-300">{calc.molarConductivity}</span>
                <span className="text-[10px] text-slate-500 block">S cm² mol⁻¹</span>
              </div>
            </div>

            {/* Dissociation & Bulb status */}
            <div className="p-3 rounded-xl bg-[#0b1220] border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                <span>Degree of Dissociation (α)</span>
                <span className="text-white font-mono">{(calc.degreeOfDissociation * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${Math.min(100, calc.degreeOfDissociation * 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleRecord}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Record to Lab Notebook</span>
            </button>
          </div>

          {/* Physical Cell Sliders */}
          <div className="p-5 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Electrochemical Controls</span>
              </h3>
            </div>

            {/* Concentration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Concentration (C)</span>
                <span className="font-mono text-cyan-300 font-bold">{state.concentration} M</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="1.0"
                step="0.005"
                value={state.concentration}
                onChange={(e) => setState((p) => ({ ...p, concentration: Number(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Electrode Separation l */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Electrode Spacing (l)</span>
                <span className="font-mono text-amber-300 font-bold">{state.electrodeDistance} cm</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.2"
                value={state.electrodeDistance}
                onChange={(e) => setState((p) => ({ ...p, electrodeDistance: Number(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Electrode Area A */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Electrode Area (A)</span>
                <span className="font-mono text-emerald-300 font-bold">{state.electrodeArea} cm²</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={state.electrodeArea}
                onChange={(e) => setState((p) => ({ ...p, electrodeArea: Number(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Voltage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Applied Voltage (V)</span>
                <span className="font-mono text-white font-bold">{state.appliedVoltage} V</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={state.appliedVoltage}
                onChange={(e) => setState((p) => ({ ...p, appliedVoltage: Number(e.target.value) }))}
                className="w-full accent-slate-200 cursor-pointer"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Solution Temp (T)</span>
                <span className="font-mono text-amber-300 font-bold">{state.temperature} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                step="1"
                value={state.temperature}
                onChange={(e) => setState((p) => ({ ...p, temperature: Number(e.target.value) }))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
