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
  ChevronRight,
  Eye,
  Camera,
  Layers,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';

export default function HomePage() {
  const [objectDist, setObjectDist] = useState(25);
  const focalLength = 10;

  // GSAP Animation Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const noteLeftRef = useRef<HTMLDivElement>(null);
  const noteRightRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const expHeadingRef = useRef<HTMLDivElement>(null);
  const expListRef = useRef<HTMLDivElement>(null);
  const demoCardRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Context ensures clean disposal on React unmount
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

      // 3. Stagger in popular experiments
      if (expHeadingRef.current) {
        tl.from(
          expHeadingRef.current,
          {
            opacity: 0,
            y: 16,
            duration: 0.5,
          },
          '-=0.2'
        );
      }

      if (expListRef.current && expListRef.current.children.length > 0) {
        tl.from(
          expListRef.current.children,
          {
            y: 22,
            opacity: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.3'
        );
      }

      // 4. Reveal live simulator card
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

      // 5. Floating handwritten sketchbook margin annotations (physics sine float)
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
    }, heroRef);

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
    <div ref={heroRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden pb-12 relative">
      {/* =========================================
          HERO SECTION (Porcelain & Electric Lime on Paper)
         ========================================= */}
      <section className="relative pt-6 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Subtle Electric Lime Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[240px] bg-[#B8D96B]/20 blur-[100px] pointer-events-none rounded-full" />

        {/* Tactile Sketchbook Margin Annotations (Mockup Style with GSAP floating physics) */}
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
            For schools and higher education.
          </p>

          {/* Primary Lime CTA Button: Sora 600 */}
          <div ref={ctaRef} className="pt-2">
            <Link
              href="/lab"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-semibold text-sm shadow-[0_4px_18px_rgba(184,217,107,0.35)] transition-all transform active:scale-95 cursor-pointer hover:translate-y-[-2px]"
            >
              <span>Start Experiment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* 4 Quick Access Navigation Tiles (Porcelain & White) */}
        <div ref={tilesRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 relative z-10">
          {/* 1. 3D Labs */}
          <Link
            href="/lab"
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all group flex flex-col items-start gap-3 shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors">
                3D Labs
              </h3>
              <p className="text-[10px] text-[#647067] mt-0.5 line-clamp-1">Simulated benches</p>
            </div>
          </Link>

          {/* 2. AR Experiments */}
          <Link
            href="/ar"
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all group flex flex-col items-start gap-3 shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] group-hover:scale-105 transition-transform">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors">
                AR Experiments
              </h3>
              <p className="text-[10px] text-[#647067] mt-0.5 line-clamp-1">Camera tabletop</p>
            </div>
          </Link>

          {/* 3. Theory & Concepts */}
          <Link
            href="/learn"
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all group flex flex-col items-start gap-3 shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors">
                Theory & Concepts
              </h3>
              <p className="text-[10px] text-[#647067] mt-0.5 line-clamp-1">Class 10 Syllabus</p>
            </div>
          </Link>

          {/* 4. Reports & Assessment */}
          <Link
            href="/observations"
            className="p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all group flex flex-col items-start gap-3 shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors">
                Reports & Assessment
              </h3>
              <p className="text-[10px] text-[#647067] mt-0.5 line-clamp-1">Data & Quizzes</p>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================
          POPULAR EXPERIMENTS SECTION (Porcelain & White Cards)
         ========================================= */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-4">
        <div ref={expHeadingRef} className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#17231B] tracking-tight">
            Popular Experiments
          </h2>
          <Link
            href="/physics"
            className="text-xs font-bold text-[#17231B] hover:text-[#527d24] flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Experiment Cards List (GSAP Staggered) */}
        <div ref={expListRef} className="space-y-3">
          {/* 1. Convex Lens */}
          <Link
            href="/lab?exp=convex-lens"
            className="group block p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail Container */}
              <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-[#B8D96B] via-[#17231B] to-[#B8D96B] shadow-[0_0_10px_rgba(184,217,107,0.5)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-60">
                  <div className="w-full h-[1px] bg-[#B8D96B]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors truncate">
                    Convex Lens
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B8D96B]/25 text-[#17231B] border border-[#B8D96B]/50">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#647067] mt-0.5 line-clamp-1 sm:line-clamp-2">
                  Image formation, ray diagrams and real-world applications
                </p>
              </div>

              {/* Arrow Action Button */}
              <div className="w-9 h-9 rounded-full bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] flex items-center justify-center text-[#17231B] group-hover:bg-[#B8D96B] transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* 2. Concave Lens */}
          <Link
            href="/lab?exp=concave-lens"
            className="group block p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail Container */}
              <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                <div className="w-2 h-10 rounded border-y border-[#17231B] bg-transparent shadow-[0_0_8px_rgba(23,35,27,0.2)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-full h-[1px] bg-[#17231B]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors truncate">
                  Concave Lens
                </h3>
                <p className="text-xs text-[#647067] mt-0.5 line-clamp-1 sm:line-clamp-2">
                  Virtual & real images, ray diagrams
                </p>
              </div>

              {/* Arrow Action Button */}
              <div className="w-9 h-9 rounded-full bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] flex items-center justify-center text-[#17231B] group-hover:bg-[#B8D96B] transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* 3. Mirror Experiments */}
          <Link
            href="/lab?exp=spherical-mirrors"
            className="group block p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-[0_2px_8px_rgba(23,35,27,0.04)]"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail Container */}
              <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                <div className="w-1.5 h-10 rounded-full border-r-2 border-[#17231B] bg-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-full h-[1px] bg-[#17231B]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[#17231B] group-hover:text-[#17231B] transition-colors truncate">
                  Mirror Experiments
                </h3>
                <p className="text-xs text-[#647067] mt-0.5 line-clamp-1 sm:line-clamp-2">
                  Plane, Concave & Convex
                </p>
              </div>

              {/* Arrow Action Button */}
              <div className="w-9 h-9 rounded-full bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] flex items-center justify-center text-[#17231B] group-hover:bg-[#B8D96B] transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================
          INTERACTIVE BENCH PREVIEW (Porcelain & Forest Palette)
         ========================================= */}
      <section ref={demoCardRef} className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-4">
        <div className="rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] p-4 sm:p-6 shadow-[0_4px_20px_rgba(23,35,27,0.05)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
            <div>
              <span className="text-[10px] font-bold text-[#647067] tracking-widest uppercase block">
                Live Interactive Simulator
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#17231B]">
                Convex Lens Ray Formation
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

          {/* SVG Ray Diagram with GSAP micro-interaction */}
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

          {/* Mobile-Friendly Sliders */}
          <div className="space-y-4 bg-[#F4F7F2] p-4 rounded-xl border border-[#E2E8DF]">
            {/* Object Distance Slider */}
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

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/lab"
                className="flex-1 py-3 px-4 rounded-xl bg-[#17231B] hover:bg-[#233529] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Open Full 3D & AR Optical Bench</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
