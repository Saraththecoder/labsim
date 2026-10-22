'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  BookOpen,
  FlaskConical,
  Smartphone,
  TableProperties,
  Award,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Layers,
  Scale,
  Eye,
} from 'lucide-react';
import { CLASS_10_PHYSICS_EXPERIMENTS } from '@/lib/physicsSuiteData';

export default function PhysicsSuiteHubPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Hero Header */}
      <div ref={headerRef} className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#17231B] border border-[#E2E8DF] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
          <span>Class 10 Secondary Board Science Suite</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-normal text-[#17231B] tracking-tight leading-tight font-serif">
          Class 10 Physics <span className="italic">Virtual Laboratory</span>
        </h1>

        <p className="text-sm sm:text-base text-[#647067] leading-relaxed font-normal">
          Complete syllabus coverage for CBSE, ICSE, and State Boards. Conduct interactive 3D simulations, trace realistic light rays, eliminate parallax, verify sign conventions, and place optical apparatus directly on your desk in Augmented Reality.
        </p>
      </div>

      {/* Curriculum Summary Quick Stats */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-3xl font-bold text-[#17231B] font-mono">5</span>
          <p className="text-xs text-[#647067] font-medium">Prescribed Practicals</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-3xl font-bold text-[#17231B] font-mono">6 + 6</span>
          <p className="text-xs text-[#647067] font-medium">Canonical Ray Cases</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-3xl font-bold text-[#17231B] font-mono flex items-center justify-center gap-1">
            WebXR
          </span>
          <p className="text-xs text-[#647067] font-medium">Tabletop AR Support</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-1">
          <span className="text-3xl font-bold text-[#17231B] font-mono">100%</span>
          <p className="text-xs text-[#647067] font-medium">CBSE / ICSE Aligned</p>
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
          <h2 className="text-lg font-bold text-[#17231B] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#17231B]" />
            <span>Prescribed Laboratory Practicals</span>
          </h2>
          <span className="text-xs text-[#647067]">Select an experiment to begin</span>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASS_10_PHYSICS_EXPERIMENTS.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between gap-2 pb-4">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF]">
                  Experiment {exp.number}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50">
                  {exp.status === 'live' ? 'Interactive 3D + AR' : 'Coming Up'}
                </span>
              </div>

              {/* Title & Chapter */}
              <div className="space-y-2 flex-1">
                <span className="text-[11px] font-mono text-[#647067] font-semibold block">
                  {exp.chapter}
                </span>
                <h3 className="text-base font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-[#647067] leading-relaxed line-clamp-3">
                  {exp.aim}
                </p>

                {/* Key Formulas Preview */}
                <div className="pt-3 pb-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#647067] tracking-wider block">
                    Key Formula:
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-xs text-[#17231B] font-bold">
                    {exp.keyFormulae[0]?.formula}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#E2E8DF] flex items-center gap-2">
                <Link
                  href={exp.route}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    exp.status === 'live'
                      ? 'bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] shadow-xs'
                      : 'bg-[#F4F7F2] text-[#647067] hover:bg-[#E2E8DF]'
                  }`}
                >
                  <span>Launch 3D Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/report?exp=${exp.id}`}
                  className="p-2.5 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] border border-[#E2E8DF] transition-colors"
                  title="View Lab Report & Viva Voce"
                >
                  <FileText className="w-4 h-4" />
                </Link>

                {exp.status === 'live' && (
                  <Link
                    href={exp.id === 'convex-lens' ? '/ar' : `${exp.route}#ar`}
                    className="p-2.5 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] border border-[#E2E8DF] transition-colors"
                    title="Launch WebXR AR Mode"
                  >
                    <Smartphone className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pedagogical Formula Comparison Guide: Lens vs Mirror */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#17231B]" />
          <span>Class 10 Board Exam Comparison: Convex Lens vs. Concave Mirror</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#E2E8DF]">
            <thead className="bg-[#F4F7F2] text-[#17231B] border-b border-[#E2E8DF] font-semibold">
              <tr>
                <th className="p-3 border-r border-[#E2E8DF]">Characteristic</th>
                <th className="p-3 border-r border-[#E2E8DF] text-[#17231B] font-bold">Convex Lens (Refraction)</th>
                <th className="p-3 text-[#17231B] font-bold">Concave Mirror (Reflection)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8DF] font-mono text-[#647067]">
              <tr>
                <td className="p-3 border-r border-[#E2E8DF] font-sans font-bold text-[#17231B]">Fundamental Formula</td>
                <td className="p-3 border-r border-[#E2E8DF] text-[#17231B] font-bold">1/v - 1/u = 1/f</td>
                <td className="p-3 text-[#17231B] font-bold">1/v + 1/u = 1/f</td>
              </tr>
              <tr>
                <td className="p-3 border-r border-[#E2E8DF] font-sans font-bold text-[#17231B]">Focal Length Sign (f)</td>
                <td className="p-3 border-r border-[#E2E8DF] text-[#17231B] font-bold">+f (Positive, right focus)</td>
                <td className="p-3 text-[#17231B] font-bold">-f (Negative, front focus)</td>
              </tr>
              <tr>
                <td className="p-3 border-r border-[#E2E8DF] font-sans font-bold text-[#17231B]">Magnification (m)</td>
                <td className="p-3 border-r border-[#E2E8DF]">m = +v / u = hᵢ / hₒ</td>
                <td className="p-3">m = -v / u = hᵢ / hₒ</td>
              </tr>
              <tr>
                <td className="p-3 border-r border-[#E2E8DF] font-sans font-bold text-[#17231B]">Real Image Position</td>
                <td className="p-3 border-r border-[#E2E8DF]">Opposite side (v &gt; 0)</td>
                <td className="p-3">Same side as object (v &lt; 0)</td>
              </tr>
              <tr>
                <td className="p-3 border-r border-[#E2E8DF] font-sans font-bold text-[#17231B]">Virtual Magnified Case</td>
                <td className="p-3 border-r border-[#E2E8DF]">u &lt; f (Magnifying glass)</td>
                <td className="p-3">u &lt; f (Shaving / Dentist mirror)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
