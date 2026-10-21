'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  FileText,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { CONDUCTIVITY_QUIZ_QUESTIONS } from '@/lib/conductivityQuizData';
import { saveConductivityQuizScore } from '@/lib/conductivityStorage';

export default function ConductivityQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const currentQ = CONDUCTIVITY_QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = CONDUCTIVITY_QUIZ_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
      saveConductivityQuizScore(score, totalQuestions);
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Physical Chemistry Knowledge Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Electrolytic Conductivity Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Test your conceptual understanding of Kohlrausch’s law, specific vs molar conductance, cell constant derivation, and ionic transport mechanisms.
        </p>
      </div>

      {!isQuizComplete ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#090e1a] border border-amber-900/40 shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="font-mono text-amber-300 font-bold">
                Score: {score} / {currentIndex}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {currentQ.conceptTag}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let style = 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700';
              if (isSelected && !isAnswerSubmitted) {
                style = 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.2)]';
              } else if (isAnswerSubmitted) {
                if (isCorrect) style = 'bg-emerald-950 border-emerald-500 text-emerald-200';
                else if (isSelected && !isCorrect) style = 'bg-rose-950 border-rose-500 text-rose-200';
                else style = 'bg-[#0f172a] border-slate-900 text-slate-500';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-[#0b1322] border border-amber-800/60 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Scientific Explanation</span>
              </span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">Select one option and submit</span>
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedOption !== null
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all"
              >
                <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-2xl bg-[#090e1a] border border-amber-500/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Assessment Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Score: {percentage}% ({score} / {totalQuestions})
            </h2>
            <p className="text-sm text-slate-300">
              {percentage >= 80 ? 'Mastery in Electrolytic Conduction & Kohlrausch’s Law!' : 'Good effort! Review the theory modules for weak electrolyte dissociation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRetake}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <Link
              href="/conductivity/report"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Attach Score to Practical Report</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
