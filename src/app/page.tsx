'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  Sparkles,
  ArrowRight,
  Box,
  Scan,
  BookOpen,
  FileText,
  Eye,
  Camera,
  Layers,
  RotateCcw,
  Zap,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';

export default function HomePage() {
  const [objectDist, setObjectDist] = useState(25);
  const focalLength = 10;

  // GSAP Animation Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const noteLeftRef = useRef<HTMLDivElement>(null);
  const noteRightRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const demoCardRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const experimentsRef = useRef<HTMLDivElement>(null);
  const arSectionRef = useRef<HTMLDivElement>(null);
  const specSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Hero text & CTA entrance
      if (eyebrowRef.current) {
        tl.from(eyebrowRef.current, {
          y: -14,
          opacity: 0,
          duration: 0.6,
          letterSpacing: '0.35em',
        });
      }

      if (headlineRef.current) {
        tl.from(
          headlineRef.current,
          {
            y: 28,
            opacity: 0,
            duration: 0.85,
            ease: 'power4.out',
          },
          '-=0.4'
        );
      }

      if (subheadRef.current) {
        tl.from(
          subheadRef.current,
          {
            y: 18,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.55'
        );
      }

      if (ctaRef.current) {
        tl.from(
          ctaRef.current,
          {
            scale: 0.85,
            opacity: 0,
            duration: 0.65,
            ease: 'back.out(1.8)',
          },
          '-=0.45'
        );
      }

      // 2. Stagger in the 4 quick tiles
      if (tilesRef.current && tilesRef.current.children.length > 0) {
        tl.from(
          tilesRef.current.children,
          {
            y: 24,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'back.out(1.4)',
          },
          '-=0.3'
        );
      }

      // 3. Reveal live simulator card
      if (demoCardRef.current) {
        tl.from(
          demoCardRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=0.2'
        );
      }

      // 4. Stagger workflow steps
      if (workflowRef.current && workflowRef.current.children.length > 0) {
        tl.from(
          workflowRef.current.children,
          {
            y: 26,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.2'
        );
      }

      // 5. Stagger experiments list
      if (experimentsRef.current && experimentsRef.current.children.length > 0) {
        tl.from(
          experimentsRef.current.children,
          {
            y: 24,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.2'
        );
      }

      // 6. Floating handwritten sketchbook margin annotations (physics sine float)
      if (noteLeftRef.current) {
        gsap.to(noteLeftRef.current, {
          y: -10,
          rotation: -3,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (noteRightRef.current) {
        gsap.to(noteRightRef.current, {
          y: 8,
          rotation: 8,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  // Subtle pulse animation when user drags the distance slider
  const handleSliderChange = (newVal: number) => {
    setObjectDist(newVal);
    if (svgWrapperRef.current) {
      gsap.fromTo(
        svgWrapperRef.current,
        { scale: 0.99 },
        { scale: 1, duration: 0.25, ease: 'power2.out' }
      );
    }
  };

  return (
    <div ref={pageContainerRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden pb-16 relative">
      {/* =========================================
          HERO SECTION (Porcelain & Electric Lime on Paper)
         ========================================= */}
      <section className="relative pt-6 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Subtle Electric Lime Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[240px] bg-[#B8D96B]/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Tactile Sketchbook Margin Annotations (GSAP floating physics) */}
        <div ref={noteLeftRef} className="hidden lg:block absolute top-12 left-4 rotate-[-6deg] select-none pointer-events-none opacity-75">
          <span className="font-serif italic text-[#647067] text-xs leading-tight block">
            Explore ✎<br />
            Experiment<br />
            Learn
          </span>
        </div>
        <div ref={noteRightRef} className="hidden lg:block absolute top-12 right-6 rotate-[5deg] select-none pointer-events-none opacity-75">
          <span className="font-serif italic text-[#647067] text-xs leading-tight block text-right">
            light bends<br />
            possibilities ⟿
          </span>
        </div>

        <div className="text-left sm:text-center space-y-4 relative z-10">
          {/* Eyebrow Tagline */}
          <p ref={eyebrowRef} className="text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#647067] uppercase">
            EXPLORE • EXPERIMENT • UNDERSTAND
          </p>

          {/* Main Title: Instrument Serif, regular */}
          <h1 ref={headlineRef} className="font-serif-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#17231B] leading-[1.12]">
            Interactive <br className="hidden sm:inline" />
            <span>Physics Labs</span> <br />
            <span className="text-[#17231B] underline decoration-[#B8D96B] decoration-[6px] underline-offset-8">
              in Your World
            </span>
          </h1>

          {/* Subtitle: Sora 400-500 */}
          <p ref={subheadRef} className="font-body text-xs sm:text-base text-[#647067] max-w-xl sm:mx-auto leading-relaxed font-normal">
            Real experiments. Real understanding. <br className="inline sm:hidden" />
            Interactive. Immersive. <br className="hidden sm:inline" />
            Standard Class 10 CBSE & ICSE board practical curriculum with 3D physics and mobile Augmented Reality.
          </p>

          {/* Primary Lime CTA Button */}
          <div ref={ctaRef} className="pt-2 flex flex-wrap items-center justify-start sm:justify-center gap-3">
            <Link
              href="/lab"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-semibold text-sm shadow-[0_4px_18px_rgba(184,217,107,0.35)] transition-all transform active:scale-95 cursor-pointer hover:translate-y-[-2px]"
            >
              <span>Start 3D Practical</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/ar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] font-semibold text-sm border border-[#E2E8DF] shadow-xs transition-all active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[#17231B]" />
              <span>Launch AR Mode</span>
            </Link>
          </div>
        </div>

        {/* 4 Quick Access Navigation Tiles */}
        <div ref={tilesRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 relative z-10">
          <Link
            href="/lab"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_12px_rgba(23,35,27,0.04)] cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Box className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">3D Labs</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Simulate optical & electrical apparatus</p>
          </Link>

          <Link
            href="/ar"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_12px_rgba(23,35,27,0.04)] cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Scan className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">AR Mode</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Place apparatus on your study desk</p>
          </Link>

          <Link
            href="/learn"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_12px_rgba(23,35,27,0.04)] cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Theory & Viva</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Formula guides, signs & oral prep</p>
          </Link>

          <Link
            href="/report"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_12px_rgba(23,35,27,0.04)] cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Lab Reports</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Printable CBSE/ICSE practical records</p>
          </Link>
        </div>
      </section>

      {/* =========================================
          LIVE INTERACTIVE SIMULATOR CARD
         ========================================= */}
      <section ref={demoCardRef} className="py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-4">
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] p-4 sm:p-6 shadow-[0_4px_20px_rgba(23,35,27,0.05)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
            <div>
              <span className="text-[10px] font-bold text-[#647067] tracking-widest uppercase block">
                Live Interactive Simulator
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#17231B]">
                Convex Lens Ray Formation & Focus Tracker
              </h3>
            </div>
            <button
              onClick={() => handleSliderChange(25)}
              className="px-2.5 py-1 rounded-lg bg-[#F4F7F2] hover:bg-[#EAEFE8] border border-[#E2E8DF] text-xs font-semibold text-[#17231B] flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* SVG Ray Diagram */}
          <div ref={svgWrapperRef} className="rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] p-3 overflow-hidden transition-transform">
            <RayDiagramSvg
              state={{
                focalLength,
                objectDistance: objectDist,
                objectHeight: 5,
              }}
              height={220}
            />
          </div>

          {/* Interactive Controls */}
          <div className="space-y-4 bg-[#F4F7F2] p-4 rounded-xl border border-[#E2E8DF]">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#17231B] font-semibold">Object Distance (u)</span>
                <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E2E8DF] shadow-sm">
                  {objectDist} cm
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSliderChange(Math.max(12, objectDist - 1))}
                  className="w-7 h-7 rounded-lg bg-[#FFFFFF] hover:bg-[#EAEFE8] border border-[#E2E8DF] text-[#17231B] font-bold flex items-center justify-center active:scale-95 text-sm shadow-sm cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="12"
                  max="45"
                  step="1"
                  value={objectDist}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => handleSliderChange(Math.min(45, objectDist + 1))}
                  className="w-7 h-7 rounded-lg bg-[#FFFFFF] hover:bg-[#EAEFE8] border border-[#E2E8DF] text-[#17231B] font-bold flex items-center justify-center active:scale-95 text-sm shadow-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/lab"
                className="flex-1 py-3 px-4 rounded-xl bg-[#17231B] hover:bg-[#233529] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Open Full 3D & AR Optical Bench</span>
              </Link>
              <Link
                href="/report?exp=convex-lens"
                className="py-3 px-4 rounded-xl bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] font-semibold text-xs sm:text-sm border border-[#E2E8DF] flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-[#17231B]" />
                <span>View Convex Lens Report</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 2: THREE-STEP LEARNING WORKFLOW
         ========================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#647067] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#E2E8DF] shadow-xs">
            Systematic Board Curriculum
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B]">
            Three-Stage Practical Mastery
          </h2>
          <p className="text-xs sm:text-sm text-[#647067]">
            Structured methodology aligned with NCERT Chapters 10, 11, and 12 guidelines.
          </p>
        </div>

        <div ref={workflowRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#B8D96B] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#B8D96B]/20 text-[#17231B] font-mono font-bold flex items-center justify-center text-sm border border-[#B8D96B]/40">
              01
            </div>
            <h3 className="text-base font-bold text-[#17231B]">Master the Theory</h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              Understand Snell’s law, mirror & thin-lens formulas, sign conventions, and light dispersion before entering the lab.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17231B] hover:text-[#B8D96B] pt-2 transition-colors"
            >
              <span>Explore Theory Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#B8D96B] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#B8D96B]/20 text-[#17231B] font-mono font-bold flex items-center justify-center text-sm border border-[#B8D96B]/40">
              02
            </div>
            <h3 className="text-base font-bold text-[#17231B]">Conduct 3D & AR Practical</h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              Align optical benches, eliminate parallax errors, place apparatus in physical space with AR hit-testing, and observe sharp ray convergence.
            </p>
            <Link
              href="/lab"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17231B] hover:text-[#B8D96B] pt-2 transition-colors"
            >
              <span>Launch 3D Bench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-3 relative overflow-hidden group hover:border-[#B8D96B] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#B8D96B]/20 text-[#17231B] font-mono font-bold flex items-center justify-center text-sm border border-[#B8D96B]/40">
              03
            </div>
            <h3 className="text-base font-bold text-[#17231B]">Record & Generate Reports</h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              Log readings into digital observation notebooks, calculate mean focal length & errors, complete viva defense, and print PDF practical sheets.
            </p>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17231B] hover:text-[#B8D96B] pt-2 transition-colors"
            >
              <span>Open Lab Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: ALL 5 CLASS 10 PRESCRIBED PRACTICALS
         ========================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
              Prescribed Physics Practicals
            </h2>
            <p className="text-xs text-[#647067]">
              Complete Class 10 Board Practical curriculum (CBSE / ICSE / State Boards).
            </p>
          </div>
          <Link
            href="/physics"
            className="text-xs font-bold text-[#17231B] hover:text-[#647067] flex items-center gap-1 transition-colors"
          >
            <span>View All Practicals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div ref={experimentsRef} className="space-y-3">
          {/* Exp 1: Convex Lens */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B8D96B]/30 text-[#17231B]">
                  EXP 1 • NCERT ACT. 10.11
                </span>
                <span className="text-[10px] text-[#647067] font-semibold">Refraction</span>
              </div>
              <h3 className="text-base font-bold text-[#17231B]">
                Determination of Focal Length of a Convex Lens
              </h3>
              <p className="text-xs text-[#647067]">
                u-v method, screen focusing, reciprocal graph plotting 1/v vs 1/u, and sign convention verification.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/lab"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/report?exp=convex-lens"
                className="px-3 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF]"
                title="View Lab Report"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Exp 2: Concave Mirror */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B8D96B]/30 text-[#17231B]">
                  EXP 2 • NCERT ACT. 10.2
                </span>
                <span className="text-[10px] text-[#647067] font-semibold">Reflection</span>
              </div>
              <h3 className="text-base font-bold text-[#17231B]">
                Focal Length of a Concave Mirror by Distant Object & u-v Method
              </h3>
              <p className="text-xs text-[#647067]">
                Real and inverted image formation on front screen, centre of curvature reflection, and radius R = 2f.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/physics/concave-mirror"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/report?exp=concave-mirror"
                className="px-3 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF]"
                title="View Lab Report"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Exp 3: Glass Slab */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B8D96B]/30 text-[#17231B]">
                  EXP 3 • NCERT ACT. 10.10
                </span>
                <span className="text-[10px] text-[#647067] font-semibold">Refraction & Snell’s Law</span>
              </div>
              <h3 className="text-base font-bold text-[#17231B]">
                Refraction & Lateral Displacement Through a Rectangular Glass Slab
              </h3>
              <p className="text-xs text-[#647067]">
                Verify Snell’s law (sin i / sin r = constant), parallel emergence (∠i ≈ ∠e), and lateral shift d.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/physics/glass-slab"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/report?exp=glass-slab"
                className="px-3 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF]"
                title="View Lab Report"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Exp 4: Glass Prism */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B8D96B]/30 text-[#17231B]">
                  EXP 4 • NCERT ACT. 11.1
                </span>
                <span className="text-[10px] text-[#647067] font-semibold">Dispersion & Deviation</span>
              </div>
              <h3 className="text-base font-bold text-[#17231B]">
                Refraction Through a Glass Prism & VIBGYOR Dispersion
              </h3>
              <p className="text-xs text-[#647067]">
                Trace rays through an equilateral triangular prism, verify A + D = i + e, and observe wavelength-dependent refraction.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/physics/glass-prism"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/report?exp=glass-prism"
                className="px-3 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF]"
                title="View Lab Report"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Exp 5: Ohm's Law */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#B8D96B]/30 text-[#17231B]">
                  EXP 5 • NCERT ACT. 12.1
                </span>
                <span className="text-[10px] text-[#647067] font-semibold">Electricity & Resistors</span>
              </div>
              <h3 className="text-base font-bold text-[#17231B]">
                Verification of Ohm’s Law and Resistors in Series & Parallel
              </h3>
              <p className="text-xs text-[#647067]">
                Linear V-I characteristic graph, resistance slope R = ΔV/ΔI, and combination laws Rs = R1+R2, 1/Rp = 1/R1+1/R2.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/physics/ohms-law"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch 3D Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/report?exp=ohms-law"
                className="px-3 py-2 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF]"
                title="View Lab Report"
              >
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4: AUGMENTED REALITY AT TRUE SCALE & DEVICE COMPATIBILITY
         ========================================= */}
      <section ref={arSectionRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#17231B] border border-[#E2E8DF] shadow-xs">
              <Smartphone className="w-3.5 h-3.5 text-[#17231B]" />
              <span>Augmented Reality Technology</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] leading-tight">
              Augmented Reality at <br />
              <span className="text-[#17231B] underline decoration-[#B8D96B] decoration-4">
                True Optical Scale
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
              Place the dual-rail 100 cm optical bench right onto your real study table. Move around the bench with your mobile phone to inspect ray convergence, screen sharpness, and eliminate parallax just like a physical laboratory.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#17231B]">Real-world Scale & Proportions</h4>
                  <p className="text-xs text-[#647067]">Accurately calibrated 100 cm bench with authentic focal lengths (10 cm to 25 cm).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#17231B]">360-Degree Ray Inspection</h4>
                  <p className="text-xs text-[#647067]">Walk around the desk to observe how light rays converge to form a real inverted focal image.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#17231B]">Zero App Installation</h4>
                  <p className="text-xs text-[#647067]">Runs directly inside mobile browsers (Android Chrome with ARCore) and WebXR camera mode.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/ar"
                className="px-5 py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Test AR Compatibility</span>
              </Link>
            </div>
          </div>

          {/* AR Diagnostic / Illustration Card */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
              <h3 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#17231B]" />
                <span>Device Compatibility Diagnostic</span>
              </h3>
              <span className="text-[10px] text-[#17231B] font-mono font-bold bg-[#B8D96B]/30 px-2 py-0.5 rounded">
                WebXR API v1
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#17231B] block">Android Mobile (Chrome / Edge)</span>
                  <span className="text-[#647067] text-[11px]">Supports WebXR surface hit-testing with ARCore</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#B8D96B] text-[#17231B] font-bold text-[10px]">
                  FULL AR
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#17231B] block">Apple iOS (Safari)</span>
                  <span className="text-[#647067] text-[11px]">Live Camera backdrop & WebXR Viewer fallback</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] font-bold text-[10px]">
                  CAMERA AR / 3D
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#17231B] block">Desktop & Laptop Browsers</span>
                  <span className="text-[#647067] text-[11px]">Hardware-accelerated 3D Virtual Optics Bench</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8DF] text-[#17231B] font-bold text-[10px]">
                  3D STUDIO
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#B8D96B]/15 border border-[#B8D96B]/40 text-[11px] text-[#17231B] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
              <span>
                <strong>Educational Accessibility Guarantee:</strong> If surface placement is unavailable on your device, LabSim seamlessly provides the full-featured interactive 3D studio with zero degraded physics.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 5: PRACTICAL EXPERIMENT SPECIFICATIONS
         ========================================= */}
      <section ref={specSectionRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B]">
            Practical Experiment Specification
          </h2>
          <p className="text-xs sm:text-sm text-[#647067]">
            CBSE / ICSE / IB Class 10 & 12 Physics Standard Practical Reference Manual
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Aim</span>
            </h4>
            <p className="text-xs text-[#647067] leading-relaxed">
              To determine the focal length of a convex lens by obtaining the image of an illuminated object on a screen and plotting graphs between u and v, and between 1/u and 1/v.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Apparatus</span>
            </h4>
            <p className="text-xs text-[#647067] leading-relaxed">
              Optical bench with dual rails and 100 cm millimeter scale, three uprights with vernier clamps, double convex lens, illuminated wire mesh/candle, and ground-glass screen.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Formula</span>
            </h4>
            <div className="text-xs text-[#17231B] font-mono leading-relaxed bg-[#F4F7F2] p-2 rounded-lg border border-[#E2E8DF]">
              1/f = 1/v - 1/u<br />
              f = (u × v) / (u + v)<br />
              m = v / u = hᵢ / hₒ
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
              <span>Sign Convention</span>
            </h4>
            <p className="text-xs text-[#647067] leading-relaxed">
              New Cartesian: Object distance u is negative (-), Real image distance v is positive (+), Focal length f of convex lens is always positive (+).
            </p>
          </div>
        </div>

        {/* Quick Jump Call-to-Action Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-[#17231B] text-[#FFFFFF] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-[#FFFFFF]">Ready to begin the investigation?</h3>
            <p className="text-xs text-[#E2E8DF]">
              Start by aligning the optical bench, setting the lens position at 50 cm, and focusing the screen.
            </p>
          </div>
          <Link
            href="/lab"
            className="px-6 py-3 rounded-xl font-bold text-xs bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Open Virtual 3D Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
