'use client';

import React, { useState } from 'react';
import { ConductivityObservation } from '@/lib/conductivityTypes';

interface ConductivityGraphProps {
  observations: ConductivityObservation[];
  className?: string;
}

export function ConductivityGraph({ observations, className = '' }: ConductivityGraphProps) {
  const [graphType, setGraphType] = useState<'lambda-vs-sqrtc' | 'kappa-vs-c'>('lambda-vs-sqrtc');

  const width = 640;
  const height = 360;
  const padLeft = 65;
  const padBottom = 55;
  const padTop = 30;
  const padRight = 30;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const isLambdaPlot = graphType === 'lambda-vs-sqrtc';

  // Scales for Lambda_m vs sqrt(C)
  // sqrt(C) from 0 to 1.0 (since C is 0 to 1.0 M)
  // Lambda_m from 0 to 450 S cm^2 mol^-1
  const maxSqrtC = 1.0;
  const maxLambda = 450;

  const toLambdaX = (sqrtC: number) => padLeft + (sqrtC / maxSqrtC) * plotW;
  const toLambdaY = (lambda: number) => padTop + plotH - (lambda / maxLambda) * plotH;

  // Theoretical curves:
  // 1. Strong Electrolyte (HCl): Lambda_m = 426 - 60 * sqrt(C)
  const hclPts: { x: number; y: number }[] = [];
  for (let sc = 0; sc <= 1.0; sc += 0.05) {
    hclPts.push({ x: toLambdaX(sc), y: toLambdaY(425.9 - 70 * sc) });
  }
  const hclPath = hclPts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  // 2. Strong Electrolyte (NaCl): Lambda_m = 126.4 - 50 * sqrt(C)
  const naclPts: { x: number; y: number }[] = [];
  for (let sc = 0; sc <= 1.0; sc += 0.05) {
    naclPts.push({ x: toLambdaX(sc), y: toLambdaY(126.4 - 45 * sc) });
  }
  const naclPath = naclPts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  // 3. Weak Electrolyte (CH3COOH): Curves steeply upward as sqrt(C) -> 0
  const ch3coohPts: { x: number; y: number }[] = [];
  for (let sc = 0.02; sc <= 1.0; sc += 0.02) {
    const C = sc * sc;
    const Ka = 1.8e-5;
    const alpha = (-Ka + Math.sqrt(Ka * Ka + 4 * C * Ka)) / (2 * C);
    const lam = alpha * 390.5;
    ch3coohPts.push({ x: toLambdaX(sc), y: toLambdaY(Math.min(maxLambda, lam)) });
  }
  const ch3coohPath = ch3coohPts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  // Scales for kappa vs C
  // C from 0 to 1.0 M
  // kappa from 0 to 50 mS/cm
  const maxC = 1.0;
  const maxKappa = 50;
  const toKappaX = (c: number) => padLeft + (c / maxC) * plotW;
  const toKappaY = (k: number) => padTop + plotH - (k / maxKappa) * plotH;

  return (
    <div className={`p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>
              {isLambdaPlot
                ? 'Debye-Hückel-Onsager Plot: Molar Conductivity (Λₘ) vs √C'
                : 'Specific Conductivity (κ) vs Concentration (C)'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              {isLambdaPlot ? 'Kohlrausch Law' : 'Ionic Concentration'}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            {isLambdaPlot
              ? 'Demonstrates linear extrapolation for strong electrolytes and steep curvature for weak electrolytes.'
              : 'Shows how specific conductivity increases with ionic population density.'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setGraphType('lambda-vs-sqrtc')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              isLambdaPlot ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Λₘ vs √C (Onsager)
          </button>
          <button
            onClick={() => setGraphType('kappa-vs-c')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              !isLambdaPlot ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            κ vs C
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none min-w-[500px]">
          {isLambdaPlot ? (
            /* DEBYE-HUCKEL-ONSAGER PLOT */
            <g>
              {/* Grid lines */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((sc) => {
                const x = toLambdaX(sc);
                return (
                  <g key={sc}>
                    <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={x} y={padTop + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {sc.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {[100, 200, 300, 400].map((lam) => {
                const y = toLambdaY(lam);
                return (
                  <g key={lam}>
                    <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {lam}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />

              <text x={padLeft + plotW / 2} y={padTop + plotH + 38} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                √C (mol¹/² · L⁻¹/²) →
              </text>
              <text x={-(padTop + plotH / 2)} y={18} transform="rotate(-90)" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Molar Cond. Λₘ (S · cm² · mol⁻¹) →
              </text>

              {/* Theoretical curves */}
              <path d={hclPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              <text x={toLambdaX(0.85)} y={toLambdaY(350)} fill="#f59e0b" fontSize="10" fontWeight="bold">
                HCl (Strong)
              </text>

              <path d={naclPath} fill="none" stroke="#00f0ff" strokeWidth="2.5" />
              <text x={toLambdaX(0.85)} y={toLambdaY(90)} fill="#00f0ff" fontSize="10" fontWeight="bold">
                NaCl (Strong)
              </text>

              <path d={ch3coohPath} fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="3 2" />
              <text x={toLambdaX(0.35)} y={toLambdaY(60)} fill="#eab308" fontSize="10" fontWeight="bold">
                CH₃COOH (Weak)
              </text>

              {/* Intercepts Λm0 */}
              <circle cx={padLeft} cy={toLambdaY(425.9)} r="4" fill="#f59e0b" />
              <text x={padLeft + 8} y={toLambdaY(425.9) + 4} fill="#f59e0b" fontSize="9" fontWeight="bold">
                Λ° = 425.9
              </text>

              <circle cx={padLeft} cy={toLambdaY(126.4)} r="4" fill="#00f0ff" />
              <text x={padLeft + 8} y={toLambdaY(126.4) + 4} fill="#00f0ff" fontSize="9" fontWeight="bold">
                Λ° = 126.4
              </text>

              {/* Observed Points */}
              {observations.map((obs) => {
                const sc = Math.sqrt(obs.concentration);
                if (sc > maxSqrtC || obs.molarConductivity > maxLambda) return null;
                const sx = toLambdaX(sc);
                const sy = toLambdaY(obs.molarConductivity);
                return (
                  <g key={obs.id}>
                    <circle cx={sx} cy={sy} r="4.5" fill="#34d399" stroke="#064e3b" strokeWidth="1.5" />
                    <text x={sx} y={sy - 7} textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                      #{obs.serialNumber}
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            /* KAPPA VS C PLOT */
            <g>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((c) => {
                const x = toKappaX(c);
                return (
                  <g key={c}>
                    <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={x} y={padTop + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {c.toFixed(1)}
                    </text>
                  </g>
                );
              })}
              {[10, 20, 30, 40, 50].map((k) => {
                const y = toKappaY(k);
                return (
                  <g key={k}>
                    <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {k}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />

              <text x={padLeft + plotW / 2} y={padTop + plotH + 38} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Concentration C (mol · L⁻¹) →
              </text>
              <text x={-(padTop + plotH / 2)} y={18} transform="rotate(-90)" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Specific Cond. κ (mS · cm⁻¹) →
              </text>

              {/* Observed Points */}
              {observations.map((obs) => {
                if (obs.concentration > maxC || obs.specificConductivity_mS_cm > maxKappa) return null;
                const sx = toKappaX(obs.concentration);
                const sy = toKappaY(obs.specificConductivity_mS_cm);
                return (
                  <g key={obs.id}>
                    <circle cx={sx} cy={sy} r="4.5" fill="#34d399" stroke="#064e3b" strokeWidth="1.5" />
                    <text x={sx} y={sy - 7} textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                      #{obs.serialNumber}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <p>Green dots represent your logged experimental beaker observations ({observations.length} readings).</p>
        <p className="font-mono text-cyan-300">Debye-Hückel-Onsager: Λₘ = Λₘ° - B√C</p>
      </div>
    </div>
  );
}
