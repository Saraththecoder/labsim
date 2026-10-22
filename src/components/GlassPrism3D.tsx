'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  calculateGlassPrism,
  PrismState,
  VIBGYOR_SPECTRUM,
} from '@/lib/prismPhysics';
import {
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Crosshair,
  CheckCircle2,
} from 'lucide-react';

interface GlassPrism3DProps {
  angleIncidence: number; // in degrees (30 to 70)
  refractiveIndex: number; // n (e.g. 1.52)
  mode: 'monochromatic' | 'dispersion';
  showDeviationAngle?: boolean;
  showPins?: boolean;
  className?: string;
}

export function GlassPrism3D({
  angleIncidence,
  refractiveIndex,
  mode,
  showDeviationAngle = true,
  showPins = true,
  className = '',
}: GlassPrism3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const raysGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<'top' | 'perspective' | 'spectrum'>('top');

  const calc = calculateGlassPrism({
    angleIncidenceDeg: angleIncidence,
    refractiveIndex,
    mode,
  });

  // Re-draw light rays & dispersion spectrum
  const updateVisuals = () => {
    if (!raysGroupRef.current || !pinsGroupRef.current) return;
    const raysGroup = raysGroupRef.current;
    const pinsGroup = pinsGroupRef.current;

    while (raysGroup.children.length > 0) {
      const child = raysGroup.children[0];
      raysGroup.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        child.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry.dispose();
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material.dispose();
          }
        });
      }
    }

    // Equilateral triangle side S = 3.6 units
    // Apex at top: (0, 1.8), Base left: (-1.8, -1.3), Base right: (1.8, -1.3)
    const Oz = 0.05;

    // Normal to left face (inclined at 30° to horizontal)
    // Point of incidence O on left face: halfway down
    const Ox = -0.9;
    const Oy = 0.25;

    const iRad = (angleIncidence * Math.PI) / 180;
    // Incident ray coming from upper-left
    const incLen = 3.2;
    const incAngleFromNormal = iRad;
    // Face angle is 60° from horizontal => normal angle is 150°
    const normalAngleLeft = (150 * Math.PI) / 180;
    const incRayAngle = normalAngleLeft + incAngleFromNormal;

    const incStartX = Ox - Math.cos(incRayAngle) * incLen;
    const incStartY = Oy - Math.sin(incRayAngle) * incLen;

    if (mode === 'monochromatic') {
      // 1. Incident Ray (Cyan)
      const incPts = [new THREE.Vector3(incStartX, incStartY, Oz), new THREE.Vector3(Ox, Oy, Oz)];
      const incGeo = new THREE.BufferGeometry().setFromPoints(incPts);
      const incMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
      raysGroup.add(new THREE.Line(incGeo, incMat));

      // Point of emergence O' on right face:
      const r1Rad = calc.r1Rad;
      const rAngleInside = normalAngleLeft - Math.PI + r1Rad;
      const insideLen = 1.8;
      const OprimeX = Ox + Math.cos(rAngleInside) * insideLen;
      const OprimeY = Oy + Math.sin(rAngleInside) * insideLen;

      // 2. Refracted Ray inside prism (Yellow)
      const refrPts = [new THREE.Vector3(Ox, Oy, Oz), new THREE.Vector3(OprimeX, OprimeY, Oz)];
      const refrGeo = new THREE.BufferGeometry().setFromPoints(refrPts);
      const refrMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 });
      raysGroup.add(new THREE.Line(refrGeo, refrMat));

      // 3. Emergent Ray (Emerald Green)
      const eRad = calc.angleEmergenceRad;
      const normalAngleRight = (30 * Math.PI) / 180;
      const emRayAngle = normalAngleRight - eRad;
      const emLen = 3.2;
      const emEndX = OprimeX + Math.cos(emRayAngle) * emLen;
      const emEndY = OprimeY + Math.sin(emRayAngle) * emLen;

      const emPts = [new THREE.Vector3(OprimeX, OprimeY, Oz), new THREE.Vector3(emEndX, emEndY, Oz)];
      const emGeo = new THREE.BufferGeometry().setFromPoints(emPts);
      const emMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
      raysGroup.add(new THREE.Line(emGeo, emMat));

      // 4. Deviation Angle Extensions (Dashed white/purple)
      if (showDeviationAngle) {
        // Forward extension of incident ray
        const incExtX = Ox + Math.cos(incRayAngle) * 2.5;
        const incExtY = Oy + Math.sin(incRayAngle) * 2.5;
        const extGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Ox, Oy, Oz),
          new THREE.Vector3(incExtX, incExtY, Oz),
        ]);
        const extMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.1, gapSize: 0.05 });
        const extLine = new THREE.Line(extGeo, extMat);
        extLine.computeLineDistances();
        raysGroup.add(extLine);

        // Backward extension of emergent ray
        const emBackX = OprimeX - Math.cos(emRayAngle) * 2.5;
        const emBackY = OprimeY - Math.sin(emRayAngle) * 2.5;
        const emBackGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(OprimeX, OprimeY, Oz),
          new THREE.Vector3(emBackX, emBackY, Oz),
        ]);
        const emBackMat = new THREE.LineDashedMaterial({ color: 0xa855f7, dashSize: 0.1, gapSize: 0.05 });
        const emBackLine = new THREE.Line(emBackGeo, emBackMat);
        emBackLine.computeLineDistances();
        raysGroup.add(emBackLine);
      }

      // Optical Pins
      if (showPins) {
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
        const pinHeadMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        const pinGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 16);
        const headGeo = new THREE.SphereGeometry(0.04, 16, 16);

        const addPin = (x: number, y: number) => {
          const pin = new THREE.Group();
          const body = new THREE.Mesh(pinGeo, pinMat);
          body.rotation.x = Math.PI / 2;
          body.position.set(0, 0, 0.25);
          pin.add(body);
          const head = new THREE.Mesh(headGeo, pinHeadMat);
          head.position.set(0, 0, 0.5);
          pin.add(head);
          pin.position.set(x, y, Oz);
          pinsGroup.add(pin);
        };

        // P1 & P2 along incident ray
        addPin(incStartX + (Ox - incStartX) * 0.3, incStartY + (Oy - incStartY) * 0.3);
        addPin(incStartX + (Ox - incStartX) * 0.7, incStartY + (Oy - incStartY) * 0.7);

        // P3 & P4 along emergent ray
        addPin(OprimeX + (emEndX - OprimeX) * 0.3, OprimeY + (emEndY - OprimeY) * 0.3);
        addPin(OprimeX + (emEndX - OprimeX) * 0.7, OprimeY + (emEndY - OprimeY) * 0.7);
      }
    } else {
      // DISPERSION MODE: White light splits into VIBGYOR
      // Incident White Light Beam
      const incPts = [new THREE.Vector3(incStartX, incStartY, Oz), new THREE.Vector3(Ox, Oy, Oz)];
      const incGeo = new THREE.BufferGeometry().setFromPoints(incPts);
      const incMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 4 });
      raysGroup.add(new THREE.Line(incGeo, incMat));

      // Draw each spectral color
      if (calc.spectralRays) {
        calc.spectralRays.forEach((spec) => {
          const r1Rad = (spec.r1Deg * Math.PI) / 180;
          const rAngleInside = normalAngleLeft - Math.PI + r1Rad;
          const insideLen = 1.8;
          const OprimeX = Ox + Math.cos(rAngleInside) * insideLen;
          const OprimeY = Oy + Math.sin(rAngleInside) * insideLen;

          // Inside color ray
          const refrPts = [new THREE.Vector3(Ox, Oy, Oz), new THREE.Vector3(OprimeX, OprimeY, Oz)];
          const refrGeo = new THREE.BufferGeometry().setFromPoints(refrPts);
          const refrMat = new THREE.LineBasicMaterial({ color: spec.colorHex, linewidth: 2.5 });
          raysGroup.add(new THREE.Line(refrGeo, refrMat));

          // Emergent spectral ray
          const eRad = (spec.eDeg * Math.PI) / 180;
          const normalAngleRight = (30 * Math.PI) / 180;
          const emRayAngle = normalAngleRight - eRad;
          const emLen = 3.4;
          const emEndX = OprimeX + Math.cos(emRayAngle) * emLen;
          const emEndY = OprimeY + Math.sin(emRayAngle) * emLen;

          const emPts = [new THREE.Vector3(OprimeX, OprimeY, Oz), new THREE.Vector3(emEndX, emEndY, Oz)];
          const emGeo = new THREE.BufferGeometry().setFromPoints(emPts);
          const emMat = new THREE.LineBasicMaterial({ color: spec.colorHex, linewidth: 2.5 });
          raysGroup.add(new THREE.Line(emGeo, emMat));
        });
      }
    }
  };

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(2, 4, 8);
    scene.add(dirLight);

    // 1. Drawing Board & Paper
    const boardGeo = new THREE.BoxGeometry(8.5, 6.5, 0.2);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0, -0.15);
    scene.add(board);

    const paperGeo = new THREE.PlaneGeometry(7.8, 5.8);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0, 0, -0.04);
    scene.add(paper);

    // 2. Triangular Glass Prism (Extruded triangle)
    const triangleShape = new THREE.Shape();
    // Equilateral triangle (apex at top, base flat)
    triangleShape.moveTo(0, 1.8);
    triangleShape.lineTo(-1.8, -1.3);
    triangleShape.lineTo(1.8, -1.3);
    triangleShape.closePath();

    const extrudeSettings = { depth: 0.6, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const prismGeo = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.5,
      roughness: 0.04,
      transmission: 0.9,
      ior: refractiveIndex,
      reflectivity: 0.7,
      thickness: 0.6,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    prismMesh.position.set(0, 0, -0.02);
    scene.add(prismMesh);

    // Groups
    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    scene.add(pinsGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  useEffect(() => {
    updateVisuals();
  }, [angleIncidence, refractiveIndex, mode, showDeviationAngle, showPins]);

  const handleCameraPreset = (view: 'top' | 'perspective' | 'spectrum') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraView(view);

    if (view === 'top') {
      camera.position.set(0, 0, 8.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'perspective') {
      camera.position.set(0, -4.5, 6.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'spectrum') {
      camera.position.set(3.5, -2.0, 3.5);
      controls.target.set(1.5, 0, 0);
    }
    controls.update();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[520px]'
      } ${className}`}
    >
      {/* Top HUD Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">∠i:</span>
            <span className="font-mono font-bold text-cyan-300">{calc.angleIncidenceDeg.toFixed(1)}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">∠e:</span>
            <span className="font-mono font-bold text-emerald-300">{calc.angleEmergenceDeg.toFixed(1)}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Deviation ∠D:</span>
            <span className="font-mono font-bold text-amber-300">{calc.angleDeviationDeg.toFixed(1)}°</span>
          </div>
        </div>

        {/* Camera Views & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg">
          <button
            onClick={() => handleCameraPreset('top')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'top' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sheet View (Top)
          </button>
          <button
            onClick={() => handleCameraPreset('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'perspective' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => handleCameraPreset('spectrum')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'spectrum' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Spectrum View
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Minimum Deviation Banner */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${calc.isMinimumDeviation ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {calc.isMinimumDeviation ? '★ Minimum Deviation Reached (Dm = ' + calc.minimumDeviationDeg.toFixed(1) + '°)' : `Angle of Deviation: D = ${calc.angleDeviationDeg.toFixed(1)}°`}
              </p>
              <p className="text-[11px] text-slate-400">
                Formula: A + D = i + e (60° + {calc.angleDeviationDeg.toFixed(1)}° = {(60 + calc.angleDeviationDeg).toFixed(1)}°) • Dm = {calc.minimumDeviationDeg.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Rotate 3D • Pins & Dispersion</span>
        </div>
      </div>
    </div>
  );
}
