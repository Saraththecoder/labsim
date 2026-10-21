'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  calculateConductivity,
  ConductivityCellState,
  ElectrolyteSolution,
  SOLUTIONS_DATABASE,
} from '@/lib/conductivityPhysics';
import {
  Maximize2,
  Minimize2,
  Zap,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ConductivityBench3DProps {
  state: ConductivityCellState;
  showIons?: boolean;
  onStateChange?: (updater: (prev: ConductivityCellState) => ConductivityCellState) => void;
  className?: string;
}

export function ConductivityBench3D({
  state,
  showIons = true,
  onStateChange,
  className = '',
}: ConductivityBench3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Dynamic 3D Refs
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const electrodeLeftRef = useRef<THREE.Group | null>(null);
  const electrodeRightRef = useRef<THREE.Group | null>(null);
  const bulbFilamentRef = useRef<THREE.Mesh | null>(null);
  const bulbGlowLightRef = useRef<THREE.PointLight | null>(null);
  const ionsGroupRef = useRef<THREE.Group | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<'perspective' | 'beaker' | 'top'>('perspective');

  const calc = calculateConductivity(state);

  // Set up Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 7, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanRim = new THREE.PointLight(0x00f0ff, 1.0, 10);
    cyanRim.position.set(0, 2, -2.5);
    scene.add(cyanRim);

    // Laboratory Workbench Surface
    const benchGeo = new THREE.BoxGeometry(8, 0.2, 5);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.3,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.1, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    const grid = new THREE.GridHelper(12, 24, 0x00d4ff, 0x1e293b);
    grid.position.y = 0.01;
    scene.add(grid);

    // ==========================================
    // 1. GLASS BEAKER (Pyrex 250ml)
    // ==========================================
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(-0.8, 0, 0);

    // Beaker Glass Wall
    const glassGeo = new THREE.CylinderGeometry(0.85, 0.82, 1.7, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.15,
      side: THREE.DoubleSide,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 0.85;
    beakerGroup.add(glassMesh);

    // Beaker Bottom
    const bottomGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.05, 32);
    const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
    bottomMesh.position.y = 0.025;
    beakerGroup.add(bottomMesh);

    // Liquid Cylinder inside Beaker
    const liquidGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.25, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      ior: 1.33,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.65;
    liquidMeshRef.current = liquidMesh;
    beakerGroup.add(liquidMesh);

    // ==========================================
    // 2. ELECTRODES (Platinum / Graphite Plates)
    // ==========================================
    const electrodeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Left Electrode (Anode +)
    const elGroupLeft = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(0.04, 1.2, 0.35);
    const plateLeft = new THREE.Mesh(plateGeo, electrodeMat);
    plateLeft.position.y = 0.8;
    elGroupLeft.add(plateLeft);

    // Terminal clamp
    const clampGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
    const clampMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
    const clampLeft = new THREE.Mesh(clampGeo, clampMatRed);
    clampLeft.position.y = 1.45;
    elGroupLeft.add(clampLeft);
    electrodeLeftRef.current = elGroupLeft;
    beakerGroup.add(elGroupLeft);

    // Right Electrode (Cathode -)
    const elGroupRight = new THREE.Group();
    const plateRight = new THREE.Mesh(plateGeo, electrodeMat);
    plateRight.position.y = 0.8;
    elGroupRight.add(plateRight);

    const clampMatBlack = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    const clampRight = new THREE.Mesh(clampGeo, clampMatBlack);
    clampRight.position.y = 1.45;
    elGroupRight.add(clampRight);
    electrodeRightRef.current = elGroupRight;
    beakerGroup.add(elGroupRight);

    // Microscopic Ions Group inside beaker
    const ionsGroup = new THREE.Group();
    ionsGroupRef.current = ionsGroup;
    beakerGroup.add(ionsGroup);

    scene.add(beakerGroup);

    // ==========================================
    // 3. DC POWER SUPPLY UNIT
    // ==========================================
    const psuGroup = new THREE.Group();
    psuGroup.position.set(1.5, 0.45, -0.6);

    const psuBoxGeo = new THREE.BoxGeometry(1.2, 0.9, 0.9);
    const psuMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const psuMesh = new THREE.Mesh(psuBoxGeo, psuMat);
    psuGroup.add(psuMesh);

    // Power switch
    const switchGeo = new THREE.BoxGeometry(0.12, 0.18, 0.06);
    const switchMat = new THREE.MeshStandardMaterial({ color: state.isPowerOn ? 0x10b981 : 0xef4444 });
    const switchMesh = new THREE.Mesh(switchGeo, switchMat);
    switchMesh.position.set(-0.35, -0.15, 0.46);
    psuGroup.add(switchMesh);

    // Digital LED display for Voltage
    const dispGeo = new THREE.PlaneGeometry(0.5, 0.25);
    const dispMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const dispMesh = new THREE.Mesh(dispGeo, dispMat);
    dispMesh.position.set(0.15, 0.15, 0.46);
    psuGroup.add(dispMesh);

    scene.add(psuGroup);

    // ==========================================
    // 4. INDICATOR LIGHT BULB & HOLDER
    // ==========================================
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(1.5, 0.15, 0.8);

    // Socket base
    const socketGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.25, 24);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    bulbGroup.add(socketMesh);

    // Glass Bulb Sphere
    const bulbGlassGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const bulbGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      transparent: true,
      roughness: 0.1,
    });
    const bulbGlass = new THREE.Mesh(bulbGlassGeo, bulbGlassMat);
    bulbGlass.position.y = 0.45;
    bulbGroup.add(bulbGlass);

    // Tungsten Filament
    const filGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 24);
    const filMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const filMesh = new THREE.Mesh(filGeo, filMat);
    filMesh.position.y = 0.45;
    bulbFilamentRef.current = filMesh;
    bulbGroup.add(filMesh);

    // Bulb Dynamic Point Light
    const bulbLight = new THREE.PointLight(0xffea00, 0, 5);
    bulbLight.position.y = 0.55;
    bulbGlowLightRef.current = bulbLight;
    bulbGroup.add(bulbLight);

    scene.add(bulbGroup);

    // ==========================================
    // 5. CONNECTING CIRCUIT WIRES (Curves)
    // ==========================================
    const wireMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const wireMatBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    // Wire from PSU (+) to Left Electrode (+)
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.1, 0.3, -0.6),
      new THREE.Vector3(0.2, 1.2, -0.5),
      new THREE.Vector3(-0.8 - (state.electrodeDistance / 20), 1.45, 0),
    ]);
    const wire1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 24, 0.02, 8, false), wireMatRed);
    scene.add(wire1);

    // Wire from Right Electrode (-) to Bulb
    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.8 + (state.electrodeDistance / 20), 1.45, 0),
      new THREE.Vector3(0.3, 0.4, 0.5),
      new THREE.Vector3(1.5, 0.15, 0.65),
    ]);
    const wire2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 24, 0.02, 8, false), wireMatBlack);
    scene.add(wire2);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate drifting ions inside beaker
      if (ionsGroupRef.current && state.isPowerOn && calc.circuitCurrent > 0.001) {
        ionsGroupRef.current.children.forEach((ionMesh: any) => {
          if (ionMesh.userData.isCation) {
            // Drift right towards Cathode (-)
            ionMesh.position.x += 0.005;
            if (ionMesh.position.x > 0.35) ionMesh.position.x = -0.35;
          } else {
            // Drift left towards Anode (+)
            ionMesh.position.x -= 0.005;
            if (ionMesh.position.x < -0.35) ionMesh.position.x = 0.35;
          }
          ionMesh.position.y += Math.sin(elapsed * 2 + ionMesh.position.z) * 0.001;
        });
      }

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
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update dynamic properties when state changes
  useEffect(() => {
    // 1. Update electrode separation distance l
    const halfDist = (state.electrodeDistance / 2) * 0.07;
    if (electrodeLeftRef.current) {
      electrodeLeftRef.current.position.x = -halfDist;
    }
    if (electrodeRightRef.current) {
      electrodeRightRef.current.position.x = halfDist;
    }

    // 2. Update liquid color & opacity
    if (liquidMeshRef.current) {
      (liquidMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(calc.solution.colorHex);
    }

    // 3. Update Bulb glow and filament emissive intensity
    if (bulbFilamentRef.current && bulbGlowLightRef.current) {
      const filMat = bulbFilamentRef.current.material as THREE.MeshStandardMaterial;
      const bright = calc.bulbBrightnessPercent / 100;

      if (state.isPowerOn && bright > 0.02) {
        filMat.emissive.setHex(bright > 0.4 ? 0xffea00 : 0xf97316);
        filMat.emissiveIntensity = bright * 2.5;
        bulbGlowLightRef.current.intensity = bright * 4.0;
        bulbGlowLightRef.current.color.setHex(bright > 0.4 ? 0xffea00 : 0xf97316);
      } else {
        filMat.emissive.setHex(0x000000);
        filMat.emissiveIntensity = 0;
        bulbGlowLightRef.current.intensity = 0;
      }
    }

    // 4. Update Microscopic Ion Particles
    if (ionsGroupRef.current) {
      while (ionsGroupRef.current.children.length > 0) {
        ionsGroupRef.current.remove(ionsGroupRef.current.children[0]);
      }

      if (showIons && calc.ionsActiveCount > 0) {
        const cationMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(calc.solution.cation.color),
          emissive: new THREE.Color(calc.solution.cation.color),
          emissiveIntensity: 0.6,
        });
        const anionMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(calc.solution.anion.color),
          emissive: new THREE.Color(calc.solution.anion.color),
          emissiveIntensity: 0.6,
        });

        const sphereGeo = new THREE.SphereGeometry(0.035, 12, 12);

        for (let i = 0; i < calc.ionsActiveCount; i++) {
          const isCation = i % 2 === 0;
          const ionMesh = new THREE.Mesh(sphereGeo, isCation ? cationMat : anionMat);
          ionMesh.position.set(
            (Math.random() - 0.5) * 0.7,
            0.2 + Math.random() * 0.8,
            (Math.random() - 0.5) * 0.7
          );
          (ionMesh as any).userData = { isCation };
          ionsGroupRef.current.add(ionMesh);
        }
      }
    }
  }, [state, calc.solution, calc.bulbBrightnessPercent, calc.ionsActiveCount, showIons]);

  const setView = (v: 'perspective' | 'beaker' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraView(v);
    if (v === 'perspective') {
      cameraRef.current.position.set(0, 3.2, 5.2);
      controlsRef.current.target.set(0, 0.8, 0);
    } else if (v === 'beaker') {
      cameraRef.current.position.set(-0.8, 1.2, 2.8);
      controlsRef.current.target.set(-0.8, 0.8, 0);
    } else if (v === 'top') {
      cameraRef.current.position.set(0, 6.0, 0.1);
      controlsRef.current.target.set(0, 0.4, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[540px]'
      } ${className}`}
    >
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Solution & Power status */}
        <div className="flex items-center gap-3 pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: calc.solution.colorHex }}
            />
            <span className="font-bold text-white">{calc.solution.name}</span>
            <span className="font-mono text-cyan-400 font-semibold">({calc.solution.formula})</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                state.isPowerOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-slate-300">
              {state.isPowerOn ? 'Power ON' : 'Power OFF'}
            </span>
          </div>
        </div>

        {/* Camera Views & Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => setView('perspective')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'perspective' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setView('beaker')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'beaker' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Beaker Zoom
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top View
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Live Conduction Readout */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-xl flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${calc.bulbBrightnessPercent > 10 ? 'text-amber-400' : 'text-slate-500'}`} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-sans">Current (I)</span>
              <span className="font-bold text-amber-300 text-sm">{calc.circuitCurrent_mA} mA</span>
            </div>
          </div>

          <span className="text-slate-700">|</span>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Conductance (G)</span>
            <span className="font-bold text-cyan-300 text-sm">{calc.cellConductance.toFixed(3)} mS</span>
          </div>

          <span className="text-slate-700">|</span>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Bulb Glow</span>
            <span className="font-bold text-white text-sm">{calc.bulbState} ({calc.bulbBrightnessPercent}%)</span>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click & drag to rotate beaker • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
