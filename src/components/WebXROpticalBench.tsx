'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateOptics, generatePrincipalRays, LensSystemState } from '@/lib/physics';
import {
  Smartphone,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Crosshair,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface WebXROpticalBenchProps {
  focalLength: number;
  objectPos: number;
  lensPos: number;
  screenPos: number;
  onObjectPosChange?: (pos: number) => void;
  onLensPosChange?: (pos: number) => void;
  onScreenPosChange?: (pos: number) => void;
}

export function WebXROpticalBench({
  focalLength,
  objectPos,
  lensPos,
  screenPos,
  onObjectPosChange,
  onLensPosChange,
  onScreenPosChange,
}: WebXROpticalBenchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [activeMode, setActiveMode] = useState<'webxr' | 'camera-fallback' | 'studio'>('studio');
  const [benchPlaced, setBenchPlaced] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [deviceDiagnostics, setDeviceDiagnostics] = useState<{
    hasXR: boolean;
    hasImmersiveAR: boolean;
    hasCamera: boolean;
    hasOrientation: boolean;
  }>({
    hasXR: false,
    hasImmersiveAR: false,
    hasCamera: false,
    hasOrientation: false,
  });

  // 3D Scene Refs
  const benchRootRef = useRef<THREE.Group | null>(null);
  const objGroupRef = useRef<THREE.Group | null>(null);
  const lensGroupRef = useRef<THREE.Group | null>(null);
  const screenGroupRef = useRef<THREE.Group | null>(null);
  const raysGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // AR Manipulation State (Move, Zoom, Rotate)
  const [arScale, setArScale] = useState<number>(1.0); // 0.25x to 2.5x multiplier
  const [arPosition, setArPosition] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: -0.15,
    z: -0.6,
  });
  const [arRotationY, setArRotationY] = useState<number>(0); // in degrees
  const [activeHudTab, setActiveHudTab] = useState<'zoom' | 'move' | 'rotate' | null>('zoom');

  // Keep ref of state for touch events
  const arScaleRef = useRef(arScale);
  arScaleRef.current = arScale;
  const arPosRef = useRef(arPosition);
  arPosRef.current = arPosition;
  const arRotRef = useRef(arRotationY);
  arRotRef.current = arRotationY;
  const benchPlacedRef = useRef(benchPlaced);
  benchPlacedRef.current = benchPlaced;

  const state: LensSystemState = {
    focalLength,
    objectDistance: Math.max(0.1, lensPos - objectPos),
    objectHeight: 5,
    screenDistance: Math.max(0, screenPos - lensPos),
  };
  const calc = calculateOptics(state);

  // Check hardware and WebXR capabilities on mount
  useEffect(() => {
    async function checkCapabilities() {
      const hasXR = typeof navigator !== 'undefined' && 'xr' in navigator;
      let hasImmersiveAR = false;

      if (hasXR && (navigator as any).xr?.isSessionSupported) {
        try {
          hasImmersiveAR = await (navigator as any).xr.isSessionSupported('immersive-ar');
        } catch {
          hasImmersiveAR = false;
        }
      }

      const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

      setDeviceDiagnostics({
        hasXR,
        hasImmersiveAR,
        hasCamera,
        hasOrientation,
      });

      if (hasImmersiveAR) {
        setArSupported(true);
        setActiveMode('webxr');
      } else {
        setArSupported(false);
        setActiveMode('studio');
      }
    }

    checkCapabilities();
  }, []);

  // Initialize WebXR or 3D overlay renderer (runs only on mount or camera toggle)
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.01, 25);
    camera.position.set(0, 0.45, 1.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    container.replaceChildren(renderer.domElement);

    // OrbitControls for non-XR desktop/camera manipulation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.1, -0.2);
    controls.minDistance = 0.3;
    controls.maxDistance = 6.0;
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2, 4, 3);
    scene.add(sun);

    const cyanRim = new THREE.PointLight(0x00f0ff, 1.0, 5);
    cyanRim.position.set(-2, 1, -1);
    scene.add(cyanRim);

    // Optical Bench Root Model
    const benchRoot = new THREE.Group();
    benchRoot.scale.set(0.18 * arScaleRef.current, 0.18 * arScaleRef.current, 0.18 * arScaleRef.current);
    benchRoot.position.set(arPosRef.current.x, arPosRef.current.y, arPosRef.current.z);
    benchRoot.rotation.y = THREE.MathUtils.degToRad(arRotRef.current);
    scene.add(benchRoot);
    benchRootRef.current = benchRoot;

    // Bed and Rails
    const bedGeo = new THREE.BoxGeometry(6.0, 0.15, 0.7);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    benchRoot.add(bed);

    const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 5.8, 16);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.rotation.z = Math.PI / 2;
    rail1.position.set(0, 0.15, 0.2);
    benchRoot.add(rail1);

    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.rotation.z = Math.PI / 2;
    rail2.position.set(0, 0.15, -0.2);
    benchRoot.add(rail2);

    // Uprights: Object, Lens, Screen, Rays
    const objGroup = new THREE.Group();
    objGroupRef.current = objGroup;
    benchRoot.add(objGroup);

    const lensGroup = new THREE.Group();
    lensGroupRef.current = lensGroup;
    benchRoot.add(lensGroup);

    const screenGroup = new THREE.Group();
    screenGroupRef.current = screenGroup;
    benchRoot.add(screenGroup);

    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    benchRoot.add(raysGroup);

    // Object Arrow
    const objMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2 });
    const objShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16), objMat);
    objShaft.position.y = 0.45;
    objGroup.add(objShaft);
    const objTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 16), objMat);
    objTip.position.y = 0.68;
    objGroup.add(objTip);

    // Convex Lens
    const lensRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.025, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
    );
    lensRing.rotation.y = Math.PI / 2;
    lensRing.position.y = 0.55;
    lensGroup.add(lensRing);

    const lensGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        transmission: 0.9,
        transparent: true,
        roughness: 0.05,
        ior: 1.52,
      })
    );
    lensGlass.scale.set(0.25, 1.0, 1.0);
    lensGlass.position.y = 0.55;
    lensGroup.add(lensGlass);

    // Screen
    const screenMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    screenMesh.position.y = 0.55;
    screenGroup.add(screenMesh);

    // Hit-testing Reticle for Real WebXR
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: any = null;

    // WebXR session start listener
    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession() as any;
      if (!session) return;
      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    });

    renderer.xr.addEventListener('sessionend', () => {
      hitTestSource = null;
    });

    // Touch tap to place on detected surface
    const onSelect = () => {
      if (reticle.visible && benchRootRef.current) {
        benchRootRef.current.position.setFromMatrixPosition(reticle.matrix);
        benchRootRef.current.quaternion.setFromRotationMatrix(reticle.matrix);
        setArPosition({
          x: benchRootRef.current.position.x,
          y: benchRootRef.current.position.y,
          z: benchRootRef.current.position.z,
        });
        setBenchPlaced(true);
      }
    };
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Touch Gestures: Pinch to Zoom & Drag to Move / Rotate
    let initialDistance = 0;
    let initialScale = 1.0;
    let lastTouchCenter = { x: 0, y: 0 };
    let lastSingleTouchX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
        initialScale = arScaleRef.current;
        lastTouchCenter = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      } else if (e.touches.length === 1) {
        lastSingleTouchX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        // Pinch to Zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / initialDistance;
        const newScale = Math.min(2.5, Math.max(0.25, initialScale * factor));
        setArScale(Number(newScale.toFixed(2)));

        // 2-Finger Move along plane
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const deltaX = (midX - lastTouchCenter.x) * 0.002;
        const deltaZ = (midY - lastTouchCenter.y) * 0.002;
        lastTouchCenter = { x: midX, y: midY };

        setArPosition((p) => ({
          ...p,
          x: p.x + deltaX,
          z: p.z + deltaZ,
        }));
      } else if (e.touches.length === 1 && benchPlacedRef.current) {
        // 1-finger swipe rotates bench in AR
        const deltaX = e.touches[0].clientX - lastSingleTouchX;
        lastSingleTouchX = e.touches[0].clientX;
        setArRotationY((r) => (r + deltaX * 0.4) % 360);
      }
    };

    const handleTouchEnd = () => {
      initialDistance = 0;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    domEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    domEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Animation Loop
    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && hitTestSource) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        if (referenceSpace) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            }
          } else {
            reticle.visible = false;
          }
        }
      }

      if (!renderer.xr.isPresenting && controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    });

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
      renderer.setAnimationLoop(null);
      domEl.removeEventListener('touchstart', handleTouchStart);
      domEl.removeEventListener('touchmove', handleTouchMove);
      domEl.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [cameraActive]);

  // Update object, lens, screen, and ray geometry positions without recreating renderer
  useEffect(() => {
    if (!objGroupRef.current || !lensGroupRef.current || !screenGroupRef.current || !raysGroupRef.current) {
      return;
    }

    const cmToRootX = (cm: number) => (cm - 50) * 0.05;
    objGroupRef.current.position.x = cmToRootX(objectPos);
    lensGroupRef.current.position.x = cmToRootX(lensPos);
    screenGroupRef.current.position.x = cmToRootX(screenPos);

    // Recreate rays
    const raysGroup = raysGroupRef.current;
    while (raysGroup.children.length > 0) {
      raysGroup.remove(raysGroup.children[0]);
    }

    const rays = generatePrincipalRays(state, calc);
    rays.forEach((ray) => {
      const pts = ray.points.map((p) => {
        return new THREE.Vector3(cmToRootX(lensPos + p.x), 0.55 + (p.y || 0) * 0.05, 0);
      });
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(ray.color), linewidth: 2.5 });
      raysGroup.add(new THREE.Line(geom, mat));
    });
  }, [objectPos, lensPos, screenPos, focalLength]);

  // Synchronize AR Scale, Position, and Rotation to 3D Bench
  useEffect(() => {
    if (!benchRootRef.current) return;
    const s = 0.18 * arScale;
    benchRootRef.current.scale.set(s, s, s);
    benchRootRef.current.position.set(arPosition.x, arPosition.y, arPosition.z);
    benchRootRef.current.rotation.y = THREE.MathUtils.degToRad(arRotationY);
  }, [arScale, arPosition, arRotationY]);

  // Step Move helper
  const moveBench = (dx: number, dy: number, dz: number) => {
    setArPosition((prev) => ({
      x: Number((prev.x + dx).toFixed(3)),
      y: Number((prev.y + dy).toFixed(3)),
      z: Number((prev.z + dz).toFixed(3)),
    }));
  };

  // Zoom helper
  const adjustZoom = (delta: number) => {
    setArScale((prev) => Math.min(2.5, Math.max(0.25, Number((prev + delta).toFixed(2)))));
  };

  // Fallback Camera feed activator
  const startCameraFeed = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setActiveMode('camera-fallback');
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const stopCameraFeed = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setActiveMode('studio');
    }
  };

  const resetAllTransforms = () => {
    setArScale(1.0);
    setArPosition({ x: 0, y: -0.15, z: -0.6 });
    setArRotationY(0);
    setBenchPlaced(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Capability Notification Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              deviceDiagnostics.hasImmersiveAR
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {deviceDiagnostics.hasImmersiveAR ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Smartphone className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Augmented Reality Capability Check</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  deviceDiagnostics.hasImmersiveAR
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {deviceDiagnostics.hasImmersiveAR ? 'WebXR AR Supported' : 'Interactive 3D / Camera Fallback'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {deviceDiagnostics.hasImmersiveAR
                ? 'Your device supports WebXR surface anchoring. Use touch gestures or the on-screen D-pad to move, scale, and rotate.'
                : 'Interactive 3D Orbit & Pinch Zoom active. Use the Move/Zoom overlay or drag to inspect the bench from any angle.'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          {deviceDiagnostics.hasCamera && !cameraActive && !deviceDiagnostics.hasImmersiveAR && (
            <button
              onClick={startCameraFeed}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Camera Feed AR</span>
            </button>
          )}

          {cameraActive && (
            <button
              onClick={stopCameraFeed}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 flex items-center gap-2"
            >
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main AR / 3D Canvas Viewport */}
      <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-800 bg-[#060a12] shadow-2xl">
        {/* Background Video stream for Camera Fallback mode */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraActive ? 'opacity-90' : 'hidden'}`}
        />

        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full touch-none" />

        {/* Top-Left: AR Scanning & Placement HUD overlay */}
        <div className="absolute top-4 left-4 z-20 bg-[#090e1a]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs shadow-lg space-y-1">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{benchPlaced ? 'Optical Bench Anchored' : 'Surface Scan & Placement Mode'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {benchPlaced
              ? 'Anchored. Drag with 1 finger to rotate, 2 fingers to move, or pinch to zoom.'
              : 'Aim camera at table or floor to project light rays in real space.'}
          </p>
        </div>

        {/* Top-Right: Quick Reset & Tab Toggles */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setActiveHudTab(activeHudTab ? null : 'zoom')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md ${
              activeHudTab
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-[#090e1a]/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeHudTab ? 'Hide AR Controls' : 'Move / Zoom AR'}</span>
          </button>

          <button
            onClick={resetAllTransforms}
            title="Reset Scale and Position"
            className="p-2 rounded-xl bg-[#090e1a]/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating AR Manipulation HUD (Move, Zoom, Rotate Controls) */}
        {activeHudTab && (
          <div className="absolute top-16 right-4 z-20 w-80 bg-[#090e1a]/95 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveHudTab('zoom')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'zoom' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </button>
                <button
                  onClick={() => setActiveHudTab('move')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'move' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
                <button
                  onClick={() => setActiveHudTab('rotate')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'rotate' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {arScale.toFixed(2)}x ({(arScale * 18).toFixed(1)} cm)
              </span>
            </div>

            {/* TAB 1: ZOOM & SCALE */}
            {activeHudTab === 'zoom' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Apparatus Scale</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustZoom(-0.1)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                    >
                      -
                    </button>
                    <span className="font-mono text-cyan-300 text-xs font-bold w-12 text-center">
                      {(arScale * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() => adjustZoom(0.1)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.05"
                  value={arScale}
                  onChange={(e) => setArScale(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                {/* Quick Size Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Mini', val: 0.5 },
                    { label: 'Desk', val: 0.8 },
                    { label: '100%', val: 1.0 },
                    { label: 'Room', val: 1.8 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setArScale(p.val)}
                      className={`py-1 rounded text-[11px] font-semibold border transition-all ${
                        Math.abs(arScale - p.val) < 0.04
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: MOVE POSITION (D-PAD) */}
            {activeHudTab === 'move' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Position Translation</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    X:{arPosition.x.toFixed(2)} Y:{arPosition.y.toFixed(2)} Z:{arPosition.z.toFixed(2)}
                  </span>
                </div>

                {/* 6-Way D-Pad Layout */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {/* Planar D-Pad */}
                  <div className="grid grid-cols-3 gap-1.5 w-28">
                    <div />
                    <button
                      onClick={() => moveBench(0, 0, -0.06)}
                      title="Move Forward"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <div />

                    <button
                      onClick={() => moveBench(-0.06, 0, 0)}
                      title="Move Left"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => setArPosition({ x: 0, y: -0.15, z: -0.6 })}
                      title="Center Position"
                      className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 font-bold border border-slate-800"
                    >
                      •
                    </button>
                    <button
                      onClick={() => moveBench(0.06, 0, 0)}
                      title="Move Right"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <div />
                    <button
                      onClick={() => moveBench(0, 0, 0.06)}
                      title="Move Backward"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <div />
                  </div>

                  {/* Vertical Elevation Column */}
                  <div className="flex flex-col gap-1.5 pl-3 border-l border-slate-800">
                    <span className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold">
                      Height
                    </span>
                    <button
                      onClick={() => moveBench(0, 0.04, 0)}
                      title="Raise Up"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => moveBench(0, -0.04, 0)}
                      title="Lower Down"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ROTATION */}
            {activeHudTab === 'rotate' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Azimuth Angle</span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold text-xs">{arRotationY.toFixed(0)}°</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setArRotationY((r) => (r - 15) % 360)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    ↺ -15°
                  </button>
                  <button
                    onClick={() => setArRotationY(0)}
                    className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800"
                  >
                    Front (0°)
                  </button>
                  <button
                    onClick={() => setArRotationY((r) => (r + 15) % 360)}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    ↻ +15°
                  </button>
                </div>

                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={arRotationY < 0 ? arRotationY + 360 : arRotationY}
                  onChange={(e) => setArRotationY(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Live Optics Status Tag */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs flex items-center gap-3 shadow-lg">
            <span className="font-mono text-cyan-400 font-bold">f = {focalLength} cm</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-amber-300 font-bold">u = {(lensPos - objectPos).toFixed(1)} cm</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 font-bold">
              v = {isFinite(calc.imageDistance) ? `${calc.imageDistance.toFixed(1)} cm` : '∞'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-semibold">{calc.imageNature}</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                setBenchPlaced(false);
                setArPosition({ x: 0, y: -0.15, z: -0.6 });
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-center Bench</span>
            </button>
          </div>
        </div>
      </div>

      {/* AR Instructions & Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <ZoomIn className="w-4 h-4" />
            <span>1. Pinch to Zoom & Scale</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use two fingers to pinch in/out directly on the camera screen, or use the on-screen Zoom slider to scale between miniature desk scale (50%) and life-size classroom floor scale (200%).
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Move className="w-4 h-4" />
            <span>2. 2-Finger Drag & D-Pad Move</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drag with two fingers across the screen to slide the bench forward, backward, left, or right. Use the Height elevation buttons to place it precisely on raised laboratory tables.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <RotateCw className="w-4 h-4" />
            <span>3. 360° Rotational Alignment</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Swipe horizontally with one finger or use the Rotate buttons to pivot the optical axis towards your study group or presenter desk for comfortable viewing.
          </p>
        </div>
      </div>
    </div>
  );
}
