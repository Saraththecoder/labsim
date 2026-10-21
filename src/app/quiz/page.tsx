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
  BookOpen,
  FileText,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/quizData';
import { saveQuizScore } from '@/lib/storage';

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizComplete(true);
      saveQuizScore(score, totalQuestions);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent fallback if canvas-confetti is not loaded
      }
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setUserAnswers({});
    setIsQuizComplete(false);
  };

  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Knowledge Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Convex Lens Optics Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Test your mastery of ray refraction, Cartesian sign conventions, focal length calculations, and real versus virtual image dynamics.
        </p>
      </div>

      {!isQuizComplete ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#090e1a] border border-cyan-900/40 shadow-2xl space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                Score: {score} / {currentIndex}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              {currentQ.conceptTag}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;

              let buttonStyle = 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700';
              if (isSelected && !isAnswerSubmitted) {
                buttonStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]';
              } else if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                } else {
                  buttonStyle = 'bg-[#0f172a] border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-[#0b1322] border border-cyan-800/60 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Scientific Explanation</span>
              </span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Select one option and click Submit
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedOption !== null
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-all"
              >
                <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'Finish Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Complete Score Card */
        <div className="p-8 sm:p-10 rounded-2xl bg-[#090e1a] border border-cyan-500/40 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Assessment Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Your Performance Score: {percentage}%
            </h2>
            <p className="text-sm text-slate-300">
              You answered <span className="font-bold text-cyan-300">{score}</span> out of{' '}
              <span className="font-bold text-white">{totalQuestions}</span> questions correctly.
            </p>
          </div>

          {/* Performance Badge */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-[#0f172a] border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-white block">
              {percentage >= 80 ? 'Mastery Level: Distinction in Optics' : percentage >= 50 ? 'Proficient: Solid Conceptual Foundation' : 'Review Recommended'}
            </span>
            <p className="text-slate-400">
              {percentage >= 80
                ? 'Outstanding grasp of Cartesian sign rules, the lens maker equation, and ray convergence geometry.'
                : 'Review the 6 standard cases in the Learn Theory module and verify readings in the 3D Virtual Lab.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <Link
              href="/report"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2"
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
