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
import { LabSimAssistant } from '@/components/LabSimAssistant';
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
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden">
      {recordedToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#17231B] border border-[#B8D96B] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#B8D96B]" />
          <span className="text-xs font-bold">{recordedToast}</span>
          <Link
            href="/conductivity/observations"
            className="text-[11px] underline font-bold text-[#B8D96B] ml-2 hover:text-white"
          >
            View Table
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* Left Column: Solution Selector & Curriculum Investigations */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Solution Selector */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-[#17231B]" />
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-0.5 cursor-pointer ${
                    state.solutionId === sol.id
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#17231B]">{sol.name}</span>
                    <span className="font-mono text-[10px] text-[#17231B] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF]">{sol.formula}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#647067]">
                    <span
                      className={`uppercase font-bold ${
                        sol.type === 'strong'
                          ? 'text-emerald-700'
                          : sol.type === 'weak'
                          ? 'text-amber-700'
                          : 'text-rose-700'
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
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
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
                className="w-full text-left p-2 rounded-lg bg-[#F4F7F2] hover:bg-[#FFFFFF] border border-[#E2E8DF] text-[#647067] hover:text-[#17231B] cursor-pointer"
              >
                <div className="font-bold text-[#17231B]">1. Strong Salt (NaCl 0.1M)</div>
                <div className="text-[10px] text-[#647067]">Complete ionization, bright bulb</div>
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
                className="w-full text-left p-2 rounded-lg bg-[#F4F7F2] hover:bg-[#FFFFFF] border border-[#E2E8DF] text-[#647067] hover:text-[#17231B] cursor-pointer"
              >
                <div className="font-bold text-[#17231B]">2. Dilute Weak Acid (CH₃COOH 0.01M)</div>
                <div className="text-[10px] text-[#647067]">Ostwald dilution effect on α</div>
              </button>

              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    solutionId: 'glucose',
                    concentration: 0.2,
                  }))
                }
                className="w-full text-left p-2 rounded-lg bg-[#F4F7F2] hover:bg-[#FFFFFF] border border-[#E2E8DF] text-[#647067] hover:text-[#17231B] cursor-pointer"
              >
                <div className="font-bold text-[#17231B]">3. Non-Electrolyte (Glucose)</div>
                <div className="text-[10px] text-[#647067]">Zero ionic charge carriers</div>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Column: 3D Beaker & Circuit Viewport */}
        <main className="flex-1 flex flex-col gap-4">
          <ConductivityBench3D
            state={state}
            showIons={showIons}
            className="flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-[#E2E8DF] shadow-xs"
          />

          {/* Quick Toolbar */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-[#17231B]">
                <input
                  type="checkbox"
                  checked={showIons}
                  onChange={(e) => setShowIons(e.target.checked)}
                  className="rounded accent-[#B8D96B] w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">Show Animated Ions & Electrolysis</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#17231B]">
                <input
                  type="checkbox"
                  checked={state.isPowerOn}
                  onChange={(e) => setState((prev) => ({ ...prev, isPowerOn: e.target.checked }))}
                  className="rounded accent-[#B8D96B] w-4 h-4 cursor-pointer"
                />
                <span className="font-bold">Circuit Power ({state.isPowerOn ? 'ON' : 'OFF'})</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetCell}
                className="px-3 py-1.5 rounded-lg bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <Link
                href="/conductivity/observations"
                className="px-3.5 py-1.5 rounded-lg bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] font-bold flex items-center gap-1.5 border border-[#E2E8DF]"
              >
                <TableProperties className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Notebook ({observationCount})</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Right Column: Physical Controls & Meters */}
        <aside className="w-full lg:w-80 xl:w-88 flex flex-col gap-4 shrink-0">
          {/* Live Meter Readouts (Class 10 NCERT Activity 2.3) */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 NCERT Activity 2.3
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                BOARD EXAM
              </span>
            </div>

            {/* BULB GLOW STATUS CARD */}
            <div className={`p-4 rounded-xl border space-y-2 shadow-inner ${
              calc.bulbState === 'BRIGHT' || calc.bulbState === 'VERY_BRIGHT'
                ? 'bg-[#B8D96B]/20 border-[#B8D96B] text-[#17231B]'
                : calc.bulbState === 'DIM' || calc.bulbState === 'MODERATE'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    calc.bulbState === 'OFF' ? 'bg-rose-500' : 'bg-[#17231B]'
                  }`} />
                  <span>Bulb: {calc.bulbState === 'OFF' ? 'DOES NOT GLOW (OFF)' : calc.bulbState + ' GLOW'}</span>
                </span>
                <span className="font-mono text-xs font-bold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E2E8DF] text-[#17231B]">
                  {calc.circuitCurrent_mA} mA
                </span>
              </div>

              <p className="text-xs font-bold text-[#17231B]">
                {calc.solution.ncertCategory || calc.solution.type.toUpperCase()}
              </p>

              <div className="pt-1 border-t border-[#E2E8DF] text-[11px] text-[#647067]">
                <span className="font-bold text-[#17231B]">NCERT Finding: </span>
                <span>{calc.solution.ncertInference || calc.solution.description}</span>
              </div>
            </div>

            {/* Circuit Current & Resistance */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Circuit Current (I)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.circuitCurrent_mA} mA</span>
                <span className="text-[10px] text-[#647067] block">Battery: {state.appliedVoltage} V</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Cell Resistance (R)</span>
                <span className="text-base font-bold text-[#17231B]">
                  {calc.cellResistance > 1e6 ? '∞ (Insulator)' : `${calc.cellResistance} Ω`}
                </span>
                <span className="text-[10px] text-[#647067] block">Gap: {state.electrodeDistance} cm</span>
              </div>
            </div>

            {/* Mobile Charge Carriers in Solution */}
            <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs space-y-1.5">
              <span className="text-[#647067] text-[10px] uppercase font-bold block">
                Charge Carriers in Solution
              </span>
              {calc.solution.type === 'non-electrolyte' ? (
                <p className="text-rose-700 text-xs leading-relaxed font-semibold">
                  Neutral molecules only. <strong>No free ions formed</strong>; electric circuit remains open.
                </p>
              ) : (
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-[#17231B] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#17231B]" />
                    <span>{calc.solution.cation.formula} ({calc.solution.cation.name})</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#17231B] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                    <span>{calc.solution.anion.formula} ({calc.solution.anion.name})</span>
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleRecord}
              className="w-full py-3 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#17231B]" />
              <span>Record to Lab Notebook</span>
            </button>
          </div>

          {/* Physical Cell Sliders */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <h3 className="font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Electrochemical Controls</span>
              </h3>
            </div>

            {/* Concentration Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold">Concentration (C)</span>
                <span className="font-mono text-[#17231B] font-bold">{state.concentration} M</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="1.0"
                step="0.005"
                value={state.concentration}
                onChange={(e) => setState((p) => ({ ...p, concentration: Number(e.target.value) }))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Electrode Separation l */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold">Electrode Spacing (l)</span>
                <span className="font-mono text-[#17231B] font-bold">{state.electrodeDistance} cm</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.2"
                value={state.electrodeDistance}
                onChange={(e) => setState((p) => ({ ...p, electrodeDistance: Number(e.target.value) }))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Electrode Area A */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold">Electrode Area (A)</span>
                <span className="font-mono text-[#17231B] font-bold">{state.electrodeArea} cm²</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={state.electrodeArea}
                onChange={(e) => setState((p) => ({ ...p, electrodeArea: Number(e.target.value) }))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Voltage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#17231B] font-semibold">Applied Voltage (V)</span>
                <span className="font-mono text-[#17231B] font-bold">{state.appliedVoltage} V</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="12.0"
                step="0.5"
                value={state.appliedVoltage}
                onChange={(e) => setState((p) => ({ ...p, appliedVoltage: Number(e.target.value) }))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8DF]">
              <div className="flex justify-between items-center">
                <span className="text-[#647067]">Solution Temp (T)</span>
                <span className="font-mono text-[#17231B] font-bold">{state.temperature} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                step="1"
                value={state.temperature}
                onChange={(e) => setState((p) => ({ ...p, temperature: Number(e.target.value) }))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Labby AI Science Tutor */}
      <LabSimAssistant experimentId="conductivity" />
    </div>
  );
}
