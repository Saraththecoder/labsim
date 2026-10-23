'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Plus,
  Trash2,
  Info,
  Maximize2,
  Layers,
  BookOpen,
} from 'lucide-react';
import { LabSimAssistant, AssistantIssue } from '@/components/LabSimAssistant';
import {
  RealisticBattery,
  RealisticBulb,
  RealisticResistor,
  RealisticKnifeSwitch,
  RealisticAmmeter,
  RealisticRheostat,
} from '@/components/RealisticCircuitElements';
import { CircuitWireConnector, CircuitReturnLoopWire } from '@/components/CircuitWireConnector';

export interface CircuitComponent {
  id: string;
  type: 'battery' | 'resistor' | 'bulb' | 'switch' | 'ammeter' | 'rheostat';
  name: string;
  value: number; // Volts or Ohms
}

const PRESET_EXPERIMENTS = [
  {
    name: '1. Simple Bulb Circuit',
    description: '3V Battery, knife switch, and incandescent bulb',
    components: [
      { id: 'c1', type: 'battery', name: '3V Battery Pack', value: 3.0 },
      { id: 'c2', type: 'switch', name: 'Knife Switch', value: 1 },
      { id: 'c3', type: 'bulb', name: 'Incandescent Bulb', value: 15 },
    ] as CircuitComponent[],
  },
  {
    name: "2. Ohm's Law Bench",
    description: 'Battery, switch, rheostat, resistor, and ammeter',
    components: [
      { id: 'c1', type: 'battery', name: '6V Battery Pack', value: 6.0 },
      { id: 'c2', type: 'switch', name: 'Knife Switch', value: 1 },
      { id: 'c3', type: 'rheostat', name: 'Sliding Rheostat', value: 20 },
      { id: 'c4', type: 'resistor', name: 'Carbon Resistor', value: 10 },
      { id: 'c5', type: 'ammeter', name: 'DC Ammeter', value: 0 },
    ] as CircuitComponent[],
  },
  {
    name: '3. Dual Bulbs in Series',
    description: 'Compare current sharing across two lightbulbs',
    components: [
      { id: 'c1', type: 'battery', name: '6V Battery Pack', value: 6.0 },
      { id: 'c2', type: 'switch', name: 'Knife Switch', value: 1 },
      { id: 'c3', type: 'bulb', name: 'Bulb 1 (10 Ω)', value: 10 },
      { id: 'c4', type: 'bulb', name: 'Bulb 2 (15 Ω)', value: 15 },
      { id: 'c5', type: 'ammeter', name: 'DC Ammeter', value: 0 },
    ] as CircuitComponent[],
  },
  {
    name: '4. Short Circuit Hazard',
    description: 'Battery directly closed with minimal resistance',
    components: [
      { id: 'c1', type: 'battery', name: '9V Battery Pack', value: 9.0 },
      { id: 'c2', type: 'switch', name: 'Knife Switch', value: 1 },
      { id: 'c3', type: 'ammeter', name: 'DC Ammeter', value: 0 },
    ] as CircuitComponent[],
  },
];

export default function SandboxPage() {
  const [circuit, setCircuit] = useState<CircuitComponent[]>([
    { id: 'c1', type: 'battery', name: '6V Battery Pack', value: 6.0 },
    { id: 'c2', type: 'switch', name: 'Knife Switch', value: 1 },
    { id: 'c3', type: 'rheostat', name: 'Sliding Rheostat', value: 20 },
    { id: 'c4', type: 'bulb', name: 'Incandescent Bulb', value: 15 },
    { id: 'c5', type: 'ammeter', name: 'DC Ammeter', value: 0 },
  ]);

  const [switchClosed, setSwitchClosed] = useState<boolean>(true);
  const [labbyIssue, setLabbyIssue] = useState<AssistantIssue | null>(null);

  // Physics calculation for series loop
  const battery = circuit.find((c) => c.type === 'battery');
  const voltage = battery ? battery.value : 0;

  const totalResistance = circuit.reduce((acc, c) => {
    if (c.type === 'resistor' || c.type === 'rheostat' || c.type === 'bulb') {
      return acc + c.value;
    }
    return acc;
  }, 0.2); // internal resistance of wires

  const current = switchClosed && totalResistance > 0.05 ? voltage / totalResistance : 0;
  const powerWatts = current * current * totalResistance;
  const bulbBrightness = Math.min(1.0, current * 3.5);

  // Short circuit risk detection (< 0.5 ohms with active voltage)
  const isShortCircuit = switchClosed && totalResistance <= 0.6 && voltage > 0;

  const handleToggleSwitch = () => {
    const nextState = !switchClosed;
    setSwitchClosed(nextState);

    if (nextState && isShortCircuit) {
      setLabbyIssue({
        id: 'sandbox-short-circuit',
        experimentId: 'sandbox',
        severity: 'danger',
        title: 'Dangerous Short Circuit Detected!',
        message:
          'You closed the circuit with almost zero resistance (R = ' +
          totalResistance.toFixed(1) +
          ' Ω)! Current surges to ' +
          current.toFixed(1) +
          ' A, causing immediate wire meltdown and battery thermal runaway.',
        suggestedActionLabel: 'Insert 15 Ω Load Resistor',
        onApplyFix: () => {
          setCircuit((prev) => [
            ...prev,
            { id: `c-${Date.now()}`, type: 'resistor', name: '15 Ω Safety Resistor', value: 15 },
          ]);
        },
      });
    }
  };

  const handleUpdateValue = (id: string, newVal: number) => {
    setCircuit(circuit.map((c) => (c.id === id ? { ...c, value: newVal } : c)));
  };

  const handleAddComponent = (type: CircuitComponent['type']) => {
    const templates: Record<CircuitComponent['type'], { name: string; defaultVal: number }> = {
      battery: { name: '3V Battery Pack', defaultVal: 3.0 },
      bulb: { name: 'Incandescent Lamp', defaultVal: 15 },
      resistor: { name: '10 Ω Resistor', defaultVal: 10 },
      rheostat: { name: '25 Ω Rheostat', defaultVal: 25 },
      switch: { name: 'Knife Switch', defaultVal: 1 },
      ammeter: { name: 'DC Ammeter', defaultVal: 0 },
    };

    const newComp: CircuitComponent = {
      id: `c-${Date.now()}`,
      type,
      name: templates[type].name,
      value: templates[type].defaultVal,
    };
    setCircuit([...circuit, newComp]);
  };

  const handleRemoveComponent = (id: string) => {
    setCircuit(circuit.filter((c) => c.id !== id));
  };

  const handleLoadPreset = (presetIndex: number) => {
    setCircuit(PRESET_EXPERIMENTS[presetIndex].components);
    setSwitchClosed(true);
  };

  const triggerLabbyTip = () => {
    setLabbyIssue({
      id: `sandbox-tip-${Date.now()}`,
      experimentId: 'sandbox',
      severity: 'info',
      title: 'Circuit Workbench Pro-Tip',
      message:
        'In this physical sandbox, current I = V / R_total = ' +
        voltage.toFixed(1) +
        ' V / ' +
        totalResistance.toFixed(1) +
        ' Ω = ' +
        current.toFixed(3) +
        ' A! Notice how the incandescent bulb tungsten filament temperature directly scales with loop current.',
      suggestedActionLabel: 'Balanced 6V Experiment',
      onApplyFix: () => handleLoadPreset(1),
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-4 sm:py-6 px-3 sm:px-6 max-w-6xl mx-auto w-full space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/physics"
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#17231B] tracking-tight flex items-center gap-2">
              <span>Interactive Circuit Workbench</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/60 uppercase tracking-wider">
                True Physical Elements
              </span>
            </h1>
            <p className="text-[11px] text-[#647067] hidden sm:block">
              Build realistic circuits with physical batteries, incandescent bulbs, wire-wound rheostats, and knife switches
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
            onClick={() => {
              setCircuit([]);
              setSwitchClosed(false);
            }}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm cursor-pointer"
            title="Clear Workbench"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Experiments Bar */}
      <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#17231B]">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#B8D96B]" />
            <span>Prescribed Circuit Presets (NCERT Class 10)</span>
          </span>
          <span className="text-[10px] text-[#647067]">Click to instant-mount</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_EXPERIMENTS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handleLoadPreset(idx)}
              className="p-2 rounded-xl text-left bg-[#F4F7F2] hover:bg-[#B8D96B]/25 border border-[#E2E8DF] hover:border-[#B8D96B] transition-all text-xs cursor-pointer group"
            >
              <div className="font-bold text-[#17231B] group-hover:text-[#17231B]">{preset.name}</div>
              <p className="text-[10px] text-[#647067] line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Component Palette Drawer */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[#647067] uppercase shrink-0">Add Component:</span>
        <button
          onClick={() => handleAddComponent('battery')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>🔋</span>
          <span>+ DC Battery</span>
        </button>
        <button
          onClick={() => handleAddComponent('bulb')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>💡</span>
          <span>+ Light Bulb</span>
        </button>
        <button
          onClick={() => handleAddComponent('resistor')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>⚡</span>
          <span>+ Resistor</span>
        </button>
        <button
          onClick={() => handleAddComponent('rheostat')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>🎚️</span>
          <span>+ Rheostat</span>
        </button>
        <button
          onClick={() => handleAddComponent('switch')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>🔌</span>
          <span>+ Knife Switch</span>
        </button>
        <button
          onClick={() => handleAddComponent('ammeter')}
          className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#B8D96B] border border-[#E2E8DF] text-xs font-bold text-[#17231B] transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>📟</span>
          <span>+ Ammeter</span>
        </button>
      </div>

      {/* Main Electronic Workbench Canvas */}
      <div className="relative w-full min-h-[480px] rounded-3xl bg-[#0f1715] border border-slate-700/80 p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between text-white">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#B8D96B 1px, transparent 1px), linear-gradient(90deg, #B8D96B 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Telemetry HUD */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Total EMF (V)</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base">{voltage.toFixed(1)} V</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Loop Current (I)</span>
              <span className="font-bold text-cyan-400 text-sm sm:text-base">{current.toFixed(3)} A</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase">Equivalent Load</span>
              <span className="font-bold text-amber-400 text-sm sm:text-base">{totalResistance.toFixed(1)} Ω</span>
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-slate-400 block text-[9px] uppercase">Power Dissipated</span>
              <span className="font-bold text-yellow-300 text-sm sm:text-base">{powerWatts.toFixed(2)} W</span>
            </div>
          </div>

          <button
            onClick={handleToggleSwitch}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              switchClosed
                ? 'bg-[#B8D96B] text-[#17231B] hover:bg-[#a9cd59]'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{switchClosed ? 'Circuit Active (ON)' : 'Circuit Broken (OFF)'}</span>
          </button>
        </div>

        {/* Active Animated Wire Electron Drift Indicator (Top Banner) */}
        {switchClosed && current > 0.001 && (
          <div className="relative z-10 my-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                Electrons drifting clockwise: drift speed ∝ I = {current.toFixed(3)} A ({Math.round(current * 1000)} mA)
              </span>
            </div>
            <span className="text-slate-400 text-[10px]">Kirchhoff Loop Satisfied</span>
          </div>
        )}

        {/* Physical Components Workbench with Connecting Wires */}
        <div className="relative z-10 py-6 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {circuit.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-slate-400">
                <p className="text-sm font-semibold">Workbench is empty.</p>
                <p className="text-xs">Click any preset or add components from the drawer above to start experimenting!</p>
              </div>
            ) : (
              circuit.map((comp, idx) => {
                const wireColors = ['red', 'blue', 'yellow', 'black'] as const;
                const nextWireColor = wireColors[idx % wireColors.length];

                return (
                  <React.Fragment key={comp.id}>
                    {comp.type === 'battery' && (
                      <RealisticBattery
                        voltage={comp.value}
                        isFlowing={switchClosed && current > 0.01}
                        onRemove={() => handleRemoveComponent(comp.id)}
                        onChangeVoltage={(v) => handleUpdateValue(comp.id, v)}
                      />
                    )}
                    {comp.type === 'bulb' && (
                      <RealisticBulb
                        resistance={comp.value}
                        brightness={bulbBrightness}
                        current={current}
                        onRemove={() => handleRemoveComponent(comp.id)}
                        onChangeResistance={(r) => handleUpdateValue(comp.id, r)}
                      />
                    )}
                    {comp.type === 'resistor' && (
                      <RealisticResistor
                        resistance={comp.value}
                        onRemove={() => handleRemoveComponent(comp.id)}
                        onChangeResistance={(r) => handleUpdateValue(comp.id, r)}
                      />
                    )}
                    {comp.type === 'switch' && (
                      <RealisticKnifeSwitch
                        isOpen={!switchClosed}
                        onToggle={handleToggleSwitch}
                        onRemove={() => handleRemoveComponent(comp.id)}
                      />
                    )}
                    {comp.type === 'ammeter' && (
                      <RealisticAmmeter
                        current={current}
                        onRemove={() => handleRemoveComponent(comp.id)}
                      />
                    )}
                    {comp.type === 'rheostat' && (
                      <RealisticRheostat
                        resistance={comp.value}
                        onRemove={() => handleRemoveComponent(comp.id)}
                        onChangeResistance={(r) => handleUpdateValue(comp.id, r)}
                      />
                    )}

                    {/* Connecting Jumper Wire between this component and the next */}
                    {idx < circuit.length - 1 && (
                      <CircuitWireConnector
                        isFlowing={switchClosed && current > 0.001}
                        current={current}
                        color={nextWireColor}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Heavy Ground Return Wire Completing the Loop */}
          {circuit.length > 1 && (
            <div className="w-full max-w-3xl mt-4">
              <CircuitReturnLoopWire
                isFlowing={switchClosed && current > 0.001}
                current={current}
              />
            </div>
          )}
        </div>

        {/* Bottom Status Footprint */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3 gap-2">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                switchClosed && current > 0.001 ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-300">
              {switchClosed
                ? `System Running: ${circuit.length} physical modules mounted in series`
                : 'Circuit Idle: Flip knife switch to activate current'}
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Safety Interlock: Active (Auto-fuses below 0.5 Ω)
          </span>
        </div>
      </div>

      {/* Labby Assistant */}
      <LabSimAssistant experimentId="sandbox" currentIssue={labbyIssue} onDismiss={() => setLabbyIssue(null)} />
    </div>
  );
}
