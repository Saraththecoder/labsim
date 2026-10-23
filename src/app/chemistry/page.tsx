'use client';

import React from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Droplets,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';

const CHEMISTRY_EXPERIMENTS = [
  {
    id: 'ph-indicators',
    number: 'NCERT Exp 2',
    title: 'Acid-Base & pH Indicators Testing',
    description: 'Determine the pH and acidic/basic nature of HCl, NaOH, CH₃COOH, lemon juice, NaHCO₃, and water using Universal Indicator and Litmus Papers.',
    href: '/chemistry/ph-indicators',
    badge: 'Colorimetric Lab',
    icon: '🧪',
    color: '#B8D96B',
  },
  {
    id: 'displacement',
    number: 'NCERT Exp 3',
    title: 'Displacement Reaction (Fe in CuSO₄)',
    description: 'Observe the single displacement reaction between iron nails and azure blue copper sulphate solution, verifying the metal reactivity series.',
    href: '/chemistry/displacement',
    badge: 'Reaction Kinetic Lab',
    icon: '⚗️',
    color: '#0284c7',
  },
  {
    id: 'conductivity',
    number: 'NCERT Exp 4',
    title: 'Electrical Conductivity of Electrolytes',
    description: 'Test electrical conductivity across distilled water, salt water, dilute acids, and alcohol in an interactive 3D beaker circuit.',
    href: '/conductivity',
    badge: '3D Beaker Circuit',
    icon: '⚡',
    color: '#f59e0b',
  },
];

export default function ChemistrySuitePage() {
  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-6 px-4 sm:px-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B8D96B]/30 text-[#17231B] text-[10px] font-bold border border-[#B8D96B]/60 uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Class 10 CBSE / ICSE Curriculum</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17231B] tracking-tight">
            Chemistry Virtual Laboratory Suite
          </h1>
          <p className="text-xs text-[#647067] max-w-xl">
            Simulate chemical titrations, pH indicator changes, and metal displacement reactions safely without toxic fumes or glassware breakage.
          </p>
        </div>

        <Link
          href="/report?exp=convex-lens"
          className="px-4 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] text-xs font-bold border border-[#E2E8DF] transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4" />
          <span>Lab Manuals & Reports</span>
        </Link>
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CHEMISTRY_EXPERIMENTS.map((exp) => (
          <Link
            key={exp.id}
            href={exp.href}
            className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-sm hover:shadow-xl hover:border-[#B8D96B] transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-2xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:scale-110 transition-transform">
                  {exp.icon}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#F4F7F2] text-[#17231B] border border-[#E2E8DF]">
                  {exp.number}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#17231B] group-hover:text-emerald-800 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-[#647067] leading-relaxed line-clamp-3">
                  {exp.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8DF] text-xs font-bold text-[#17231B]">
              <span className="text-[10px] text-[#647067] font-mono">{exp.badge}</span>
              <span className="flex items-center gap-1 text-[#17231B] group-hover:translate-x-1 transition-transform">
                <span>Enter Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Safety & Lab Best Practices Callout */}
      <div className="p-4 rounded-2xl bg-[#F8FAF6] border border-[#E2E8DF] flex items-center justify-between gap-4 text-xs text-[#647067]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B8D96B]/30 border border-[#B8D96B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#17231B]" />
          </div>
          <div>
            <span className="font-bold text-[#17231B] block">Safe Experimental Learning Guaranteed</span>
            <p className="text-[11px] leading-tight">
              All chemical reactions conform strictly to official NCERT laboratory safety guidelines and stoichiometry calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
