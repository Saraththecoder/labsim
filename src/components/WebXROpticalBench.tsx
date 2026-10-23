'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateOptics, generatePrincipalRays, LensSystemState } from '@/lib/physics';
import { calculateMirrorOptics, MirrorSystemState } from '@/lib/mirrorPhysics';
import { calculateGlassSlab, GlassSlabState } from '@/lib/glassSlabPhysics';
import { calculateGlassPrism, PrismState } from '@/lib/prismPhysics';
import { calculateOhmsLaw, OhmsLawState } from '@/lib/ohmsLawPhysics';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
import {
  buildConvexLensModel,
  buildConcaveMirrorModel,
  buildGlassSlabModel,
  buildGlassPrismModel,
  buildOhmsLawCircuitModel,
} from '@/components/arPhysicsModels';
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

export interface WebXROpticalBenchProps {
  experimentId?: string; // 'convex-lens' | 'concave-mirror' | 'glass-slab' | 'glass-prism' | 'ohms-law'
  // Convex Lens & Concave Mirror Props
  focalLength?: number;
  objectPos?: number;
  lensPos?: number;
  screenPos?: number;
  mirrorPos?: number;
  onObjectPosChange?: (pos: number) => void;
  onLensPosChange?: (pos: number) => void;
  onScreenPosChange?: (pos: number) => void;
  onMirrorPosChange?: (pos: number) => void;

  // Glass Slab Props
  slabAngleIncidence?: number;
  slabThickness?: number;
  slabRefractiveIndex?: number;
  onSlabAngleChange?: (angle: number) => void;

  // Glass Prism Props
  prismAngleIncidence?: number;
  prismMode?: 'monochromatic' | 'dispersion';
  onPrismAngleChange?: (angle: number) => void;

  // Ohm's Law Props
  ohmsCellCount?: number;
  ohmsRheostat?: number;
  ohmsResistance?: number;
  ohmsKeyClosed?: boolean;
  onOhmsCellCountChange?: (cells: number) => void;
  onOhmsRheostatChange?: (r: number) => void;
  onOhmsToggleKey?: () => void;
}

export function WebXROpticalBench({
  experimentId = 'convex-lens',
  focalLength = 15,
  objectPos = 25,
  lensPos = 50,
  screenPos = 80,
  mirrorPos = 80,
  onObjectPosChange,
  onLensPosChange,
  onScreenPosChange,
  onMirrorPosChange,
  slabAngleIncidence = 45,
  slabThickness = 6,
  slabRefractiveIndex = 1.52,
  onSlabAngleChange,
  prismAngleIncidence = 48,
  prismMode = 'dispersion',
  onPrismAngleChange,
  ohmsCellCount = 2,
  ohmsRheostat = 15,
  ohmsResistance = 5,
  ohmsKeyClosed = true,
  onOhmsCellCountChange,
  onOhmsRheostatChange,
  onOhmsToggleKey,
}: WebXROpticalBenchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [activeMode, setActiveMode] = useState<'webxr' | 'camera-fallback' | 'studio'>('studio');
  const [benchPlaced, setBenchPlaced] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [reticleBannerVisible, setReticleBannerVisible] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState<'ar' | '3d' | 'ray'>('ar');
  const [snapshotToast, setSnapshotToast] = useState(false);

  // 3D Scene Refs
  const benchRootRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const studioTableRef = useRef<THREE.Group | null>(null);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'perspective' | 'top' | 'eye' | 'side'>('perspective');

  // AR Manipulation State (Move, Zoom, Rotate)
  const [arScale, setArScale] = useState<number>(1.0);
  const [arPosition, setArPosition] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: -0.05,
    z: -0.35,
  });
  const [arRotationY, setArRotationY] = useState<number>(0);
  const [activeHudTab, setActiveHudTab] = useState<'zoom' | 'move' | 'rotate' | null>(null);

  const arScaleRef = useRef(arScale);
  arScaleRef.current = arScale;
  const arPosRef = useRef(arPosition);
  arPosRef.current = arPosition;
  const arRotRef = useRef(arRotationY);
  arRotRef.current = arRotationY;
  const benchPlacedRef = useRef(benchPlaced);
  benchPlacedRef.current = benchPlaced;

  // Real-time Physics Calculations for all 5 Practicals
  // 1. Convex Lens
  const lensState: LensSystemState = {
    focalLength,
    objectDistance: Math.max(0.1, lensPos - objectPos),
    objectHeight: 5,
    screenDistance: Math.max(0, screenPos - lensPos),
  };
  const lensCalc = calculateOptics(lensState);

  // 2. Concave Mirror
  const mirrorU = Math.max(0.1, mirrorPos - objectPos);
  const mirrorScreenDist = Math.max(0, mirrorPos - screenPos);
  const mirrorState: MirrorSystemState = {
    focalLength,
    objectDistance: mirrorU,
    objectHeight: 5,
    screenDistance: mirrorScreenDist,
    mirrorPosition: mirrorPos,
  };
  const mirrorCalc = calculateMirrorOptics(mirrorState);

  // 3. Glass Slab
  const slabState: GlassSlabState = {
    angleIncidenceDeg: slabAngleIncidence,
    slabThicknessCm: slabThickness,
    refractiveIndex: slabRefractiveIndex,
  };
  const slabCalc = calculateGlassSlab(slabState);

  // 4. Glass Prism
  const prismState: PrismState = {
    angleIncidenceDeg: prismAngleIncidence,
    refractiveIndex: 1.52,
    mode: prismMode,
  };
  const prismCalc = calculateGlassPrism(prismState);

  // 5. Ohm's Law
  const ohmsState: OhmsLawState = {
    config: 'single',
    r1: ohmsResistance,
    r2: 10,
    rheostatResistance: ohmsRheostat,
    cellCount: ohmsCellCount,
    isPlugKeyClosed: ohmsKeyClosed,
  };
  const ohmsCalc = calculateOhmsLaw(ohmsState);

  // Check hardware and WebXR capabilities on mount
  useEffect(() => {
    async function checkCapabilities() {
      const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;
      const hasXR = typeof navigator !== 'undefined' && 'xr' in navigator;
      let hasImmersiveAR = false;

      if (hasXR && (navigator as any).xr?.isSessionSupported) {
        try {
          hasImmersiveAR = await (navigator as any).xr.isSessionSupported('immersive-ar');
        } catch {
          hasImmersiveAR = false;
        }
      }

      if (!isSecure && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        setCameraError(
          'Mobile browsers strictly require HTTPS to access camera hardware. If testing via local Wi-Fi, run: npx localtunnel --port 3005'
        );
      }

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

  // Initialize Three.js WebXR Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.01, 25);
    camera.position.set(0, 0.45, 0.95);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.12, -0.35);
    controls.minDistance = 0.2;
    controls.maxDistance = 6.0;
    controlsRef.current = controls;

    // Realistic Laboratory Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(2, 5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xb8d96b, 1.5, 8);
    rimLight.position.set(0, 3, 2);
    scene.add(rimLight);

    // 3D Laboratory Workstation Bench Table Surface (visible in 3D Lab Studio mode)
    const studioTable = new THREE.Group();
    studioTable.position.set(0, -0.055, -0.35);

    // Dark slate laboratory worktop with chamfer
    const tableTopGeo = new THREE.BoxGeometry(2.4, 0.03, 1.4);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x18241d,
      roughness: 0.35,
      metalness: 0.25,
    });
    const tableTopMesh = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTopMesh.position.y = -0.015;
    studioTable.add(tableTopMesh);

    // Hardwood edge trim
    const trimGeo = new THREE.BoxGeometry(2.46, 0.036, 1.46);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x473322,
      roughness: 0.55,
      metalness: 0.1,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.019;
    studioTable.add(trimMesh);

    // Millimeter Coordinate Grid Lines
    const grid = new THREE.GridHelper(2.2, 22, 0xb8d96b, 0x2e4235);
    grid.position.y = 0.001;
    studioTable.add(grid);

    // Soft Ambient Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.6, 0.9).rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x070d09,
      transparent: true,
      opacity: 0.55,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.002;
    studioTable.add(shadowMesh);

    studioTable.visible = activeViewMode === '3d';
    scene.add(studioTable);
    studioTableRef.current = studioTable;

    // Optical Bench Root Group
    const benchRoot = new THREE.Group();
    const baseScale = experimentId === 'convex-lens' || experimentId === 'concave-mirror' ? 0.22 : 0.28;
    const initialScale = baseScale * arScaleRef.current;
    benchRoot.scale.set(initialScale, initialScale, initialScale);
    benchRoot.position.set(arPosRef.current.x, arPosRef.current.y, arPosRef.current.z);
    benchRoot.rotation.y = THREE.MathUtils.degToRad(arRotRef.current);
    scene.add(benchRoot);
    benchRootRef.current = benchRoot;

    // WebXR Hit-testing Reticle
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xb8d96b });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: any = null;

    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession() as any;
      if (!session) return;
      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    });

    renderer.xr.addEventListener('sessionend', () => {
      hitTestSource = null;
    });

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

    // Multi-touch Gestures: Pinch to Zoom & Drag to Move/Rotate
    let initialDistance = 0;
    let initialScaleVal = 1.0;
    let lastTouchCenter = { x: 0, y: 0 };
    let lastSingleTouchX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
        initialScaleVal = arScaleRef.current;
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
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / initialDistance;
        const newScale = Math.min(2.5, Math.max(0.25, initialScaleVal * factor));
        setArScale(Number(newScale.toFixed(2)));

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

      // Dynamic Simulation: Animate Electric Current Flow & Traveling Optical Light Pulses
      if (benchRootRef.current) {
        benchRootRef.current.traverse((child) => {
          if ((child.userData?.isCurrentPulse || child.userData?.isLightPulse) && child.userData.curve) {
            child.userData.progress = (child.userData.progress + child.userData.speed) % 1.0;
            const pt = child.userData.curve.getPointAt(child.userData.progress);
            child.position.copy(pt);
          }
        });
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

  // Dynamically Rebuild 3D Model based on active experiment & parameters
  useEffect(() => {
    if (!benchRootRef.current) return;
    const root = benchRootRef.current;

    if (experimentId === 'convex-lens') {
      buildConvexLensModel(root, lensState, lensCalc, { objectPos, lensPos, screenPos });
    } else if (experimentId === 'concave-mirror') {
      buildConcaveMirrorModel(root, mirrorState, mirrorCalc, { objectPos, mirrorPos, screenPos });
    } else if (experimentId === 'glass-slab') {
      buildGlassSlabModel(root, slabState, slabCalc);
    } else if (experimentId === 'glass-prism') {
      buildGlassPrismModel(root, prismState, prismCalc);
    } else if (experimentId === 'ohms-law') {
      buildOhmsLawCircuitModel(root, ohmsState, ohmsCalc);
    }
  }, [
    experimentId,
    focalLength,
    objectPos,
    lensPos,
    screenPos,
    mirrorPos,
    slabAngleIncidence,
    slabThickness,
    slabRefractiveIndex,
    prismAngleIncidence,
    prismMode,
    ohmsCellCount,
    ohmsRheostat,
    ohmsResistance,
    ohmsKeyClosed,
  ]);

  // Synchronize Scale, Position & Rotation
  useEffect(() => {
    if (!benchRootRef.current) return;
    const baseScale = experimentId === 'convex-lens' || experimentId === 'concave-mirror' ? 0.22 : 0.28;
    const s = baseScale * arScale;
    benchRootRef.current.scale.set(s, s, s);
    benchRootRef.current.position.set(arPosition.x, arPosition.y, arPosition.z);
    benchRootRef.current.rotation.y = THREE.MathUtils.degToRad(arRotationY);
  }, [arScale, arPosition, arRotationY, experimentId]);

  // Synchronize 3D Lab Studio Tabletop visibility with activeViewMode
  useEffect(() => {
    if (studioTableRef.current) {
      studioTableRef.current.visible = activeViewMode === '3d';
    }
  }, [activeViewMode]);

  const applyCameraPreset = (preset: 'perspective' | 'top' | 'eye' | 'side') => {
    setActiveCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'perspective':
        cam.position.set(0.42, 0.48, 0.88);
        ctrl.target.set(0, 0.10, -0.35);
        break;
      case 'top':
        cam.position.set(0, 1.25, -0.35);
        ctrl.target.set(0, 0.02, -0.351);
        break;
      case 'eye':
        cam.position.set(0, 0.12, 0.62);
        ctrl.target.set(0, 0.12, -0.35);
        break;
      case 'side':
        cam.position.set(1.05, 0.16, -0.35);
        ctrl.target.set(0, 0.12, -0.35);
        break;
    }
    ctrl.update();
  };

  const moveBench = (dx: number, dy: number, dz: number) => {
    setArPosition((prev) => ({
      x: Number((prev.x + dx).toFixed(3)),
      y: Number((prev.y + dy).toFixed(3)),
      z: Number((prev.z + dz).toFixed(3)),
    }));
  };

  const startCameraFeed = async () => {
    setCameraError(null);
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError(
        'Insecure Origin: Mobile browsers block camera hardware when accessed via raw IP HTTP (e.g. http://192.168.x.x:3005). Please connect via an HTTPS tunnel (`npx localtunnel --port 3005`) or USB port forwarding.'
      );
      return;
    }

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Camera API not supported in this browser. Please use Chrome, Safari, or an HTTPS connection.');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        setActiveMode('camera-fallback');
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Tap the lock icon in your browser address bar to allow camera access.');
      } else {
        setCameraError(err.message || 'Unable to access camera on this device.');
      }
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
    setArPosition({ x: 0, y: -0.05, z: -0.35 });
    setArRotationY(0);
    setBenchPlaced(false);
  };

  const handleShutterClick = () => {
    setBenchPlaced(true);
    setSnapshotToast(true);
    setTimeout(() => setSnapshotToast(false), 2200);
  };

  return (
    <div className="w-full space-y-3">
      {/* 1. Top Segmented View Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E2E8DF] shadow-xs gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveViewMode('ar');
              if (!cameraActive) startCameraFeed();
            }}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeViewMode === 'ar'
                ? 'bg-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                : 'text-[#647067] hover:text-[#17231B]'
            }`}
          >
            AR Camera Mode
          </button>
          <button
            onClick={() => setActiveViewMode('3d')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeViewMode === '3d'
                ? 'bg-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                : 'text-[#647067] hover:text-[#17231B]'
            }`}
          >
            3D Lab Studio
          </button>
          {experimentId === 'convex-lens' && (
            <button
              onClick={() => setActiveViewMode('ray')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeViewMode === 'ray'
                  ? 'bg-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                  : 'text-[#647067] hover:text-[#17231B]'
              }`}
            >
              Ray Diagram
            </button>
          )}
        </div>
      </div>

      {/* Camera Alert */}
      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#B8D96B] text-xs text-[#17231B] flex items-start justify-between gap-3 shadow-md">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-[#17231B] block">Camera Connection Notice:</span>
              <p className="text-[11px] text-[#647067] leading-relaxed">{cameraError}</p>
            </div>
          </div>
          <button onClick={() => setCameraError(null)} className="text-[#647067] hover:text-[#17231B] p-1 text-xs shrink-0 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main AR / 3D Viewport */}
      <div className="relative w-full h-[58vh] min-h-[460px] max-h-[620px] sm:h-[580px] rounded-3xl overflow-hidden border border-[#E2E8DF] bg-[#17231B] shadow-2xl">
        {/* Background Camera Passthrough */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity duration-300 ${
            cameraActive && activeViewMode === 'ar' ? 'opacity-90' : 'hidden'
          }`}
        />

        {/* High-end Studio Background Glow */}
        {(!cameraActive || activeViewMode !== 'ar') && (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1c2c22] via-[#17231B] to-[#111b15] flex items-center justify-center pointer-events-none">
            <div className="w-[450px] h-[450px] bg-[#B8D96B]/10 rounded-full blur-[90px]" />
          </div>
        )}

        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          className={`absolute inset-0 z-10 w-full h-full ${activeViewMode === 'ray' ? 'hidden' : 'block'}`}
        />

        {/* 2D Ray Diagram Overlay */}
        {activeViewMode === 'ray' && (
          <div className="absolute inset-0 z-15 bg-[#FFFFFF]/95 backdrop-blur-md p-4 flex flex-col justify-center items-center overflow-hidden">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8DF] p-3 shadow-sm">
              <RayDiagramSvg state={lensState} height={260} />
            </div>
          </div>
        )}

        {/* 3D Lab Studio Viewport Presets & Title Pill */}
        {activeViewMode === '3d' && (
          <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            {/* Apparatus Title Badge */}
            <div className="bg-[#FFFFFF]/92 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E2E8DF] text-[11px] font-bold text-[#17231B] shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8D96B] animate-pulse" />
              <span>
                {experimentId === 'convex-lens' && 'Dual-Rail Precision Optical Bench • 100cm Millimeter Scale'}
                {experimentId === 'concave-mirror' && 'Spherical Mirror Optical Bench • Candle & Ground Glass'}
                {experimentId === 'glass-slab' && 'Teak Drawing Board • Crown Glass Slab (n = 1.52) & Laser'}
                {experimentId === 'glass-prism' && 'Prism Turntable Stand • 60° Equilateral Glass • VIBGYOR'}
                {experimentId === 'ohms-law' && 'Ohm’s Law DC Circuit Board • Moving-Coil Ammeter & Voltmeter'}
              </span>
            </div>

            {/* Camera Presets Selector */}
            <div className="bg-[#FFFFFF]/92 backdrop-blur-md p-1 rounded-full border border-[#E2E8DF] shadow-sm flex items-center gap-1 text-xs">
              <button
                onClick={() => applyCameraPreset('perspective')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeCameraPreset === 'perspective'
                    ? 'bg-[#B8D96B] text-[#17231B] shadow-xs'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
                title="Perspective 3/4 Orbit View"
              >
                Perspective
              </button>
              <button
                onClick={() => applyCameraPreset('top')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeCameraPreset === 'top'
                    ? 'bg-[#B8D96B] text-[#17231B] shadow-xs'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
                title="Top-Down Plan View (Engineering schematic)"
              >
                Top Plan
              </button>
              <button
                onClick={() => applyCameraPreset('eye')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeCameraPreset === 'eye'
                    ? 'bg-[#B8D96B] text-[#17231B] shadow-xs'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
                title="Eye-Level Along Optical Axis / Meters"
              >
                Eye Level
              </button>
              <button
                onClick={() => applyCameraPreset('side')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeCameraPreset === 'side'
                    ? 'bg-[#B8D96B] text-[#17231B] shadow-xs'
                    : 'text-[#647067] hover:text-[#17231B]'
                }`}
                title="Side Elevation View"
              >
                Side
              </button>
            </div>
          </div>
        )}

        {/* Top Floating Instruction Banner */}
        {reticleBannerVisible && activeViewMode === 'ar' && (
          <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-20 max-w-md mx-auto bg-[#FFFFFF]/92 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#E2E8DF] text-xs shadow-xl flex items-center justify-between gap-3 text-[#17231B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] shrink-0">
                <Smartphone className="w-4 h-4 text-[#17231B]" />
              </div>
              <p className="text-[11px] font-medium leading-tight text-[#17231B] truncate sm:whitespace-normal">
                Point your phone camera at your desk. Pinch to zoom, drag to move, and swipe with 1 finger to rotate apparatus.
              </p>
            </div>
            <button
              onClick={() => setReticleBannerVisible(false)}
              className="text-[#647067] hover:text-[#17231B] p-1 text-xs shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Right Action Controls */}
        <div className="absolute top-16 sm:top-14 right-3 z-20 flex flex-col items-center gap-2">
          <button
            onClick={() => setActiveHudTab(activeHudTab ? null : 'zoom')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold backdrop-blur-md transition-all shadow-md cursor-pointer ${
              activeHudTab
                ? 'bg-[#B8D96B] text-[#17231B] border-[#B8D96B]'
                : 'bg-[#FFFFFF]/90 border-[#E2E8DF] text-[#17231B] hover:bg-[#FFFFFF]'
            }`}
            title="Adjust Scale, Position & Angle"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {activeViewMode === 'ar' && (
            <button
              onClick={cameraActive ? stopCameraFeed : startCameraFeed}
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold backdrop-blur-md transition-all shadow-md cursor-pointer ${
                cameraActive
                  ? 'bg-[#B8D96B] text-[#17231B] border-[#B8D96B]'
                  : 'bg-[#FFFFFF]/90 border-[#E2E8DF] text-[#17231B] hover:bg-[#FFFFFF]'
              }`}
              title={cameraActive ? 'Stop Camera Feed' : 'Start Camera Feed'}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={resetAllTransforms}
            className="w-10 h-10 rounded-full bg-[#FFFFFF]/90 border border-[#E2E8DF] flex items-center justify-center text-[#17231B] hover:bg-[#FFFFFF] shadow-md transition-all cursor-pointer"
            title="Reset Bench Alignment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating AR Transformation Drawer */}
        {activeHudTab && (
          <div className="absolute top-28 right-3 z-30 w-[calc(100%-24px)] max-w-xs sm:w-72 bg-[#FFFFFF]/95 backdrop-blur-lg border border-[#E2E8DF] rounded-2xl p-3.5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
              <div className="flex items-center gap-1 bg-[#F4F7F2] p-0.5 rounded-lg border border-[#E2E8DF]">
                <button
                  onClick={() => setActiveHudTab('zoom')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'zoom' ? 'bg-[#B8D96B] text-[#17231B]' : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Zoom
                </button>
                <button
                  onClick={() => setActiveHudTab('move')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'move' ? 'bg-[#B8D96B] text-[#17231B]' : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Move
                </button>
                <button
                  onClick={() => setActiveHudTab('rotate')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'rotate' ? 'bg-[#B8D96B] text-[#17231B]' : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Rotate
                </button>
              </div>

              <button onClick={() => setActiveHudTab(null)} className="text-[#647067] hover:text-[#17231B] p-1 text-xs shrink-0 cursor-pointer">
                ✕
              </button>
            </div>

            {activeHudTab === 'zoom' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#17231B]">
                  <span>Apparatus Scale</span>
                  <span className="font-mono font-bold text-[#17231B]">{(arScale * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.05"
                  value={arScale}
                  onChange={(e) => setArScale(Number(e.target.value))}
                  className="w-full accent-[#B8D96B] cursor-pointer"
                />
              </div>
            )}

            {activeHudTab === 'move' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#17231B]">
                  <span>Translate Position</span>
                  <button
                    onClick={() => setArPosition({ x: 0, y: -0.05, z: -0.35 })}
                    className="text-[#17231B] text-[10px] underline font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-28 mx-auto">
                  <div />
                  <button
                    onClick={() => moveBench(0, 0, -0.06)}
                    className="p-1.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] flex items-center justify-center cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-[#17231B]" />
                  </button>
                  <div />
                  <button
                    onClick={() => moveBench(-0.06, 0, 0)}
                    className="p-1.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#17231B]" />
                  </button>
                  <div />
                  <button
                    onClick={() => moveBench(0.06, 0, 0)}
                    className="p-1.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] flex items-center justify-center cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#17231B]" />
                  </button>
                  <div />
                  <button
                    onClick={() => moveBench(0, 0, 0.06)}
                    className="p-1.5 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] flex items-center justify-center cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-[#17231B]" />
                  </button>
                  <div />
                </div>
              </div>
            )}

            {activeHudTab === 'rotate' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#17231B]">
                  <span>Azimuth Rotation</span>
                  <span className="font-mono font-bold text-[#17231B]">{arRotationY.toFixed(0)}°</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setArRotationY((r) => (r - 15) % 360)}
                    className="flex-1 py-1 rounded bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-semibold text-xs cursor-pointer"
                  >
                    ↺ -15°
                  </button>
                  <button
                    onClick={() => setArRotationY((r) => (r + 15) % 360)}
                    className="flex-1 py-1 rounded bg-[#F4F7F2] border border-[#E2E8DF] text-[#17231B] font-semibold text-xs cursor-pointer"
                  >
                    ↻ +15°
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic 3-Column Floating Metrics HUD tailored per Experiment */}
        <div className="absolute bottom-22 left-3 right-3 sm:left-6 sm:right-6 z-20 max-w-xl mx-auto bg-[#FFFFFF]/92 backdrop-blur-md px-3 sm:px-5 py-2.5 rounded-2xl border border-[#E2E8DF] shadow-lg pointer-events-auto">
          {experimentId === 'convex-lens' && (
            <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Image Dist (v)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                  {isFinite(lensCalc.imageDistance) ? `${lensCalc.imageDistance.toFixed(1)} cm` : '∞'}
                </span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Magnification (m)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                  {lensCalc.magnification === Infinity ? '∞' : lensCalc.magnification.toFixed(2)}
                </span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Image Nature</span>
                <span className="text-[10px] sm:text-xs font-bold text-[#17231B] leading-tight block truncate sm:whitespace-normal">
                  {lensCalc.imageNature}
                </span>
              </div>
            </div>
          )}

          {experimentId === 'concave-mirror' && (
            <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Object Dist (u)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{mirrorU.toFixed(1)} cm</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Image Dist (v)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                  {isFinite(mirrorCalc.imageDistance) ? `${mirrorCalc.imageDistance.toFixed(1)} cm` : '∞'}
                </span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Magnification (m)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                  {isFinite(mirrorCalc.magnification) ? mirrorCalc.magnification.toFixed(2) : '∞'}
                </span>
              </div>
            </div>
          )}

          {experimentId === 'glass-slab' && (
            <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Refraction (∠r)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{slabCalc.angleRefractionDeg.toFixed(1)}°</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Lateral Shift (d)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{slabCalc.lateralDisplacementCm.toFixed(2)} cm</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Emergence (∠e)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{slabCalc.angleEmergenceDeg.toFixed(1)}°</span>
              </div>
            </div>
          )}

          {experimentId === 'glass-prism' && (
            <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Incidence (∠i)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{prismCalc.angleIncidenceDeg.toFixed(1)}°</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Deviation (∠D)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{prismCalc.angleDeviationDeg.toFixed(1)}°</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Emergence (∠e)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{prismCalc.angleEmergenceDeg.toFixed(1)}°</span>
              </div>
            </div>
          )}

          {experimentId === 'ohms-law' && (
            <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Voltmeter (V)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{ohmsCalc.measuredVoltageV.toFixed(2)} V</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Ammeter (I)</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">{ohmsCalc.currentA.toFixed(3)} A</span>
              </div>
              <div className="px-1 sm:px-3">
                <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Ratio V/I = R</span>
                <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                  {ohmsCalc.currentA > 0 ? `${(ohmsCalc.measuredVoltageV / ohmsCalc.currentA).toFixed(2)} Ω` : '—'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Shutter Controls */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-6 sm:gap-8 pointer-events-auto">
          <button
            onClick={() => setActiveHudTab(activeHudTab === 'zoom' ? null : 'zoom')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFFFFF]/90 border border-[#E2E8DF] flex items-center justify-center text-[#17231B] hover:bg-[#FFFFFF] active:scale-95 shadow-md cursor-pointer"
            title="Inspect Scale / Zoom"
          >
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#17231B]" />
          </button>

          <button
            onClick={handleShutterClick}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B8D96B] hover:bg-[#a7cb58] border-4 border-[#FFFFFF] ring-2 ring-[#B8D96B]/80 shadow-[0_0_25px_rgba(184,217,107,0.5)] flex items-center justify-center text-[#17231B] active:scale-90 transition-transform cursor-pointer"
            title="Anchor Apparatus / Log Reading"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#17231B]" />
          </button>

          <button
            onClick={resetAllTransforms}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFFFFF]/90 border border-[#E2E8DF] flex items-center justify-center text-[#17231B] hover:bg-[#FFFFFF] active:scale-95 shadow-md cursor-pointer"
            title="Reset Position"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#17231B]" />
          </button>
        </div>

        {/* Snapshot Notification Toast */}
        {snapshotToast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-[#FFFFFF]/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#B8D96B] text-[#17231B] text-xs font-bold shadow-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#17231B]" />
            <span>Apparatus Anchored & Tabletop Measurements Saved!</span>
          </div>
        )}
      </div>
    </div>
  );
}
