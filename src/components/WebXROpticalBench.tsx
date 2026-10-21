'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
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

  // Initialize WebXR or 3D overlay renderer
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 20);
    camera.position.set(0, 0.35, 0.9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(2, 4, 3);
    scene.add(sun);

    // Optical Bench Root Model
    const benchRoot = new THREE.Group();
    // Scale for real world AR: 1 meter bench
    benchRoot.scale.set(0.18, 0.18, 0.18);
    benchRoot.position.set(0, -0.15, -0.6);
    scene.add(benchRoot);

    // Bed and Rails
    const bedGeo = new THREE.BoxGeometry(6.0, 0.15, 0.7);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
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

    // Uprights: Object, Lens, Screen
    const objGroup = new THREE.Group();
    const lensGroup = new THREE.Group();
    const screenGroup = new THREE.Group();
    const raysGroup = new THREE.Group();

    // Object Arrow
    const objMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2 });
    const objShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16), objMat);
    objShaft.position.y = 0.45;
    objGroup.add(objShaft);
    const objTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 16), objMat);
    objTip.position.y = 0.68;
    objGroup.add(objTip);
    benchRoot.add(objGroup);

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
      new THREE.MeshPhysicalMaterial({ color: 0xa5f3fc, transmission: 0.9, roughness: 0.05 })
    );
    lensGlass.scale.set(0.25, 1.0, 1.0);
    lensGlass.position.y = 0.55;
    lensGroup.add(lensGlass);
    benchRoot.add(lensGroup);

    // Screen
    const screenMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    screenMesh.position.y = 0.55;
    screenGroup.add(screenMesh);
    benchRoot.add(screenGroup);

    benchRoot.add(raysGroup);

    // Helper to position items according to bench cm
    const updatePositions = () => {
      // 0 to 100 cm maps to -2.5 to +2.5 along X in bench root
      const cmToRootX = (cm: number) => (cm - 50) * 0.05;
      objGroup.position.x = cmToRootX(objectPos);
      lensGroup.position.x = cmToRootX(lensPos);
      screenGroup.position.x = cmToRootX(screenPos);

      // Recreate rays
      while (raysGroup.children.length > 0) {
        raysGroup.remove(raysGroup.children[0]);
      }
      const rays = generatePrincipalRays(state, calc);
      rays.forEach((ray) => {
        const pts = ray.points.map((p) => {
          return new THREE.Vector3(cmToRootX(lensPos + p.x), 0.55 + (p.y || 0) * 0.05, 0);
        });
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(ray.color), linewidth: 2 });
        raysGroup.add(new THREE.Line(geom, mat));
      });
    };
    updatePositions();

    // Hit-testing Reticle for Real WebXR
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: any = null;
    let hitTestSourceRequested = false;

    // WebXR session start listener
    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession() as any;
      if (!session) return;

      const viewerSpace = await session.requestReferenceSpace('viewer');
      const hitTestSrc = await session.requestHitTestSource({ space: viewerSpace });
      hitTestSource = hitTestSrc;
    });

    // Touch tap to place on detected surface
    const onSelect = () => {
      if (reticle.visible) {
        benchRoot.position.setFromMatrixPosition(reticle.matrix);
        benchRoot.quaternion.setFromRotationMatrix(reticle.matrix);
        setBenchPlaced(true);
      }
    };
    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

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

      // Gentle rotation when in studio mode
      if (activeMode === 'studio') {
        benchRoot.rotation.y += 0.002;
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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [objectPos, lensPos, screenPos, focalLength, activeMode]);

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
                ? 'Your device supports WebXR hit-testing. Tap "Launch Immersive AR" to place the bench in your room.'
                : 'Immersive surface-anchored AR requires WebXR on Android Chrome (ARCore). Use the Camera AR mode or 3D Virtual Studio below.'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          {deviceDiagnostics.hasCamera && !cameraActive && !deviceDiagnostics.hasImmersiveAR && (
            <button
              onClick={startCameraFeed}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2 transition-all"
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
      <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 bg-[#060a12] shadow-2xl">
        {/* Background Video stream for Camera Fallback mode */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraActive ? 'opacity-90' : 'hidden'}`}
        />

        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full" />

        {/* AR Placement HUD overlay */}
        <div className="absolute top-4 left-4 z-20 bg-[#090e1a]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs shadow-lg space-y-1">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              {benchPlaced ? 'Optical Bench Placed' : 'Surface Scanning & Placement Mode'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {benchPlaced
              ? 'Bench anchored. Move around with your device to view ray refraction from all angles.'
              : 'Aim camera at table or floor to project light rays in real space.'}
          </p>
        </div>

        {/* Live Optics Status Tag */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
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
              onClick={() => setBenchPlaced(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>
      </div>

      {/* AR Instructions & Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Scan className="w-4 h-4" />
            <span>1. Surface Detection</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Move your mobile device steadily over a flat tabletop or floor with good ambient lighting. The blue reticle will lock onto the detected surface plane.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sliders className="w-4 h-4" />
            <span>2. Real-Time Ray Tracing</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adjust the slider positions of the object, convex lens, and screen. The three principal rays and refracted beams update dynamically in augmented reality space.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a]/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Crosshair className="w-4 h-4" />
            <span>3. Classroom Collaboration</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Walk around the bench to verify real inverted images on the virtual screen or look through the lens to observe magnified virtual images ($u &lt; f$).
          </p>
        </div>
      </div>
    </div>
  );
}
