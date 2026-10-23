'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Droplets,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  TableProperties,
  Info,
  Beaker,
  TestTube,
} from 'lucide-react';
import {
  CHEMICAL_SOLUTIONS,
  INDICATORS,
  PH_CHART_SCALE,
  ChemicalSolution,
} from '@/lib/chemistryData';
import { LabSimAssistant, AssistantIssue } from '@/components/LabSimAssistant';

interface ObservationRecord {
  solutionId: string;
  solutionName: string;
  indicatorId: string;
  observedColor: string;
  deducedPh: number;
  inferredNature: string;
}

export default function PhIndicatorsPage() {
  const [selectedSolution, setSelectedSolution] = useState<ChemicalSolution>(CHEMICAL_SOLUTIONS[0]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('universal');
  const [pipetteFilledWith, setPipetteFilledWith] = useState<ChemicalSolution | null>(null);
  const [testedWells, setTestedWells] = useState<Record<string, { color: string; ph: number; label: string }>>({});
  const [records, setRecords] = useState<ObservationRecord[]>([]);
  const [labbyIssue, setLabbyIssue] = useState<AssistantIssue | null>(null);

  // Trigger drop of liquid from pipette onto spotting tile
  const handleDispenseDroplet = (sol: ChemicalSolution) => {
    let resultColor = '#e2e8f0';
    let resultLabel = '';

    if (selectedIndicator === 'universal') {
      resultColor = sol.universalColor;
      resultLabel = `pH ~ ${sol.ph.toFixed(1)}`;
    } else if (selectedIndicator === 'red-litmus') {
      resultColor = sol.redLitmusResult === 'blue' ? '#2563eb' : '#dc2626';
      resultLabel = sol.redLitmusResult === 'blue' ? 'Turned Blue (Base)' : 'Remains Red (Acid/Neutral)';
    } else if (selectedIndicator === 'blue-litmus') {
      resultColor = sol.blueLitmusResult === 'red' ? '#dc2626' : '#2563eb';
      resultLabel = sol.blueLitmusResult === 'red' ? 'Turned Red (Acid)' : 'Remains Blue (Base/Neutral)';
    } else if (selectedIndicator === 'phenolphthalein') {
      resultColor = sol.phenolphthaleinResult === 'pink' ? '#ec4899' : 'rgba(255,255,255,0.7)';
      resultLabel = sol.phenolphthaleinResult === 'pink' ? 'Magenta Pink (Base)' : 'Colorless (Acid/Neutral)';
    } else if (selectedIndicator === 'methyl-orange') {
      resultColor = sol.methylOrangeResult === 'red' ? '#ef4444' : '#eab308';
      resultLabel = sol.methylOrangeResult === 'red' ? 'Red-Pink (Acid)' : 'Yellow (Base/Neutral)';
    }

    setTestedWells((prev) => ({
      ...prev,
      [sol.id]: { color: resultColor, ph: sol.ph, label: resultLabel },
    }));

    // Add to records if not duplicate
    if (!records.some((r) => r.solutionId === sol.id && r.indicatorId === selectedIndicator)) {
      let nature = 'Neutral';
      if (sol.ph < 3) nature = 'Strong Acid';
      else if (sol.ph < 7) nature = 'Weak Acid';
      else if (sol.ph === 7) nature = 'Neutral (Pure Water)';
      else if (sol.ph < 11) nature = 'Weak Base';
      else nature = 'Strong Base';

      setRecords((prev) => [
        ...prev,
        {
          solutionId: sol.id,
          solutionName: sol.name,
          indicatorId: selectedIndicator,
          observedColor: resultColor,
          deducedPh: sol.ph,
          inferredNature: nature,
        },
      ]);
    }
  };

  const handleResetTile = () => {
    setTestedWells({});
    setPipetteFilledWith(null);
  };

  const triggerLabbyTip = () => {
    setLabbyIssue({
      id: `labby-chem-${Date.now()}`,
      experimentId: 'ph-indicators',
      severity: 'info',
      title: 'Labby pH Indicator Pro-Tip',
      message: 'Universal indicator is a mixture of several organic dyes! Unlike simple litmus which only tells if a liquid is acidic or basic, universal indicator reveals the exact hydronium ion concentration [H+] on the pH scale from 1 to 14.',
      suggestedActionLabel: 'Test Strong Acid (HCl) vs Strong Base (NaOH)',
      onApplyFix: () => {
        handleDispenseDroplet(CHEMICAL_SOLUTIONS[0]);
        handleDispenseDroplet(CHEMICAL_SOLUTIONS[5]);
      },
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
              <span>Acid-Base & pH Indicators Lab</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/60">
                NCERT Exp 2
              </span>
            </h1>
            <p className="text-[11px] text-[#647067] hidden sm:block">
              Study the pH of sample solutions using Universal Indicator, Litmus Paper & Colorimetric Indicators
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
            onClick={handleResetTile}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm cursor-pointer"
            title="Clean Spotting Tile"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicator Selection Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {INDICATORS.map((ind) => (
          <button
            key={ind.id}
            onClick={() => setSelectedIndicator(ind.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
              selectedIndicator === ind.id
                ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                : 'bg-[#FFFFFF] text-[#647067] border-[#E2E8DF] hover:text-[#17231B] hover:bg-[#F4F7F2]'
            }`}
          >
            <span>{ind.type === 'paper' ? '📜' : '🧪'}</span>
            <span>{ind.name}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Ceramic Lab Bench & Spotting Tile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Reagent Bottles Rack */}
        <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-[#17231B]" />
              <span>Chemical Reagents</span>
            </span>
            <span className="text-[10px] text-[#647067]">Tap to Select</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CHEMICAL_SOLUTIONS.map((sol) => (
              <button
                key={sol.id}
                onClick={() => {
                  setSelectedSolution(sol);
                  setPipetteFilledWith(sol);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                  selectedSolution.id === sol.id
                    ? 'bg-[#B8D96B]/15 border-[#B8D96B] ring-1 ring-[#B8D96B]'
                    : 'bg-[#F4F7F2] border-[#E2E8DF] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#17231B]">{sol.formula}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: sol.universalColor }}
                    title={`pH ~ ${sol.ph}`}
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-[#17231B] line-clamp-1 block leading-tight">
                    {sol.name}
                  </span>
                  <span className="text-[9px] text-[#647067] uppercase font-mono block">
                    pH {sol.ph}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-[#F4F7F2] rounded-2xl border border-[#E2E8DF] text-xs space-y-1">
            <span className="font-bold text-[#17231B] block">Selected: {selectedSolution.name}</span>
            <p className="text-[11px] text-[#647067] leading-relaxed">
              {selectedSolution.description}
            </p>
          </div>
        </div>

        {/* Center: Spotting Tile (6 Wells) */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8D96B] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#17231B]">
                Ceramic Spotting Tile • Test Wells
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#647067]">
              Current Indicator: <strong className="text-[#17231B]">{INDICATORS.find((i) => i.id === selectedIndicator)?.name}</strong>
            </span>
          </div>

          {/* 6 Ceramic Depressions Tile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
            {CHEMICAL_SOLUTIONS.map((sol) => {
              const tested = testedWells[sol.id];
              return (
                <div
                  key={sol.id}
                  className="p-4 rounded-3xl bg-[#F8FAF6] border-2 border-[#E2E8DF] flex flex-col items-center justify-center space-y-2 relative group hover:border-[#B8D96B] transition-all"
                >
                  <span className="text-[10px] font-bold text-[#647067] uppercase tracking-wide">
                    {sol.name}
                  </span>

                  {/* Liquid Well Depression */}
                  <div
                    onClick={() => handleDispenseDroplet(sol)}
                    className="w-20 h-20 rounded-full border-4 border-[#E2E8DF] shadow-inner flex items-center justify-center cursor-pointer transition-transform transform active:scale-95 relative overflow-hidden"
                    style={{
                      backgroundColor: tested ? tested.color : '#FFFFFF',
                      boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.15)',
                    }}
                    title={`Click to drop ${selectedSolution.name}`}
                  >
                    {tested ? (
                      <div className="text-center p-1">
                        <span className="text-[11px] font-bold font-mono text-[#17231B] bg-white/80 px-1 py-0.5 rounded shadow-xs">
                          {tested.ph ? `pH ${tested.ph}` : 'Tested'}
                        </span>
                      </div>
                    ) : (
                      <Droplets className="w-6 h-6 text-[#647067]/40" />
                    )}
                  </div>

                  <button
                    onClick={() => handleDispenseDroplet(sol)}
                    className="px-2.5 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#B8D96B] text-[10px] font-bold text-[#17231B] border border-[#E2E8DF] transition-all shadow-xs cursor-pointer"
                  >
                    Drop {sol.formula}
                  </button>
                </div>
              );
            })}
          </div>

          {/* NCERT Standard pH Reference Scale (1 to 14) */}
          <div className="space-y-1.5 pt-2 border-t border-[#E2E8DF]">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#647067]">
              <span>Strong Acid (pH 1)</span>
              <span>Neutral (pH 7)</span>
              <span>Strong Base (pH 14)</span>
            </div>
            <div className="grid grid-cols-14 h-4 rounded-full overflow-hidden border border-[#E2E8DF] shadow-xs">
              {PH_CHART_SCALE.map((p) => (
                <div
                  key={p.ph}
                  style={{ backgroundColor: p.color }}
                  className="flex items-center justify-center text-[8px] font-mono text-white font-bold opacity-90 hover:opacity-100 transition-opacity"
                  title={`pH ${p.ph}: ${p.label}`}
                >
                  {p.ph}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Table of Conducted Tests */}
      {records.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#17231B] flex items-center gap-1.5">
              <TableProperties className="w-4 h-4 text-[#17231B]" />
              <span>Practical Observation Log ({records.length} Tests Logged)</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F7F2] text-[#17231B] border-b border-[#E2E8DF] font-bold">
                  <th className="p-2.5">Sample Solution</th>
                  <th className="p-2.5">Indicator Tested</th>
                  <th className="p-2.5">Color Observed</th>
                  <th className="p-2.5">Approx. pH</th>
                  <th className="p-2.5">Inferred Chemical Nature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8DF] font-mono">
                {records.map((rec, i) => (
                  <tr key={i} className="hover:bg-[#F8FAF6]">
                    <td className="p-2.5 font-bold text-[#17231B]">{rec.solutionName}</td>
                    <td className="p-2.5 text-[#647067]">{rec.indicatorId}</td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: rec.observedColor }}
                        />
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-[#17231B]">{rec.deducedPh}</td>
                    <td className="p-2.5 font-bold text-[#17231B]">{rec.inferredNature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Labby Mascot */}
      <LabSimAssistant currentIssue={labbyIssue} onDismiss={() => setLabbyIssue(null)} />
    </div>
  );
}
