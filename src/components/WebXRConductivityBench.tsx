'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  Eye,
  Sliders,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  createWaterCausticTexture,
  createCausticPoolTexture,
  createBeakerTexture,
} from '@/lib/waterTexture';

interface WebXRConductivityBenchProps {
  state: ConductivityCellState;
  onStateChange?: (updater: (prev: ConductivityCellState) => ConductivityCellState) => void;
}

export function WebXRConductivityBench({ state, onStateChange }: WebXRConductivityBenchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [benchPlaced, setBenchPlaced] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasImmersiveAR, setHasImmersiveAR] = useState(false);
  const [isInXRSession, setIsInXRSession] = useState(false);

  // Dynamic 3D Refs
  const rootRef = useRef<THREE.Group | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidTopRef = useRef<THREE.Mesh | null>(null);
  const causticPoolRef = useRef<THREE.Mesh | null>(null);
  const waterCausticRef = useRef<{ texture: THREE.CanvasTexture; update: (t: number) => void } | null>(null);
  const elLeftRef = useRef<THREE.Group | null>(null);
  const elRightRef = useRef<THREE.Group | null>(null);
  const bulbFilamentRef = useRef<THREE.Mesh | null>(null);
  const bulbLightRef = useRef<THREE.PointLight | null>(null);
  const ionsGroupRef = useRef<THREE.Group | null>(null);
  const bubblesGroupRef = useRef<THREE.Group | null>(null);

  // AR Manipulation State (Move, Zoom, Rotate)
  const [arScale, setArScale] = useState<number>(1.0); // multiplier on base 0.24 scale
  const [arPosition, setArPosition] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: -0.05,
    z: -0.4,
  });
  const [arRotationY, setArRotationY] = useState<number>(0); // in degrees
  const [activeHudTab, setActiveHudTab] = useState<'zoom' | 'move' | 'rotate' | null>('zoom');

  // Keep refs for touch events
  const arScaleRef = useRef(arScale);
  arScaleRef.current = arScale;
  const arPosRef = useRef(arPosition);
  arPosRef.current = arPosition;
  const arRotRef = useRef(arRotationY);
  arRotRef.current = arRotationY;
  const benchPlacedRef = useRef(benchPlaced);
  benchPlacedRef.current = benchPlaced;

  const calc = calculateConductivity(state);

  // Check WebXR
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

  // Initialize Three.js scene with OrbitControls & WebXR
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = cameraActive ? null : new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 30);
    camera.position.set(0, 1.2, 2.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.target.set(0, 0.45, 0);
    controlsRef.current = controls;

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(2, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const cyanRim = new THREE.PointLight(0x00f0ff, 1.0, 8);
    cyanRim.position.set(-2, 1.5, -2);
    scene.add(cyanRim);

    // Apparatus Root Model (Desk Scale in AR: ~35cm wide)
    const root = new THREE.Group();
    const s = 0.24 * arScaleRef.current;
    root.scale.set(s, s, s);
    root.position.set(arPosRef.current.x, arPosRef.current.y, arPosRef.current.z);
    root.rotation.y = THREE.MathUtils.degToRad(arRotRef.current);
    scene.add(root);
    rootRef.current = root;

    // Workbench Mat (only in non-camera mode)
    const matGeo = new THREE.BoxGeometry(4.5, 0.06, 3.2);
    const matMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const workMat = new THREE.Mesh(matGeo, matMaterial);
    workMat.position.y = -0.03;
    workMat.receiveShadow = true;
    root.add(workMat);

    // ==========================================
    // 1. BEAKER & RETORT CLAMP STAND
    // ==========================================
    const beakerArea = new THREE.Group();
    beakerArea.position.set(-0.7, 0, 0);

    // Retort Stand Base
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 1.1), standMat);
    standBase.position.set(-0.5, 0.03, -0.2);
    beakerArea.add(standBase);

    // Retort Vertical Rod
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.3, 16), rodMat);
    standRod.position.set(-0.5, 1.15, -0.5);
    beakerArea.add(standRod);

    // Clamp Arm & Carrier
    const clampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.65, 16), rodMat);
    clampArm.rotation.x = Math.PI / 2;
    clampArm.position.set(-0.5, 1.7, -0.2);
    beakerArea.add(clampArm);

    const carrier = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.08, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    carrier.position.set(0, 1.68, 0);
    beakerArea.add(carrier);

    // Pyrex Glass Beaker with graduation markings
    const beakerTex = createBeakerTexture();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.12,
      side: THREE.DoubleSide,
      map: beakerTex,
    });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.74, 1.55, 32, 1, true), glassMat);
    glass.position.y = 0.78;
    beakerArea.add(glass);

    const botMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.04, 32), glassMat);
    botMesh.position.y = 0.02;
    beakerArea.add(botMesh);

    // Procedural Water Caustic & Dynamic Wave Texture
    const waterCaustic = createWaterCausticTexture(256, 256);
    waterCausticRef.current = waterCaustic;

    // Projected Table Caustic Shimmer Pool Under Beaker
    const poolTex = createCausticPoolTexture(256);
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      opacity: 0.65,
      color: new THREE.Color(calc.solution.colorHex),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const causticPool = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), poolMat);
    causticPool.rotation.x = -Math.PI / 2;
    causticPool.position.set(0, 0.015, 0);
    beakerArea.add(causticPool);
    causticPoolRef.current = causticPool;

    // Fluid Body with realistic depth absorption, transmission, and caustic bump ripples
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      roughness: 0.04,
      ior: 1.333,
      thickness: 0.9,
      attenuationColor: new THREE.Color(calc.solution.colorHex),
      attenuationDistance: 0.55,
      bumpMap: waterCaustic.texture,
      bumpScale: 0.04,
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.15, 32), liquidMat);
    liquid.position.y = 0.6;
    liquidMeshRef.current = liquid;
    beakerArea.add(liquid);

    // Flat Reflective Meniscus Top Surface Disc
    const topGeo = new THREE.CircleGeometry(0.71, 32);
    const topMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.85,
      transparent: true,
      opacity: 0.92,
      roughness: 0.03,
      ior: 1.333,
      bumpMap: waterCaustic.texture,
      bumpScale: 0.045,
    });
    const liquidTop = new THREE.Mesh(topGeo, topMat);
    liquidTop.rotation.x = -Math.PI / 2;
    liquidTop.position.y = 1.17;
    liquidTopRef.current = liquidTop;
    beakerArea.add(liquidTop);

    // Beaker Meniscus Ring on liquid boundary
    const meniscusGeo = new THREE.TorusGeometry(0.71, 0.018, 16, 32);
    const meniscus = new THREE.Mesh(meniscusGeo, liquidMat);
    meniscus.rotation.x = Math.PI / 2;
    meniscus.position.y = 1.17;
    beakerArea.add(meniscus);

    // Platinum Electrodes
    const elMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

    // Anode (+)
    const elLeft = new THREE.Group();
    const plateLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.25, 0.32), elMat);
    plateLeft.position.y = 1.0;
    elLeft.add(plateLeft);
    const clipLeft = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.1), redMat);
    clipLeft.position.y = 1.62;
    elLeft.add(clipLeft);
    elLeftRef.current = elLeft;
    beakerArea.add(elLeft);

    // Cathode (-)
    const elRight = new THREE.Group();
    const plateRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.25, 0.32), elMat);
    plateRight.position.y = 1.0;
    elRight.add(plateRight);
    const clipRight = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.1), blackMat);
    clipRight.position.y = 1.62;
    elRight.add(clipRight);
    elRightRef.current = elRight;
    beakerArea.add(elRight);

    // Bubbles & Ions
    const bubblesGroup = new THREE.Group();
    bubblesGroupRef.current = bubblesGroup;
    beakerArea.add(bubblesGroup);

    const ionsGroup = new THREE.Group();
    ionsGroupRef.current = ionsGroup;
    beakerArea.add(ionsGroup);

    root.add(beakerArea);

    // ==========================================
    // 2. DC POWER SUPPLY INSTRUMENT
    // ==========================================
    const psuGroup = new THREE.Group();
    psuGroup.position.set(1.2, 0.4, -0.45);

    const psuChassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    psuGroup.add(psuChassis);

    // Digital Voltage Display (Glowing blue)
    const ledDisp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.48, 0.22),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    ledDisp.position.set(-0.2, 0.15, 0.46);
    psuGroup.add(ledDisp);

    root.add(psuGroup);

    // ==========================================
    // 3. GLOWING EDISON BULB
    // ==========================================
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(1.2, 0.12, 0.7);

    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.26, 0.24, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
    );
    bulbGroup.add(socket);

    const bulbDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.88, transparent: true, roughness: 0.05 })
    );
    bulbDome.position.y = 0.45;
    bulbGroup.add(bulbDome);

    const filament = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.015, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 })
    );
    filament.position.y = 0.45;
    bulbFilamentRef.current = filament;
    bulbGroup.add(filament);

    const bulbLight = new THREE.PointLight(0xffea00, 0, 6);
    bulbLight.position.y = 0.5;
    bulbLightRef.current = bulbLight;
    bulbGroup.add(bulbLight);

    root.add(bulbGroup);

    // ==========================================
    // 4. CIRCUIT WIRES
    // ==========================================
    const c1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.0, 0.2, -0.05),
      new THREE.Vector3(0.3, 0.6, -0.3),
      new THREE.Vector3(-0.7 - (state.electrodeDistance * 0.04), 1.6, 0),
    ]);
    const wire1 = new THREE.Mesh(new THREE.TubeGeometry(c1, 24, 0.018, 8, false), redMat);
    root.add(wire1);

    const c2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7 + (state.electrodeDistance * 0.04), 1.6, 0),
      new THREE.Vector3(0.2, 0.4, 0.4),
      new THREE.Vector3(1.0, 0.15, 0.7),
    ]);
    const wire2 = new THREE.Mesh(new THREE.TubeGeometry(c2, 24, 0.018, 8, false), blackMat);
    root.add(wire2);

    // ==========================================
    // 5. WEBXR HIT-TEST RETICLE
    // ==========================================
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: any = null;
    renderer.xr.addEventListener('sessionstart', async () => {
      setIsInXRSession(true);
      const session = renderer.xr.getSession() as any;
      if (session) {
        const viewerSpace = await session.requestReferenceSpace('viewer');
        hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      }
    });

    renderer.xr.addEventListener('sessionend', () => {
      setIsInXRSession(false);
      hitTestSource = null;
    });

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', () => {
      if (reticle.visible && rootRef.current) {
        rootRef.current.position.setFromMatrixPosition(reticle.matrix);
        rootRef.current.quaternion.setFromRotationMatrix(reticle.matrix);
        setArPosition({
          x: rootRef.current.position.x,
          y: rootRef.current.position.y,
          z: rootRef.current.position.z,
        });
        setBenchPlaced(true);
      }
    });
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
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Only use controls when not in immersive WebXR session
      if (!renderer.xr.isPresenting) {
        controls.update();
      }

      // Animate drifting ions
      if (ionsGroupRef.current && state.isPowerOn && calc.circuitCurrent > 0.001) {
        ionsGroupRef.current.children.forEach((ion: any) => {
          if (ion.userData.isCation) {
            ion.position.x += 0.005;
            if (ion.position.x > 0.3) ion.position.x = -0.3;
          } else {
            ion.position.x -= 0.005;
            if (ion.position.x < -0.3) ion.position.x = 0.3;
          }
        });
      }

      // Rising electrolysis bubbles
      if (bubblesGroupRef.current && state.isPowerOn && calc.circuitCurrent_mA > 15) {
        bubblesGroupRef.current.children.forEach((b: any) => {
          b.position.y += b.userData.speed;
          if (b.position.y > 1.15) b.position.y = 0.25;
        });
      }

      // Animate dynamic fluid water caustics & table pool shimmer
      if (waterCausticRef.current) {
        waterCausticRef.current.update(elapsed);
      }
      if (causticPoolRef.current) {
        causticPoolRef.current.rotation.z = elapsed * 0.08;
        (causticPoolRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 2.5) * 0.12;
      }

      renderer.render(scene, camera);
    };
    animate();

    // WebXR frame hit-testing loop
    renderer.setAnimationLoop((time, frame) => {
      const elapsed = time * 0.001;
      if (waterCausticRef.current) {
        waterCausticRef.current.update(elapsed);
      }
      if (causticPoolRef.current) {
        causticPoolRef.current.rotation.z = elapsed * 0.08;
        (causticPoolRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 2.5) * 0.12;
      }

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
      cancelAnimationFrame(animId);
      domEl.removeEventListener('touchstart', handleTouchStart);
      domEl.removeEventListener('touchmove', handleTouchMove);
      domEl.removeEventListener('touchend', handleTouchEnd);
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [cameraActive]);

  // Synchronize AR Scale, Position, and Rotation to 3D Cell
  useEffect(() => {
    if (!rootRef.current) return;
    const s = 0.24 * arScale;
    rootRef.current.scale.set(s, s, s);
    rootRef.current.position.set(arPosition.x, arPosition.y, arPosition.z);
    rootRef.current.rotation.y = THREE.MathUtils.degToRad(arRotationY);
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

  const resetAllTransforms = () => {
    setArScale(1.0);
    setArPosition({ x: 0, y: -0.05, z: -0.4 });
    setArRotationY(0);
    setBenchPlaced(false);
  };

  // Update dynamic properties
  useEffect(() => {
    const halfDist = (state.electrodeDistance / 2) * 0.07;
    if (elLeftRef.current) elLeftRef.current.position.x = -halfDist;
    if (elRightRef.current) elRightRef.current.position.x = halfDist;

    if (liquidMeshRef.current) {
      const mat = liquidMeshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color.set(calc.solution.colorHex);
      mat.attenuationColor.set(calc.solution.colorHex);
    }

    if (liquidTopRef.current) {
      (liquidTopRef.current.material as THREE.MeshPhysicalMaterial).color.set(calc.solution.colorHex);
    }

    if (causticPoolRef.current) {
      (causticPoolRef.current.material as THREE.MeshBasicMaterial).color.set(calc.solution.colorHex);
    }

    if (bulbFilamentRef.current && bulbLightRef.current) {
      const filMat = bulbFilamentRef.current.material as THREE.MeshStandardMaterial;
      const bRatio = calc.bulbBrightnessPercent / 100;
      if (state.isPowerOn && bRatio > 0.02) {
        const glowHex = bRatio > 0.4 ? 0xffea00 : 0xf97316;
        filMat.emissive.setHex(glowHex);
        filMat.emissiveIntensity = bRatio * 3.5;
        bulbLightRef.current.intensity = bRatio * 4.5;
        bulbLightRef.current.color.setHex(glowHex);
      } else {
        filMat.emissive.setHex(0x000000);
        filMat.emissiveIntensity = 0;
        bulbLightRef.current.intensity = 0;
      }
    }

    // Recreate Ions
    if (ionsGroupRef.current) {
      while (ionsGroupRef.current.children.length > 0) {
        ionsGroupRef.current.remove(ionsGroupRef.current.children[0]);
      }

      if (calc.ionsActiveCount > 0) {
        const catMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(calc.solution.cation.color),
          emissive: new THREE.Color(calc.solution.cation.color),
          emissiveIntensity: 0.8,
        });
        const anMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(calc.solution.anion.color),
          emissive: new THREE.Color(calc.solution.anion.color),
          emissiveIntensity: 0.8,
        });
        const sphereGeo = new THREE.SphereGeometry(0.035, 12, 12);

        for (let i = 0; i < Math.min(40, calc.ionsActiveCount); i++) {
          const isCation = i % 2 === 0;
          const ionMesh = new THREE.Mesh(sphereGeo, isCation ? catMat : anMat);
          ionMesh.position.set(
            (Math.random() - 0.5) * 0.6,
            0.3 + Math.random() * 0.7,
            (Math.random() - 0.5) * 0.6
          );
          (ionMesh as any).userData = { isCation };
          ionsGroupRef.current.add(ionMesh);
        }
      }
    }

    // Recreate Bubbles
    if (bubblesGroupRef.current) {
      while (bubblesGroupRef.current.children.length > 0) {
        bubblesGroupRef.current.remove(bubblesGroupRef.current.children[0]);
      }

      if (state.isPowerOn && calc.circuitCurrent_mA > 15) {
        const bubbleMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, transparent: true });
        const bGeo = new THREE.SphereGeometry(0.016, 8, 8);
        for (let b = 0; b < 18; b++) {
          const bubble = new THREE.Mesh(bGeo, bubbleMat);
          const xBase = b % 2 === 0 ? halfDist : -halfDist;
          bubble.position.set(
            xBase + (Math.random() - 0.5) * 0.06,
            0.25 + Math.random() * 0.8,
            (Math.random() - 0.5) * 0.25
          );
          (bubble as any).userData = { speed: 0.005 + Math.random() * 0.006 };
          bubblesGroupRef.current.add(bubble);
        }
      }
    }
  }, [state, calc.solution, calc.bulbBrightnessPercent, calc.ionsActiveCount]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
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
      {/* Capability Notification Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#090e1a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Augmented Reality Beaker Placement</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                {hasImmersiveAR ? 'WebXR AR Supported' : 'Interactive 3D / Camera Fallback'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Anchor the Pyrex beaker, retort stand, platinum electrodes, and glowing bulb on your physical study desk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 flex items-center gap-2 transition-all shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Camera Feed AR</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 flex items-center gap-2"
            >
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3D / AR Viewport */}
      <div className="relative w-full h-[58vh] min-h-[460px] max-h-[620px] sm:h-[580px] rounded-2xl overflow-hidden border border-slate-800 bg-[#060913] shadow-2xl">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover z-0 ${cameraActive ? 'opacity-90' : 'hidden'}`}
        />
        <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full touch-none" />

        {/* Top-Left HUD */}
        <div className="absolute top-4 left-4 z-20 bg-[#090e1a]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1 max-w-sm">
          <div className="flex items-center gap-2 font-bold text-white">
            <Scan className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{benchPlaced ? 'Apparatus Anchored to Table' : 'Scanning Surface Plane'}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {benchPlaced
              ? 'Anchored. Drag with 1 finger to rotate, 2 fingers to move, or pinch to zoom.'
              : 'Aim camera at table or floor. Drag with mouse/touch in 3D studio mode.'}
          </p>
        </div>

        {/* Top-Right: Quick Reset & Tab Toggles */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setActiveHudTab(activeHudTab ? null : 'zoom')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md ${
              activeHudTab
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#090e1a]/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
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
          <div className="absolute top-16 right-4 z-20 w-[calc(100%-32px)] max-w-xs sm:w-80 bg-[#090e1a]/95 backdrop-blur-lg border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4">
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveHudTab('zoom')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'zoom' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </button>
                <button
                  onClick={() => setActiveHudTab('move')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'move' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
                <button
                  onClick={() => setActiveHudTab('rotate')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeHudTab === 'rotate' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {arScale.toFixed(2)}x ({(arScale * 35).toFixed(0)} cm)
              </span>
            </div>

            {/* TAB 1: ZOOM & SCALE */}
            {activeHudTab === 'zoom' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apparatus Scale</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustZoom(-0.1)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-300 text-xs font-bold w-12 text-center">
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
                  className="w-full accent-amber-400 cursor-pointer"
                />

                {/* Quick Size Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Mini', val: 0.5 },
                    { label: 'Desk', val: 0.8 },
                    { label: '100%', val: 1.0 },
                    { label: 'Large', val: 1.8 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setArScale(p.val)}
                      className={`py-1 rounded text-[11px] font-semibold border transition-all ${
                        Math.abs(arScale - p.val) < 0.04
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
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
                    <Move className="w-3.5 h-3.5 text-amber-400" />
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
                      <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <div />

                    <button
                      onClick={() => moveBench(-0.06, 0, 0)}
                      title="Move Left"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => setArPosition({ x: 0, y: -0.05, z: -0.4 })}
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
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    <div />
                    <button
                      onClick={() => moveBench(0, 0, 0.06)}
                      title="Move Backward"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
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
                      <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => moveBench(0, -0.04, 0)}
                      title="Lower Down"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
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
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Azimuth Angle</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold text-xs">{arRotationY.toFixed(0)}°</span>
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
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto bg-[#0a0f1d]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs flex items-center gap-3 font-mono shadow-2xl">
            <span className="font-bold text-white text-sm">{calc.solution.formula}</span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-amber-300 text-sm">{calc.circuitCurrent_mA} mA</span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-cyan-300">κ = {calc.specificConductivity_mS_cm} mS/cm</span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-emerald-300">{calc.bulbState} ({calc.bulbBrightnessPercent}%)</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                setBenchPlaced(false);
                setArPosition({ x: 0, y: -0.05, z: -0.4 });
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Position</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
