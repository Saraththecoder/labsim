'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, BookOpen, FlaskConical, Smartphone, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="no-print bg-[#060a12] border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                λ
              </div>
              <span className="font-bold text-base text-white tracking-tight">OptiLab AR</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive 3D and Augmented Reality virtual physics laboratory for studying refraction, focal length, and real-time image formation through convex lenses.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aligned with CBSE, ICSE, IB & AP Physics curricula</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Laboratory Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lab" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-cyan-400" />
                  <span>3D Optical Bench</span>
                </Link>
              </li>
              <li>
                <Link href="/ar" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-cyan-400" />
                  <span>WebXR Augmented Reality</span>
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  <span>Optical Theory & Ray Cases</span>
                </Link>
              </li>
              <li>
                <Link href="/observations" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Measurement Table & Graphs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Assessment & Academic */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Academic Output</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/quiz" className="hover:text-cyan-300 transition-colors">
                  Interactive Physics Assessment
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-cyan-300 transition-colors">
                  Printable Lab Practical Sheet
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Sign Convention: New Cartesian</span>
              </li>
              <li>
                <span className="text-slate-500">Lens Equation: 1/f = 1/v - 1/u</span>
              </li>
            </ul>
          </div>

          {/* Device & AR info */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Device Compatibility</h4>
            <p className="text-slate-400">
              WebXR AR is supported on Android Chrome (ARCore) and WebXR viewers. All desktop and tablet devices support the interactive 3D studio and live camera fallback.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Application Version 2.5.0-AR • Production Release
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 OptiLab AR — Virtual Physics Practical Platform. Built for open educational access.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors">Accessibility: WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors">Reduced Motion Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
