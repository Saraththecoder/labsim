'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateGlassSlab, GlassSlabState } from '@/lib/glassSlabPhysics';
import {
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Crosshair,
  CheckCircle2,
} from 'lucide-react';

interface GlassSlab3DProps {
  angleIncidence: number; // in degrees (0 to 75)
  slabThickness: number; // in cm (e.g. 6 cm)
  refractiveIndex: number; // n (e.g. 1.52)
  showNormals?: boolean;
  showDottedOriginal?: boolean;
  showPins?: boolean;
  className?: string;
}

export function GlassSlab3D({
  angleIncidence,
  slabThickness,
  refractiveIndex,
  showNormals = true,
  showDottedOriginal = true,
  showPins = true,
  className = '',
}: GlassSlab3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const slabMeshRef = useRef<THREE.Mesh | null>(null);
  const raysGroupRef = useRef<THREE.Group | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<'perspective' | 'top' | 'side'>('top');

  const calc = calculateGlassSlab({
    angleIncidenceDeg: angleIncidence,
    slabThicknessCm: slabThickness,
    refractiveIndex,
  });

  // Re-draw light rays, normals, and optical pins
  const updateVisuals = () => {
    if (!raysGroupRef.current || !pinsGroupRef.current) return;
    const raysGroup = raysGroupRef.current;
    const pinsGroup = pinsGroupRef.current;

    // Clear old children
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
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    // Geometry units: Let 1 cm = 0.25 units in 3D
    const scale = 0.25;
    const t3D = slabThickness * scale;
    const halfT = t3D / 2;

    const iRad = calc.angleIncidenceRad;
    const rRad = calc.angleRefractionRad;
    const d3D = calc.lateralDisplacementCm * scale;

    // Point of incidence O on top interface (Y = halfT)
    const Ox = 0;
    const Oy = halfT;
    const Oz = 0.02;

    // Incident ray origin (coming from upper left)
    const rayLength = 3.2;
    const incOriginX = Ox - Math.sin(iRad) * rayLength;
    const incOriginY = Oy + Math.cos(iRad) * rayLength;

    // Point of emergence O' on bottom interface (Y = -halfT)
    // Horizontal shift inside glass = t * tan(r)
    const shiftInsideX = t3D * Math.tan(rRad);
    const OprimeX = Ox + shiftInsideX;
    const OprimeY = -halfT;

    // Emergent ray endpoint (exiting to lower right, parallel to incident angle i)
    const emEndX = OprimeX + Math.sin(iRad) * rayLength;
    const emEndY = OprimeY - Math.cos(iRad) * rayLength;

    // 1. Incident Ray (Electric Cyan)
    const incPts = [new THREE.Vector3(incOriginX, incOriginY, Oz), new THREE.Vector3(Ox, Oy, Oz)];
    const incGeo = new THREE.BufferGeometry().setFromPoints(incPts);
    const incMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 });
    raysGroup.add(new THREE.Line(incGeo, incMat));

    // 2. Refracted Ray inside glass (Vibrant Amber / Yellow)
    const refrPts = [new THREE.Vector3(Ox, Oy, Oz), new THREE.Vector3(OprimeX, OprimeY, Oz)];
    const refrGeo = new THREE.BufferGeometry().setFromPoints(refrPts);
    const refrMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 3 });
    raysGroup.add(new THREE.Line(refrGeo, refrMat));

    // 3. Emergent Ray (Emerald Green)
    const emPts = [new THREE.Vector3(OprimeX, OprimeY, Oz), new THREE.Vector3(emEndX, emEndY, Oz)];
    const emGeo = new THREE.BufferGeometry().setFromPoints(emPts);
    const emMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
    raysGroup.add(new THREE.Line(emGeo, emMat));

    // 4. Dotted Original Incident Ray Path Produced Forward (White / Grey dashed)
    if (showDottedOriginal) {
      const origEndX = Ox + Math.sin(iRad) * rayLength * 1.8;
      const origEndY = Oy - Math.cos(iRad) * rayLength * 1.8;

      const dotPts = [new THREE.Vector3(Ox, Oy, Oz), new THREE.Vector3(origEndX, origEndY, Oz)];
      const dotGeo = new THREE.BufferGeometry().setFromPoints(dotPts);
      const dotMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 0.1,
        gapSize: 0.06,
        linewidth: 1.5,
      });
      const dotLine = new THREE.Line(dotGeo, dotMat);
      dotLine.computeLineDistances();
      raysGroup.add(dotLine);

      // 5. Lateral Displacement Dimension Line (Crimson Red)
      // Strictly perpendicular segment dropped from emergence point O' to original path
      if (d3D > 0.02) {
        // Projection of vector OO' onto unit direction u=(sin i, -cos i)
        const projS = shiftInsideX * Math.sin(iRad) + t3D * Math.cos(iRad);
        const perpX = Ox + projS * Math.sin(iRad);
        const perpY = Oy - projS * Math.cos(iRad);

        const latPts = [new THREE.Vector3(OprimeX, OprimeY, Oz + 0.01), new THREE.Vector3(perpX, perpY, Oz + 0.01)];
        const latGeo = new THREE.BufferGeometry().setFromPoints(latPts);
        const latMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2.5 });
        raysGroup.add(new THREE.Line(latGeo, latMat));
      }
    }

    // 6. Normal Lines (Purple Dashed)
    if (showNormals) {
      // Normal at O (Top interface)
      const nTopPts = [new THREE.Vector3(Ox, Oy + 1.2, Oz), new THREE.Vector3(Ox, Oy - 1.2, Oz)];
      const nTopGeo = new THREE.BufferGeometry().setFromPoints(nTopPts);
      const nMat = new THREE.LineDashedMaterial({ color: 0xa855f7, dashSize: 0.08, gapSize: 0.05 });
      const nTopLine = new THREE.Line(nTopGeo, nMat);
      nTopLine.computeLineDistances();
      raysGroup.add(nTopLine);

      // Normal at O' (Bottom interface)
      const nBotPts = [new THREE.Vector3(OprimeX, OprimeY + 1.2, Oz), new THREE.Vector3(OprimeX, OprimeY - 1.2, Oz)];
      const nBotGeo = new THREE.BufferGeometry().setFromPoints(nBotPts);
      const nBotLine = new THREE.Line(nBotGeo, nMat);
      nBotLine.computeLineDistances();
      raysGroup.add(nBotLine);
    }

    // 7. Four Optical Pins grounded firmly into drawing board (Z = -0.04)
    if (showPins) {
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
      const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.44, 16);
      const headGeo = new THREE.SphereGeometry(0.038, 16, 16);

      const addPin = (x: number, y: number, headColor = 0xd97706) => {
        const pin = new THREE.Group();
        pin.position.set(x, y, -0.04);

        const body = new THREE.Mesh(pinGeo, pinMat);
        body.rotation.x = Math.PI / 2;
        body.position.set(0, 0, 0.22);
        pin.add(body);

        const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.3 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0, 0.44);
        pin.add(head);

        pinsGroup.add(pin);
      };

      // P1 & P2 along incident ray (Red beads)
      addPin(incOriginX + (Ox - incOriginX) * 0.35, incOriginY + (Oy - incOriginY) * 0.35, 0xef4444);
      addPin(incOriginX + (Ox - incOriginX) * 0.75, incOriginY + (Oy - incOriginY) * 0.75, 0xef4444);

      // P3 & P4 along emergent ray (Blue beads)
      addPin(OprimeX + (emEndX - OprimeX) * 0.35, OprimeY + (emEndY - OprimeY) * 0.35, 0x0284c7);
      addPin(OprimeX + (emEndX - OprimeX) * 0.75, OprimeY + (emEndY - OprimeY) * 0.75, 0x0284c7);
    }
  };

  // Initialize Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    // Default top-down orthogonal-style view
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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3, 4, 8);
    scene.add(dirLight);

    // 1. Drawing Board (Wooden grain board)
    const boardGeo = new THREE.BoxGeometry(8.5, 6.5, 0.2);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0, -0.15);
    scene.add(board);

    // 2. White Sheet of Paper
    const paperGeo = new THREE.PlaneGeometry(7.8, 5.8);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0, 0, -0.04);
    scene.add(paper);

    // 3. Rectangular Glass Slab Mesh
    const scale = 0.25;
    const slabW = 16 * scale; // 4.0 units
    const slabT = slabThickness * scale; // thickness
    const slabH = 0.4; // height in Z

    const slabGeo = new THREE.BoxGeometry(slabW, slabT, slabH);
    const slabMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.55,
      roughness: 0.05,
      transmission: 0.85,
      ior: refractiveIndex,
      reflectivity: 0.6,
      thickness: slabT,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(0, 0, 0.16);
    slabMeshRef.current = slabMesh;
    scene.add(slabMesh);

    // 4. Ray & Pin Groups
    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

    const pinsGroup = new THREE.Group();
    pinsGroupRef.current = pinsGroup;
    scene.add(pinsGroup);

    // Animation Loop
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

  // Update visual elements when parameters change
  useEffect(() => {
    if (slabMeshRef.current) {
      const scale = 0.25;
      const slabT = slabThickness * scale;
      slabMeshRef.current.scale.set(1, slabThickness / 6, 1);
      if (slabMeshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
        slabMeshRef.current.material.ior = refractiveIndex;
      }
    }
    updateVisuals();
  }, [angleIncidence, slabThickness, refractiveIndex, showNormals, showDottedOriginal, showPins]);

  // Camera presets
  const handleCameraPreset = (view: 'top' | 'perspective' | 'side') => {
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
    } else if (view === 'side') {
      camera.position.set(0, -7.5, 1.2);
      controls.target.set(0, 0, 0);
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
            <span className="text-slate-400">Incidence ∠i:</span>
            <span className="font-mono font-bold text-cyan-300">{calc.angleIncidenceDeg.toFixed(1)}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Refraction ∠r:</span>
            <span className="font-mono font-bold text-amber-300">{calc.angleRefractionDeg.toFixed(1)}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Emergence ∠e:</span>
            <span className="font-mono font-bold text-emerald-300">{calc.angleEmergenceDeg.toFixed(1)}°</span>
          </div>
        </div>

        {/* Camera Views & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg">
          <button
            onClick={() => handleCameraPreset('top')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sheet View (Top)
          </button>
          <button
            onClick={() => handleCameraPreset('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'perspective' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Perspective
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

      {/* Bottom Floating Lateral Shift Banner */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                Lateral Displacement: d = {calc.lateralDisplacementCm.toFixed(2)} cm
              </p>
              <p className="text-[11px] text-slate-400">
                Formula: d = [t · sin(i - r)] / cos(r) • Parallel shift without angular deviation
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Rotate 3D • Optical pins P1-P4 aligned</span>
        </div>
      </div>
    </div>
  );
}
