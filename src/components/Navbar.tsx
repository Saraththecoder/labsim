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
  Sparkles,
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Compass },
  { name: 'Learn Theory', href: '/learn', icon: BookOpen },
  { name: 'Virtual 3D Lab', href: '/lab', icon: FlaskConical, highlight: true },
  { name: 'AR Mode', href: '/ar', icon: Smartphone, badge: 'WebXR' },
  { name: 'Observations', href: '/observations', icon: TableProperties },
  { name: 'Physics Quiz', href: '/quiz', icon: Award },
  { name: 'Lab Report', href: '/report', icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080d1a]/90 border-b border-cyan-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-400 p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090e1a] rounded-[10px] flex items-center justify-center overflow-hidden relative">
                {/* Convex Lens SVG Icon */}
                <svg viewBox="0 0 40 40" className="w-7 h-7">
                  <path
                    d="M16 6 C 24 14, 24 26, 16 34 C 24 26, 24 14, 16 6 Z"
                    fill="url(#lensGradient)"
                    className="opacity-80"
                  />
                  <line x1="4" y1="20" x2="36" y2="20" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
                  <line x1="6" y1="12" x2="20" y2="12" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="20" y1="12" x2="34" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
                  <line x1="6" y1="28" x2="20" y2="28" stroke="#fbbf24" strokeWidth="1.5" />
                  <line x1="20" y1="28" x2="34" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
                  <defs>
                    <linearGradient id="lensGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                  OptiLab AR
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  Physics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                Convex Lens Virtual & AR Laboratory
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  } ${item.highlight ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/40 text-cyan-200' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
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
              href="/lab"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Lab</span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#090e1a] border-b border-cyan-900/40 px-4 pt-2 pb-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
