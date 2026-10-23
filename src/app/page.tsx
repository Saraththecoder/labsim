'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  ArrowRight,
  Scan,
  FileText,
  Smartphone,
  CheckCircle2,
  Atom,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ANIMATE ONLY THIS TEXT: "Interactive Science Labs in 3D & Augmented Reality"
      if (headlineRef.current) {
        const line1 = headlineRef.current.querySelector('.headline-line-1');
        const line2 = headlineRef.current.querySelector('.headline-line-2');

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          [line1, line2],
          {
            y: 32,
            opacity: 0,
            scale: 0.96,
            filter: 'blur(6px)',
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.85,
            stagger: 0.18,
            clearProps: 'transform,filter',
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageContainerRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] overflow-hidden pb-16 relative">
      {/* =========================================
          HERO SECTION
         ========================================= */}
      <section className="relative pt-6 sm:pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-[260px] bg-[#B8D96B]/20 blur-[110px] pointer-events-none rounded-full" />

        {/* ---------------- CUTE STICKER 1: Bubbling Chemistry Flask (Top Left) ---------------- */}
        <div className="absolute top-2 left-2 sm:left-4 z-20 animate-cute-float pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stickers/cute-flask.svg"
            alt="Chemistry Flask"
            className="w-12 h-12 sm:w-20 sm:h-20 drop-shadow-[0_8px_16px_rgba(49,151,149,0.3)] hover:scale-110 transition-transform"
          />
        </div>

        {/* ---------------- CUTE STICKER 2: Spinning Physics Atom (Top Right) ---------------- */}
        <div className="absolute top-2 right-2 sm:right-4 z-20 animate-cute-float-reverse pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stickers/cute-atom.svg"
            alt="Physics Atom"
            className="w-12 h-12 sm:w-20 sm:h-20 drop-shadow-[0_8px_16px_rgba(184,217,107,0.35)] hover:scale-110 transition-transform"
          />
        </div>

        <div className="text-left sm:text-center space-y-4 relative z-10 pt-8 sm:pt-2">
          {/* Eyebrow Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFFFFF] text-[#17231B] border border-[#E2E8DF] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B8D96B]" />
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#647067] uppercase">
              Class 10 CBSE & ICSE Science Practical Suite
            </p>
          </div>

          {/* Main Title - ONLY THIS TEXT IS ANIMATED */}
          <h1 ref={headlineRef} className="font-serif-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#17231B] leading-[1.12]">
            <span className="headline-line-1 block">
              Interactive Science Labs
            </span>
            <span className="headline-line-2 block text-[#17231B] underline decoration-[#B8D96B] decoration-[6px] underline-offset-8">
              in 3D & Augmented Reality
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xs sm:text-base text-[#647067] max-w-2xl sm:mx-auto leading-relaxed font-normal">
            Master prescribed secondary board practicals with authentic physics ray tracing, electrical circuits, and chemical electrolyte simulations. Zero app installation — experience interactive 3D in your browser and tabletop AR on your desk.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-start sm:justify-center gap-3 relative">
            {/* ---------------- CUTE STICKER 3: Rainbow Prism Crystal (Floating near CTAs) ---------------- */}
            <div className="absolute -right-2 -top-10 sm:-right-8 sm:-top-12 z-20 animate-cute-float-slow pointer-events-none select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/stickers/cute-prism.svg"
                alt="Rainbow Prism"
                className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_6px_14px_rgba(171,71,188,0.3)] hover:scale-110 transition-transform"
              />
            </div>

            <Link
              href="/physics"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-semibold text-sm shadow-[0_4px_18px_rgba(184,217,107,0.35)] transition-all transform active:scale-95 cursor-pointer hover:translate-y-[-2px]"
            >
              <Atom className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Physics Suite</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              href="/conductivity/lab"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#17231B] font-semibold text-sm border border-[#E2E8DF] shadow-xs transition-all active:scale-95 hover:translate-y-[-2px]"
            >
              <Zap className="w-4 h-4 text-[#17231B]" />
              <span>Chemistry Lab</span>
            </Link>

            <Link
              href="/ar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] text-[#647067] hover:text-[#17231B] font-semibold text-sm border border-[#E2E8DF] shadow-xs transition-all active:scale-95 hover:translate-y-[-2px]"
            >
              <Smartphone className="w-4 h-4 text-[#17231B]" />
              <span>Launch AR</span>
            </Link>
          </div>
        </div>

        {/* ---------------- CUTE STICKER 4: 3D H2O Molecule (Floating between CTA & Tiles) ---------------- */}
        <div className="flex justify-center -my-1 sm:my-2 relative z-20 pointer-events-none select-none">
          <div className="animate-cute-float flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/stickers/cute-molecule.svg"
              alt="H2O Molecule"
              className="w-14 h-14 sm:w-18 sm:h-18 drop-shadow-[0_8px_16px_rgba(229,62,62,0.3)] hover:scale-110 transition-transform"
            />
          </div>
        </div>

        {/* 5 Quick Access Navigation Tiles (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
          <Link
            href="/physics"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-xs cursor-pointer relative"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Atom className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Physics Suite</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">5 NCERT Practicals</p>
          </Link>

          <Link
            href="/chemistry"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-xs cursor-pointer relative"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Zap className="w-5 h-5 stroke-[2] text-[#17231B]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Chemistry Lab</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">pH, CuSO4 & Salts</p>
          </Link>

          <Link
            href="/sandbox"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-xs cursor-pointer relative"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Sparkles className="w-5 h-5 stroke-[2] text-[#17231B]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Circuit Sandbox</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Tinkercad-Style CAD</p>
          </Link>

          <Link
            href="/ar"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-xs cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <Scan className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Tabletop AR</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Desk surface placement</p>
          </Link>

          <Link
            href="/report"
            className="group block p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F9FAF8] border border-[#E2E8DF] hover:border-[#B8D96B] transition-all shadow-xs cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] group-hover:border-[#B8D96B] group-hover:bg-[#B8D96B]/20 flex items-center justify-center text-[#17231B] mb-3 transition-colors">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#17231B] mb-0.5">Lab Reports</h3>
            <p className="text-[11px] text-[#647067] line-clamp-1">Printable practical records</p>
          </Link>
        </div>
      </section>

      {/* =========================================
          SECTION 2: WHY LABSIM? (VISUAL FEATURE SHOWCASE)
         ========================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
        {/* ---------------- CUTE STICKER 5: Glowing Bulb (Physics Circuit) ---------------- */}
        <div className="absolute top-2 right-3 sm:right-8 z-20 animate-cute-float pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stickers/cute-bulb.svg"
            alt="Glowing Bulb"
            className="w-12 h-12 sm:w-18 sm:h-18 drop-shadow-[0_6px_14px_rgba(236,201,75,0.4)] hover:scale-110 transition-transform"
          />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#17231B] bg-[#FFFFFF] px-3.5 py-1.5 rounded-full border border-[#B8D96B]/60 shadow-xs inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#B8D96B]" />
            <span>Why LabSim? • Real Lab vs Virtual Reality</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17231B] tracking-tight">
            Your School Science Lab, <span className="underline decoration-[#B8D96B] decoration-4 underline-offset-4">Available 24/7</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
            School laboratories give you only 40 minutes once a week with crowded queues and scratched mirrors. LabSim puts a fully functioning 3D and Augmented Reality laboratory right on your screen and study table.
          </p>
        </div>

        {/* 4 Strategic Visual Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 3D Optical Bench & Ray Tracing */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#17231B] border border-[#E2E8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/convex-lens.jpg"
                  alt="3D Optical Bench Practical"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/70 text-[#B8D96B] backdrop-blur-xs">
                  Physics Optics Bench
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Master Optical Benches Without Broken Glass
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Slide lenses along a 100 cm dual-rail optical bench, position object and image pins, and eliminate parallax error in real-time 3D ray tracing without waiting in school lab queues.
                </p>
              </div>
            </div>

            <Link
              href="/lab"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#17231B] group-hover:text-[#38761D] pt-1 transition-colors"
            >
              <span>Try Convex Lens 3D Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Tabletop Augmented Reality (AR) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#17231B] border border-[#E2E8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/concave-mirror.jpg"
                  alt="Tabletop Augmented Reality"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/70 text-[#B8D96B] backdrop-blur-xs">
                  WebXR Desk Surface AR
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Place Physical Apparatus on Your Study Table
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Point your phone camera at your desk. The complete physical apparatus appears right in front of you in 1:1 scale using WebXR with intuitive touch controls.
                </p>
              </div>
            </div>

            <Link
              href="/ar"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#17231B] group-hover:text-[#38761D] pt-1 transition-colors"
            >
              <span>Launch Desk Augmented Reality</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Safe Circuits & Chemistry */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/ohms-law.svg"
                  alt="Safe Electrical Circuit Simulation"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#17231B]/80 text-[#B8D96B] backdrop-blur-xs">
                  Zero-Risk Circuits & Acids
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Zero Blown Fuses, Zero Chemical Spills
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Safely test batteries, slide rheostats, and dip electrodes into acids, bases, and salts. View live current meters and ion dissociation with zero risk of electric shocks or chemical burns.
                </p>
              </div>
            </div>

            <Link
              href="/chemistry"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#17231B] group-hover:text-[#38761D] pt-1 transition-colors"
            >
              <span>Explore Chemistry Practicals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Observation Tables & Viva Practice */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/experiments/glass-prism.svg"
                  alt="Practical Records and Viva"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#17231B]/80 text-[#B8D96B] backdrop-blur-xs">
                  Exam-Ready Observation Sheets
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Ready-to-Submit Lab Notebooks & Viva Mastery
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Auto-calculate mean focal lengths, refractive indices, and error percentages. Master curated examiner viva-voce questions to score full 30/30 marks in your practical exam!
                </p>
              </div>
            </div>

            <Link
              href="/report"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#17231B] group-hover:text-[#38761D] pt-1 transition-colors"
            >
              <span>View Practical Reports & Viva</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: FEATURED LABORATORY DISCIPLINES
         ========================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
        {/* ---------------- CUTE STICKER 6: Horseshoe Magnet (Near Physics card) ---------------- */}
        <div className="absolute top-2 left-2 sm:left-4 z-20 animate-cute-float-reverse pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stickers/cute-magnet.svg"
            alt="Horseshoe Magnet"
            className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_8px_16px_rgba(229,62,62,0.3)] hover:scale-110 transition-transform"
          />
        </div>

        {/* ---------------- CUTE STICKER 7: Chemistry Electrolyte Beaker (Near Chemistry card) ---------------- */}
        <div className="absolute top-2 right-2 sm:right-4 z-20 animate-cute-float-slow pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/stickers/cute-beaker.svg"
            alt="Chemistry Beaker"
            className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_8px_16px_rgba(102,126,234,0.35)] hover:scale-110 transition-transform"
          />
        </div>

        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2 pt-6 sm:pt-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#647067] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#E2E8DF] shadow-xs">
            Interactive Laboratories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231B]">
            Explore Laboratory Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-[#647067]">
            Select a discipline to begin your interactive 3D simulations and augmented reality practicals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discipline 1: Physics Suite */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden">
            {/* Visual Header Image */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#17231B] border border-[#E2E8DF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/experiments/convex-lens.jpg"
                alt="Physics Suite Practicals"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Atom className="w-4 h-4 text-[#B8D96B]" />
                  <span>Physics Laboratory</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8D96B] text-[#17231B]">
                  5 Practicals
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Class 10 Physics Suite
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Complete optics and electricity syllabus: Convex Lens focal length, Concave Mirror image formation, Glass Slab lateral shift, Triangular Prism dispersion, and Ohm’s Law circuits.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>Ray tracing & 6 canonical image formation cases</span>
                </div>
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>Dual-rail 100 cm optical bench in WebXR Tabletop AR</span>
                </div>
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>V-I characteristics, Series & Parallel circuit analysis</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8DF] flex items-center gap-3">
              <Link
                href="/physics"
                className="flex-1 py-3 px-4 rounded-xl bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Open Physics Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/lab"
                className="py-3 px-4 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF] transition-colors"
                title="Direct link to Convex Lens 3D Lab"
              >
                <span>Convex Lens</span>
              </Link>
            </div>
          </div>

          {/* Discipline 2: Chemistry Lab */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] hover:border-[#B8D96B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 group relative overflow-hidden">
            {/* Visual Header Image */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/experiments/glass-slab.svg"
                alt="Chemistry Electrolyte Practical"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#B8D96B]" />
                  <span>Chemistry Laboratory</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#17231B] text-[#B8D96B] border border-[#B8D96B]/50">
                  Electrolyte Practical
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#17231B] group-hover:text-[#17231B]">
                  Class 10 Chemistry Lab
                </h3>
                <p className="text-xs text-[#647067] mt-1 leading-relaxed">
                  Investigate electrical conductivity of acid, base, salt, and organic solutions. Observe real-time ion dissociation (H⁺, OH⁻, Na⁺, Cl⁻) and circuit bulb luminosity.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>Strong vs Weak vs Non-electrolyte solutions</span>
                </div>
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>Real-time microscopic ion dissociation simulation</span>
                </div>
                <div className="text-[11px] font-semibold text-[#17231B] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8D96B]" />
                  <span>Electrode immersion, current logging & viva questions</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8DF] flex items-center gap-3">
              <Link
                href="/conductivity/lab"
                className="flex-1 py-3 px-4 rounded-xl bg-[#17231B] hover:bg-[#233529] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Launch Chemistry Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/conductivity/learn"
                className="py-3 px-4 rounded-xl bg-[#F4F7F2] hover:bg-[#E2E8DF] text-[#17231B] text-xs font-bold border border-[#E2E8DF] transition-colors"
                title="Chemistry Theory Guide"
              >
                <span>Theory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ---------------- CUTE STICKER 8: Microscope (Floating above bottom card) ---------------- */}
        <div className="flex justify-center -mb-2 mt-4 relative z-20 pointer-events-none select-none">
          <div className="animate-cute-float-slow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/stickers/cute-microscope.svg"
              alt="Optical Microscope"
              className="w-14 h-14 sm:w-18 sm:h-18 drop-shadow-[0_8px_16px_rgba(49,151,149,0.35)] hover:scale-110 transition-transform"
            />
          </div>
        </div>

        {/* Quick Launch Call-to-Action Card */}
        <div className="mt-6 p-6 rounded-2xl bg-[#17231B] text-[#FFFFFF] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-[#FFFFFF]">Ready to begin your practical exam preparation?</h3>
            <p className="text-xs text-[#E2E8DF]">
              All experiments are aligned with NCERT Class 10 Board exam practical syllabus and marking schemes.
            </p>
          </div>
          <Link
            href="/physics"
            className="px-6 py-3 rounded-xl font-bold text-xs bg-[#B8D96B] hover:bg-[#a7cb58] text-[#17231B] flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Open All Practicals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
