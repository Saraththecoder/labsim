'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  calculateConductivity,
  ConductivityCellState,
  SOLUTIONS_DATABASE,
} from '@/lib/conductivityPhysics';
import {
  Smartphone,
  Scan,
  CheckCircle2,
  Camera,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface WebXRConductivityBenchProps {
  state: ConductivityCellState;
  onStateChange?: (updater: (prev: ConductivityCellState) => ConductivityCellState) => void;
}

export function WebXRConductivityBench({ state, onStateChange }: WebXRConductivityBenchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [benchPlaced, setBenchPlaced] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasImmersiveAR, setHasImmersiveAR] = useState(false);

  const calc = calculateConductivity(state);

  useEffect(() => {
    async function checkXR() {
      if (typeof navigator !== 'undefined' && 'xr' in navigator) {
        try {
          const supp = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setHasImmersiveAR(!!supp);
        } catch {
          setHasImmersiveAR(false);
        }
      }
    }
    checkXR();
  }, []);

  // Three.js AR / 3D Canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.01, 20);
    camera.position.set(0, 0.35, 0.85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    container.replaceChildren(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // Apparatus Root Model
    const root = new THREE.Group();
    root.scale.set(0.18, 0.18, 0.18);
    root.position.set(0, -0.15, -0.5);
    scene.add(root);

    // Beaker
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.05 });
    const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.68, 1.4, 24, 1, true), glassMat);
    beaker.position.set(-0.6, 0.7, 0);
    root.add(beaker);

    // Liquid inside beaker
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.8,
      transparent: true,
      roughness: 0.1,
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 1.0, 24), liquidMat);
    liquid.position.set(-0.6, 0.52, 0);
    root.add(liquid);

    // Electrodes
    const elMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    const elLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.3), elMat);
    elLeft.position.set(-0.6 - (state.electrodeDistance * 0.04), 0.7, 0);
    root.add(elLeft);

    const elRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.3), elMat);
    elRight.position.set(-0.6 + (state.electrodeDistance * 0.04), 0.7, 0);
    root.add(elRight);

    // Bulb and socket
    const bulbMat = new THREE.MeshStandardMaterial({
      color: calc.bulbBrightnessPercent > 10 ? 0xffea00 : 0x334155,
      emissive: calc.bulbBrightnessPercent > 10 ? 0xffea00 : 0x000000,
      emissiveIntensity: (calc.bulbBrightnessPercent / 100) * 2,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bulbMat);
    bulb.position.set(0.8, 0.45, 0);
    root.add(bulb);

    // Hit-testing Reticle
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.13, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: any = null;
    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession() as any;
      if (session) {
        const viewerSpace = await session.requestReferenceSpace('viewer');
        hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      }
    });

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (reticle.visible) {
        root.position.setFromMatrixPosition(reticle.matrix);
        setBenchPlaced(true);
      }
    });
    scene.add(controller);

    renderer.setAnimationLoop((time, frame) => {
      if (frame && hitTestSource) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        if (referenceSpace) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(referenceSpace);
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
            }
          } else {
            reticle.visible = false;
          }
        }
      }
      renderer.render(scene, camera);
    });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [state, calc.solution, calc.bulbBrightnessPercent]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Augmented Reality Beaker Placement</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {hasImmersiveAR ? 'WebXR AR Supported' : 'Camera Fallback / 3D'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Anchor the electrochemical conductivity apparatus on your real physical desk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Camera Feed AR</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800"
            >
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#060a12] shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraActive ? 'opacity-90' : 'hidden'}`}
        />
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full" />

        <div className="absolute top-4 left-4 z-20 bg-[#090e1a]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs shadow-lg">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{benchPlaced ? 'Apparatus Anchored' : 'Scanning Surface Plane'}</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs flex items-center gap-3 font-mono">
            <span className="font-bold text-white">{calc.solution.formula}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300">{calc.circuitCurrent_mA} mA</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300">κ = {calc.specificConductivity_mS_cm} mS/cm</span>
          </div>
          <button
            onClick={() => setBenchPlaced(false)}
            className="pointer-events-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Position</span>
          </button>
        </div>
      </div>
    </div>
  );
}
