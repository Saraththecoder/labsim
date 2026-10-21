'use client';

import React, { useState } from 'react';
import { LabObservation } from '@/lib/types';

interface OpticsGraphProps {
  observations: LabObservation[];
  focalLength?: number;
  className?: string;
}

export function OpticsGraph({
  observations,
  focalLength = 15,
  className = '',
}: OpticsGraphProps) {
  const [graphType, setGraphType] = useState<'v-vs-u' | 'inv-v-vs-inv-u'>('v-vs-u');

  const width = 640;
  const height = 360;
  const padLeft = 65;
  const padBottom = 55;
  const padTop = 30;
  const padRight = 30;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const isHyperbola = graphType === 'v-vs-u';

  // Constants for Hyperbola (v vs u)
  const minU = 15;
  const maxU = 65;
  const minV = 15;
  const maxV = 80;

  const toSvgX = (u: number) => padLeft + ((u - minU) / (maxU - minU)) * plotW;
  const toSvgY = (v: number) => padTop + plotH - ((v - minV) / (maxV - minV)) * plotH;

  const curvePoints: { u: number; v: number }[] = [];
  if (isHyperbola) {
    for (let u = minU + 1; u <= maxU; u += 0.5) {
      if (u > focalLength + 1) {
        const v = (u * focalLength) / (u - focalLength);
        if (v >= minV && v <= maxV) {
          curvePoints.push({ u, v });
        }
      }
    }
  }

  const pathD = curvePoints.reduce((acc, pt, idx) => {
    const sx = toSvgX(pt.u);
    const sy = toSvgY(pt.v);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  }, '');

  // Constants for 1/v vs 1/u (Straight line)
  const minInv = 0.01;
  const maxInv = 0.08;

  const toInvX = (invU: number) => padLeft + ((invU - minInv) / (maxInv - minInv)) * plotW;
  const toInvY = (invV: number) => padTop + plotH - ((invV - minInv) / (maxInv - minInv)) * plotH;
  const theoreticalInvF = 1 / focalLength;

  return (
    <div className={`p-4 rounded-xl bg-[#090e1a] border border-slate-800 space-y-4 ${className}`}>
      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>
              {isHyperbola
                ? 'Graph Analysis: Image Distance (v) vs Object Distance (u)'
                : 'Linear Analysis: 1/v vs 1/u Plot'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              {isHyperbola ? `f = ${focalLength} cm` : `Intercept = ${(1 / focalLength).toFixed(4)} cm⁻¹`}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            {isHyperbola
              ? 'Rectangular hyperbola showing reciprocal relationship between u and v'
              : 'Straight line plot verifying the thin lens equation: 1/v - 1/u = 1/f'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setGraphType('v-vs-u')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              isHyperbola ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            v vs u (Hyperbola)
          </button>
          <button
            onClick={() => setGraphType('inv-v-vs-inv-u')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              !isHyperbola ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            1/v vs 1/u (Straight Line)
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none min-w-[500px]">
          {isHyperbola ? (
            /* HYPERBOLA (v vs u) */
            <g>
              {/* Grid lines */}
              {[20, 30, 40, 50, 60].map((u) => {
                const x = toSvgX(u);
                return (
                  <g key={u}>
                    <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={x} y={padTop + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {u}
                    </text>
                  </g>
                );
              })}
              {[20, 30, 40, 50, 60, 70].map((v) => {
                const y = toSvgY(v);
                return (
                  <g key={v}>
                    <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {v}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />

              <text x={padLeft + plotW / 2} y={padTop + plotH + 38} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Object Distance u (cm) →
              </text>
              <text
                x={-(padTop + plotH / 2)}
                y={20}
                transform="rotate(-90)"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="bold"
              >
                Image Distance v (cm) →
              </text>

              {/* Symmetry point (2f, 2f) */}
              {focalLength * 2 <= maxU && (
                <g>
                  <circle cx={toSvgX(2 * focalLength)} cy={toSvgY(2 * focalLength)} r="5" fill="#f59e0b" />
                  <line
                    x1={toSvgX(2 * focalLength)}
                    y1={padTop + plotH}
                    x2={toSvgX(2 * focalLength)}
                    y2={toSvgY(2 * focalLength)}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={padLeft}
                    y1={toSvgY(2 * focalLength)}
                    x2={toSvgX(2 * focalLength)}
                    y2={toSvgY(2 * focalLength)}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={toSvgX(2 * focalLength) + 8}
                    y={toSvgY(2 * focalLength) - 8}
                    fill="#fbbf24"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    (2f, 2f) = ({2 * focalLength}, {2 * focalLength})
                  </text>
                </g>
              )}

              {/* Theoretical curve */}
              {pathD && <path d={pathD} fill="none" stroke="#00f0ff" strokeWidth="2.5" opacity="0.8" />}

              {/* Observed Points */}
              {observations.map((obs) => {
                if (obs.u < minU || obs.u > maxU || obs.v < minV || obs.v > maxV) return null;
                const sx = toSvgX(obs.u);
                const sy = toSvgY(obs.v);

                return (
                  <g key={obs.id}>
                    <circle cx={sx} cy={sy} r="4.5" fill="#34d399" stroke="#064e3b" strokeWidth="1.5" />
                    <text x={sx} y={sy - 8} textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                      #{obs.serialNumber}
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            /* STRAIGHT LINE (1/v vs 1/u) */
            <g>
              {/* Grid lines */}
              {[0.02, 0.03, 0.04, 0.05, 0.06, 0.07].map((val) => {
                const x = toInvX(val);
                const y = toInvY(val);
                return (
                  <g key={val}>
                    <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={x} y={padTop + plotH + 18} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {val.toFixed(2)}
                    </text>
                    <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#475569" strokeWidth="2" />

              <text x={padLeft + plotW / 2} y={padTop + plotH + 38} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                1/u (cm⁻¹) →
              </text>
              <text
                x={-(padTop + plotH / 2)}
                y={18}
                transform="rotate(-90)"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="bold"
              >
                1/v (cm⁻¹) →
              </text>

              {/* Theoretical line */}
              <line
                x1={toInvX(0.015)}
                y1={toInvY(theoreticalInvF - 0.015)}
                x2={toInvX(theoreticalInvF - 0.015)}
                y2={toInvY(0.015)}
                stroke="#00f0ff"
                strokeWidth="2.5"
                opacity="0.85"
              />

              {/* Intercept marker */}
              <circle cx={padLeft} cy={toInvY(theoreticalInvF)} r="5" fill="#f59e0b" />
              <text x={padLeft + 10} y={toInvY(theoreticalInvF) - 5} fill="#fbbf24" fontSize="10" fontWeight="bold">
                1/f Intercept ({theoreticalInvF.toFixed(4)})
              </text>

              {/* Observed Points */}
              {observations.map((obs) => {
                const invU = 1 / obs.u;
                const invV = 1 / obs.v;
                if (invU < minInv || invU > maxInv || invV < minInv || invV > maxInv) return null;
                const sx = toInvX(invU);
                const sy = toInvY(invV);

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

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        {isHyperbola ? (
          <>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400"></span>
                <span>Theoretical Curve: v = uf/(u-f)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Your Lab Measurements ({observations.length} points)</span>
              </div>
            </div>
            <p className="font-mono text-cyan-300">Point of intersection (2f, 2f) gives f = u/2 = v/2</p>
          </>
        ) : (
          <>
            <p>The reciprocal of the intercept on either axis gives the focal length: f = 1 / intercept.</p>
            <p className="font-mono text-emerald-400">
              Calculated f = (1 / {theoreticalInvF.toFixed(4)}) = {focalLength.toFixed(1)} cm
            </p>
          </>
        )}
      </div>
    </div>
  );
}
