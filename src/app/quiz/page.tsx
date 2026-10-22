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
    <div className="flex-1 flex flex-col bg-transparent text-[#17231B] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] text-xs font-semibold shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#17231B]" />
          <span>Interactive Knowledge Assessment</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal text-[#17231B] tracking-tight font-serif">
          Convex Lens Optics Assessment
        </h1>
        <p className="text-xs sm:text-sm text-[#647067] max-w-xl mx-auto">
          Test your mastery of ray refraction, Cartesian sign conventions, focal length calculations, and real versus virtual image dynamics.
        </p>
      </div>

      {!isQuizComplete ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#647067]">
              <span className="font-semibold text-[#17231B]">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="font-mono text-[#17231B] font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded">
                Score: {score} / {currentIndex}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E2E8DF] overflow-hidden">
              <div
                className="h-full bg-[#B8D96B] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase font-bold text-[#17231B] bg-[#B8D96B]/30 px-1.5 py-0.5 rounded tracking-wider">
              {currentQ.conceptTag}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#17231B] leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;

              let buttonStyle = 'bg-[#F4F7F2] border-[#E2E8DF] text-[#17231B] hover:bg-[#FFFFFF] hover:border-[#B8D96B]';
              if (isSelected && !isAnswerSubmitted) {
                buttonStyle = 'bg-[#B8D96B]/25 border-[#B8D96B] text-[#17231B] font-bold shadow-xs';
              } else if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                } else {
                  buttonStyle = 'bg-[#F4F7F2] border-[#E2E8DF] text-[#647067] opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs text-[#17231B] space-y-1.5 animate-fadeIn">
              <span className="font-bold text-[#17231B] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#17231B]" />
                <span>Scientific Explanation</span>
              </span>
              <p className="leading-relaxed text-[#647067]">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E2E8DF]">
            <span className="text-xs text-[#647067]">
              Select one option and click Submit
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedOption !== null
                    ? 'bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] shadow-xs cursor-pointer'
                    : 'bg-[#E2E8DF] text-[#647067] cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'Finish Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Complete Score Card */
        <div className="p-8 sm:p-10 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#B8D96B]/25 border border-[#B8D96B] flex items-center justify-center mx-auto text-[#17231B] shadow-xs">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/50">
              Assessment Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B]">
              Your Performance Score: {percentage}%
            </h2>
            <p className="text-sm text-[#647067]">
              You answered <span className="font-bold text-[#17231B]">{score}</span> out of{' '}
              <span className="font-bold text-[#17231B]">{totalQuestions}</span> questions correctly.
            </p>
          </div>

          {/* Performance Badge */}
          <div className="max-w-md mx-auto p-4 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] text-xs text-[#17231B] space-y-1">
            <span className="font-bold text-[#17231B] block">
              {percentage >= 80 ? 'Mastery Level: Distinction in Optics' : percentage >= 50 ? 'Proficient: Solid Conceptual Foundation' : 'Review Recommended'}
            </span>
            <p className="text-[#647067]">
              {percentage >= 80
                ? 'Outstanding grasp of Cartesian sign rules, the lens maker equation, and ray convergence geometry.'
                : 'Review the 6 standard cases in the Learn Theory module and verify readings in the 3D Virtual Lab.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRetakeQuiz}
              className="px-5 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] text-xs font-bold border border-[#E2E8DF] flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <Link
              href="/report"
              className="px-6 py-3 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold shadow-xs flex items-center gap-2"
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
