'use client';

import React, { useState, useEffect } from 'react';
import { Atom, Sparkles, ArrowRight, FlaskConical } from 'lucide-react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation from 0 to 100% over 1.3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 70);

    // Auto-dismiss smoothly after 1.4 seconds
    const timeout = setTimeout(() => {
      handleDismiss();
    }, 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#17231B] text-[#FFFFFF] px-6 transition-all duration-500 ${
        fading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#B8D96B]/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-6">
        {/* Animated Brand Logo Icon */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#B8D96B]/20 border-2 border-[#B8D96B]/70 flex items-center justify-center shadow-[0_0_40px_rgba(184,217,107,0.4)] animate-pulse">
            <Atom className="w-12 h-12 sm:w-14 sm:h-14 text-[#B8D96B] animate-cute-spin" />
          </div>
          {/* Orbiting particles */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#38B2AC] shadow-[0_0_12px_#38B2AC] animate-ping" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#B8D96B] text-[11px] font-mono font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3 h-3 text-[#B8D96B]" />
            <span>Virtual Science Laboratory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal font-serif text-[#FFFFFF] tracking-tight">
            Lab<span className="text-[#B8D96B] font-bold">Sim</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#A0AEC0] max-w-xs mx-auto leading-relaxed">
            Class 10 CBSE & ICSE Practical Syllabus in Interactive 3D & Augmented Reality
          </p>
        </div>

        {/* Progress Bar & Status */}
        <div className="w-full space-y-2 max-w-xs">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#B8D96B] to-[#38B2AC] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#B8D96B]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A0AEC0]">
            <span>Calibrating 3D Optics & Circuits...</span>
            <span className="text-[#B8D96B] font-bold">{progress}%</span>
          </div>
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={handleDismiss}
          className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer mt-2"
        >
          <span>Enter Laboratory</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B8D96B]" />
        </button>
      </div>
    </div>
  );
}
