'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  Wrench,
  HelpCircle,
  Volume2,
  VolumeX,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Atom,
  Square,
  Radio,
} from 'lucide-react';

export interface AssistantIssue {
  id: string;
  experimentId: string;
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  suggestedActionLabel: string;
  onApplyFix?: () => void;
}

interface LabSimAssistantProps {
  experimentId?: string;
  currentIssue?: AssistantIssue | null;
  onDismiss?: () => void;
  className?: string;
}

const EXPERIMENT_KNOWLEDGE: Record<
  string,
  {
    title: string;
    proTip: string;
    vivaQuestion: string;
    vivaAnswer: string;
    keyFormula: string;
  }
> = {
  sandbox: {
    title: 'Interactive Circuit Workbench',
    proTip: 'All closed loops satisfy Kirchhoff’s Voltage Law (KVL): the sum of potential drops across your resistors and bulbs strictly equals battery voltage V.',
    vivaQuestion: 'Why must an ammeter always be connected in series, and a voltmeter in parallel?',
    vivaAnswer: 'An ammeter has very low internal resistance so it doesn’t drop voltage in series. A voltmeter has very high internal resistance so it doesn’t siphon current in parallel.',
    keyFormula: 'I = V / R_total • P = I²R',
  },
  'convex-lens': {
    title: 'Convex Lens Optical Bench',
    proTip: 'When object distance u = 2f (30 cm for f=15 cm), the real inverted image forms at exactly v = 2f (30 cm) with magnification m = -1.0 (same size)!',
    vivaQuestion: 'What is optical parallax, and how do you eliminate it on an optical bench?',
    vivaAnswer: 'Parallax is the apparent shift in relative position between two objects when the eye moves sideways. To eliminate it, move the screen needle until both needle tips stay locked together when moving your head.',
    keyFormula: '1/f = 1/v - 1/u (Cartesian: u < 0, f > 0)',
  },
  'ohms-law': {
    title: 'Ohm’s Law & Resistance Bench',
    proTip: 'Keep the plug key open between observations to prevent resistance wire heating, as metallic resistance increases with temperature (ΔR ∝ ΔT).',
    vivaQuestion: 'What does the slope of a V versus I graph represent?',
    vivaAnswer: 'The slope ΔV / ΔI represents the electrical resistance (R) of the conductor in Ohms (Ω).',
    keyFormula: 'V = I • R ➔ R = V / I',
  },
  'concave-mirror': {
    title: 'Concave Spherical Mirror',
    proTip: 'When an object is placed between the Focus F and Pole P (u < f), the reflected rays diverge, producing a virtual, erect, and magnified image behind the mirror.',
    vivaQuestion: 'Why is a concave mirror used by dentists and for shaving?',
    vivaAnswer: 'Because when held close to the face (u < f), it forms an erect, enlarged virtual image of teeth or facial skin.',
    keyFormula: '1/f = 1/v + 1/u (f is negative for concave)',
  },
  'glass-slab': {
    title: 'Rectangular Glass Slab Refraction',
    proTip: 'The emergent ray is always parallel to the incident ray (∠i = ∠e) because the two refracting surfaces of a rectangular slab are parallel.',
    vivaQuestion: 'On what factors does the lateral displacement through a glass slab depend?',
    vivaAnswer: '1. Thickness of slab (t), 2. Refractive index (n), and 3. Angle of incidence (i). Lateral displacement increases with all three.',
    keyFormula: 'n = sin(i) / sin(r)',
  },
  'glass-prism': {
    title: 'Equilateral Glass Prism Dispersion',
    proTip: 'Violet light bends the most because it has the shortest wavelength and highest refractive index in glass, while red light bends the least.',
    vivaQuestion: 'What is the condition for minimum deviation (Dm) in a prism?',
    vivaAnswer: 'At minimum deviation, the angle of incidence equals the angle of emergence (i = e), and the refracted ray passes parallel to the prism base.',
    keyFormula: 'n = sin((A + Dm)/2) / sin(A/2)',
  },
  'ph-indicators': {
    title: 'Acid-Base & pH Indicators',
    proTip: 'Universal indicator contains a blend of dyes that changes color continuously from red (pH 1, strong acid) through green (pH 7, neutral) to dark violet (pH 14, strong base).',
    vivaQuestion: 'Why does dry HCl gas not change the color of dry blue litmus paper?',
    vivaAnswer: 'Acids dissociate to release H⁺ (or H₃O⁺) ions only in the presence of water/moisture. Without moisture, no H⁺ ions exist to turn litmus red.',
    keyFormula: 'pH = -log₁₀[H⁺]',
  },
  displacement: {
    title: 'Metal Single Displacement',
    proTip: 'Iron nail placed in blue copper sulphate displaces copper because Iron (Fe) is more reactive than Copper (Cu) in the electrochemical activity series.',
    vivaQuestion: 'Why does the blue color of copper sulphate solution change to pale green?',
    vivaAnswer: 'Blue Cu²⁺ ions are reduced to reddish-brown copper metal on the nail, while iron dissolves to form green Ferrous sulphate (FeSO₄).',
    keyFormula: 'Fe(s) + CuSO₄(aq) ➔ FeSO₄(aq) + Cu(s)',
  },
  conductivity: {
    title: 'Electrolyte Conductance Lab',
    proTip: 'Glucose and alcohol do not conduct electricity because they are covalent compounds and do not dissociate into free ions in aqueous solution.',
    vivaQuestion: 'What particles are responsible for electricity conduction in solutions versus metallic wires?',
    vivaAnswer: 'In metallic wires, free mobile electrons conduct electricity; in electrolyte solutions, free mobile cations and anions conduct current.',
    keyFormula: 'Conductance G = 1/R • I = V/R',
  },
};

export function LabSimAssistant({
  experimentId = 'sandbox',
  currentIssue = null,
  onDismiss,
  className = '',
}: LabSimAssistantProps) {
  // Floating menu open/close state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'viva' | 'formula'>('status');
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Issue balloon visibility
  const [issueVisible, setIssueVisible] = useState(false);
  const [activeIssue, setActiveIssue] = useState<AssistantIssue | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  // Audio & Voice toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Preload browser speech voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch {}
      };
      loadVoices();
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Dismiss on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        setIssueVisible(false);
        stopSpeaking();
      }
    };

    if (drawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  // Sync incoming issue
  useEffect(() => {
    if (currentIssue) {
      setActiveIssue(currentIssue);
      setIssueVisible(true);
      playAlertChime(currentIssue.severity);
      triggerHaptic('alert');
      speakMessage(currentIssue.title + '. ' + currentIssue.message);
    }
  }, [currentIssue]);

  // Mobile Haptic Feedback
  const triggerHaptic = (type: 'alert' | 'fix' | 'click') => {
    if (typeof window === 'undefined' || !navigator?.vibrate) return;
    try {
      if (type === 'alert') {
        navigator.vibrate([60, 40, 90]);
      } else if (type === 'fix') {
        navigator.vibrate([35, 30, 50, 30, 40]);
      } else {
        navigator.vibrate(25);
      }
    } catch {
      // Ignore unsupported browsers
    }
  };

  // 1. Guaranteed Web Audio Melodic Voice Chime (Plays on 100% of browsers)
  const playVocalChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Friendly, melodic 3-tone harmonic arpeggio (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch {}
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    (window as any).__labbyActiveUtterance = null;
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  // 2. High-Fidelity Web Speech Voice Engine (Zero-Cancel Stall, Anti-GC)
  const speakMessage = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    // Guaranteed chime feedback
    playVocalChime();

    if (!('speechSynthesis' in window)) return;

    try {
      // Resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Stop previous
      window.speechSynthesis.cancel();

      // Clean speech text
      const cleanText = text
        .replace(/∠/g, 'angle ')
        .replace(/Δ/g, 'delta ')
        .replace(/•/g, ', ')
        .replace(/➔/g, ' which gives ')
        .replace(/Ω/g, ' Ohms ')
        .replace(/λ/g, ' lambda ')
        .replace(/\+/g, ' plus ')
        .replace(/([a-zA-Z0-9])\/([a-zA-Z0-9])/g, '$1 over $2')
        .replace(/[^a-zA-Z0-9\s.,?!%'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      // Small tick delay to avoid Chromium cancel() stall
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.05;

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const preferred =
              voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google') ||
                    v.name.includes('Jenny') ||
                    v.name.includes('Guy') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Microsoft'))
              ) ||
              voices.find((v) => v.lang.startsWith('en')) ||
              voices[0];

            if (preferred) utterance.voice = preferred;
          }

          utterance.onstart = () => {
            setIsSpeaking(true);
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            (window as any).__labbyActiveUtterance = null;
            utteranceRef.current = null;
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            (window as any).__labbyActiveUtterance = null;
            utteranceRef.current = null;
          };

          // Store on window + ref so Chromium V8 never garbage-collects it
          (window as any).__labbyActiveUtterance = utterance;
          utteranceRef.current = utterance;

          window.speechSynthesis.speak(utterance);
        } catch {
          setIsSpeaking(false);
        }
      }, 40);
    } catch {
      setIsSpeaking(false);
    }
  };

  const playAlertChime = (severity: 'warning' | 'danger' | 'info') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (severity === 'danger') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const playFixSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const handleApplyFix = () => {
    if (!activeIssue) return;
    setIsFixing(true);
    triggerHaptic('fix');
    playFixSound();
    if (activeIssue.onApplyFix) {
      activeIssue.onApplyFix();
    }
    setTimeout(() => {
      setIsFixing(false);
      setIssueVisible(false);
      setActiveIssue(null);
      if (onDismiss) onDismiss();
    }, 500);
  };

  const handleDismissIssue = () => {
    triggerHaptic('click');
    stopSpeaking();
    setIssueVisible(false);
    setActiveIssue(null);
    if (onDismiss) onDismiss();
  };

  const knowledge = EXPERIMENT_KNOWLEDGE[experimentId] || EXPERIMENT_KNOWLEDGE.sandbox;

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-[60] pointer-events-auto select-none ${className}`}
    >
      {/* =========================================================================
          1. ACTIVE HAZARD / SETUP ALERT BALLOON (Pop-up on issue)
         ========================================================================= */}
      {issueVisible && activeIssue && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#FFFFFF]/98 backdrop-blur-xl border-2 border-[#ef4444] rounded-3xl p-4 shadow-[0_12px_40px_rgba(23,35,27,0.25)] text-[#17231B] space-y-2.5 relative">
            <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#17231B] font-mono">
                  Labby Hazard Alert
                </span>
              </div>
              <button
                onClick={handleDismissIssue}
                className="text-[#647067] hover:text-[#17231B] p-1 rounded-md text-xs cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#17231B] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
                <span>{activeIssue.title}</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-[#647067] leading-relaxed">
                {activeIssue.message}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {activeIssue.onApplyFix && (
                <button
                  onClick={handleApplyFix}
                  disabled={isFixing}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#17231B]" />
                  <span>{activeIssue.suggestedActionLabel || 'Auto-Fix Setup'}</span>
                </button>
              )}
              <button
                onClick={handleDismissIssue}
                className="py-2 px-3 rounded-xl bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#647067] text-xs font-semibold border border-[#E2E8DF] cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. INTERACTIVE LABBY AI MENTOR DRAWER (When mascot is tapped)
         ========================================================================= */}
      {drawerOpen && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm rounded-3xl bg-[#FFFFFF] border-2 border-[#B8D96B] shadow-[0_16px_45px_rgba(23,35,27,0.25)] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200 text-[#17231B] max-h-[75vh] overflow-y-auto">
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B8D96B] flex items-center justify-center font-bold text-xs text-[#17231B] shadow-xs">
                ✨
              </div>
              <div>
                <span className="font-extrabold text-xs block text-[#17231B]">Labby AI Science Tutor</span>
                <span className="text-[10px] text-[#647067] font-medium">{knowledge.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Speaking Indicator & Stop Button */}
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Stop Speech"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    speakMessage(
                      `Hello! I am Labby, your virtual lab tutor for ${knowledge.title}. Tap any section below to hear my voice explanation!`
                    )
                  }
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B8D96B]/30 hover:bg-[#B8D96B]/50 text-[#17231B] text-[10px] font-bold border border-[#B8D96B]/60 shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Test Labby Voice"
                >
                  <Volume2 className="w-2.5 h-2.5 text-[#17231B]" />
                  <span>Test Voice</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (soundEnabled) {
                    stopSpeaking();
                    setSoundEnabled(false);
                  } else {
                    setSoundEnabled(true);
                    playVocalChime();
                  }
                }}
                className="p-1 rounded-lg text-[#647067] hover:text-[#17231B] transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-red-500" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setDrawerOpen(false);
                }}
                className="p-1 rounded-lg text-[#647067] hover:text-[#17231B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#F4F7F2] p-1 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('status')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'status' ? 'bg-[#FFFFFF] text-[#17231B] shadow-xs' : 'text-[#647067]'
              }`}
            >
              💡 Pro-Tip
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'viva' ? 'bg-[#FFFFFF] text-[#17231B] shadow-xs' : 'text-[#647067]'
              }`}
            >
              🎯 Viva Q&A
            </button>
            <button
              onClick={() => setActiveTab('formula')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'formula' ? 'bg-[#FFFFFF] text-[#17231B] shadow-xs' : 'text-[#647067]'
              }`}
            >
              📐 Formula
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-2 text-xs">
            {/* 1. PRO-TIP TAB */}
            {activeTab === 'status' && (
              <div className="p-3 rounded-2xl bg-[#F8FAF6] border border-[#B8D96B]/50 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#558120] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Curriculum Insight</span>
                </span>
                <p className="text-[#17231B] text-[11px] leading-relaxed font-medium">
                  {knowledge.proTip}
                </p>

                {/* Primary Voice Button */}
                <div className="pt-1">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="w-full py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speakMessage(knowledge.proTip)}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#17231B] hover:bg-black text-[#B8D96B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                      <span>🔊 Listen to Labby's Pro-Tip</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. VIVA Q&A TAB */}
            {activeTab === 'viva' && (
              <div className="p-3 rounded-2xl bg-[#F8FAF6] border border-[#B8D96B]/50 space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                    Board Viva Voce Question:
                  </span>
                  <p className="font-bold text-[#17231B] text-[11px] mt-0.5">{knowledge.vivaQuestion}</p>
                </div>
                <div className="pt-1.5 border-t border-[#E2E8DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Model Examiner Answer:
                  </span>
                  <p className="text-[11px] text-[#647067] leading-relaxed mt-0.5">{knowledge.vivaAnswer}</p>
                </div>

                {/* Primary Voice Button for Viva */}
                <div className="pt-1">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="w-full py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        speakMessage(
                          `Board viva voce question: ${knowledge.vivaQuestion}. Model examiner answer: ${knowledge.vivaAnswer}`
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-xl bg-[#17231B] hover:bg-black text-[#B8D96B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                      <span>🔊 Read Question & Model Answer</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. FORMULA TAB */}
            {activeTab === 'formula' && (
              <div className="p-3 rounded-2xl bg-[#F8FAF6] border border-[#B8D96B]/50 space-y-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#647067]">
                  Key Governing Equation
                </span>
                <div className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E2E8DF] font-mono text-xs font-bold text-[#17231B]">
                  {knowledge.keyFormula}
                </div>

                {/* Primary Voice Button for Formula */}
                <div className="pt-1">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="w-full py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        speakMessage(
                          `The key governing formula for ${knowledge.title} is: ${knowledge.keyFormula}`
                        )
                      }
                      className="w-full py-1.5 px-3 rounded-xl bg-[#17231B] hover:bg-black text-[#B8D96B] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                      <span>🔊 Explain Formula</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. PERMANENT FLOATING MASCOT BUTTON (Always Available in Bottom-Right)
         ========================================================================= */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => {
            triggerHaptic('click');
            const willOpen = !drawerOpen;
            setDrawerOpen(willOpen);
            if (willOpen) {
              speakMessage(
                `Hello! I am Labby, your virtual lab assistant for ${knowledge.title}. Tap any tab to hear my explanations!`
              );
            } else {
              stopSpeaking();
            }
          }}
          className="group relative flex items-center gap-2 p-1.5 sm:p-2 pr-3.5 sm:pr-4 rounded-full bg-[#17231B] hover:bg-black text-white shadow-2xl border-2 border-[#B8D96B] transition-all transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
          title="Open Labby AI Science Tutor"
          aria-label="Open Labby AI Science Tutor"
        >
          {/* Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-[#B8D96B]/40 blur-md group-hover:blur-lg transition-all animate-pulse" />

          {/* Avatar Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-white/10 relative z-10 border border-white/20 shrink-0">
            <Image
              src="/images/mascot/labby-alert.jpg"
              alt="Labby AI Avatar"
              width={44}
              height={44}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Button Text Pill - Visible on mobile & desktop */}
          <div className="flex flex-col text-left pr-1 relative z-10">
            <span className="text-[11px] sm:text-xs font-black tracking-wider text-[#B8D96B] uppercase flex items-center gap-1 leading-none">
              <span>Ask Labby</span>
              <Sparkles className="w-3 h-3 text-[#B8D96B]" />
            </span>
            <span className="text-[9px] text-slate-300 font-mono mt-0.5 leading-none flex items-center gap-1">
              <span>AI Tutor</span>
              {isSpeaking && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
