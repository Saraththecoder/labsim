'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  FlaskConical,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { WebXRConductivityBench } from '@/components/WebXRConductivityBench';
import {
  ConductivityCellState,
  SOLUTIONS_DATABASE,
} from '@/lib/conductivityPhysics';

export default function ConductivityARPage() {
  const [state, setState] = useState<ConductivityCellState>({
    solutionId: 'nacl',
    concentration: 0.1,
    temperature: 25,
    electrodeDistance: 2.0,
    electrodeArea: 4.0,
    appliedVoltage: 6.0,
    isPowerOn: true,
  });

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
            <span>WebXR Augmented Reality Mode</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal text-[#17231B] tracking-tight font-serif">
            AR Electrochemical Conductivity Lab
          </h1>
          <p className="text-sm text-[#647067] max-w-2xl leading-relaxed">
            Project an authentic 250ml laboratory beaker, platinum electrodes, variable power supply, and glowing circuit bulb onto your physical desk.
          </p>
        </div>

        <Link
          href="/conductivity/lab"
          className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-2"
        >
          <FlaskConical className="w-4 h-4 text-[#17231B]" />
          <span>Switch to 3D Virtual Cell</span>
        </Link>
      </div>

      <WebXRConductivityBench state={state} onStateChange={setState} />

      {/* AR Reagent & Voltage Control Bar */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center justify-between">
          <span>AR Apparatus Real-Time Settings</span>
          <span className="text-xs font-bold text-[#17231B] font-mono bg-[#B8D96B]/30 px-2 py-0.5 rounded">Live Sync</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <label className="text-[#17231B] font-semibold block">Select Electrolyte Solution:</label>
            <select
              value={state.solutionId}
              onChange={(e) => setState((p) => ({ ...p, solutionId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-semibold cursor-pointer"
            >
              {SOLUTIONS_DATABASE.map((sol) => (
                <option key={sol.id} value={sol.id}>
                  {sol.name} ({sol.formula})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#17231B] font-semibold">Concentration:</span>
              <span className="font-mono text-[#17231B] font-bold">{state.concentration} M</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="1.0"
              step="0.01"
              value={state.concentration}
              onChange={(e) => setState((p) => ({ ...p, concentration: Number(e.target.value) }))}
              className="w-full accent-[#B8D96B] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#17231B] font-semibold">Applied Voltage:</span>
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
        </div>
      </div>
    </div>
  );
}
