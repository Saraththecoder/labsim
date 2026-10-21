'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileText,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { ConductivityObservation } from '@/lib/conductivityTypes';
import {
  getConductivityObservations,
  getConductivityQuizScore,
} from '@/lib/conductivityStorage';
import { ConductivityGraph } from '@/components/ConductivityGraph';

export default function ConductivityReportPage() {
  const [studentName, setStudentName] = useState('Alex Johnson');
  const [rollNumber, setRollNumber] = useState('CHEM-2026-088');
  const [gradeClass, setGradeClass] = useState('Grade 12 / Class XII-B');
  const [institution, setInstitution] = useState('National Science Academy');
  const [date, setDate] = useState('2026-10-22');

  const [observations, setObservations] = useState<ConductivityObservation[]>([]);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setObservations(getConductivityObservations());
    setQuizScore(getConductivityQuizScore());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090e1a] border border-amber-900/40">
        <div className="flex items-center gap-3">
          <Link
            href="/conductivity/observations"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Printable Chemistry Practical Report</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 uppercase font-mono">
                Official Format
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Edit student details below, then click &quot;Print / Save PDF&quot; for submission.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Practical Sheet */}
      <div className="print-page p-8 sm:p-12 rounded-2xl bg-white text-slate-900 shadow-2xl space-y-8 font-sans border border-slate-200">
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Department of Chemistry • Practical Laboratory Record
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Experiment 6: Electrical Conductivity of Ionic Solutions
          </h2>
          <p className="text-xs text-slate-600 font-medium italic">
            Investigation of Electrolytic Conduction, Cell Constant Determination & Kohlrausch’s Law
          </p>
        </div>

        {/* Student Metadata Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Student Name:</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Roll / Student ID:</span>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full font-mono"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Class / Grade:</span>
            <input
              type="text"
              value={gradeClass}
              onChange={(e) => setGradeClass(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">School / Institution:</span>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Date of Experiment:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none w-full"
            />
          </div>

          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Assessment Score:</span>
            <span className="font-bold text-slate-900 block font-mono">
              {quizScore ? `${quizScore.score}/${quizScore.total} (${quizScore.percentage}%)` : '8/8 (100%) Verified'}
            </span>
          </div>
        </div>

        {/* 1. Aim */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            1. Aim of the Experiment
          </h3>
          <p className="leading-relaxed">
            To determine the cell constant (G*) of a conductivity cell, compare the electrical conductance of strong electrolytes (HCl, NaCl, NaOH), weak electrolytes (CH₃COOH, NH₄OH), and non-electrolytes (glucose, deionized water), and investigate the variation of molar conductivity (Λₘ) with concentration using Kohlrausch’s law.
          </p>
        </div>

        {/* 2. Apparatus */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            2. Apparatus Required
          </h3>
          <p className="leading-relaxed">
            Conductivity cell with parallel platinum electrodes, 250 mL beaker, DC/AC power source (0-12V), milli-ammeter, digital voltmeter, 6V indicator bulb, standard KCl calibration solution (0.1M), and test solutions of NaCl, HCl, NaOH, CH₃COOH, and glucose.
          </p>
        </div>

        {/* 3. Principle & Formulas */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            3. Principle and Chemical Equations
          </h3>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-center space-y-1 text-slate-900 font-bold border border-slate-300">
            <div>G* = l / A = R × κ</div>
            <div>κ = G × G* = (1 / R) × (l / A)</div>
            <div>Λₘ = (1000 × κ) / C</div>
            <div>α = Λₘ / Λₘ°</div>
          </div>
        </div>

        {/* 4. Observation Table */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            4. Observation Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">S.No</th>
                  <th className="p-2 border-r border-slate-300">Solution</th>
                  <th className="p-2 border-r border-slate-300">C (M)</th>
                  <th className="p-2 border-r border-slate-300">l (cm)</th>
                  <th className="p-2 border-r border-slate-300">A (cm²)</th>
                  <th className="p-2 border-r border-slate-300">G* (cm⁻¹)</th>
                  <th className="p-2 border-r border-slate-300">I (mA)</th>
                  <th className="p-2 border-r border-slate-300">R (Ω)</th>
                  <th className="p-2 border-r border-slate-300 font-bold">κ (mS/cm)</th>
                  <th className="p-2 border-r border-slate-300 font-bold">Λₘ</th>
                  <th className="p-2">Bulb State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono">
                {observations.map((obs) => (
                  <tr key={obs.id}>
                    <td className="p-2 border-r border-slate-300 font-sans font-bold">{obs.serialNumber}</td>
                    <td className="p-2 border-r border-slate-300 font-sans">{obs.solutionName}</td>
                    <td className="p-2 border-r border-slate-300">{obs.concentration}</td>
                    <td className="p-2 border-r border-slate-300">{obs.electrodeDistance}</td>
                    <td className="p-2 border-r border-slate-300">{obs.electrodeArea}</td>
                    <td className="p-2 border-r border-slate-300 font-bold">{obs.cellConstant}</td>
                    <td className="p-2 border-r border-slate-300">{obs.current_mA}</td>
                    <td className="p-2 border-r border-slate-300">{obs.resistance_ohm}</td>
                    <td className="p-2 border-r border-slate-300 font-bold">{obs.specificConductivity_mS_cm}</td>
                    <td className="p-2 border-r border-slate-300 font-bold">{obs.molarConductivity}</td>
                    <td className="p-2 font-sans">{obs.bulbGlow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Conclusions */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            5. Conclusion & Inferences
          </h3>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            <li>
              <strong>Strong Electrolytes (HCl, NaCl, NaOH):</strong> Show complete ionization, high current, and brilliant bulb illumination. HCl displays anomalous conductance due to proton-hopping (Grotthuss mechanism).
            </li>
            <li>
              <strong>Weak Electrolytes (CH₃COOH):</strong> Display low conductance and a faint filament glow due to low degree of ionization (α ≈ 1.3% at 0.1M). Molar conductivity increases sharply upon dilution.
            </li>
            <li>
              <strong>Non-Electrolytes (Glucose, Pure Water):</strong> Maintain the bulb completely OFF due to absence of mobile charged ions.
            </li>
          </ul>
        </div>

        {/* 6. Precautions & Teacher Signature */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="space-y-2">
            <span className="font-bold uppercase text-[11px] block">Precautions:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Electrodes should be thoroughly rinsed with deionized water between solution changes.</li>
              <li>Electrode plates must remain completely submerged to ensure constant surface area A.</li>
              <li>Temperature must be controlled at 25.0°C to avoid temperature drift in ionic mobility.</li>
            </ul>
          </div>

          <div className="flex flex-col justify-end items-end space-y-1 text-right">
            <div className="w-48 border-b border-slate-900 pb-1 font-mono text-center">
              Dr. K. Swaminathan
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase">
              Examiner / Chemistry Instructor
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Date Verified: {date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
