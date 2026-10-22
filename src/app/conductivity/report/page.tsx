'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileText,
  ArrowLeft,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { ConductivityObservation } from '@/lib/conductivityTypes';
import {
  getConductivityObservations,
  getConductivityQuizScore,
} from '@/lib/conductivityStorage';
import { SOLUTIONS_DATABASE } from '@/lib/conductivityPhysics';

export default function ConductivityReportPage() {
  const [studentName, setStudentName] = useState('Aarav Patel');
  const [rollNumber, setRollNumber] = useState('1014298');
  const [gradeClass, setGradeClass] = useState('Class 10-B (Secondary)');
  const [institution, setInstitution] = useState('Delhi Public School');
  const [date, setDate] = useState('2026-10-22');

  const [observations, setObservations] = useState<ConductivityObservation[]>([]);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Viva Voce Interactive State
  const [vivaAnswers, setVivaAnswers] = useState<Record<number, number>>({});
  const [vivaSubmitted, setVivaSubmitted] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setObservations(getConductivityObservations());
    setQuizScore(getConductivityQuizScore());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const vivaQuestions = [
    {
      id: 1,
      q: 'Why does an aqueous solution of glucose or alcohol NOT conduct electricity even though their chemical formula contains hydrogen?',
      options: [
        'They are insoluble and precipitate out of aqueous solution immediately.',
        'They are covalent compounds and do NOT dissociate in water to produce free mobile H⁺ (aq) ions.',
        'Their hydrogen atoms neutralize the electric current from the battery.',
      ],
      correct: 1,
      explanation:
        'Conduction of electricity through a solution requires mobile ions. In glucose and alcohol, hydrogen is held by strong covalent bonds that do not ionize in water.',
    },
    {
      id: 2,
      q: 'Why does dry HCl gas not turn dry blue litmus paper red or conduct electricity, while dilute aqueous HCl does both?',
      options: [
        'Water serves only as a thermal coolant in the test tube.',
        'Separation of H⁺ ion from HCl molecules can only occur in the presence of water, forming hydronium ions (H₃O⁺).',
        'Dry HCl gas is chemically a neutral noble gas.',
      ],
      correct: 1,
      explanation:
        'Acidic behavior is exclusively due to H⁺ / H₃O⁺ ions, which only separate when water molecules hydrate the polar covalent HCl bonds.',
    },
    {
      id: 3,
      q: 'Why does distilled water fail to light the bulb, whereas tap water or rainwater causes a faint bulb glow?',
      options: [
        'Distilled water is too cold to permit electronic movement.',
        'Rainwater dissolves atmospheric carbon dioxide and mineral salts forming ions (H⁺, HCO₃⁻, Ca²⁺), while pure distilled water contains almost zero free ions.',
        'Distilled water contains no hydrogen atoms.',
      ],
      correct: 1,
      explanation:
        'Pure distilled water has a negligible degree of self-ionization (10⁻⁷ M), whereas tap water contains dissolved electrolytes that permit electrical conduction.',
    },
  ];

  const handleVivaSelect = (qId: number, optIdx: number) => {
    setVivaAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const vivaScore = vivaQuestions.filter((q) => vivaAnswers[q.id] === q.correct).length;

  // Fallback observation list if student hasn't recorded yet
  const defaultObservations = SOLUTIONS_DATABASE.map((sol, index) => {
    let current_mA = 0;
    let bulbGlow = 'OFF (No Glow)';
    let ions = 'None (Covalent Molecules)';

    if (sol.id === 'hcl') {
      current_mA = 95.9;
      bulbGlow = 'BRIGHT GLOW';
      ions = 'H⁺ (aq) + Cl⁻ (aq)';
    } else if (sol.id === 'naoh') {
      current_mA = 98.2;
      bulbGlow = 'BRIGHT GLOW';
      ions = 'Na⁺ (aq) + OH⁻ (aq)';
    } else if (sol.id === 'nacl') {
      current_mA = 92.5;
      bulbGlow = 'BRIGHT GLOW';
      ions = 'Na⁺ (aq) + Cl⁻ (aq)';
    } else if (sol.id === 'acetic_acid') {
      current_mA = 18.4;
      bulbGlow = 'DIM GLOW';
      ions = 'CH₃COO⁻ + H⁺ (Partial)';
    } else if (sol.id === 'tap_water') {
      current_mA = 8.2;
      bulbGlow = 'FAINT GLOW';
      ions = 'Trace mineral salts (Ca²⁺, HCO₃⁻)';
    } else if (sol.id === 'glucose' || sol.id === 'ethanol') {
      current_mA = 0.0;
      bulbGlow = 'OFF (No Glow)';
      ions = 'Zero ions (Intact molecules)';
    } else if (sol.id === 'distilled_water') {
      current_mA = 0.0;
      bulbGlow = 'OFF (No Glow)';
      ions = 'Negligible (Pure H₂O)';
    } else {
      current_mA = 75.0;
      bulbGlow = 'BRIGHT GLOW';
      ions = `${sol.cation.formula} + ${sol.anion.formula}`;
    }

    return {
      sNo: index + 1,
      name: sol.name,
      formula: sol.formula,
      hasHydrogen: sol.hasHydrogen ? 'YES' : 'NO',
      bulbGlow,
      current_mA: current_mA.toFixed(1),
      ions,
      category: sol.ncertCategory || sol.type,
      inference: sol.ncertInference || 'Electrolytic conductor in aqueous medium.',
    };
  });

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
                Class 10 CBSE / ICSE Standard
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              NCERT Chapter 2 Activity 2.3: Electrical Conductivity of Acids, Bases & Non-Electrolytes. Click &quot;Print / Save PDF&quot;.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Practical Sheet */}
      <div className="print-page p-8 sm:p-12 rounded-2xl bg-white text-slate-900 shadow-2xl space-y-8 font-sans border border-slate-200">
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Secondary School Examination • Class 10 Science Practical Record
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            NCERT Activity 2.3: Electrical Conductivity of Aqueous Solutions
          </h2>
          <p className="text-xs text-slate-600 font-medium italic">
            Chapter 2: Acids, Bases and Salts — Investigating the Role of Free Hydrated Ions in Conduction
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
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Oral Defense (Viva):</span>
            <span className="font-bold text-slate-900 block font-mono">
              {vivaSubmitted ? `${vivaScore}/3 (${Math.round((vivaScore / 3) * 100)}%) Answered` : '3 Viva Questions Below'}
            </span>
          </div>
        </div>

        {/* 1. Aim */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            1. Aim of the Experiment
          </h3>
          <p className="leading-relaxed">
            To investigate the electrical conductivity of aqueous solutions of acids (dilute HCl, dilute H₂SO₄, dilute CH₃COOH), bases (dilute NaOH), salts (NaCl), and neutral covalent organic compounds (glucose, alcohol, distilled water) to determine whether all hydrogen-containing substances produce free ions and conduct electricity (NCERT Chapter 2, Activity 2.3).
          </p>
        </div>

        {/* 2. Apparatus Required */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            2. Apparatus Required
          </h3>
          <p className="leading-relaxed">
            A 250 mL glass beaker, a rubber cork fitted with two clean iron nails/graphite electrodes, a 6V DC battery (or low-voltage power supply), a 6V miniature incandescent indicator bulb, a plug key/switch, insulated copper connecting wires, and test solutions of dilute HCl, dilute NaOH, NaCl, dilute CH₃COOH, glucose (C₆H₁₂O₆), ethyl alcohol (C₂H₅OH), distilled water, and tap water.
          </p>
        </div>

        {/* 3. Principle & Chemical Equations */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            3. Scientific Principle and Chemical Equations
          </h3>
          <p className="leading-relaxed">
            Electrical conduction through liquids requires the presence of <strong>free, mobile charged particles (ions)</strong> that can migrate toward oppositely charged electrodes:
          </p>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs space-y-1 text-slate-900 font-bold border border-slate-300">
            <div>1. Ionization of Acids: HCl (aq) + H₂O (l) ➔ H₃O⁺ (aq) + Cl⁻ (aq)</div>
            <div>2. Dissociation of Bases: NaOH (s) ➔[H₂O] Na⁺ (aq) + OH⁻ (aq)</div>
            <div>3. Dissociation of Salts: NaCl (s) ➔[H₂O] Na⁺ (aq) + Cl⁻ (aq)</div>
            <div>4. Partial Ionization: CH₃COOH (aq) ⇌ CH₃COO⁻ (aq) + H⁺ (aq)  [Weak Acid]</div>
            <div>5. Covalent Non-Electrolytes: C₆H₁₂O₆ (s) + H₂O ➔ C₆H₁₂O₆ (aq)  [ZERO ions formed]</div>
          </div>
          <p className="text-[11px] text-slate-700 italic">
            <strong>Key Class 10 Rule:</strong> The bulb glows only when the circuit is completed by free moving ions in the liquid. Although glucose and alcohol contain hydrogen, they do not ionize to form H⁺ ions in water; hence, they do not conduct electricity.
          </p>
        </div>

        {/* 4. Observation Table */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            4. Observation Table (NCERT Activity 2.3 Battery)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">S.No</th>
                  <th className="p-2 border-r border-slate-300">Reagent / Solution</th>
                  <th className="p-2 border-r border-slate-300">Formula</th>
                  <th className="p-2 border-r border-slate-300">Contains H?</th>
                  <th className="p-2 border-r border-slate-300">Bulb State</th>
                  <th className="p-2 border-r border-slate-300">Current (mA)</th>
                  <th className="p-2 border-r border-slate-300">Mobile Charge Carriers</th>
                  <th className="p-2">Class 10 Board Inference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono text-[11px]">
                {observations.length > 0
                  ? observations.map((obs) => {
                      const sol = SOLUTIONS_DATABASE.find((s) => s.id === obs.solutionId);
                      return (
                        <tr key={obs.id}>
                          <td className="p-2 border-r border-slate-300 font-sans font-bold">{obs.serialNumber}</td>
                          <td className="p-2 border-r border-slate-300 font-sans font-semibold text-slate-900">{obs.solutionName}</td>
                          <td className="p-2 border-r border-slate-300">{sol?.formula || 'Aqueous'}</td>
                          <td className="p-2 border-r border-slate-300 font-bold">{sol?.hasHydrogen ? 'YES' : 'NO'}</td>
                          <td className="p-2 border-r border-slate-300 font-sans font-bold">
                            <span className={obs.bulbGlow.includes('OFF') ? 'text-red-700' : 'text-emerald-800'}>
                              {obs.bulbGlow}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-300 font-bold">{obs.current_mA.toFixed(1)} mA</td>
                          <td className="p-2 border-r border-slate-300 font-sans text-[10px]">
                            {sol?.type === 'non-electrolyte' ? 'None (Covalent)' : `${sol?.cation.formula} + ${sol?.anion.formula}`}
                          </td>
                          <td className="p-2 font-sans text-[10px] text-slate-700">
                            {sol?.ncertInference || 'Electrolyte conductor'}
                          </td>
                        </tr>
                      );
                    })
                  : defaultObservations.map((obs) => (
                      <tr key={obs.sNo}>
                        <td className="p-2 border-r border-slate-300 font-sans font-bold">{obs.sNo}</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-semibold text-slate-900">{obs.name}</td>
                        <td className="p-2 border-r border-slate-300">{obs.formula}</td>
                        <td className="p-2 border-r border-slate-300 font-bold">{obs.hasHydrogen}</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-bold">
                          <span className={obs.bulbGlow.includes('OFF') ? 'text-red-700' : 'text-emerald-800'}>
                            {obs.bulbGlow}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-300 font-bold">{obs.current_mA} mA</td>
                        <td className="p-2 border-r border-slate-300 font-sans text-[10px]">{obs.ions}</td>
                        <td className="p-2 font-sans text-[10px] text-slate-700">{obs.inference}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Conclusions & Inferences */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            5. Conclusion and Scientific Inferences
          </h3>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-slate-700">
            <li>
              <strong>Acids and Bases are Electrolytes:</strong> Dilute mineral acids (HCl, H₂SO₄) and strong alkalis (NaOH) ionize in water to yield mobile cations and anions. The movement of these ions through the solution completes the circuit, causing the 6V bulb to glow brightly.
            </li>
            <li>
              <strong>Hydrogen Content Does Not Guarantee Acidity:</strong> Although glucose (C₆H₁₂O₆) and ethanol (C₂H₅OH) contain abundant hydrogen atoms in their molecular structure, they do NOT produce free H⁺ (aq) or H₃O⁺ ions in water. Consequently, the circuit remains open and the bulb does NOT glow.
            </li>
            <li>
              <strong>Weak Acids Undergo Incomplete Ionization:</strong> Acetic acid (CH₃COOH) ionizes only partially in aqueous solution, resulting in lower current (~18.4 mA) and a dim filament glow compared to hydrochloric acid.
            </li>
            <li>
              <strong>Distilled Water vs. Tap Water:</strong> Distilled water is a covalent molecular liquid with almost zero free ions (bulb remains OFF). Tap water contains trace dissolved mineral salts and gases that furnish enough ions to produce a faint glow.
            </li>
          </ul>
        </div>

        {/* 6. Class 10 Board Viva Voce Oral Defense */}
        <div className="no-print space-y-3 p-4 rounded-xl bg-amber-50/70 border border-amber-300 text-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-amber-950 uppercase tracking-wide">
                6. Class 10 Board Viva Voce Oral Defense
              </h4>
            </div>
            <span className="text-[11px] font-bold text-amber-900 font-mono">
              Score: {vivaScore} / {vivaQuestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((q) => {
              const selected = vivaAnswers[q.id];
              const isCorrect = selected === q.correct;
              const hasAnswered = selected !== undefined;

              return (
                <div key={q.id} className="p-3 rounded-lg bg-white border border-amber-200 space-y-2">
                  <p className="font-bold text-slate-900 text-xs">
                    Q{q.id}. {q.q}
                  </p>
                  <div className="space-y-1.5 pl-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                          selected === optIdx
                            ? isCorrect
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                              : 'bg-red-50 text-red-900 font-bold border border-red-300'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`viva-q-${q.id}`}
                          checked={selected === optIdx}
                          onChange={() => {
                            handleVivaSelect(q.id, optIdx);
                            setVivaSubmitted(true);
                          }}
                          className="mt-0.5 accent-amber-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {hasAnswered && (
                    <div
                      className={`text-[11px] p-2 rounded flex items-start gap-1.5 ${
                        isCorrect
                          ? 'bg-emerald-100/70 text-emerald-900 font-semibold'
                          : 'bg-red-100/70 text-red-900'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0 mt-0.5" />
                      )}
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Precautions & Teacher Signature */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="space-y-2">
            <span className="font-bold uppercase text-[11px] block">Precautions:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li>Never connect nails directly across the battery without the solution to prevent a short circuit.</li>
              <li>Clean the iron nails with sandpaper before each test to eliminate non-conductive oxide layers.</li>
              <li>Thoroughly rinse the beaker and electrodes with distilled water between different test solutions.</li>
              <li>Use a low voltage DC source (6V) to minimize electrolysis risk and prevent electric shock.</li>
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
