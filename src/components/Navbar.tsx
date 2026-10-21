'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Compass,
  BookOpen,
  FlaskConical,
  Smartphone,
  TableProperties,
  Award,
  FileText,
  Zap,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check which experiment is active based on path
  const isConductivity = pathname.startsWith('/conductivity');

  const opticsNavItems = [
    { name: 'Home', href: '/', icon: Compass },
    { name: 'Theory', href: '/learn', icon: BookOpen },
    { name: '3D Optics Bench', href: '/lab', icon: FlaskConical, highlight: true },
    { name: 'AR Mode', href: '/ar', icon: Smartphone, badge: 'WebXR' },
    { name: 'Observations', href: '/observations', icon: TableProperties },
    { name: 'Quiz', href: '/quiz', icon: Award },
    { name: 'Lab Report', href: '/report', icon: FileText },
  ];

  const conductivityNavItems = [
    { name: 'Hub', href: '/conductivity', icon: Compass },
    { name: 'Theory', href: '/conductivity/learn', icon: BookOpen },
    { name: '3D Beaker Cell', href: '/conductivity/lab', icon: FlaskConical, highlight: true },
    { name: 'AR Mode', href: '/conductivity/ar', icon: Smartphone, badge: 'WebXR' },
    { name: 'Observations', href: '/conductivity/observations', icon: TableProperties },
    { name: 'Quiz', href: '/conductivity/quiz', icon: Award },
    { name: 'Lab Report', href: '/conductivity/report', icon: FileText },
  ];

  const activeNavItems = isConductivity ? conductivityNavItems : opticsNavItems;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080d1a]/95 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Experiment Switcher */}
          <div className="flex items-center gap-4">
            <Link href={isConductivity ? '/conductivity' : '/'} className="flex items-center gap-2.5 group">
              <div
                className={`w-9 h-9 rounded-xl p-[1.5px] transition-transform group-hover:scale-105 shadow-md flex items-center justify-center ${
                  isConductivity
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold'
                    : 'bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 font-bold'
                }`}
              >
                {isConductivity ? <Zap className="w-5 h-5 text-slate-950" /> : 'λ'}
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">
                  {isConductivity ? 'ConductoLab AR' : 'OptiLab AR'}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">
                  {isConductivity ? 'Ionic Solutions' : 'Convex Lens Optics'}
                </span>
              </div>
            </Link>

            {/* Experiment Switcher Pills (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-slate-800 text-xs">
              <Link
                href="/lab"
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  !isConductivity
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔬 Optics Lab</span>
              </Link>

              <Link
                href="/conductivity/lab"
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isConductivity
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡ Conductivity Lab</span>
              </Link>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? isConductivity
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1 py-0.2 text-[8px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href={isConductivity ? '/lab' : '/conductivity/lab'}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <span>{isConductivity ? 'Switch: Optics' : 'Switch: Chem'}</span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#090e1a] border-b border-slate-800 px-4 pt-2 pb-5 space-y-2">
          {/* Lab Switcher in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800 text-xs">
            <Link
              href="/lab"
              onClick={() => setMobileOpen(false)}
              className={`p-2 rounded-lg text-center font-bold ${
                !isConductivity ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              🔬 Optics Lab
            </Link>
            <Link
              href="/conductivity/lab"
              onClick={() => setMobileOpen(false)}
              className={`p-2 rounded-lg text-center font-bold ${
                isConductivity ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              ⚡ Conductivity Lab
            </Link>
          </div>

          <div className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-slate-800 text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
