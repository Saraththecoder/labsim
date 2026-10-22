'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  Smartphone,
  Scan,
  Box,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { WebXROpticalBench } from '@/components/WebXROpticalBench';

export default function ARPage() {
  const [focalLength, setFocalLength] = useState<number>(15);
  const [lensPos, setLensPos] = useState<number>(50);
  const [objectPos, setObjectPos] = useState<number>(25);
  const [screenPos, setScreenPos] = useState<number>(80);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const slidersCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (headerRef.current) {
        tl.from(headerRef.current, { y: -16, opacity: 0, duration: 0.5 });
      }
      if (slidersCardRef.current) {
        tl.from(slidersCardRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.2');
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-transparent text-[#17231B] py-4 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Header Matching Screen 3 */}
      <div ref={headerRef} className="flex items-center justify-between pb-2 border-b border-[#E2E8DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-[#17231B] tracking-tight flex items-center gap-2">
              <span>AR Mode</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B8D96B]/30 text-[#17231B] border border-[#B8D96B]/60">
                WebXR
              </span>
            </h1>
            <p className="text-[11px] text-[#647067] hidden sm:block">
              Interactive Tabletop Augmented Reality Optical Bench
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] transition-all shadow-sm"
            title="AR & Camera Guide"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main AR Component & Viewport */}
      <WebXROpticalBench
        focalLength={focalLength}
        objectPos={objectPos}
        lensPos={lensPos}
        screenPos={screenPos}
        onObjectPosChange={setObjectPos}
        onLensPosChange={setLensPos}
        onScreenPosChange={setScreenPos}
      />

      {/* Bench Upright Quick Adjustment Sliders */}
      <div ref={slidersCardRef} className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8DF] space-y-4 shadow-[0_4px_20px_rgba(23,35,27,0.05)]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#17231B] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#17231B]" />
            <span>Upright Controls</span>
          </span>
          <span className="text-[11px] font-mono text-[#17231B] font-bold bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E2E8DF]">
            f = +{focalLength} cm
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Object Slider */}
          <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
            <div className="flex justify-between items-center">
              <span className="text-[#17231B] font-semibold">Object Position (xₒ)</span>
              <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">{objectPos.toFixed(1)} cm</span>
            </div>
            <input
              type="range"
              min="0"
              max={lensPos - 5}
              step="0.5"
              value={objectPos}
              onChange={(e) => setObjectPos(Number(e.target.value))}
              className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#647067] font-mono">
              <span>u = {(lensPos - objectPos).toFixed(1)} cm</span>
              <span>Light source</span>
            </div>
          </div>

          {/* Lens Slider */}
          <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
            <div className="flex justify-between items-center">
              <span className="text-[#17231B] font-semibold">Lens Position (xₗ)</span>
              <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">{lensPos.toFixed(1)} cm</span>
            </div>
            <input
              type="range"
              min={objectPos + 5}
              max={screenPos - 5}
              step="0.5"
              value={lensPos}
              onChange={(e) => setLensPos(Number(e.target.value))}
              className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#647067] font-mono">
              <span>Center upright</span>
              <span>Double convex</span>
            </div>
          </div>

          {/* Screen Slider */}
          <div className="space-y-1.5 bg-[#F4F7F2] p-3 rounded-xl border border-[#E2E8DF]">
            <div className="flex justify-between items-center">
              <span className="text-[#17231B] font-semibold">Screen Position (xₛ)</span>
              <span className="font-mono text-[#17231B] font-bold bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E2E8DF] shadow-sm">{screenPos.toFixed(1)} cm</span>
            </div>
            <input
              type="range"
              min={lensPos + 5}
              max="100"
              step="0.5"
              value={screenPos}
              onChange={(e) => setScreenPos(Number(e.target.value))}
              className="w-full accent-[#B8D96B] h-2 bg-[#E2E8DF] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#647067] font-mono">
              <span>v = {(screenPos - lensPos).toFixed(1)} cm</span>
              <span>Focal capture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info / Diagnostics Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-[#17231B]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8DF] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-[#17231B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8DF]">
              <div className="flex items-center gap-2 font-bold text-base text-[#17231B]">
                <Smartphone className="w-5 h-5 text-[#17231B]" />
                <span>Mobile AR Camera Compatibility</span>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-7 h-7 rounded-lg bg-[#F4F7F2] hover:bg-[#EAEFE8] text-[#17231B] flex items-center justify-center text-xs border border-[#E2E8DF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#647067] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#B8D96B]/50 space-y-1">
                <span className="font-bold text-[#17231B] block">
                  Why was camera inaccessible on mobile?
                </span>
                <p>
                  Modern mobile browsers (Chrome on Android, Safari on iOS) strictly block camera hardware and WebXR when accessed over unencrypted HTTP (e.g. <code className="text-[#17231B] bg-white px-1 py-0.5 rounded border border-[#E2E8DF]">http://192.168.x.x:3005</code>). They require a <strong>Secure Context (HTTPS or localhost)</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#17231B]">How to connect your phone camera:</h4>
                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                  <span className="font-semibold text-[#17231B]">1. Instant Free HTTPS Tunnel:</span>
                  <p>
                    Run this in your terminal on your PC:
                  </p>
                  <pre className="bg-[#FFFFFF] p-2 rounded text-[#17231B] font-mono text-[11px] overflow-x-auto border border-[#E2E8DF]">
                    npx localtunnel --port 3005
                  </pre>
                  <p className="text-[10px] text-[#647067]">
                    Open the generated HTTPS URL on your phone browser. Camera & AR will work immediately!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                  <span className="font-semibold text-[#17231B]">2. Android USB Port Forwarding:</span>
                  <p>
                    Connect your phone via USB cable, open <code className="text-[#17231B] font-bold">chrome://inspect</code> on your PC, click <strong>Port forwarding</strong>, add port <code className="text-[#17231B]">3005</code> to <code className="text-[#17231B]">localhost:3005</code>, then browse to <code className="text-[#17231B] font-bold">http://localhost:3005</code> on your phone.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7F2] border border-[#E2E8DF] space-y-1">
                  <span className="font-semibold text-[#17231B]">3. Device Platforms:</span>
                  <p>
                    • <strong>Android:</strong> Supports native ARCore WebXR hit-testing.<br />
                    • <strong>Apple iOS:</strong> Safari uses the interactive live Camera Passthrough and 3D tabletop simulation.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#B8D96B] hover:bg-[#a9cd59] text-[#17231B] font-bold text-xs shadow-md transition-all active:scale-98"
            >
              Got it, continue experiment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
