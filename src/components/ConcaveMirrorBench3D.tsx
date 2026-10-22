'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  calculateMirrorOptics,
  generateMirrorPrincipalRays,
  MirrorSystemState,
} from '@/lib/mirrorPhysics';
import {
  Eye,
  Maximize2,
  Minimize2,
  Crosshair,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface ConcaveMirrorBench3DProps {
  focalLength: number; // e.g. 15 cm
  objectPos: number; // in cm on bench (e.g. 20 cm)
  mirrorPos: number; // in cm on bench (e.g. 80 cm)
  screenPos: number; // in cm on bench (e.g. 56 cm)
  objectHeight?: number; // ho in cm
  onObjectPosChange?: (pos: number) => void;
  onMirrorPosChange?: (pos: number) => void;
  onScreenPosChange?: (pos: number) => void;
  showRays?: boolean;
  className?: string;
}

export function ConcaveMirrorBench3D({
  focalLength,
  objectPos,
  mirrorPos,
  screenPos,
  objectHeight = 5,
  onObjectPosChange,
  onMirrorPosChange,
  onScreenPosChange,
  showRays = true,
  className = '',
}: ConcaveMirrorBench3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const objectUprightRef = useRef<THREE.Group | null>(null);
  const mirrorUprightRef = useRef<THREE.Group | null>(null);
  const screenUprightRef = useRef<THREE.Group | null>(null);
  const raysGroupRef = useRef<THREE.Group | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraAngle, setCameraAngle] = useState<'perspective' | 'side' | 'screen'>('perspective');
  const [parallaxState, setParallaxState] = useState<{
    testing: boolean;
    hasChecked: boolean;
    isRemoved: boolean;
    errorCm: number;
    message: string;
  } | null>(null);

  // Convert bench cm (0-100 cm) to 3D units (-5 to +5 meters)
  const cmTo3D = (cm: number) => (cm - 50) * 0.1;

  // Mirror calculations
  // u is distance between object and mirror
  const u = Math.max(0.1, mirrorPos - objectPos);
  // screenDist is distance between screen and mirror
  const screenDist = Math.max(0, mirrorPos - screenPos);

  const state: MirrorSystemState = {
    focalLength,
    objectDistance: u,
    objectHeight,
    screenDistance: screenDist,
    mirrorPosition: mirrorPos,
  };
  const calc = calculateMirrorOptics(state);

  // Update 2D screen projected image texture
  const updateScreenTexture = () => {
    if (!screenCanvasRef.current || !screenTextureRef.current) return;
    const canvas = screenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Millimeter grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Cross-hairs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (!calc.isReal) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Virtual Image Behind Mirror', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '11px sans-serif';
      ctx.fillText('(Cannot be captured on screen)', canvas.width / 2, canvas.height / 2 + 12);
      ctx.fillText('Look into mirror surface to view', canvas.width / 2, canvas.height / 2 + 30);
    } else {
      const distFromFocalPlane = Math.abs(screenDist - calc.imageDistance);
      const blurPx = Math.min(45, (distFromFocalPlane / Math.max(calc.imageDistance, 5)) * 60);

      ctx.save();
      if (blurPx > 0.5) {
        ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scaledHeight = Math.min(110, Math.abs(calc.imageHeight) * 9);

      // Inverted flame / arrow (pointing DOWN for real image)
      const grad = ctx.createLinearGradient(centerX, centerY, centerX, centerY + scaledHeight);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.7, '#ef4444');
      grad.addColorStop(1, '#dc2626');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(centerX - 12, centerY);
      ctx.lineTo(centerX + 12, centerY);
      ctx.lineTo(centerX + 4, centerY + scaledHeight - 16);
      ctx.lineTo(centerX + 10, centerY + scaledHeight - 16);
      ctx.lineTo(centerX, centerY + scaledHeight);
      ctx.lineTo(centerX - 10, centerY + scaledHeight - 16);
      ctx.lineTo(centerX - 4, centerY + scaledHeight - 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    screenTextureRef.current.needsUpdate = true;
  };

  // Update 3D Light Rays
  const updateRays3D = () => {
    if (!raysGroupRef.current) return;
    const group = raysGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    if (!showRays) return;

    const obj3DX = cmTo3D(objectPos);
    const mirror3DX = cmTo3D(mirrorPos);
    const focus3DX = mirror3DX - focalLength * 0.1;
    const c3DX = mirror3DX - 2 * focalLength * 0.1;
    const baseHeight = 1.0;
    const tipHeight = baseHeight + objectHeight * 0.1;

    // Ray 1: Parallel to principal axis -> Reflects through Focus F
    const ray1Pts = [
      new THREE.Vector3(obj3DX, tipHeight, 0),
      new THREE.Vector3(mirror3DX, tipHeight, 0),
      new THREE.Vector3(focus3DX, baseHeight, 0),
      new THREE.Vector3(mirror3DX - (calc.isReal ? calc.imageDistance * 0.1 * 1.5 : -1.5), baseHeight + (calc.isReal ? calc.imageHeight * 0.1 * 1.5 : objectHeight * 0.1 * 1.5), 0),
    ];
    const geo1 = new THREE.BufferGeometry().setFromPoints(ray1Pts);
    const mat1 = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2, transparent: true, opacity: 0.85 });
    group.add(new THREE.Line(geo1, mat1));

    // Ray 2: Directed towards/through Focus F -> Reflects parallel
    const ray2Pts = [
      new THREE.Vector3(obj3DX, tipHeight, 0),
      new THREE.Vector3(focus3DX, baseHeight, 0),
      new THREE.Vector3(mirror3DX, baseHeight - objectHeight * 0.1, 0),
      new THREE.Vector3(mirror3DX - (calc.isReal ? calc.imageDistance * 0.1 * 1.5 : -1.5), baseHeight - objectHeight * 0.1, 0),
    ];
    const geo2 = new THREE.BufferGeometry().setFromPoints(ray2Pts);
    const mat2 = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2, transparent: true, opacity: 0.85 });
    group.add(new THREE.Line(geo2, mat2));

    // Ray 3: Directed at Pole P (mirror3DX, baseHeight, 0) -> Reflects at equal angle
    const ray3Pts = [
      new THREE.Vector3(obj3DX, tipHeight, 0),
      new THREE.Vector3(mirror3DX, baseHeight, 0),
      new THREE.Vector3(mirror3DX - (calc.isReal ? calc.imageDistance * 0.1 * 1.5 : -1.5), baseHeight - objectHeight * 0.1, 0),
    ];
    const geo3 = new THREE.BufferGeometry().setFromPoints(ray3Pts);
    const mat3 = new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 2, transparent: true, opacity: 0.85 });
    group.add(new THREE.Line(geo3, mat3));
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.8, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Bench Rails
    const benchGroup = new THREE.Group();
    const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 10.5, 32);

    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.rotation.z = Math.PI / 2;
    rail1.position.set(0, 0.3, 0.25);
    rail1.castShadow = true;
    benchGroup.add(rail1);

    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.rotation.z = Math.PI / 2;
    rail2.position.set(0, 0.3, -0.25);
    rail2.castShadow = true;
    benchGroup.add(rail2);

    // Scale Ruler Bed
    const bedGeo = new THREE.BoxGeometry(10.2, 0.06, 0.8);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.25, 0);
    bed.receiveShadow = true;
    benchGroup.add(bed);

    scene.add(benchGroup);

    // ==========================================
    // 1. OBJECT UPRIGHT (Arrow / Needle)
    // ==========================================
    const objectGroup = new THREE.Group();
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 16);
    const post = new THREE.Mesh(postGeo, standMat);
    post.position.set(0, 0.7, 0);
    objectGroup.add(post);

    const arrowShaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
    const arrowShaftMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 });
    const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowShaftMat);
    arrowShaft.position.set(0, 1.15, 0);
    objectGroup.add(arrowShaft);

    const arrowTipGeo = new THREE.ConeGeometry(0.06, 0.12, 16);
    const arrowTip = new THREE.Mesh(arrowTipGeo, arrowShaftMat);
    arrowTip.position.set(0, 1.4, 0);
    objectGroup.add(arrowTip);

    objectGroup.position.set(cmTo3D(objectPos), 0, 0);
    objectUprightRef.current = objectGroup;
    scene.add(objectGroup);

    // ==========================================
    // 2. CONCAVE MIRROR UPRIGHT
    // ==========================================
    const mirrorGroup = new THREE.Group();
    const mirrorPost = new THREE.Mesh(postGeo, standMat);
    mirrorPost.position.set(0, 0.7, 0);
    mirrorGroup.add(mirrorPost);

    // Metallic Rim Housing
    const rimGeo = new THREE.TorusGeometry(0.42, 0.035, 16, 48);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, 1.0, 0);
    rim.rotation.y = Math.PI / 2;
    mirrorGroup.add(rim);

    // Concave Reflective Dish (Hemisphere dish facing object on the left)
    const dishGeo = new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.05,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.0, 0);
    // Orient opening of dish towards negative X (facing left towards the object)
    dish.rotation.z = -Math.PI / 2;
    mirrorGroup.add(dish);

    mirrorGroup.position.set(cmTo3D(mirrorPos), 0, 0);
    mirrorUprightRef.current = mirrorGroup;
    scene.add(mirrorGroup);

    // ==========================================
    // 3. SCREEN UPRIGHT
    // ==========================================
    const screenGroup = new THREE.Group();
    const screenPost = new THREE.Mesh(postGeo, standMat);
    screenPost.position.set(0, 0.7, 0);
    screenGroup.add(screenPost);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    screenCanvasRef.current = canvas;

    const screenTexture = new THREE.CanvasTexture(canvas);
    screenTextureRef.current = screenTexture;

    const screenPlateGeo = new THREE.BoxGeometry(0.02, 0.7, 0.7);
    const screenPlateMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.4,
      metalness: 0.1,
    });
    const screenPlate = new THREE.Mesh(screenPlateGeo, screenPlateMat);
    screenPlate.rotation.y = Math.PI / 2;
    screenPlate.position.set(0, 1.0, 0);
    screenPlate.castShadow = true;
    screenGroup.add(screenPlate);

    screenGroup.position.set(cmTo3D(screenPos), 0, 0);
    screenUprightRef.current = screenGroup;
    scene.add(screenGroup);

    // 3D Rays Group
    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

    // Animation loop
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

  // Update positions and visual elements
  useEffect(() => {
    if (objectUprightRef.current) {
      objectUprightRef.current.position.x = cmTo3D(objectPos);
    }
    if (mirrorUprightRef.current) {
      mirrorUprightRef.current.position.x = cmTo3D(mirrorPos);
    }
    if (screenUprightRef.current) {
      screenUprightRef.current.position.x = cmTo3D(screenPos);
    }

    updateScreenTexture();
    updateRays3D();
  }, [objectPos, mirrorPos, screenPos, focalLength, objectHeight, showRays]);

  // Camera presets
  const setCameraView = (view: 'perspective' | 'side' | 'screen') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraAngle(view);

    if (view === 'perspective') {
      camera.position.set(0, 2.8, 4.8);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'side') {
      camera.position.set(0, 1.0, 5.5);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'screen') {
      const sX = cmTo3D(screenPos);
      camera.position.set(sX + 1.2, 1.0, 0);
      controls.target.set(sX, 1.0, 0);
    }
    controls.update();
  };

  // Parallax Test
  const runParallaxTest = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const initialPos = camera.position.clone();
    const initialTarget = controls.target.clone();

    setParallaxState({
      testing: true,
      hasChecked: false,
      isRemoved: false,
      errorCm: Math.abs(screenDist - calc.imageDistance),
      message: 'Simulating lateral head shift (moving eye left and right across mirror uprights)...',
    });

    const startTime = performance.now();
    const duration = 2200;

    const oscillate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 1) {
        const offset = Math.sin(progress * Math.PI * 4) * 0.85;
        camera.position.x = initialPos.x + offset;
        controls.update();
        requestAnimationFrame(oscillate);
      } else {
        camera.position.copy(initialPos);
        controls.target.copy(initialTarget);
        controls.update();

        const err = Math.abs(screenDist - calc.imageDistance);
        const removed = calc.isReal && err <= 0.6;

        setParallaxState({
          testing: false,
          hasChecked: true,
          isRemoved: removed,
          errorCm: Number(err.toFixed(1)),
          message: removed
            ? '✓ Zero Parallax Verified! The real inverted image stays coincident with the screen pointer mark during lateral observation.'
            : `⚠ Parallax Detected! The image and screen plane separate by ${err.toFixed(1)} cm. Adjust screen position to coincide with the focal plane.`,
        });
      }
    };

    requestAnimationFrame(oscillate);
  };

  // Snap screen to focus
  const snapScreenToFocus = () => {
    if (!calc.isReal || !isFinite(calc.imageDistance) || !onScreenPosChange) return;
    const exactScreenPos = Number((mirrorPos - calc.imageDistance).toFixed(1));
    if (exactScreenPos >= 0) {
      onScreenPosChange(exactScreenPos);
    }
    if (parallaxState) {
      setParallaxState(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[520px]'
      } ${className}`}
    >
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Object:</span>
            <span className="font-mono font-bold text-amber-300">{objectPos.toFixed(1)} cm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-400">Mirror:</span>
            <span className="font-mono font-bold text-purple-300">{mirrorPos.toFixed(1)} cm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">Screen:</span>
            <span className="font-mono font-bold text-white">{screenPos.toFixed(1)} cm</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg">
          <button
            onClick={() => setCameraView('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'perspective' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setCameraView('side')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'side' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ray View (Side)
          </button>
          <button
            onClick={() => setCameraView('screen')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'screen' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Screen View
          </button>

          <button
            onClick={runParallaxTest}
            disabled={parallaxState?.testing}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 border ${
              parallaxState?.testing
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 border-indigo-700/60 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{parallaxState?.testing ? 'Testing...' : 'Check Parallax'}</span>
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

      {/* Parallax Guidance Modal */}
      {parallaxState && (
        <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 pointer-events-auto bg-[#0a0f1d]/95 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/40 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Concave Mirror Parallax Test</span>
            </span>
            <button
              onClick={() => setParallaxState(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {parallaxState.message}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 italic">
              {parallaxState.testing ? 'Observation in progress...' : `Deviation: ${parallaxState.errorCm} cm`}
            </span>
            {!parallaxState.testing && !parallaxState.isRemoved && calc.isReal && onScreenPosChange && (
              <button
                onClick={snapScreenToFocus}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-sm cursor-pointer"
              >
                Eliminate Parallax
              </button>
            )}
          </div>
        </div>
      )}

      {/* Screen Focus Banner */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl flex items-center gap-3">
          {calc.isFocused ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Screen in Sharp Focus
                </p>
                <p className="text-[11px] text-slate-300">
                  Coincides at v = {calc.imageDistance.toFixed(1)} cm in front of mirror
                </p>
              </div>
            </div>
          ) : calc.isReal ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Focus Match: {calc.screenFocusMatchPercent || 0}%
                </p>
                <p className="text-[11px] text-slate-400">
                  Target v = {calc.imageDistance.toFixed(1)} cm (current screen dist: {screenDist.toFixed(1)} cm)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-purple-300">Virtual Image (Behind Mirror)</p>
                <p className="text-[11px] text-slate-400">Dentist / Shaving mirror case — look into mirror surface</p>
              </div>
            </div>
          )}

          {calc.isReal && !calc.isFocused && onScreenPosChange && (
            <button
              onClick={snapScreenToFocus}
              className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Snap to Focus</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>Click & drag to rotate • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
