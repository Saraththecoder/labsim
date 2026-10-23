'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  Smartphone,
  Scan,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Info,
  CheckCircle2,
  ExternalLink,
  Sliders,
  FileText,
  Zap,
  Layers,
  Square,
  Triangle,
  Flame,
} from 'lucide-react';
import { WebXROpticalBench } from '@/components/WebXROpticalBench';
import { LabSimAssistant, AssistantIssue } from '@/components/LabSimAssistant';

const EXPERIMENTS = [
  { id: 'convex-lens', name: 'Convex Lens', badge: 'NCERT Exp 1', icon: '🔍' },
  { id: 'concave-mirror', name: 'Concave Mirror', badge: 'NCERT Exp 2', icon: '🪞' },
  { id: 'glass-slab', name: 'Glass Slab', badge: 'NCERT Exp 3', icon: '🧱' },
  { id: 'glass-prism', name: 'Glass Prism', badge: 'NCERT Exp 4', icon: '📐' },
  { id: 'ohms-law', name: 'Ohm’s Law', badge: 'NCERT Exp 5', icon: '⚡' },
];

function ARPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialExp = searchParams.get('exp') || 'convex-lens';
  const [activeExp, setActiveExp] = useState<string>(initialExp);

  // Sync state if query param changes
  useEffect(() => {
    const expParam = searchParams.get('exp');
    if (expParam && EXPERIMENTS.some((e) => e.id === expParam)) {
      setActiveExp(expParam);
    }
  }, [searchParams]);

  const selectExperiment = (id: string) => {
    setActiveExp(id);
    router.replace(`/ar?exp=${id}`, { scroll: false });
  };

  // 1. Convex Lens State
  const [focalLength, setFocalLength] = useState<number>(15);
  const [lensPos, setLensPos] = useState<number>(50);
  const [objectPos, setObjectPos] = useState<number>(25);
  const [screenPos, setScreenPos] = useState<number>(80);

  // 2. Concave Mirror State
  const [mirrorPos, setMirrorPos] = useState<number>(80);
  const [mirrorObjPos, setMirrorObjPos] = useState<number>(50);
  const [mirrorScreenPos, setMirrorScreenPos] = useState<number>(50);

  // 3. Glass Slab State
  const [slabAngle, setSlabAngle] = useState<number>(45);
  const [slabThickness, setSlabThickness] = useState<number>(6);
  const [slabIndex, setSlabIndex] = useState<number>(1.52);

  // 4. Glass Prism State
  const [prismAngle, setPrismAngle] = useState<number>(48);
  const [prismMode, setPrismMode] = useState<'monochromatic' | 'dispersion'>('dispersion');

  // 5. Ohm's Law State
  const [ohmsCells, setOhmsCells] = useState<number>(2); // 3.0V
  const [ohmsRheostat, setOhmsRheostat] = useState<number>(15);
  const [ohmsResistance, setOhmsResistance] = useState<number>(5);
  const [ohmsKeyClosed, setOhmsKeyClosed] = useState<boolean>(true);

  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const slidersCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (headerRef.current) tl.from(headerRef.current, { y: -16, opacity: 0, duration: 0.5 });
      if (tabsRef.current) tl.from(tabsRef.current, { y: -10, opacity: 0, duration: 0.4 }, '-=0.3');
      if (slidersCardRef.current) tl.from(slidersCardRef.current, { y: 20, opacity: 0, duration: 0.5 }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Manual Labby advice trigger state
  const [manualAdvice, setManualAdvice] = useState<AssistantIssue | null>(null);

  // Real-time Error Detection across all 5 Practicals
  const getDetectedIssue = (): AssistantIssue | null => {
    // If student manually asked for advice, show that
    if (manualAdvice) return manualAdvice;

    // 1. Ohm's Law Overload / Open Circuit
    if (activeExp === 'ohms-law') {
      if (!ohmsKeyClosed) {
        return {
          id: 'ohms-key-open',
          experimentId: 'ohms-law',
          severity: 'warning',
          title: 'Plug Key Unplugged!',
          message: 'The brass plug key is unplugged from the key block. The circuit is open, so no current can flow through the ammeter or unknown resistor.',
          suggestedActionLabel: 'Insert Brass Key Plug',
          onApplyFix: () => setOhmsKeyClosed(true),
        };
      }

      const totalR = ohmsResistance + ohmsRheostat + 0.4;
      const current = (ohmsCells * 1.5) / totalR;
      if (current >= 0.70 || (ohmsCells >= 3 && ohmsRheostat <= 3)) {
        return {
          id: 'ohms-overload',
          experimentId: 'ohms-law',
          severity: 'danger',
          title: 'Circuit Overload & Overheating Risk!',
          message: `Hey, you put improper values! With ${ohmsCells * 1.5}V and only ${ohmsRheostat} Ω rheostat resistance, current surges to ${current.toFixed(2)} A! The resistor will overheat and the ammeter coil may burn out.`,
          suggestedActionLabel: 'Set Rheostat to 25 Ω (Safe Limit)',
          onApplyFix: () => {
            setOhmsRheostat(25);
            setOhmsCells(2);
          },
        };
      }
    }

    // 2. Convex Lens: Virtual Image inside Focus or Object at Infinity
    if (activeExp === 'convex-lens') {
      const u = lensPos - objectPos;
      if (u > 0 && u < 14.5) {
        return {
          id: 'lens-virtual-image',
          experimentId: 'convex-lens',
          severity: 'warning',
          title: 'Virtual Image Cannot Project!',
          message: `Hey, the object pin is placed inside the focal length (u = ${u.toFixed(1)} cm < f = 15 cm). This forms an enlarged virtual image behind the lens that cannot be captured on your physical screen!`,
          suggestedActionLabel: 'Move Object to 2F (x = 20 cm)',
          onApplyFix: () => {
            setObjectPos(20);
            setLensPos(50);
            setScreenPos(80);
          },
        };
      }

      if (Math.abs(u - focalLength) < 0.6) {
        return {
          id: 'lens-infinity-image',
          experimentId: 'convex-lens',
          severity: 'warning',
          title: 'Image at Infinity!',
          message: 'The object is placed precisely at the focal point (u = 15 cm). Refracted rays emerge parallel and will never converge onto the screen on your optical bench.',
          suggestedActionLabel: 'Move Object to 25 cm (Real Image)',
          onApplyFix: () => {
            setObjectPos(25);
            setLensPos(50);
            setScreenPos(75);
          },
        };
      }
    }

    // 3. Concave Mirror: Candle inside Focus
    if (activeExp === 'concave-mirror') {
      const uMirror = mirrorPos - mirrorObjPos;
      if (uMirror > 0 && uMirror < 14.5) {
        return {
          id: 'mirror-virtual-image',
          experimentId: 'concave-mirror',
          severity: 'warning',
          title: 'Virtual Image Behind Mirror!',
          message: `The candle flame is inside the focal point (u = ${uMirror.toFixed(1)} cm < f = 15 cm). Reflected rays diverge, creating a virtual erect image behind the mirror that cannot be projected on the screen!`,
          suggestedActionLabel: 'Move Candle to C (30 cm distance)',
          onApplyFix: () => {
            setMirrorObjPos(50);
            setMirrorPos(80);
            setMirrorScreenPos(50);
          },
        };
      }
    }

    // 4. Glass Slab: Extreme Glancing Angle
    if (activeExp === 'glass-slab') {
      if (slabAngle >= 72) {
        return {
          id: 'slab-steep-angle',
          experimentId: 'glass-slab',
          severity: 'warning',
          title: 'Steep Glancing Angle!',
          message: `At an extreme angle of incidence (∠i = ${slabAngle}°), strong Fresnel reflection bounces most laser light off the glass surface, making the refracted beam inside too dim to align optical pins!`,
          suggestedActionLabel: 'Set Angle to Optimal 45°',
          onApplyFix: () => setSlabAngle(45),
        };
      }
    }

    // 5. Glass Prism: Shallow Angle / Total Internal Reflection
    if (activeExp === 'glass-prism') {
      if (prismAngle < 32) {
        return {
          id: 'prism-critical-angle',
          experimentId: 'glass-prism',
          severity: 'warning',
          title: 'Oblique Incidence & TIR Hazard!',
          message: `At shallow incidence (∠i = ${prismAngle}°), light strikes the exiting prism face beyond the critical angle, causing total internal reflection and collapsing the rainbow dispersion ribbon!`,
          suggestedActionLabel: 'Set Minimum Deviation Angle (48°)',
          onApplyFix: () => setPrismAngle(48),
        };
      }
    }

    return null;
  };

  const triggerLabbyTip = () => {
    const tips: Record<string, AssistantIssue> = {
      'convex-lens': {
        id: `tip-lens-${Date.now()}`,
        experimentId: 'convex-lens',
        severity: 'info',
        title: 'Convex Lens Pro-Tip',
        message: 'When the object is placed at 2F (30 cm away from the lens), a real, inverted image of equal size (m = -1.0) is formed exactly at 2F on the opposite side!',
        suggestedActionLabel: 'Align Object to 2F (x = 20 cm)',
        onApplyFix: () => {
          setObjectPos(20);
          setLensPos(50);
          setScreenPos(80);
        },
      },
      'concave-mirror': {
        id: `tip-mirror-${Date.now()}`,
        experimentId: 'concave-mirror',
        severity: 'info',
        title: 'Concave Mirror Pro-Tip',
        message: 'When the candle is at the center of curvature C (u = 30 cm), the reflected rays converge to form an inverted image right at C with identical flame height!',
        suggestedActionLabel: 'Set Candle to C (x = 50 cm)',
        onApplyFix: () => {
          setMirrorObjPos(50);
          setMirrorPos(80);
          setMirrorScreenPos(50);
        },
      },
      'glass-slab': {
        id: `tip-slab-${Date.now()}`,
        experimentId: 'glass-slab',
        severity: 'info',
        title: 'Refraction & Lateral Shift Pro-Tip',
        message: 'Notice that ∠e strictly equals ∠i! Light bends towards the normal in glass, then away from normal in air, shifting sideways by lateral displacement d.',
        suggestedActionLabel: 'Try Standard 45° Incidence',
        onApplyFix: () => setSlabAngle(45),
      },
      'glass-prism': {
        id: `tip-prism-${Date.now()}`,
        experimentId: 'glass-prism',
        severity: 'info',
        title: 'Prism Dispersion Pro-Tip',
        message: 'Violet light bends most and Red bends least because refractive index depends on wavelength (Cauchy relation). That is why white light disperses into VIBGYOR!',
        suggestedActionLabel: 'Set Minimum Deviation (48°)',
        onApplyFix: () => setPrismAngle(48),
      },
      'ohms-law': {
        id: `tip-ohms-${Date.now()}`,
        experimentId: 'ohms-law',
        severity: 'info',
        title: 'Ohm’s Law Verification Pro-Tip',
        message: 'Slide the rheostat to vary the current and voltage. You will notice the ratio V / I remains strictly constant at R = 5 Ω! The V-I graph is a straight line.',
        suggestedActionLabel: 'Set Optimal Test Point (3V, 15 Ω)',
        onApplyFix: () => {
          setOhmsCells(2);
          setOhmsRheostat(15);
          setOhmsKeyClosed(true);
        },
      },
    };

    setManualAdvice(tips[activeExp] || null);
  };

  const activeIssue = getDetectedIssue();

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Header */}
      <div ref={headerRef} className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/physics"
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#17231B] tracking-tight flex items-center gap-2">
              <span>Physics Tabletop AR</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/60">
                WebXR 3D
              </span>
            </h1>
            <p className="text-[11px] text-[#647067] hidden sm:block">
              NCERT Prescribed Class 10 Practicals in Tabletop Augmented Reality
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ask Labby Mascot Tip Trigger */}
          <button
            onClick={triggerLabbyTip}
            className="px-3 py-1.5 rounded-full bg-[#B8D96B]/20 hover:bg-[#B8D96B]/40 border border-[#B8D96B] flex items-center gap-1.5 text-xs font-bold text-[#17231B] shadow-xs cursor-pointer transition-all"
            title="Ask Labby AI for hints and pro-tips"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#17231B]" />
            <span>Ask Labby</span>
          </button>

          <Link
            href={`/report?exp=${activeExp}`}
            className="px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center gap-1.5 text-xs font-semibold text-[#17231B] shadow-xs"
            title="Open Experiment Lab Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#17231B]" />
            <span className="hidden sm:inline">Lab Report</span>
          </Link>

          <button
            onClick={() => setShowInfoModal(true)}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm cursor-pointer"
            title="AR & Camera Guide"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Experiment Selector Pill Bar */}
      <div ref={tabsRef} className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            onClick={() => selectExperiment(exp.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
              activeExp === exp.id
                ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                : 'bg-[#FFFFFF] text-[#647067] border-[#E2E8DF] hover:text-[#17231B] hover:bg-[#F4F7F2]'
            }`}
          >
            <span>{exp.icon}</span>
            <span>{exp.name}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
              activeExp === exp.id ? 'bg-[#17231B]/15 text-[#17231B]' : 'bg-[#F4F7F2] text-[#647067]'
            }`}>
              {exp.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Main High-Fidelity AR Viewport */}
      <WebXROpticalBench
        experimentId={activeExp}
        // Convex Lens Props
        focalLength={focalLength}
        objectPos={activeExp === 'concave-mirror' ? mirrorObjPos : objectPos}
        lensPos={lensPos}
        screenPos={activeExp === 'concave-mirror' ? mirrorScreenPos : screenPos}
        mirrorPos={mirrorPos}
        onObjectPosChange={activeExp === 'concave-mirror' ? setMirrorObjPos : setObjectPos}
        onLensPosChange={setLensPos}
        onScreenPosChange={activeExp === 'concave-mirror' ? setMirrorScreenPos : setScreenPos}
        onMirrorPosChange={setMirrorPos}
        // Glass Slab Props
        slabAngleIncidence={slabAngle}
        slabThickness={slabThickness}
        slabRefractiveIndex={slabIndex}
        onSlabAngleChange={setSlabAngle}
        // Glass Prism Props
        prismAngleIncidence={prismAngle}
        prismMode={prismMode}
        onPrismAngleChange={setPrismAngle}
        // Ohm's Law Props
        ohmsCellCount={ohmsCells}
        ohmsRheostat={ohmsRheostat}
        ohmsResistance={ohmsResistance}
        ohmsKeyClosed={ohmsKeyClosed}
        onOhmsCellCountChange={setOhmsCells}
        onOhmsRheostatChange={setOhmsRheostat}
        onOhmsToggleKey={() => setOhmsKeyClosed(!ohmsKeyClosed)}
      />

      {/* Tailored Controls for Active Experiment */}
      <div ref={slidersCardRef} className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] space-y-4 shadow-[0_4px_20px_rgba(23,35,27,0.05)]">
        {/* 1. Convex Lens Controls */}
        {activeExp === 'convex-lens' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Convex Lens Bench Controls</span>
              </span>
              <span className="text-[11px] font-mono text-[#17231B] font-bold bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E2E8DF]">
                f = +{focalLength} cm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Object Position (xₒ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {objectPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={lensPos - 5}
                  step="0.5"
                  value={objectPos}
                  onChange={(e) => setObjectPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>u = {(lensPos - objectPos).toFixed(1)} cm</span>
                  <span>Light crosswires</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Lens Position (xₗ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {lensPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min={objectPos + 5}
                  max={screenPos - 5}
                  step="0.5"
                  value={lensPos}
                  onChange={(e) => setLensPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>Center upright</span>
                  <span>Double convex</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Screen Position (xₛ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {screenPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min={lensPos + 5}
                  max="100"
                  step="0.5"
                  value={screenPos}
                  onChange={(e) => setScreenPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>v = {(screenPos - lensPos).toFixed(1)} cm</span>
                  <span>Frosted screen</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 2. Concave Mirror Controls */}
        {activeExp === 'concave-mirror' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Concave Mirror Bench Controls</span>
              </span>
              <span className="text-[11px] font-mono text-[#17231B] font-bold bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E2E8DF]">
                f = -{focalLength} cm • C = {2 * focalLength} cm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Object Candle (xₒ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {mirrorObjPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={mirrorPos - 5}
                  step="0.5"
                  value={mirrorObjPos}
                  onChange={(e) => setMirrorObjPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>u = {(mirrorPos - mirrorObjPos).toFixed(1)} cm</span>
                  <span>Glowing candle</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Mirror Position (xₘ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {mirrorPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="0.5"
                  value={mirrorPos}
                  onChange={(e) => setMirrorPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>Pole P</span>
                  <span>Silvered concave</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Half-Screen (xₛ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {mirrorScreenPos.toFixed(1)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max={mirrorPos - 5}
                  step="0.5"
                  value={mirrorScreenPos}
                  onChange={(e) => setMirrorScreenPos(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>Capture screen</span>
                  <span>v = {(mirrorPos - mirrorScreenPos).toFixed(1)} cm</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. Glass Slab Controls */}
        {activeExp === 'glass-slab' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Refraction & Lateral Shift Controls</span>
              </span>
              <span className="text-[11px] font-mono text-[#17231B] font-bold bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E2E8DF]">
                Snell’s Law: n = sin(i)/sin(r)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Incidence Angle (∠i)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {slabAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  step="1"
                  value={slabAngle}
                  onChange={(e) => setSlabAngle(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>15° (near normal)</span>
                  <span>75° (glancing)</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Slab Thickness (t)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {slabThickness} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={slabThickness}
                  onChange={(e) => setSlabThickness(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>Standard 6 cm</span>
                  <span>Thick slab = More shift</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Refractive Index (n)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {slabIndex.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-1 pt-1">
                  {[
                    { label: 'Crown (1.52)', n: 1.52 },
                    { label: 'Flint (1.66)', n: 1.66 },
                    { label: 'Perspex (1.49)', n: 1.49 },
                  ].map((g) => (
                    <button
                      key={g.n}
                      onClick={() => setSlabIndex(g.n)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                        slabIndex === g.n
                          ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B]'
                          : 'bg-white text-[#647067] border-[#E2E8DF] hover:bg-[#EAEFE8]'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 4. Glass Prism Controls */}
        {activeExp === 'glass-prism' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Prism Refraction & Dispersion Controls</span>
              </span>
              <span className="text-[11px] font-mono text-[#17231B] font-bold bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E2E8DF]">
                Apex Angle A = 60°
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Incidence Angle (∠i)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {prismAngle}°
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  step="1"
                  value={prismAngle}
                  onChange={(e) => setPrismAngle(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>30°</span>
                  <span>Minimum Deviation ~48°</span>
                  <span>70°</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <span className="text-[#17231B] font-semibold block">Optical Beam Spectrum Mode</span>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPrismMode('dispersion')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      prismMode === 'dispersion'
                        ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                        : 'bg-white text-[#647067] border-[#E2E8DF] hover:bg-[#EAEFE8]'
                    }`}
                  >
                    🌈 White Light Dispersion (VIBGYOR)
                  </button>
                  <button
                    onClick={() => setPrismMode('monochromatic')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      prismMode === 'monochromatic'
                        ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B] shadow-xs'
                        : 'bg-white text-[#647067] border-[#E2E8DF] hover:bg-[#EAEFE8]'
                    }`}
                  >
                    🟢 Monochromatic Ray (i-D Curve)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 5. Ohm's Law Controls */}
        {activeExp === 'ohms-law' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Ohm’s Law Circuit Controls</span>
              </span>
              <button
                onClick={() => setOhmsKeyClosed(!ohmsKeyClosed)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  ohmsKeyClosed
                    ? 'bg-[#10b981] text-white border-[#059669] shadow-xs'
                    : 'bg-[#ef4444] text-white border-[#dc2626]'
                }`}
              >
                Plug Key: {ohmsKeyClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">DC Battery Voltage</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {(ohmsCells * 1.5).toFixed(1)} V
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[1, 2, 3, 4].map((c) => (
                    <button
                      key={c}
                      onClick={() => setOhmsCells(c)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        ohmsCells === c
                          ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B]'
                          : 'bg-white text-[#647067] border-[#E2E8DF] hover:bg-[#EAEFE8]'
                      }`}
                    >
                      {c * 1.5}V
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Rheostat Slider (Rₕ)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {ohmsRheostat} Ω
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={ohmsRheostat}
                  onChange={(e) => setOhmsRheostat(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                  <span>Minimum (High I)</span>
                  <span>50 Ω (Low I)</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
                <div className="flex justify-between items-center">
                  <span className="text-[#17231B] font-semibold">Unknown Resistor (R₁)</span>
                  <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                    {ohmsResistance} Ω
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[2, 5, 10].map((r) => (
                    <button
                      key={r}
                      onClick={() => setOhmsResistance(r)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        ohmsResistance === r
                          ? 'bg-[#B8D96B] text-[#17231B] border-[#17231B]'
                          : 'bg-white text-[#647067] border-[#E2E8DF] hover:bg-[#EAEFE8]'
                      }`}
                    >
                      {r} Ω
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info / Diagnostics Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-[#17231B]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8DF] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-[#17231B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-2 font-bold text-base text-[#17231B]">
                <Smartphone className="w-5 h-5 text-[#17231B]" />
                <span>Mobile Tabletop AR Setup Guide</span>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-7 h-7 rounded-lg bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] flex items-center justify-center text-xs border border-[#E2E8DF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#647067] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#B8D96B]/50 space-y-1">
                <span className="font-bold text-[#17231B] block">
                  How does Augmented Reality work in LabSim?
                </span>
                <p>
                  LabSim uses <strong>WebXR and high-definition camera passthrough</strong> to anchor accurate 3D physics models directly onto your table, complete with millimeter graduations and physical light tracing.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#17231B]">Phone Connection Quick Steps:</h4>
                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                  <span className="font-semibold text-[#17231B]">1. Instant HTTPS Tunnel for Mobile Camera:</span>
                  <pre className="bg-[#FFFFFF] p-2 rounded text-[#17231B] font-mono text-[11px] overflow-x-auto border border-[#E2E8DF]">
                    npx localtunnel --port 3005
                  </pre>
                  <p className="text-[10px] text-[#647067]">
                    Open the generated URL on Chrome (Android) or Safari (iOS) to activate live camera AR passthrough.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                  <span className="font-semibold text-[#17231B]">2. Touch Gestures:</span>
                  <p>
                    • <strong>Pinch with 2 fingers:</strong> Scale model larger or smaller.<br />
                    • <strong>Drag with 2 fingers:</strong> Slide model across table surface.<br />
                    • <strong>Swipe with 1 finger:</strong> Rotate apparatus around vertical axis.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Start Experimenting
            </button>
          </div>
        </div>
      )}

      {/* LabSim AI Mascot Assistant (Pops out when errors occur or tips requested) */}
      <LabSimAssistant
        currentIssue={activeIssue}
        onDismiss={() => setManualAdvice(null)}
      />
    </div>
  );
}

export default function ARPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#B8D96B] border-t-transparent animate-spin" />
      </div>
    }>
      <ARPageContent />
    </Suspense>
  );
}
