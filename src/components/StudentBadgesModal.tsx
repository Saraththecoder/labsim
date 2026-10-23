'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  ALL_BADGES,
  getStudentProgress,
  StudentProgress,
} from '@/lib/gamification';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentBadgesModal({ isOpen, onClose }: BadgesModalProps) {
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProgress(getStudentProgress());
      // Prevent background scrolling while modal is open
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !progress) return null;

  const currentLevelXP = progress.xp % 200;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-[#17231B]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 touch-manipulation"
    >
      <div className="bg-[#FFFFFF] border border-[#E2E8DF] rounded-3xl max-w-lg w-full flex flex-col shadow-2xl relative text-[#17231B] max-h-[85vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ===================================================================
            1. FIXED HEADER (Always visible on all screen sizes)
           =================================================================== */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8DF] shrink-0 bg-white">
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-[#17231B]">
            <div className="w-8 h-8 rounded-xl bg-[#B8D96B]/30 border border-[#B8D96B]/60 flex items-center justify-center text-[#17231B] shadow-xs shrink-0">
              <Trophy className="w-4 h-4 text-[#17231B]" />
            </div>
            <div>
              <span className="block leading-tight text-xs sm:text-sm font-extrabold">Student Practical Achievements</span>
              <span className="text-[10px] text-[#647067] font-medium leading-none">
                {progress.badges.length} of {ALL_BADGES.length} Badges Unlocked
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] flex items-center justify-center text-xs border border-[#E2E8DF] cursor-pointer shrink-0 transition-colors active:scale-95"
            aria-label="Close Achievements Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================================
            2. SCROLLABLE BODY (Scrolls independently within viewport)
           =================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Level & XP Progress Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAF6] border border-[#B8D96B]/50 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-[#B8D96B] font-extrabold text-xs text-[#17231B] flex items-center justify-center shadow-xs shrink-0">
                  L{progress.level}
                </span>
                <span className="font-bold text-xs text-[#17231B] truncate">
                  Level {progress.level} Science Investigator
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#17231B] shrink-0 bg-white px-2 py-0.5 rounded-md border border-[#E2E8DF]">
                {progress.xp} XP
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-[#E2E8DF] overflow-hidden">
                <div
                  className="h-full bg-[#B8D96B] rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#647067] font-mono">
                <span>{currentLevelXP} / 200 XP to Level {progress.level + 1}</span>
                <span className="font-bold text-[#17231B]">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#647067]">
                Practical Badges ({progress.badges.length} / {ALL_BADGES.length})
              </span>
              <span className="text-[10px] text-[#558120] font-bold">
                +{progress.badges.length * 50} XP Earned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {ALL_BADGES.map((badge) => {
                const isUnlocked = progress.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                      isUnlocked
                        ? 'bg-[#FFFFFF] border-[#B8D96B] shadow-xs'
                        : 'bg-[#F4F7F2]/60 border-[#E2E8DF] opacity-60'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] shrink-0">
                      {badge.icon}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[#17231B] text-[11px] truncate block">
                          {badge.title}
                        </span>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-3 h-3 text-[#647067] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#647067] leading-tight line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. FIXED FOOTER (Always visible and clickable on all screen sizes)
           =================================================================== */}
        <div className="p-3.5 sm:p-4 border-t border-[#E2E8DF] shrink-0 bg-[#F9FAF8]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#17231B]" />
            <span>Keep Experimenting</span>
          </button>
        </div>
      </div>
    </div>
  );
}
