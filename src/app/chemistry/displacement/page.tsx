'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TestTube,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  TableProperties,
  Info,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { calculateDisplacement } from '@/lib/chemistryData';
import { LabSimAssistant, AssistantIssue } from '@/components/LabSimAssistant';

export default function DisplacementPage() {
  const [reactionTime, setReactionTime] = useState<number>(0); // 0 to 30 mins
  const [nailSubmerged, setNailSubmerged] = useState<boolean>(true);
  const [labbyIssue, setLabbyIssue] = useState<AssistantIssue | null>(null);

  const disp = calculateDisplacement(reactionTime);

  const triggerLabbyTip = () => {
    setLabbyIssue({
      id: `labby-disp-${Date.now()}`,
      experimentId: 'displacement',
      severity: 'info',
      title: 'Displacement Reaction Pro-Tip',
      message: 'Iron is higher than Copper in the Metal Reactivity Series! Iron displaces copper ions from CuSO₄ to form pale green FeSO₄, and the displaced copper deposits as a reddish-brown crust on the nail.',
      suggestedActionLabel: 'Advance to 25 Minutes (Full Reaction)',
      onApplyFix: () => setReactionTime(25),
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/chemistry"
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#17231B] tracking-tight flex items-center gap-2">
              <span>Displacement Reaction Simulation</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/60">
                NCERT Exp 3
              </span>
            </h1>
            <p className="text-[11px] text-[#647067] hidden sm:block">
              Reaction of Iron Nails with Copper Sulphate Solution: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerLabbyTip}
            className="px-3 py-1.5 rounded-full bg-[#B8D96B]/20 hover:bg-[#B8D96B]/40 border border-[#B8D96B] flex items-center gap-1.5 text-xs font-bold text-[#17231B] shadow-xs cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
            <span>Ask Labby</span>
          </button>
          <button
            onClick={() => setReactionTime(0)}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm cursor-pointer"
            title="Reset Experiment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dual Test-Tube Laboratory Stand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Lab Apparatus Setup */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex justify-between items-center text-xs font-bold text-[#17231B] border-b border-[#E2E8DF] pb-2">
            <span>Dual Test Tube Stand (A & B)</span>
            <span className="font-mono text-[#647067]">Reaction Time: {reactionTime} min</span>
          </div>

          {/* Test Tubes Visual Comparison */}
          <div className="flex items-end justify-center gap-12 sm:gap-16 py-6">
            {/* Test Tube A (Control) */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[11px] font-bold text-[#17231B]">Tube A (Control)</span>
              <div className="w-14 h-64 rounded-b-full border-4 border-slate-300 bg-white/70 shadow-lg relative overflow-hidden flex flex-col justify-end p-1">
                {/* Fixed Deep Blue CuSO4 liquid */}
                <div
                  className="w-full rounded-b-full transition-colors duration-500"
                  style={{ height: '70%', backgroundColor: 'rgb(30, 144, 255)' }}
                >
                  <div className="text-[9px] text-white/90 text-center pt-2 font-mono font-bold">CuSO₄</div>
                </div>
              </div>
              <span className="text-[10px] text-[#647067] font-mono">Original Azure Blue</span>
            </div>

            {/* Test Tube B (Experimental Reaction) */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-[11px] font-bold text-[#17231B]">Tube B (With Iron Nail)</span>
              <div className="w-14 h-64 rounded-b-full border-4 border-slate-300 bg-white/70 shadow-lg relative overflow-hidden flex flex-col justify-end p-1">
                {/* Suspended Thread */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-amber-800/60 z-10" />

                {/* Suspended Iron Nail with Copper Deposition */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-3.5 h-28 rounded-b-sm border border-slate-600 shadow-md z-20 transition-all duration-300"
                  style={{
                    top: '65px',
                    backgroundColor: `rgb(${Math.round(100 + disp.fraction * 80)}, ${Math.round(110 - disp.fraction * 60)}, ${Math.round(120 - disp.fraction * 80)})`,
                    boxShadow: disp.fraction > 0.1 ? `0 0 8px rgba(180, 83, 9, ${disp.copperCoatingOpacity})` : 'none',
                  }}
                  title="Iron nail with reddish-brown copper deposit"
                />

                {/* Color-changing Solution */}
                <div
                  className="w-full rounded-b-full transition-colors duration-700"
                  style={{ height: '70%', backgroundColor: disp.solutionColor }}
                >
                  <div className="text-[9px] text-[#17231B] text-center pt-2 font-mono font-bold">
                    {reactionTime > 15 ? 'FeSO₄' : 'Reacting'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#647067] font-mono">
                {reactionTime > 20 ? 'Pale Green (FeSO₄)' : 'Turning Green'}
              </span>
            </div>
          </div>

          {/* Real-time Reaction Slider */}
          <div className="w-full space-y-2 bg-[#F4F7F2] p-3.5 rounded-2xl border border-[#E2E8DF]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#17231B]" />
                <span>Elapsed Reaction Duration</span>
              </span>
              <span className="font-mono font-bold text-[#17231B] bg-white px-2 py-0.5 rounded border border-[#E2E8DF]">
                {reactionTime} Minutes
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={reactionTime}
              onChange={(e) => setReactionTime(Number(e.target.value))}
              className="w-full accent-[#B8D96B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#647067] font-mono">
              <span>0 min (Initial)</span>
              <span>15 min (Intermediate)</span>
              <span>30 min (Complete)</span>
            </div>
          </div>
        </div>

        {/* Right: Chemical Equation, Observations & Temperature */}
        <div className="space-y-4">
          {/* Reaction Equation Box */}
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231B]">
              Balanced Chemical Reaction
            </h3>
            <div className="p-3 bg-[#F4F7F2] rounded-2xl border border-[#E2E8DF] font-mono text-center text-xs sm:text-sm font-bold text-[#17231B]">
              Fe (s) + CuSO₄ (aq) → FeSO₄ (aq) + Cu (s)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#647067]">
              <div className="p-2 rounded-xl bg-[#F8FAF6] border border-[#E2E8DF]">
                <strong className="text-[#17231B] block">Iron Nail (Fe):</strong>
                Silver-grey metal, active reducing agent.
              </div>
              <div className="p-2 rounded-xl bg-[#F8FAF6] border border-[#E2E8DF]">
                <strong className="text-[#17231B] block">Copper Sulphate (CuSO₄):</strong>
                Hydrated azure blue crystal solution.
              </div>
            </div>
          </div>

          {/* Live Sensor Metrics */}
          <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17231B]">
              Live Physical Observations
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DF]">
                <span className="text-[10px] text-[#647067] font-bold block">Solution Color:</span>
                <span className="font-bold text-[#17231B] text-xs">
                  {reactionTime === 0
                    ? 'Brilliant Azure Blue'
                    : reactionTime < 18
                    ? 'Greenish-Blue Tint'
                    : 'Pale Light Green'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DF]">
                <span className="text-[10px] text-[#647067] font-bold block">Iron Nail Surface:</span>
                <span className="font-bold text-[#17231B] text-xs">
                  {reactionTime === 0
                    ? 'Clean Silver-Grey Metal'
                    : `Reddish-Brown Copper (${(disp.fraction * 100).toFixed(0)}%)`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DF]">
                <span className="text-[10px] text-[#647067] font-bold block">Exothermic Temp:</span>
                <span className="font-bold text-[#17231B] text-xs font-mono">{disp.tempRise} °C</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DF]">
                <span className="text-[10px] text-[#647067] font-bold block">Reaction Progress:</span>
                <span className="font-bold text-[#17231B] text-xs font-mono">
                  {(disp.fraction * 100).toFixed(0)}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Metal Reactivity Series Card */}
          <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md text-xs space-y-2">
            <span className="font-bold text-[#17231B] block">Reactivity Series Deductions:</span>
            <p className="text-[11px] text-[#647067] leading-relaxed">
              Because <strong>Iron (Fe)</strong> is positioned above <strong>Copper (Cu)</strong> in the reactivity series, Fe readily donates electrons to reduce Cu²⁺ ions to solid copper metal:
            </p>
            <div className="p-2 bg-[#F4F7F2] rounded-xl font-mono text-[11px] text-[#17231B] text-center font-bold">
              K &gt; Na &gt; Ca &gt; Mg &gt; Al &gt; Zn &gt; <strong className="text-emerald-700 underline">Fe</strong> &gt; Pb &gt; [H] &gt; <strong className="text-amber-700 underline">Cu</strong> &gt; Ag &gt; Au
            </div>
          </div>
        </div>
      </div>

      {/* Labby Assistant */}
      <LabSimAssistant currentIssue={labbyIssue} onDismiss={() => setLabbyIssue(null)} />
    </div>
  );
}
