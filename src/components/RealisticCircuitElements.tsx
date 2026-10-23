'use client';

import React from 'react';
import { Trash2, Settings, Zap } from 'lucide-react';

// =========================================================================
// 1. REALISTIC BATTERY PACK COMPONENT
// =========================================================================
export function RealisticBattery({
  voltage,
  isFlowing,
  onRemove,
  onChangeVoltage,
}: {
  voltage: number;
  isFlowing: boolean;
  onRemove: () => void;
  onChangeVoltage: (v: number) => void;
}) {
  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Battery"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Realistic Cylindrical Battery SVG */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-40 h-20 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <defs>
            <linearGradient id="batteryBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="65%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="batteryGoldBand" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <linearGradient id="metalTerminal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Negative Terminal Base (Left) */}
          <rect x="10" y="24" width="8" height="32" rx="2" fill="url(#metalTerminal)" />
          {/* Main Battery Casing */}
          <rect x="18" y="16" width="116" height="48" rx="6" fill="url(#batteryBody)" />
          {/* Gold Accent Band */}
          <rect x="94" y="16" width="24" height="48" fill="url(#batteryGoldBand)" />
          {/* Positive Nub Terminal (Right) */}
          <rect x="134" y="28" width="12" height="24" rx="3" fill="url(#metalTerminal)" />

          {/* Polarity Silkscreen */}
          <text x="32" y="44" fill="#93c5fd" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            -
          </text>
          <text x="56" y="42" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            {voltage.toFixed(1)}V DC
          </text>
          <text x="110" y="44" fill="#1e293b" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            +
          </text>

          {/* Red and Black Binding Post Leads */}
          <circle cx="14" cy="40" r="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          <circle cx="140" cy="40" r="4" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
        </svg>

        {isFlowing && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Component Details & Controls */}
      <div className="w-full mt-1 space-y-1.5 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>DC Power Source</span>
          <span className="font-mono text-emerald-400">{voltage.toFixed(1)} Volts</span>
        </div>

        {/* Quick Voltage Selector */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[1.5, 3.0, 4.5, 6.0, 9.0].map((v) => (
            <button
              key={v}
              onClick={() => onChangeVoltage(v)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                Math.abs(voltage - v) < 0.1
                  ? 'bg-[#B8D96B] text-[#17231B] shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {v}V
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. REALISTIC INCANDESCENT BULB COMPONENT
// =========================================================================
export function RealisticBulb({
  resistance,
  brightness,
  current,
  onRemove,
  onChangeResistance,
}: {
  resistance: number;
  brightness: number;
  current: number;
  onRemove: () => void;
  onChangeResistance: (r: number) => void;
}) {
  const isGlowing = brightness > 0.05;
  const glowOpacity = Math.min(1.0, brightness * 1.2);
  const glowColor =
    brightness > 0.6
      ? 'rgba(255, 235, 150, 0.9)'
      : brightness > 0.2
      ? 'rgba(251, 191, 36, 0.8)'
      : 'rgba(234, 88, 12, 0.5)';

  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Bulb"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Realistic Incandescent Light Bulb SVG */}
      <div className="relative w-full h-24 flex items-center justify-center">
        {/* Ambient Radial Filament Glow */}
        {isGlowing && (
          <div
            className="absolute w-28 h-28 rounded-full pointer-events-none transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, rgba(250, 204, 21, 0.3) 40%, transparent 75%)`,
              filter: `blur(${Math.min(18, 6 + brightness * 12)}px)`,
            }}
          />
        )}

        <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10">
          <defs>
            <radialGradient id="bulbGlass" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor={isGlowing ? '#fffbeb' : '#ffffff'} stopOpacity={isGlowing ? '0.9' : '0.4'} />
              <stop offset="60%" stopColor={isGlowing ? '#fde047' : '#94a3b8'} stopOpacity={isGlowing ? '0.7' : '0.2'} />
              <stop offset="100%" stopColor={isGlowing ? '#eab308' : '#334155'} stopOpacity={isGlowing ? '0.8' : '0.5'} />
            </radialGradient>
            <linearGradient id="brassBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Glass Dome */}
          <path
            d="M 50,15 C 32,15 24,28 24,45 C 24,56 34,66 38,72 L 62,72 C 66,66 76,56 76,45 C 76,28 68,15 50,15 Z"
            fill="url(#bulbGlass)"
            stroke={isGlowing ? '#fef08a' : '#64748b'}
            strokeWidth="1.5"
          />

          {/* Glass Reflection Highlight */}
          <path
            d="M 33,28 C 30,35 30,45 34,52"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={isGlowing ? '0.8' : '0.3'}
          />

          {/* Internal Stem & Filament Wires */}
          <line x1="43" y1="72" x2="43" y2="46" stroke="#475569" strokeWidth="1.5" />
          <line x1="57" y1="72" x2="57" y2="46" stroke="#475569" strokeWidth="1.5" />

          {/* Tungsten Coil (Glows vibrant orange/yellow when hot) */}
          <path
            d="M 43,46 Q 50,38 57,46"
            fill="none"
            stroke={isGlowing ? '#ffffff' : '#64748b'}
            strokeWidth={isGlowing ? '2.5' : '1.5'}
            strokeLinecap="round"
            style={{
              filter: isGlowing ? 'drop-shadow(0 0 6px #ffedd5)' : 'none',
            }}
          />

          {/* Brass Screw Threads (E10 Socket) */}
          <rect x="38" y="72" width="24" height="4" rx="1" fill="url(#brassBase)" />
          <rect x="39" y="77" width="22" height="4" rx="1" fill="url(#brassBase)" />
          <rect x="40" y="82" width="20" height="4" rx="1" fill="url(#brassBase)" />
          {/* Black Solder Contact Foot */}
          <rect x="44" y="86" width="12" height="4" rx="2" fill="#0f172a" />
        </svg>
      </div>

      {/* Details & Live Output */}
      <div className="w-full mt-1 space-y-1.5 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>Incandescent Lamp</span>
          <span className="font-mono text-yellow-400">{resistance} Ω</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-1 rounded-lg">
          <span>Emission:</span>
          <span className={isGlowing ? 'text-yellow-300 font-bold' : 'text-slate-500'}>
            {isGlowing ? `${Math.round(brightness * 100)}% Glow (${(current * current * resistance).toFixed(2)} W)` : 'OFF (0 W)'}
          </span>
        </div>

        {/* Resistance Selector */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {[5, 10, 15, 25].map((r) => (
            <button
              key={r}
              onClick={() => onChangeResistance(r)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                resistance === r ? 'bg-[#B8D96B] text-[#17231B]' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}Ω
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. REALISTIC COLOR-CODED CERAMIC RESISTOR
// =========================================================================
export function RealisticResistor({
  resistance,
  onRemove,
  onChangeResistance,
}: {
  resistance: number;
  onRemove: () => void;
  onChangeResistance: (r: number) => void;
}) {
  // Map resistance to EIA 4-band colors
  const getBands = (val: number) => {
    if (val === 5) return ['#22c55e', '#000000', '#000000', '#eab308']; // 5 Ω (Green-Black-Black-Gold)
    if (val === 10) return ['#78350f', '#000000', '#000000', '#eab308']; // 10 Ω (Brown-Black-Black-Gold)
    if (val === 20) return ['#dc2626', '#000000', '#000000', '#eab308']; // 20 Ω (Red-Black-Black-Gold)
    if (val === 50) return ['#22c55e', '#000000', '#78350f', '#eab308']; // 50 Ω (Green-Black-Brown-Gold)
    return ['#78350f', '#000000', '#78350f', '#eab308']; // Default 100 Ω
  };

  const bands = getBands(resistance);

  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Resistor"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Realistic Axial Resistor SVG */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-40 h-20 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id="ceramicBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="40%" stopColor="#fde68a" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="leadWire" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Left and Right Lead Wires */}
          <line x1="8" y1="40" x2="45" y2="40" stroke="url(#leadWire)" strokeWidth="4" strokeLinecap="round" />
          <line x1="115" y1="40" x2="152" y2="40" stroke="url(#leadWire)" strokeWidth="4" strokeLinecap="round" />

          {/* Dog-bone Ceramic Contoured Body */}
          <rect x="42" y="24" width="76" height="32" rx="10" fill="url(#ceramicBody)" />
          <ellipse cx="46" cy="40" rx="6" ry="16" fill="url(#ceramicBody)" />
          <ellipse cx="114" cy="40" rx="6" ry="16" fill="url(#ceramicBody)" />

          {/* 4 EIA Color Bands */}
          <rect x="56" y="24" width="5" height="32" fill={bands[0]} />
          <rect x="68" y="24" width="5" height="32" fill={bands[1]} />
          <rect x="80" y="24" width="5" height="32" fill={bands[2]} />
          <rect x="98" y="24" width="6" height="32" fill={bands[3]} />
        </svg>
      </div>

      {/* Details & Controls */}
      <div className="w-full mt-1 space-y-1.5 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>Carbon Film Resistor</span>
          <span className="font-mono text-cyan-400">{resistance} Ω (±5%)</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[5, 10, 20, 50].map((r) => (
            <button
              key={r}
              onClick={() => onChangeResistance(r)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                resistance === r ? 'bg-[#B8D96B] text-[#17231B]' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r}Ω
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. REALISTIC MECHANICAL KNIFE SWITCH COMPONENT
// =========================================================================
export function RealisticKnifeSwitch({
  isOpen,
  onToggle,
  onRemove,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Switch"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Mechanical Knife Switch SVG with Pivoting Blade */}
      <div
        onClick={onToggle}
        className="relative w-full h-24 flex items-center justify-center cursor-pointer group-hover:scale-102 transition-transform"
        title="Click to flip switch"
      >
        <svg viewBox="0 0 160 80" className="w-40 h-20 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id="knifeBrass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="insulatingBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Heavy Insulating Bakelite Base */}
          <rect x="20" y="48" width="120" height="20" rx="4" fill="url(#insulatingBase)" stroke="#475569" strokeWidth="1" />

          {/* Left Pivot Post (Brass Terminal) */}
          <rect x="36" y="32" width="14" height="20" rx="2" fill="url(#knifeBrass)" />
          <circle cx="43" cy="38" r="4" fill="#451a03" />

          {/* Right Spring Contact Jaw (Brass Clip) */}
          <path d="M 112,32 L 120,32 L 120,48 L 112,48 Z" fill="url(#knifeBrass)" />
          <rect x="110" y="28" width="4" height="20" rx="1" fill="#ca8a04" />

          {/* Pivoting Copper Knife Blade */}
          {isOpen ? (
            // Blade tilted up 35 degrees (Open Circuit)
            <g transform="rotate(-35, 43, 38)" className="transition-transform duration-300">
              <rect x="43" y="34" width="76" height="8" rx="2" fill="url(#knifeBrass)" />
              {/* Insulated Black Handle Knob on tip */}
              <rect x="112" y="30" width="18" height="16" rx="4" fill="#dc2626" />
            </g>
          ) : (
            // Blade fully engaged down (Closed Circuit)
            <g className="transition-transform duration-300">
              <rect x="43" y="34" width="76" height="8" rx="2" fill="url(#knifeBrass)" />
              {/* Insulated Handle */}
              <rect x="112" y="30" width="18" height="16" rx="4" fill="#16a34a" />
              {/* Spark contact indicator */}
              <circle cx="116" cy="38" r="2" fill="#fef08a" />
            </g>
          )}
        </svg>
      </div>

      {/* Details & Clickable Status */}
      <div className="w-full mt-1 space-y-1.5 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>Laboratory Knife Switch</span>
          <span className={`font-mono ${isOpen ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        <button
          onClick={onToggle}
          className={`w-full py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 ${
            isOpen
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>{isOpen ? 'Click to Close (Turn ON)' : 'Click to Open (Turn OFF)'}</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// 5. REALISTIC DC AMMETER COMPONENT (ANALOG NEEDLE)
// =========================================================================
export function RealisticAmmeter({
  current,
  onRemove,
}: {
  current: number;
  onRemove: () => void;
}) {
  // Angle deflection: 0A = -45 deg, 3A = +45 deg
  const maxI = 3.0;
  const clampedI = Math.min(maxI, Math.max(0, current));
  const needleAngle = -45 + (clampedI / maxI) * 90;

  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Ammeter"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Realistic Analog Bench Meter SVG */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 120 90" className="w-32 h-24 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id="meterBezel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="dialFace" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
          </defs>

          {/* Heavy Bakelite Meter Housing */}
          <rect x="10" y="6" width="100" height="78" rx="8" fill="url(#meterBezel)" stroke="#475569" strokeWidth="2" />

          {/* White Dial Face with Arc */}
          <path d="M 20,60 C 20,28 100,28 100,60 Z" fill="url(#dialFace)" />

          {/* Scale Arc Line */}
          <path d="M 28,52 A 40 40 0 0 1 92,52" fill="none" stroke="#0f172a" strokeWidth="1.5" />

          {/* Scale Markings (0, 1, 2, 3 A) */}
          <text x="25" y="48" fontSize="8" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
            0
          </text>
          <text x="45" y="32" fontSize="8" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
            1
          </text>
          <text x="70" y="32" fontSize="8" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
            2
          </text>
          <text x="90" y="48" fontSize="8" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
            3
          </text>

          {/* 'A' Emblem */}
          <text x="56" y="52" fontSize="11" fontWeight="900" fill="#dc2626" fontFamily="sans-serif">
            A
          </text>

          {/* Deflecting Red Needle */}
          <g
            transform={`rotate(${needleAngle}, 60, 64)`}
            className="transition-transform duration-300 ease-out"
          >
            <line x1="60" y1="64" x2="60" y2="24" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="60" cy="64" r="3.5" fill="#0f172a" />
          </g>

          {/* Red (+) and Black (-) Binding Terminals */}
          <circle cx="30" cy="74" r="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          <circle cx="90" cy="74" r="4" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
        </svg>
      </div>

      {/* Details & Live Reading */}
      <div className="w-full mt-1 space-y-1 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>DC Moving-Coil Ammeter</span>
          <span className="font-mono text-cyan-400 font-bold">{current.toFixed(3)} A</span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Deflection: {clampedI.toFixed(2)} / {maxI} A ({Math.round((clampedI / maxI) * 100)}%)
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. REALISTIC WIRE-WOUND SLIDING RHEOSTAT
// =========================================================================
export function RealisticRheostat({
  resistance,
  onRemove,
  onChangeResistance,
}: {
  resistance: number;
  onRemove: () => void;
  onChangeResistance: (r: number) => void;
}) {
  return (
    <div className="relative group p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-black/90 border border-slate-700/80 shadow-xl flex flex-col items-center select-none w-52">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-400"
        title="Remove Rheostat"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Realistic Laboratory Wire-Wound Rheostat SVG */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-40 h-20 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id="ceramicTube" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="sliderBar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Support Legs (Left and Right) */}
          <rect x="22" y="32" width="10" height="36" rx="2" fill="#334155" />
          <rect x="128" y="32" width="10" height="36" rx="2" fill="#334155" />

          {/* Central Ceramic Cylindrical Core */}
          <rect x="32" y="36" width="96" height="24" rx="4" fill="url(#ceramicTube)" />

          {/* Constantan Wire Coil Windings (Pattern of lines) */}
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={i}
              x1={36 + i * 5}
              y1="36"
              x2={36 + i * 5}
              y2="60"
              stroke="#b45309"
              strokeWidth="2"
            />
          ))}

          {/* Top Brass Slider Rod */}
          <rect x="26" y="22" width="108" height="6" rx="2" fill="url(#sliderBar)" />

          {/* Interactive Sliding Contact Wiper (Position based on resistance 0 to 50) */}
          <g transform={`translate(${Math.min(90, Math.max(0, (resistance / 50) * 85))}, 0)`}>
            <rect x="36" y="14" width="14" height="26" rx="3" fill="#dc2626" />
            <circle cx="43" cy="22" r="3" fill="#fef08a" />
          </g>

          {/* Terminal Binding Posts (A, B, C) */}
          <circle cx="26" cy="62" r="3" fill="#ef4444" />
          <circle cx="134" cy="62" r="3" fill="#0f172a" />
        </svg>
      </div>

      {/* Details & Interactive Slider */}
      <div className="w-full mt-1 space-y-1.5 text-center">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
          <span>Variable Rheostat</span>
          <span className="font-mono text-amber-400">{resistance} Ω</span>
        </div>

        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={resistance}
          onChange={(e) => onChangeResistance(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#B8D96B]"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
          <span>Min: 5Ω</span>
          <span>Max: 50Ω</span>
        </div>
      </div>
    </div>
  );
}
