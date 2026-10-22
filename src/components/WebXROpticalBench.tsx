'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateOptics, generatePrincipalRays, LensSystemState } from '@/lib/physics';
import { RayDiagramSvg } from '@/components/RayDiagramSvg';
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [reticleBannerVisible, setReticleBannerVisible] = useState(true);
  const [activeViewMode, setActiveViewMode] = useState<'ar' | '3d' | 'ray'>('ar');
  const [snapshotToast, setSnapshotToast] = useState(false);
  const [deviceDiagnostics, setDeviceDiagnostics] = useState<{
    hasXR: boolean;
    hasImmersiveAR: boolean;
    hasCamera: boolean;
    hasOrientation: boolean;
    isSecure: boolean;
  }>({
    hasXR: false,
    hasImmersiveAR: false,
    hasCamera: false,
    hasOrientation: false,
    isSecure: true,
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
  const [activeHudTab, setActiveHudTab] = useState<'zoom' | 'move' | 'rotate' | null>(null);

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

      const hasCamera = typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

      setDeviceDiagnostics({
        hasXR,
        hasImmersiveAR,
        hasCamera,
        hasOrientation,
        isSecure,
      });

      if (!isSecure && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        setCameraError(
          'Mobile browsers strictly require HTTPS to access the device camera. If testing via local Wi-Fi IP, use an HTTPS tunnel or USB port forwarding.'
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
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2, 4, 3);
    scene.add(sun);

    const limeRim = new THREE.PointLight(0xc6f135, 1.2, 6);
    limeRim.position.set(-2, 1, -1);
    scene.add(limeRim);

    // Optical Bench Root Model
    const benchRoot = new THREE.Group();
    benchRoot.scale.set(0.18 * arScaleRef.current, 0.18 * arScaleRef.current, 0.18 * arScaleRef.current);
    benchRoot.position.set(arPosRef.current.x, arPosRef.current.y, arPosRef.current.z);
    benchRoot.rotation.y = THREE.MathUtils.degToRad(arRotRef.current);
    scene.add(benchRoot);
    benchRootRef.current = benchRoot;

    // Bed and Rails
    const bedGeo = new THREE.BoxGeometry(6.0, 0.15, 0.7);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x121c14, metalness: 0.85, roughness: 0.3 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    benchRoot.add(bed);

    const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 5.8, 16);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95 });
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
      new THREE.MeshStandardMaterial({ color: 0x84cc16, metalness: 0.9 })
    );
    lensRing.rotation.y = Math.PI / 2;
    lensRing.position.y = 0.55;
    lensGroup.add(lensRing);

    const lensGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xd9f99d,
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

    // Hit-testing Reticle for Real WebXR (Electric Lime)
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xc6f135 });
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
  // Fallback Camera feed activator
  const startCameraFeed = async () => {
    setCameraError(null);
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError(
        'Insecure Origin: Mobile browsers block camera hardware when accessed via raw IP HTTP (e.g. http://192.168.x.x:3005). Please connect via an HTTPS tunnel (run `npx localtunnel --port 3005`) or USB port forwarding.'
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
        // Tier 1: Ideal rear environment camera with 720p/1080p
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        try {
          // Tier 2: Basic environment facing camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
        } catch {
          // Tier 3: Any available video stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
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
        setCameraError('Camera permission was blocked. Tap the lock/tune icon in your browser address bar to allow camera access.');
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
    setArPosition({ x: 0, y: -0.15, z: -0.6 });
    setArRotationY(0);
    setBenchPlaced(false);
  };

  // Snapshot flash simulation
  const handleShutterClick = () => {
    setBenchPlaced(true);
    setSnapshotToast(true);
    setTimeout(() => setSnapshotToast(false), 2200);
  };

  return (
    <div className="w-full space-y-3">
      {/* 1. Top Segmented View Switcher (Matches Screen 3 Mockup) */}
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
            AR Mode
          </button>
          <button
            onClick={() => setActiveViewMode('3d')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeViewMode === '3d'
                ? 'bg-[#B8D96B] text-[#17231B] font-bold shadow-xs'
                : 'text-[#647067] hover:text-[#17231B]'
            }`}
          >
            3D Model
          </button>
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
        </div>
      </div>

      {/* Camera Inaccessible Alert Banner (If mobile HTTP or permission issue) */}
      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#B8D96B] text-xs text-[#17231B] flex items-start justify-between gap-3 shadow-md">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#17231B] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-[#17231B] block">
                Why is the AR Camera Inaccessible on Mobile?
              </span>
              <p className="text-[11px] text-[#647067] leading-relaxed">
                {cameraError}
              </p>
              <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#F4F7F2] border border-[#E2E8DF] font-mono text-[#17231B] font-bold">
                  Run: npx localtunnel --port 3005
                </span>
                <span className="text-[#647067]">for instant HTTPS on your phone</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCameraError(null)}
            className="text-[#647067] hover:text-[#17231B] p-1 text-xs shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main AR Viewport (Matches Screen 3 Mockup) */}
      <div className="relative w-full h-[58vh] min-h-[460px] max-h-[620px] sm:h-[580px] rounded-3xl overflow-hidden border border-[#E2E8DF] bg-[#17231B] shadow-2xl">
        {/* Background Camera Stream (Plays directly behind 3D canvas) */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity duration-300 ${
            cameraActive && activeViewMode === 'ar' ? 'opacity-90' : 'hidden'
          }`}
        />

        {/* Studio Background Pattern when Camera is off or in 3D mode */}
        {(!cameraActive || activeViewMode !== 'ar') && (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1c2c22] via-[#17231B] to-[#111b15] flex items-center justify-center pointer-events-none">
            <div className="w-[420px] h-[420px] bg-[#B8D96B]/10 rounded-full blur-[90px]" />
          </div>
        )}

        {/* Three.js Canvas Container */}
        <div
          ref={containerRef}
          className={`absolute inset-0 z-10 w-full h-full ${activeViewMode === 'ray' ? 'hidden' : 'block'}`}
        />

        {/* 2D Ray Diagram Overlay when activeViewMode === 'ray' */}
        {activeViewMode === 'ray' && (
          <div className="absolute inset-0 z-15 bg-[#FFFFFF]/95 backdrop-blur-md p-4 flex flex-col justify-center items-center overflow-hidden">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8DF] p-3 shadow-sm">
              <RayDiagramSvg state={state} height={260} />
            </div>
            <p className="text-[11px] text-[#647067] mt-3 font-mono text-center">
              Real-time geometric ray tracing: Incident, refracted, and focal focal planes
            </p>
          </div>
        )}

        {/* Top Floating Prompt Banner (Matches Screen 3 Mockup) */}
        {reticleBannerVisible && activeViewMode === 'ar' && (
          <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-20 max-w-md mx-auto bg-[#FFFFFF]/92 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#E2E8DF] text-xs shadow-xl flex items-center justify-between gap-3 text-[#17231B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#F4F7F2] border border-[#E2E8DF] flex items-center justify-center text-[#17231B] shrink-0">
                <Smartphone className="w-4 h-4 text-[#17231B]" />
              </div>
              <p className="text-[11px] font-medium leading-tight text-[#17231B] truncate sm:whitespace-normal">
                Place the lens on a flat surface and align the markers. The rays and image will be shown in real-time.
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

        {/* Floating Right Action Controls (Vertical column matching Screen 3 Mockup) */}
        <div className="absolute top-16 sm:top-14 right-3 z-20 flex flex-col items-center gap-2">
          {/* Settings / Upright drawer toggle */}
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

          {/* Camera On / Off toggle */}
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

          {/* Reset position button */}
          <button
            onClick={resetAllTransforms}
            className="w-10 h-10 rounded-full bg-[#FFFFFF]/90 border border-[#E2E8DF] flex items-center justify-center text-[#17231B] hover:bg-[#FFFFFF] shadow-md transition-all cursor-pointer"
            title="Reset Bench Alignment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating AR Transformation Drawer (Fully Responsive on mobile) */}
        {activeHudTab && (
          <div className="absolute top-28 right-3 z-30 w-[calc(100%-24px)] max-w-xs sm:w-72 bg-[#FFFFFF]/95 backdrop-blur-lg border border-[#E2E8DF] rounded-2xl p-3.5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
              <div className="flex items-center gap-1 bg-[#F4F7F2] p-0.5 rounded-lg border border-[#E2E8DF]">
                <button
                  onClick={() => setActiveHudTab('zoom')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'zoom'
                      ? 'bg-[#B8D96B] text-[#17231B]'
                      : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Zoom
                </button>
                <button
                  onClick={() => setActiveHudTab('move')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'move'
                      ? 'bg-[#B8D96B] text-[#17231B]'
                      : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Move
                </button>
                <button
                  onClick={() => setActiveHudTab('rotate')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeHudTab === 'rotate'
                      ? 'bg-[#B8D96B] text-[#17231B]'
                      : 'text-[#647067] hover:text-[#17231B]'
                  }`}
                >
                  Rotate
                </button>
              </div>

              <button
                onClick={() => setActiveHudTab(null)}
                className="text-[#647067] hover:text-[#17231B] p-1 text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeHudTab === 'zoom' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#17231B]">
                  <span>Scale Multiplier</span>
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
                  <span>Move on Table</span>
                  <button
                    onClick={() => setArPosition({ x: 0, y: -0.15, z: -0.6 })}
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
                  <span>Azimuth Angle</span>
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

        {/* 3-Column Floating HUD Metrics (Matches Screen 3 Mockup) */}
        <div className="absolute bottom-22 left-3 right-3 sm:left-6 sm:right-6 z-20 max-w-lg mx-auto bg-[#FFFFFF]/92 backdrop-blur-md px-3 sm:px-5 py-2.5 rounded-2xl border border-[#E2E8DF] shadow-lg pointer-events-auto">
          <div className="grid grid-cols-3 divide-x divide-[#E2E8DF] text-center">
            <div className="px-1 sm:px-3">
              <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Image Distance (v)</span>
              <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                {isFinite(calc.imageDistance) ? `${calc.imageDistance.toFixed(1)} cm` : '∞'}
              </span>
            </div>
            <div className="px-1 sm:px-3">
              <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Magnification (m)</span>
              <span className="font-mono text-xs sm:text-base font-bold text-[#17231B] block">
                {calc.magnification === Infinity ? '∞' : calc.magnification.toFixed(2)}
              </span>
            </div>
            <div className="px-1 sm:px-3">
              <span className="block text-[10px] sm:text-[11px] text-[#647067] font-medium truncate">Image Nature</span>
              <span className="text-[10px] sm:text-xs font-bold text-[#17231B] leading-tight block truncate sm:whitespace-normal">
                {calc.imageNature}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Bottom Shutter Controls (Matches Screen 3 Mockup) */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-6 sm:gap-8 pointer-events-auto">
          {/* Gallery / Zoom Toggle Button */}
          <button
            onClick={() => setActiveHudTab(activeHudTab === 'zoom' ? null : 'zoom')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFFFFF]/90 border border-[#E2E8DF] flex items-center justify-center text-[#17231B] hover:bg-[#FFFFFF] active:scale-95 shadow-md cursor-pointer"
            title="Inspect Scale / Zoom"
          >
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#17231B]" />
          </button>

          {/* Big Electric Lime Shutter Button */}
          <button
            onClick={handleShutterClick}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B8D96B] hover:bg-[#a7cb58] border-4 border-[#FFFFFF] ring-2 ring-[#B8D96B]/80 shadow-[0_0_25px_rgba(184,217,107,0.5)] flex items-center justify-center text-[#17231B] active:scale-90 transition-transform cursor-pointer"
            title="Anchor Optical Bench / Capture Reading"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#17231B]" />
          </button>

          {/* Reset / Recenter Button */}
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
            <span>Optical Bench Anchored & Measurement Logged!</span>
          </div>
        )}
      </div>
    </div>
  );
}
