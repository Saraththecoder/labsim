'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  BookOpen,
  FlaskConical,
  Smartphone,
  TableProperties,
  Award,
  FileText,
  ChevronDown,
  Atom,
  Zap,
  Trophy,
  Sliders,
} from 'lucide-react';
import { StudentBadgesModal } from '@/components/StudentBadgesModal';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [physicsDropdownOpen, setPhysicsDropdownOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);

  // Clean up any legacy classroom-mode if present
  useEffect(() => {
    document.documentElement.classList.remove('classroom-mode');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ar_studio_classroom_theme');
    }
  }, []);

  const isConductivity = pathname.startsWith('/conductivity');
  const isChemistry = pathname.startsWith('/chemistry') || isConductivity;
  const isPhysics = !isChemistry;

  const physicsExperiments = [
    { name: '1. Convex Lens Optics', href: '/lab', badge: 'Light' },
    { name: '2. Concave Mirror', href: '/physics/concave-mirror', badge: 'Light' },
    { name: '3. Glass Slab Refraction', href: '/physics/glass-slab', badge: 'Light' },
    { name: '4. Glass Prism Dispersion', href: '/physics/glass-prism', badge: 'Light' },
    { name: '5. Ohm’s Law & Circuits', href: '/physics/ohms-law', badge: 'Electricity' },
  ];

  const currentPhysicsExp = physicsExperiments.find((e) => pathname === e.href);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FFFFFF]/95 border-b border-[#E2E8DF] shadow-[0_1px_3px_rgba(23,35,27,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo: LabSim */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#B8D96B]/30 border border-[#B8D96B]/60 text-[#17231B] flex items-center justify-center shadow-[0_0_15px_rgba(184,217,107,0.3)] group-hover:scale-105 transition-transform">
                <Atom className="w-6 h-6 text-[#17231B]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-[#17231B]">LabSim</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF]">
                    AR Studio
                  </span>
                </div>
                <span className="text-[11px] text-[#647067] -mt-0.5 font-medium">Virtual Science Laboratory</span>
              </div>
            </Link>

            {/* Discipline Switcher (Physics vs Chemistry) */}
            <div className="hidden md:flex items-center bg-[#F4F7F2] p-1 rounded-xl border border-[#E2E8DF]">
              <Link
                href="/physics"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isPhysics
                    ? 'bg-[#B8D96B] text-[#17231B] font-extrabold shadow-sm'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>Physics Suite</span>
              </Link>
              <Link
                href="/chemistry"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isChemistry
                    ? 'bg-[#B8D96B] text-[#17231B] font-extrabold shadow-sm'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Chemistry Lab</span>
              </Link>
            </div>
          </div>

          {/* Desktop Right Nav */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Physics Experiments Dropdown */}
            {isPhysics && (
              <div className="relative">
                <button
                  onClick={() => setPhysicsDropdownOpen(!physicsDropdownOpen)}
                  onBlur={() => setTimeout(() => setPhysicsDropdownOpen(false), 200)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#17231B] bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] transition-colors shadow-sm"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-[#17231B]" />
                  <span>{currentPhysicsExp ? currentPhysicsExp.name : 'Experiments'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#647067]" />
                </button>

                {physicsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xl p-2 z-50 space-y-1">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#647067] tracking-wider">
                      Prescribed Practicals
                    </div>
                    {physicsExperiments.map((exp) => (
                      <Link
                        key={exp.href}
                        href={exp.href}
                        onClick={() => setPhysicsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pathname === exp.href
                            ? 'bg-[#B8D96B]/25 text-[#17231B] font-bold'
                            : 'text-[#17231B] hover:bg-[#F4F7F2]'
                        }`}
                      >
                        <span>{exp.name}</span>
                        <span className="text-[9px] font-mono text-[#647067] px-1 py-0.5 rounded bg-[#F4F7F2] border border-[#E2E8DF]">
                          {exp.badge}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              <Link
                href={isConductivity ? '/conductivity/learn' : '/learn'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.includes('/learn')
                    ? 'text-[#17231B] bg-[#B8D96B]/25 font-bold'
                    : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Theory</span>
              </Link>

              <Link
                href="/sandbox"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.includes('/sandbox')
                    ? 'text-[#17231B] bg-[#B8D96B]/25 font-bold'
                    : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
                <span>Sandbox</span>
              </Link>

              <Link
                href={isConductivity ? '/conductivity/ar' : '/ar'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.includes('/ar')
                    ? 'text-[#17231B] bg-[#B8D96B]/25 font-bold'
                    : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
                <span>AR Mode</span>
              </Link>

              <Link
                href={isConductivity ? '/conductivity/report' : '/report'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.includes('/report')
                    ? 'text-[#17231B] bg-[#B8D96B]/25 font-bold'
                    : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Reports</span>
              </Link>

              <Link
                href="/poster"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === '/poster'
                    ? 'text-[#17231B] bg-[#B8D96B]/25 font-bold'
                    : 'text-[#647067] hover:text-[#17231B] hover:bg-[#F4F7F2]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Poster</span>
              </Link>

              <button
                onClick={() => setBadgesOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#B8D96B]/25 hover:bg-[#B8D96B]/40 border border-[#B8D96B] text-[#17231B] transition-all shadow-xs cursor-pointer ml-1 text-xs font-bold"
                title="View Practical Achievements & Level"
                aria-label="View Practical Achievements & Level"
              >
                <Trophy className="w-3.5 h-3.5 text-[#17231B]" />
                <span className="hidden xl:inline text-[11px]">Awards</span>
              </button>
            </nav>
          </div>

          {/* Mobile Right: Trophy + AR + Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setBadgesOpen(true)}
              className="w-9 h-9 rounded-full bg-[#B8D96B]/25 hover:bg-[#B8D96B]/40 border border-[#B8D96B] flex items-center justify-center text-[#17231B] transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
              title="Student Practical Achievements & XP"
              aria-label="Student Practical Achievements & XP"
            >
              <Trophy className="w-4 h-4 text-[#17231B]" />
            </button>

            <Link
              href="/ar"
              className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-[#B8D96B] text-[#17231B] flex items-center gap-1 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>AR</span>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg text-[#17231B] hover:bg-[#F4F7F2] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#E2E8DF] px-4 pt-3 pb-5 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Gamification / Trophy Quick Banner */}
          <div className="p-3 bg-gradient-to-r from-[#B8D96B]/20 via-[#B8D96B]/10 to-transparent border border-[#B8D96B]/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#B8D96B] flex items-center justify-center text-[#17231B] shadow-xs shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#17231B] truncate">Student Practical Awards</div>
                <div className="text-[10px] text-[#647067] truncate">Earn XP & unlock AR lab badges</div>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileOpen(false);
                setBadgesOpen(true);
              }}
              className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#17231B] text-[#FFFFFF] hover:bg-black transition-colors shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              View Awards
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E2E8DF] text-xs">
            <Link
              href="/physics"
              onClick={() => setMobileOpen(false)}
              className={`p-2 rounded-xl text-center font-bold transition-colors ${
                isPhysics ? 'bg-[#B8D96B] text-[#17231B]' : 'bg-[#F4F7F2] text-[#647067]'
              }`}
            >
              ⚛ Physics Suite
            </Link>
            <Link
              href="/chemistry"
              onClick={() => setMobileOpen(false)}
              className={`p-2 rounded-xl text-center font-bold transition-colors ${
                isChemistry ? 'bg-[#B8D96B] text-[#17231B]' : 'bg-[#F4F7F2] text-[#647067]'
              }`}
            >
              🧪 Chemistry Lab
            </Link>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-[#647067] px-3 py-1">NCERT Class 10 Practicals</p>
            {physicsExperiments.map((exp) => (
              <Link
                key={exp.href}
                href={exp.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium ${
                  pathname === exp.href ? 'bg-[#B8D96B]/25 text-[#17231B] font-bold' : 'text-[#17231B]'
                }`}
              >
                <span>{exp.name}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-[#F4F7F2] text-[#647067] font-mono border border-[#E2E8DF]">
                  {exp.badge}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E2E8DF] space-y-1">
            <Link
              href="/sandbox"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#17231B] hover:bg-[#F4F7F2]"
            >
              <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Interactive Circuit Sandbox</span>
            </Link>
            <Link
              href={isConductivity ? '/conductivity/learn' : '/learn'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#17231B] hover:bg-[#F4F7F2]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#647067]" />
              <span>Theory & Principles</span>
            </Link>
            <Link
              href={isConductivity ? '/conductivity/ar' : '/ar'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#17231B] hover:bg-[#F4F7F2]"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#647067]" />
              <span>Tabletop WebXR AR Mode</span>
            </Link>
            <Link
              href={isConductivity ? '/conductivity/observations' : '/observations'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#17231B] hover:bg-[#F4F7F2]"
            >
              <TableProperties className="w-3.5 h-3.5 text-[#647067]" />
              <span>Observation Tables</span>
            </Link>
            <Link
              href={isConductivity ? '/conductivity/report' : '/report'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#17231B] hover:bg-[#F4F7F2]"
            >
              <FileText className="w-3.5 h-3.5 text-[#647067]" />
              <span>Printable Lab Report & Viva</span>
            </Link>
            <Link
              href="/poster"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project Presentation Poster (A0/A1)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Student Badges & Progress Modal */}
      <StudentBadgesModal isOpen={badgesOpen} onClose={() => setBadgesOpen(false)} />
    </header>
  );
}
