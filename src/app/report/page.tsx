'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  FileText,
  CheckCircle2,
  XCircle,
  TableProperties,
  ArrowLeft,
  Sparkles,
  Award,
  Edit3,
} from 'lucide-react';
import { LabObservation } from '@/lib/types';
import { getSavedObservations, computeStatistics, getQuizScore } from '@/lib/storage';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
import { OpticsGraph } from '@/components/OpticsGraph';

export default function ReportPage() {
  const [studentName, setStudentName] = useState<string>('Aarav Patel');
  const [rollNumber, setRollNumber] = useState<string>('1014298');
  const [gradeClass, setGradeClass] = useState<string>('Class 10-B (Secondary)');
  const [institution, setInstitution] = useState<string>('Delhi Public School');
  const [date, setDate] = useState<string>('2026-10-22');

  const [observations, setObservations] = useState<LabObservation[]>([]);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Class 10 Board Viva Voce Interactive State
  const [vivaAnswers, setVivaAnswers] = useState<Record<number, number>>({});
  const [vivaSubmitted, setVivaSubmitted] = useState(false);

  const vivaQuestions = [
    {
      id: 1,
      q: 'What is the nature and size of the image formed when an object is placed at 2F₁ of a convex lens?',
      options: [
        'Virtual, erect, and magnified behind the lens.',
        'Real, inverted, and of the same size as the object (m = -1.0) formed at 2F₂.',
        'Real, inverted, and point-sized at the principal focus F₂.',
      ],
      correct: 1,
      explanation:
        'When u = 2f, the image distance v = +2f and magnification m = -v/u = -1.0. This is the canonical benchmark case used in board exams.',
    },
    {
      id: 2,
      q: 'Why is the focal length (f) of a convex lens always taken as POSITIVE under the New Cartesian Sign Convention?',
      options: [
        'Because the object needle is always placed on the left side of the optical bench.',
        'Because parallel incident rays converge at the principal focus (F₂) on the right side, along the positive direction of incident light.',
        'Because convex lenses are thicker at the middle than at the edges.',
      ],
      correct: 1,
      explanation:
        'All distances measured in the direction of incident light from the optical centre O are taken as positive. Since a convex lens converges rays to the right focus, f is positive.',
    },
    {
      id: 3,
      q: 'If the lower half of the convex lens is covered with an opaque black paper, what happens to the image formed on the screen?',
      options: [
        'The lower half of the image disappears completely from the screen.',
        'A complete image of the entire object is still formed, but its brightness and intensity are reduced by approximately half.',
        'The image becomes completely virtual and upright.',
      ],
      correct: 1,
      explanation:
        'Light rays from every point of the object pass through every part of the lens. Covering half only reduces the total number of rays converging, cutting intensity without cutting the image.',
    },
  ];

  const handleVivaSelect = (qId: number, optIdx: number) => {
    setVivaAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setVivaSubmitted(true);
  };

  const vivaScore = vivaQuestions.filter((q) => vivaAnswers[q.id] === q.correct).length;

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setObservations(getSavedObservations());
    setQuizScore(getQuizScore());
  }, []);

  const stats = computeStatistics(observations, 15);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/observations"
            className="p-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] transition-colors border border-[#E2E8DF]"
            title="Back to Observation Table"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[#17231B] flex items-center gap-2">
              <span>Printable Practical Lab Report</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/50 uppercase font-mono font-bold">
                Class 10 CBSE / ICSE Format
              </span>
            </h1>
            <p className="text-xs text-[#647067]">
              Edit the student details below, then click &quot;Print / Save PDF&quot; for submission.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#17231B]" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* =========================================
          PRACTICAL REPORT DOCUMENT (PRINT OPTIMIZED)
         ========================================= */}
      <div className="print-page p-8 sm:p-12 rounded-2xl bg-white text-slate-900 shadow-sm space-y-8 font-sans border border-[#E2E8DF]">
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Secondary School Examination • Class 10 Science Practical Record
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Experiment 10: Determination of Focal Length of a Convex Lens
          </h2>
          <p className="text-xs text-slate-600 font-medium italic">
            NCERT Chapter 10: Light – Reflection & Refraction (u-v Method & 6 Canonical Cases)
          </p>
        </div>

        {/* Student Metadata Box (Editable in web view) */}
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
              {vivaSubmitted ? `${vivaScore}/3 (${Math.round((vivaScore / 3) * 100)}%) Verified` : '3 Viva Questions Below'}
            </span>
          </div>
        </div>

        {/* 1. Aim */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            1. Aim of the Experiment
          </h3>
          <p className="leading-relaxed">
            To determine the focal length of a given convex lens by obtaining real, inverted images of an illuminated object needle/arrow on a ground-glass screen at various object distances, and to verify the result by plotting:
            <br />
            (a) Graph between image distance (v) and object distance (u) [Hyperbola].
            <br />
            (b) Graph between 1/v and 1/u [Straight line].
          </p>
        </div>

        {/* 2. Apparatus Required */}
        <div className="space-y-1.5 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            2. Apparatus Required
          </h3>
          <p className="leading-relaxed">
            An optical bench with dual cylindrical rails (length 100 cm) having a millimeter scale, three uprights with vernier index marks, a double convex lens of nominal focal length 15 cm mounted in a holder, an illuminated object (cross-wire arrow / candle flame), and a ground-glass projection screen.
          </p>
        </div>

        {/* 3. Principle & Formulae */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            3. Principle and Formulae
          </h3>
          <p className="leading-relaxed">
            According to the <strong>Thin Lens Formula</strong> and the <strong>New Cartesian Sign Convention</strong>:
          </p>
          <div className="p-3 bg-slate-100 rounded-lg font-mono text-center space-y-1 text-slate-900 font-bold border border-slate-300">
            <div>1/v - 1/u = 1/f</div>
            <div className="text-[11px] text-slate-700 font-normal">
              where u = -ve (object distance), v = +ve (real image distance), f = +ve (convex lens)
            </div>
            <div className="text-sm text-cyan-800 pt-1">f = (u × v) / (u + v)</div>
          </div>
        </div>

        {/* 4. Ray Diagram */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            4. Ray Diagram (Standard Optical Formation)
          </h3>
          <div className="border border-slate-300 rounded-xl overflow-hidden p-2 bg-slate-950">
            <RayDiagramSvg
              state={{
                focalLength: 15,
                objectDistance: 30,
                objectHeight: 5,
              }}
              height={220}
            />
          </div>
          <p className="text-[11px] text-slate-600 text-center italic">
            Figure 1: Real, inverted image formed by a convex lens when object is at 2F (u = 2f = 30cm, v = 2f = 30cm).
          </p>
        </div>

        {/* 5. Observation Table */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            5. Observation Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">S.No</th>
                  <th className="p-2 border-r border-slate-300">xₒ (cm)</th>
                  <th className="p-2 border-r border-slate-300">xₗ (cm)</th>
                  <th className="p-2 border-r border-slate-300">xₛ (cm)</th>
                  <th className="p-2 border-r border-slate-300">u (cm)</th>
                  <th className="p-2 border-r border-slate-300">v (cm)</th>
                  <th className="p-2 border-r border-slate-300 font-mono">1/u</th>
                  <th className="p-2 border-r border-slate-300 font-mono">1/v</th>
                  <th className="p-2 border-r border-slate-300 font-bold">f = uv/(u+v) (cm)</th>
                  <th className="p-2">Nature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono">
                {observations.map((obs) => (
                  <tr key={obs.id}>
                    <td className="p-2 border-r border-slate-300 font-sans font-bold">{obs.serialNumber}</td>
                    <td className="p-2 border-r border-slate-300">{obs.objectPos.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-300">{obs.lensPos.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-300">{obs.screenPos.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-300 font-bold">{obs.u.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-300 font-bold">{obs.v.toFixed(1)}</td>
                    <td className="p-2 border-r border-slate-300">{(1 / obs.u).toFixed(4)}</td>
                    <td className="p-2 border-r border-slate-300">{(1 / obs.v).toFixed(4)}</td>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                      {obs.fCalculated.toFixed(2)}
                    </td>
                    <td className="p-2 font-sans text-[11px]">{obs.imageNature.split('—')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Calculations & Results */}
        <div className="space-y-2 text-xs text-slate-800">
          <h3 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
            6. Calculations and Result Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg">
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Mean Focal Length (f̄):</span>
              <span className="text-base font-bold text-slate-900 font-mono">{stats.meanF.toFixed(2)} cm</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Standard Deviation:</span>
              <span className="text-base font-bold text-slate-900 font-mono">±{stats.stdDev.toFixed(2)} cm</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-bold">Percentage Error:</span>
              <span className="text-base font-bold text-slate-900 font-mono">{stats.percentError.toFixed(2)}%</span>
            </div>
          </div>
          <p className="leading-relaxed">
            <strong>Conclusion:</strong> The experimental focal length of the convex lens determined using the optical bench method is <strong>{stats.meanF.toFixed(2)} cm</strong>, which agrees closely with the nominal specification of 15.0 cm with a percentage error of <strong>{stats.percentError.toFixed(2)}%</strong>.
          </p>
        </div>

        {/* 7. Class 10 Board Viva Voce Oral Defense */}
        <div className="no-print space-y-3 p-4 rounded-xl bg-cyan-50/70 border border-cyan-300 text-xs">
          <div className="flex items-center justify-between border-b border-cyan-200 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-700" />
              <h4 className="font-bold text-cyan-950 uppercase tracking-wide">
                7. Class 10 Board Viva Voce Oral Defense
              </h4>
            </div>
            <span className="text-[11px] font-bold text-cyan-900 font-mono">
              Score: {vivaScore} / {vivaQuestions.length}
            </span>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((q) => {
              const selected = vivaAnswers[q.id];
              const isCorrect = selected === q.correct;
              const hasAnswered = selected !== undefined;

              return (
                <div key={q.id} className="p-3 rounded-lg bg-white border border-cyan-200 space-y-2">
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
                          name={`optics-viva-q-${q.id}`}
                          checked={selected === optIdx}
                          onChange={() => handleVivaSelect(q.id, optIdx)}
                          className="mt-0.5 accent-cyan-600"
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

        {/* 8. Precautions & Sources of Error */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-800 pt-2 border-t border-slate-300">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Precautions:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>The uprights must be vertically positioned and perpendicular to the bench rails.</li>
              <li>The optical centre of the lens and the tip of the object needle must lie at the same horizontal height.</li>
              <li>Parallax between the real image and the screen plane must be completely removed.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Sources of Error:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Index error between the upright pointer mark and the actual optical centre of the lens.</li>
              <li>Spherical and chromatic aberration in thick non-achromatic lenses causing edge fringing.</li>
              <li>Subjective judgment error while identifying the position of maximum sharpness on the screen.</li>
            </ul>
          </div>
        </div>

        {/* 9. Teacher Evaluation & Signature Block */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="space-y-3">
            <span className="font-bold uppercase text-[11px] block">9. Teacher&apos;s Remarks & Grade:</span>
            <div className="p-3 border border-dashed border-slate-400 rounded-lg min-h-[50px] italic text-slate-600">
              Excellent experimental accuracy. High consistency in reciprocal graphical intercepts and accurate parallax elimination.
            </div>
          </div>

          <div className="flex flex-col justify-end items-end space-y-1 text-right">
            <div className="w-48 border-b border-slate-900 pb-1 font-mono text-center">
              Dr. M. Ramanathan
            </div>
            <span className="text-[11px] font-bold text-slate-900 uppercase">
              Examiner / Physics Instructor
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Date Verified: {date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
