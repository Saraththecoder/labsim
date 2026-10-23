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
    }
  }, [isOpen]);

  if (!isOpen || !progress) return null;

  const currentLevelXP = progress.xp % 200;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / 200) * 100));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#17231B]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[#FFFFFF] border border-[#E2E8DF] rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative text-[#17231B] max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#17231B]">
            <Trophy className="w-5 h-5 text-[#B8D96B]" />
            <span>Student Practical Achievements</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] flex items-center justify-center text-xs border border-[#E2E8DF] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level & XP Progress Card */}
        <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#B8D96B]/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#B8D96B] font-extrabold text-xs text-[#17231B] flex items-center justify-center shadow-xs">
                L{progress.level}
              </span>
              <span className="font-bold text-xs text-[#17231B]">
                Level {progress.level} Science Investigator
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#17231B]">
              {progress.xp} Total XP
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2.5 rounded-full bg-[#E2E8DF] overflow-hidden">
              <div
                className="h-full bg-[#B8D96B] rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#647067] font-mono">
              <span>{currentLevelXP} / 200 XP to Level {progress.level + 1}</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#647067]">
            Earned Badges ({progress.badges.length} / {ALL_BADGES.length})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = progress.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                    isUnlocked
                      ? 'bg-[#FFFFFF] border-[#B8D96B] shadow-xs'
                      : 'bg-[#F4F7F2]/60 border-[#E2E8DF] opacity-60'
                  }`}
                >
                  <span className="text-2xl p-1.5 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] shrink-0">
                    {badge.icon}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#17231B] text-[11px] truncate block">
                        {badge.title}
                      </span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
        >
          Keep Experimenting
        </button>
      </div>
    </div>
  );
}
