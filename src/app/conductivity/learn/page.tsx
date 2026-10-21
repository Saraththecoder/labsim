'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FlaskConical,
  Zap,
  ArrowRight,
  CheckCircle2,
  TableProperties,
} from 'lucide-react';
import { SOLUTIONS_DATABASE } from '@/lib/conductivityPhysics';

export default function ConductivityLearnPage() {
  const [selectedSolution, setSelectedSolution] = useState(SOLUTIONS_DATABASE[1]); // NaCl

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Curriculum Module: Electrochemistry & Electrolytic Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Electrolytic Conduction & Kohlrausch’s Law
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Unlike metallic conductors where electrical charge is carried by electrons, electricity in solutions is transported by the physical migration of <strong>solvated cations and anions</strong> toward oppositely charged electrodes.
        </p>
      </div>

      {/* Classification of Electrolytes */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>1. Classification of Electrolytic Substances</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090e1a] border border-emerald-900/50 space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Complete Ionization (α ≈ 1)
            </span>
            <h3 className="text-base font-bold text-white">Strong Electrolytes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Substances that dissociate almost completely into ions at all concentrations. High population of charge carriers gives high conductance.
            </p>
            <div className="text-xs text-emerald-400 font-mono pt-2 border-t border-slate-800">
              Examples: HCl, NaCl, NaOH, KCl, CuSO₄, KNO₃
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090e1a] border border-amber-900/50 space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
              Partial Ionization (α &lt;&lt; 1)
            </span>
            <h3 className="text-base font-bold text-white">Weak Electrolytes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Substances that dissociate only slightly at normal concentrations, establishing a dynamic chemical equilibrium. Low ion count causes dim bulb glow.
            </p>
            <div className="text-xs text-amber-400 font-mono pt-2 border-t border-slate-800">
              Examples: CH₃COOH, NH₄OH, H₂CO₃, HCN
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090e1a] border border-rose-900/50 space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-950 text-rose-300 border border-rose-800">
              Zero Ionization (α = 0)
            </span>
            <h3 className="text-base font-bold text-white">Non-Electrolytes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Covalent substances that dissolve as intact neutral molecules. No ions are produced, yielding virtually infinite electrical resistance.
            </p>
            <div className="text-xs text-rose-400 font-mono pt-2 border-t border-slate-800">
              Examples: Glucose (C₆H₁₂O₆), Sucrose, Urea, Ethanol
            </div>
          </div>
        </div>
      </section>

      {/* Fundamental Formulas */}
      <section className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white">2. Essential Electrochemistry Formulas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0b1220] border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">Cell Constant (G*)</span>
            <div className="text-lg font-mono font-bold text-white">G* = l / A = R × κ</div>
            <p className="text-slate-400 leading-relaxed">
              Geometric ratio of distance between plates (l) to their surface area (A). Expressed in cm⁻¹ or m⁻¹.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1220] border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Specific Conductivity (κ)</span>
            <div className="text-lg font-mono font-bold text-white">κ = G × G* = (1/R) × (l/A)</div>
            <p className="text-slate-400 leading-relaxed">
              Conductance of 1 cm³ volume of the electrolytic solution. Measured in S · cm⁻¹ or Ω⁻¹ · cm⁻¹.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1220] border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Molar Conductivity (Λₘ)</span>
            <div className="text-lg font-mono font-bold text-white">Λₘ = (1000 × κ) / C</div>
            <p className="text-slate-400 leading-relaxed">
              Conducting power of all the ions produced by dissolving 1 mole of an electrolyte in V cm³ of solution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1220] border border-slate-800 space-y-2">
            <span className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">Degree of Dissociation (α)</span>
            <div className="text-lg font-mono font-bold text-white">α = Λₘ / Λₘ°</div>
            <p className="text-slate-400 leading-relaxed">
              Fraction of weak electrolyte molecules ionized at concentration C relative to infinite dilution (Λₘ°).
            </p>
          </div>
        </div>
      </section>

      {/* Kohlrausch's Law Section */}
      <section className="p-6 rounded-2xl bg-[#090e1a] border border-amber-900/40 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>3. Kohlrausch&apos;s Law of Independent Migration of Ions</span>
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          &quot;At infinite dilution, when dissociation of an electrolyte is complete and all inter-ionic attractions disappear, each ion makes a definite contribution toward the molar conductivity of the electrolyte, irrespective of the nature of the other ion with which it is associated.&quot;
        </p>

        <div className="p-4 rounded-xl bg-[#0b1322] border border-slate-800 font-mono text-center text-sm font-bold text-amber-300">
          Λₘ° = ν₊ · λ₊° + ν₋ · λ₋°
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
          <div className="space-y-1">
            <h4 className="font-bold text-white">Determination of Λₘ° for Weak Electrolytes:</h4>
            <p className="text-slate-400 leading-relaxed">
              For weak electrolytes like acetic acid, direct extrapolation of Λₘ vs √C to C = 0 is impossible because the curve becomes nearly vertical. Kohlrausch’s law allows exact calculation by combining strong electrolyte data:
            </p>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-cyan-300">
              Λ°(CH₃COOH) = Λ°(CH₃COONa) + Λ°(HCl) - Λ°(NaCl)
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-white">Anomalous Mobility of H⁺ and OH⁻ Ions:</h4>
            <p className="text-slate-400 leading-relaxed">
              Protons (H⁺) and hydroxide ions (OH⁻) have extraordinary limiting molar conductivities (λ°(H⁺) = 349.6, λ°(OH⁻) = 199.1 S cm² mol⁻¹) compared to other ions (Na⁺ = 50.1). This is due to the <strong>Grotthuss mechanism</strong> (rapid proton hopping along hydrogen-bonded chains) rather than ordinary hydrodynamic drift.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to Lab */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-[#080d19] border border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Ready to test solutions on the virtual bench?</h3>
          <p className="text-xs text-slate-400">
            Mount platinum electrodes into different solutions and observe circuit currents.
          </p>
        </div>
        <Link
          href="/conductivity/lab"
          className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all shrink-0"
        >
          <span>Open 3D Conductivity Lab</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
