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
  Zap,
  Power,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { OhmsLawCircuit3D } from '@/components/OhmsLawCircuit3D';
import {
  calculateOhmsLaw,
  CircuitConfig,
  generateOhmsLawReadings,
} from '@/lib/ohmsLawPhysics';

export default function OhmsLawLabPage() {
  const [config, setConfig] = useState<CircuitConfig>('single');
  const [r1, setR1] = useState<number>(5.0); // 5 Ohms
  const [r2, setR2] = useState<number>(10.0); // 10 Ohms
  const [rheostatResistance, setRheostatResistance] = useState<number>(20.0); // 20 Ohms
  const [cellCount, setCellCount] = useState<number>(3); // 3 cells (4.5V)
  const [isPlugKeyClosed, setIsPlugKeyClosed] = useState<boolean>(true);
  const [showOhmsHelp, setShowOhmsHelp] = useState<boolean>(false);

  const calc = calculateOhmsLaw({
    config,
    r1,
    r2,
    rheostatResistance,
    cellCount,
    isPlugKeyClosed,
  });

  const readings = generateOhmsLawReadings(config, r1, r2, cellCount);

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
              <span className="font-bold text-[#17231B] text-sm">Ohm’s Law & Resistor Networks</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50 font-mono uppercase font-bold">
                NCERT Chapter 12 • Experiment 5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ar?exp=ohms-law"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-1.5 shadow-xs"
              title="Launch Tabletop Augmented Reality"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Tabletop AR</span>
            </Link>
            <Link
              href="/report?exp=ohms-law"
              className="px-3 py-1 rounded-lg bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold border border-[#B8D96B] flex items-center gap-1 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Report</span>
            </Link>
            <Link
              href="/physics/glass-prism"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Prev: Glass Prism</span>
            </Link>
            <Link
              href="/conductivity/lab"
              className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-semibold border border-[#E2E8DF] flex items-center gap-1"
            >
              <span>Chemistry Lab</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1720px] mx-auto w-full">
        {/* =========================================
            LEFT COLUMN: CONFIG & BATTERY
           ========================================= */}
        <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 shrink-0">
          {/* Circuit Configuration Switcher */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Resistor Network</span>
            </h3>

            <div className="space-y-1.5">
              {[
                { id: 'single', label: 'Single Resistor (R₁)', note: `R = ${r1}Ω`, icon: '1x' },
                { id: 'series', label: 'Series Network (R₁ + R₂)', note: `Rs = ${(r1 + r2).toFixed(1)}Ω`, icon: 'Series' },
                { id: 'parallel', label: 'Parallel Network (R₁ || R₂)', note: `Rp = ${((r1 * r2) / (r1 + r2)).toFixed(2)}Ω`, icon: 'Parallel' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConfig(c.id as CircuitConfig)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                    config === c.id
                      ? 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold'
                      : 'bg-[#F4F7F2] hover:bg-[#FFFFFF] border-[#E2E8DF] text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17231B]">{c.label}</span>
                    <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF]">{c.note}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DC Battery Cells Supply */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                DC Voltage Source
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono font-bold bg-[#B8D96B]/30 px-1.5 py-0.5 rounded">
                {(cellCount * 1.5).toFixed(1)} V
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((cells) => (
                <button
                  key={cells}
                  onClick={() => setCellCount(cells)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                    cellCount === cells
                      ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                      : 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] hover:bg-[#FFFFFF] hover:text-[#17231B]'
                  }`}
                >
                  {(cells * 1.5).toFixed(1)}V
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#647067] italic">
              Dry cells connected in series: {cellCount} × 1.5V = {(cellCount * 1.5).toFixed(1)}V.
            </p>
          </div>

          {/* Individual Resistor Values */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
              Component Values
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#647067]">Resistor R₁:</span>
                <span className="font-mono font-bold text-[#17231B]">{r1.toFixed(1)} Ω</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#647067]">Resistor R₂:</span>
                <span className="font-mono font-bold text-[#17231B]">{r2.toFixed(1)} Ω</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E2E8DF]">
                <span className="text-[#17231B] font-semibold">Equivalent R:</span>
                <span className="font-mono font-bold text-[#17231B] text-sm bg-[#B8D96B]/30 px-2 py-0.5 rounded">
                  {calc.circuitResistance.toFixed(2)} Ω
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================
            CENTER: 3D CIRCUIT APPARATUS
           ========================================= */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          <OhmsLawCircuit3D
            config={config}
            r1={r1}
            r2={r2}
            rheostatResistance={rheostatResistance}
            cellCount={cellCount}
            isPlugKeyClosed={isPlugKeyClosed}
            onToggleKey={() => setIsPlugKeyClosed(!isPlugKeyClosed)}
            className="flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-[#E2E8DF] shadow-xs"
          />

          {/* Rheostat Slider Controller */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#17231B]" />
                  <span>Rheostat Variable Resistance (R_rh)</span>
                </span>
                <span className="font-mono text-[#17231B] font-bold">{rheostatResistance.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={rheostatResistance}
                onChange={(e) => setRheostatResistance(parseFloat(e.target.value))}
                className="w-full accent-[#B8D96B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                <span>0 Ω (Max Current)</span>
                <span>Move slider to vary current I and voltage V</span>
                <span>50 Ω (Min Current)</span>
              </div>
            </div>
          </div>
        </main>

        {/* =========================================
            RIGHT COLUMN: READINGS & V-I GRAPH
           ========================================= */}
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#17231B]" />
                <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider">
                  Class 10 Ohm’s Law Readouts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded border border-[#B8D96B]/50">
                V = I · R
              </span>
            </div>

            {/* Live Ohmic Status Badge */}
            <div className="p-3.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#17231B] font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
                  <span>Ohmic Conductor</span>
                </span>
                <span className="text-[10px] text-[#17231B] font-bold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF]">
                  R = {calc.circuitResistance.toFixed(2)} Ω
                </span>
              </div>
              <p className="text-xs font-bold text-[#17231B] leading-snug">
                V / I Ratio = {calc.ohmsRatio.toFixed(2)} Ω (Constant at constant temperature)
              </p>
              <div className="pt-1 border-t border-[#E2E8DF] flex flex-col gap-0.5">
                <p className="text-[11px] text-[#647067] font-medium">
                  {calc.formulaNote}
                </p>
                <p className="text-[10px] text-[#647067] italic">
                  Power P = V · I = {calc.powerWatts.toFixed(3)} W
                </p>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Voltmeter (V)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.measuredVoltageV.toFixed(2)} V</span>
                <span className="text-[10px] text-[#647067] block">Across Resistor</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Ammeter (I)</span>
                <span className="text-base font-bold text-[#17231B]">{calc.measuredCurrentMA.toFixed(1)} mA</span>
                <span className="text-[10px] text-[#647067] block">{(calc.currentA).toFixed(4)} A</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Total Resistance</span>
                <span className="text-base font-bold text-[#17231B]">{calc.totalCircuitResistance.toFixed(1)} Ω</span>
                <span className="text-[10px] text-[#647067] block">Includes Rheostat</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                <span className="text-[#647067] block text-[10px] font-sans font-semibold">Calculated R</span>
                <span className="text-base font-bold text-[#17231B]">{calc.ohmsRatio.toFixed(2)} Ω</span>
                <span className="text-[10px] text-[#647067] block">R = V / I</span>
              </div>
            </div>

            {/* Live Observation Table (5 Readings) */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8DF] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#17231B] text-[11px] uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#17231B]" />
                  <span>V-I Observation Table</span>
                </span>
                <span className="text-[10px] font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-1.5 py-0.5 rounded">Slope = R</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#E2E8DF]">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-[#F4F7F2] text-[#647067] border-b border-[#E2E8DF]">
                    <tr>
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">V (Volts)</th>
                      <th className="p-1.5">I (mA)</th>
                      <th className="p-1.5 text-[#17231B] font-bold">R = V/I (Ω)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8DF]">
                    {readings.map((r) => (
                      <tr key={r.sNo} className="hover:bg-[#F4F7F2]">
                        <td className="p-1.5 text-[#647067]">{r.sNo}</td>
                        <td className="p-1.5 font-bold text-[#17231B]">{r.voltageV.toFixed(2)}</td>
                        <td className="p-1.5 text-[#647067]">{r.currentMA.toFixed(1)}</td>
                        <td className="p-1.5 font-bold text-[#17231B]">{r.resistanceCalculated.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-[#647067] italic">
                Mean Resistance: {calc.circuitResistance.toFixed(2)} Ω • Straight line V-I graph confirms Ohm&apos;s Law.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
