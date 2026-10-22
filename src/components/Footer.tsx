'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, FlaskConical, Smartphone, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="no-print bg-[#FFFFFF] border-t border-[#E2E8DF] text-[#647067] text-sm mt-auto shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#B8D96B]/30 border border-[#B8D96B]/60 flex items-center justify-center text-[#17231B] font-bold text-xs">
                λ
              </div>
              <span className="font-bold text-base text-[#17231B] tracking-tight">LabSim</span>
            </div>
            <p className="text-xs text-[#647067] leading-relaxed">
              Interactive 3D and Augmented Reality virtual laboratory for studying physics and chemistry phenomena in real-time.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#17231B]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#558120]" />
              <span>Aligned with CBSE, ICSE, IB & AP Physics curricula</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-[#17231B] uppercase tracking-wider mb-3">Laboratory Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lab" className="hover:text-[#17231B] transition-colors flex items-center gap-1.5 text-[#647067]">
                  <FlaskConical className="w-3 h-3 text-[#17231B]" />
                  <span>3D Optical Bench</span>
                </Link>
              </li>
              <li>
                <Link href="/ar" className="hover:text-[#17231B] transition-colors flex items-center gap-1.5 text-[#647067]">
                  <Smartphone className="w-3 h-3 text-[#17231B]" />
                  <span>WebXR Augmented Reality</span>
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-[#17231B] transition-colors flex items-center gap-1.5 text-[#647067]">
                  <BookOpen className="w-3 h-3 text-[#17231B]" />
                  <span>Optical Theory & Ray Cases</span>
                </Link>
              </li>
              <li>
                <Link href="/observations" className="hover:text-[#17231B] transition-colors flex items-center gap-1.5 text-[#647067]">
                  <Compass className="w-3 h-3 text-[#17231B]" />
                  <span>Measurement Table & Graphs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Assessment & Academic */}
          <div>
            <h4 className="text-xs font-semibold text-[#17231B] uppercase tracking-wider mb-3">Academic Output</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz" className="hover:text-[#17231B] transition-colors text-[#647067]">
                  Interactive Physics Assessment
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#17231B] transition-colors text-[#647067]">
                  Printable Lab Practical Sheet
                </Link>
              </li>
              <li>
                <span className="text-[#647067]">Sign Convention: New Cartesian</span>
              </li>
              <li>
                <span className="text-[#647067]">Lens Equation: 1/f = 1/v - 1/u</span>
              </li>
            </ul>
          </div>

          {/* Device & AR info */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-[#17231B] uppercase tracking-wider mb-3">Device Compatibility</h4>
            <p className="text-[#647067]">
              WebXR AR is supported on Android Chrome (ARCore) and WebXR viewers. All desktop and tablet devices support the interactive 3D studio and live camera fallback.
            </p>
            <div className="pt-2 text-[11px] text-[#647067]">
              Application Version 2.5.0-AR • Production Release
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E2E8DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#647067] gap-4">
          <p>© 2026 LabSim — Virtual Science Laboratory. Built for open educational access.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#17231B] transition-colors">Accessibility: WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span className="hover:text-[#17231B] transition-colors">Reduced Motion Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
