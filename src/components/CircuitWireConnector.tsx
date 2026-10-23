'use client';

import React from 'react';

interface CircuitWireConnectorProps {
  isFlowing: boolean;
  current: number;
  color?: 'red' | 'black' | 'blue' | 'yellow';
  label?: string;
  className?: string;
}

export function CircuitWireConnector({
  isFlowing,
  current,
  color = 'red',
  label,
  className = '',
}: CircuitWireConnectorProps) {
  // Speed scales with current: higher current = faster electron flow
  const durationSec = Math.max(0.4, Math.min(2.5, 1.2 / (current > 0.01 ? current * 2.5 : 0.5)));

  const wireColors = {
    red: { jacket: '#ef4444', core: '#b91c1c', glow: 'rgba(239, 68, 68, 0.4)' },
    black: { jacket: '#334155', core: '#0f172a', glow: 'rgba(51, 65, 85, 0.4)' },
    blue: { jacket: '#3b82f6', core: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.4)' },
    yellow: { jacket: '#eab308', core: '#a16207', glow: 'rgba(234, 179, 8, 0.4)' },
  };

  const c = wireColors[color] || wireColors.red;

  return (
    <div className={`flex flex-col items-center justify-center shrink-0 select-none py-2 px-1 ${className}`}>
      {/* SVG Connecting Wire with Terminal Clips */}
      <svg viewBox="0 0 70 36" className="w-14 sm:w-16 h-9 overflow-visible">
        <defs>
          <linearGradient id={`wireGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor={c.jacket} />
            <stop offset="75%" stopColor={c.jacket} />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Glowing Electron Particle Filter */}
          <filter id="electronGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Left Banana Plug Terminal Clip */}
        <rect x="0" y="14" width="8" height="8" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
        <circle cx="4" cy="18" r="2.5" fill="#fde047" />

        {/* Thick Rubber Insulated Jumper Cable Path */}
        <path
          d="M 6,18 C 22,2 48,34 64,18"
          fill="none"
          stroke={`url(#wireGrad-${color})`}
          strokeWidth="5"
          strokeLinecap="round"
          style={{
            filter: isFlowing ? `drop-shadow(0 0 4px ${c.glow})` : 'none',
          }}
        />

        {/* Inner Core Highlighting */}
        <path
          d="M 6,18 C 22,2 48,34 64,18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity={isFlowing ? '0.7' : '0.2'}
          strokeLinecap="round"
        />

        {/* Right Banana Plug Terminal Clip */}
        <rect x="62" y="14" width="8" height="8" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
        <circle cx="66" cy="18" r="2.5" fill="#fde047" />

        {/* Animated Moving Electron Charge Pulses along the wire */}
        {isFlowing && (
          <path
            d="M 6,18 C 22,2 48,34 64,18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="4 12"
            filter="url(#electronGlow)"
            className="animate-electron-drift"
            style={{
              animationDuration: `${durationSec}s`,
            }}
          />
        )}
      </svg>

      {/* Wire Label or Electron Arrow */}
      <span className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">
        {isFlowing ? (
          <span className="text-cyan-400 flex items-center gap-0.5 animate-pulse">
            e⁻ ➔
          </span>
        ) : (
          <span className="text-slate-500">idle</span>
        )}
      </span>
    </div>
  );
}

// Full Closed-Loop Return Bus Wire (Connects tail of circuit back to head)
export function CircuitReturnLoopWire({
  isFlowing,
  current,
}: {
  isFlowing: boolean;
  current: number;
}) {
  const durationSec = Math.max(0.6, Math.min(3.0, 1.5 / (current > 0.01 ? current * 2.5 : 0.5)));

  return (
    <div className="w-full px-4 pt-2 pb-1 relative z-10 flex flex-col items-center select-none">
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 px-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-[8px] font-bold text-white">
            -
          </span>
          <span>Heavy Ground Return Cable</span>
        </span>
        <span className={isFlowing ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
          {isFlowing ? `Loop Closed • ${(current * 1000).toFixed(0)} mA Returning` : 'Loop Interrupted'}
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span>Source Terminal</span>
          <span className="w-2.5 h-2.5 rounded-full bg-red-700 border border-red-500 flex items-center justify-center text-[8px] font-bold text-white">
            +
          </span>
        </span>
      </div>

      <svg viewBox="0 0 600 24" className="w-full h-6 overflow-visible mt-1">
        <defs>
          <linearGradient id="returnWireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Outer Heavy Insulated Cable */}
        <path
          d="M 10,6 L 590,6"
          stroke="url(#returnWireGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Inner Highlight Wire */}
        <path
          d="M 10,6 L 590,6"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Animated Flowing Charges on Return Path */}
        {isFlowing && (
          <path
            d="M 10,6 L 590,6"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 20"
            className="animate-electron-drift"
            style={{
              animationDuration: `${durationSec}s`,
            }}
          />
        )}

        {/* Terminal Clamps */}
        <circle cx="10" cy="6" r="4.5" fill="#fde047" stroke="#334155" strokeWidth="1.5" />
        <circle cx="590" cy="6" r="4.5" fill="#fde047" stroke="#334155" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
