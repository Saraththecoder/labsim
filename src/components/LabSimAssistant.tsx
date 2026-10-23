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
} from 'lucide-react';

export interface AssistantIssue {
  id: string;
  experimentId: string;
  severity: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  suggestedActionLabel: string;
  onApplyFix: () => void;
}

interface LabSimAssistantProps {
  currentIssue: AssistantIssue | null;
  onDismiss?: () => void;
  className?: string;
}

export function LabSimAssistant({
  currentIssue,
  onDismiss,
  className = '',
}: LabSimAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissedCurrent, setHasDismissedCurrent] = useState(false);
  const [lastIssueId, setLastIssueId] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play soft friendly web audio chime on error
  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (currentIssue && currentIssue.id !== lastIssueId) {
      setLastIssueId(currentIssue.id);
      setHasDismissedCurrent(false);
      setIsVisible(true);
      playChime();

      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      // Auto-hide after 12 seconds if not interacted
      autoHideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 12000);
    } else if (!currentIssue) {
      setIsVisible(false);
    }

    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [currentIssue]);

  const handleFix = () => {
    if (!currentIssue) return;
    setIsFixing(true);
    currentIssue.onApplyFix();
    setTimeout(() => {
      setIsFixing(false);
      setIsVisible(false);
      setHasDismissedCurrent(true);
      if (onDismiss) onDismiss();
    }, 600);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissedCurrent(true);
    if (onDismiss) onDismiss();
  };

  if (!currentIssue || hasDismissedCurrent) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-8 z-50 pointer-events-auto transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
      } ${className}`}
    >
      <div className="relative flex items-end gap-3 max-w-sm sm:max-w-md">
        {/* Character Speech Bubble */}
        <div className="bg-[#FFFFFF]/98 backdrop-blur-xl border-2 border-[#B8D96B] rounded-3xl p-4 shadow-[0_12px_40px_rgba(23,35,27,0.22)] text-[#17231B] space-y-2.5 relative">
          {/* Decorative speech arrow pointing to mascot */}
          <div className="absolute -right-2 bottom-8 w-4 h-4 bg-[#FFFFFF] border-r-2 border-b-2 border-[#B8D96B] transform -rotate-45" />

          {/* Top Header of Speech Bubble */}
          <div className="flex items-center justify-between gap-2 border-b border-[#E2E8DF] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17231B] font-mono">
                Labby AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-[#647067] hover:text-[#17231B] p-1 rounded-md text-xs cursor-pointer"
                title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDismiss}
                className="text-[#647067] hover:text-[#17231B] p-1 rounded-md text-xs cursor-pointer"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#17231B] flex items-center gap-1.5 leading-snug">
              <AlertTriangle className="w-4 h-4 text-[#ef4444] shrink-0" />
              <span>{currentIssue.title}</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-[#647067] leading-relaxed">
              {currentIssue.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleFix}
              disabled={isFixing}
              className="flex-1 py-2 px-3 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isFixing ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#17231B] border-t-transparent animate-spin" />
                  <span>Fixing Setup...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 text-[#17231B]" />
                  <span>{currentIssue.suggestedActionLabel}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#647067] hover:text-[#17231B] font-semibold text-xs border border-[#E2E8DF] transition-all cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>

        {/* 3D Character Avatar (Peeking out from corner) */}
        <div className="shrink-0 relative group">
          {/* Subtle animated neon pedestal ring */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#B8D96B]/50 rounded-full blur-md animate-pulse" />

          {/* Mascot Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#B8D96B] bg-[#17231B] overflow-hidden shadow-2xl relative animate-bounce duration-1000">
            <Image
              src="/images/mascot/labby-alert.jpg"
              alt="Labby AI Science Assistant"
              width={96}
              height={96}
              className="w-full h-full object-cover transform scale-110"
              priority
            />
          </div>

          {/* Name Tag Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#17231B] border border-[#B8D96B] text-[9px] font-bold text-[#B8D96B] shadow-md tracking-wider">
            LABBY
          </div>
        </div>
      </div>
    </div>
  );
}
