'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateOptics, generatePrincipalRays, LensSystemState } from '@/lib/physics';
import {
  RotateCcw,
  Eye,
  Maximize2,
  Minimize2,
  Crosshair,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface OpticalBench3DProps {
  focalLength: number;
  objectPos: number; // in cm on 100cm bench, e.g. 20 cm
  lensPos: number; // in cm on 100cm bench, e.g. 50 cm
  screenPos: number; // in cm on 100cm bench, e.g. 80 cm
  objectHeight?: number; // ho in cm
  onObjectPosChange?: (pos: number) => void;
  onLensPosChange?: (pos: number) => void;
  onScreenPosChange?: (pos: number) => void;
  showRays?: boolean;
  className?: string;
}

export function OpticalBench3D({
  focalLength,
  objectPos,
  lensPos,
  screenPos,
  objectHeight = 5,
  onObjectPosChange,
  onLensPosChange,
  onScreenPosChange,
  showRays = true,
  className = '',
}: OpticalBench3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Object Groups
  const objectUprightRef = useRef<THREE.Group | null>(null);
  const lensUprightRef = useRef<THREE.Group | null>(null);
  const screenUprightRef = useRef<THREE.Group | null>(null);
  const raysGroupRef = useRef<THREE.Group | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraAngle, setCameraAngle] = useState<'perspective' | 'side' | 'top' | 'screen'>('perspective');

  // Convert bench cm (0 to 100 cm) to 3D units (-5 to +5 meters)
  // Let 10 cm = 1.0 unit in 3D
  const cmTo3D = (cm: number) => (cm - 50) * 0.1;

  // Calculate current physics
  const u = Math.max(0.1, lensPos - objectPos);
  const screenDist = Math.max(0, screenPos - lensPos);
  const state: LensSystemState = {
    focalLength,
    objectDistance: u,
    objectHeight,
    screenDistance: screenDist,
    lensPosition: lensPos,
  };
  const calc = calculateOptics(state);

  // Draw projected image on 2D screen canvas texture
  const updateScreenTexture = () => {
    if (!screenCanvasRef.current || !screenTextureRef.current) return;
    const canvas = screenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines on ground glass
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    const step = 25;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Cross-hairs
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const isReal = calc.isReal;
    const imageV = calc.imageDistance;
    const actualScreenDist = screenDist;

    if (!isReal) {
      // Virtual image - not formed on physical screen
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Virtual Image', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '11px sans-serif';
      ctx.fillText('(Cannot be captured on screen)', canvas.width / 2, canvas.height / 2 + 12);
      ctx.fillText('Look through the lens to view', canvas.width / 2, canvas.height / 2 + 30);
    } else {
      // Circle of confusion / blur
      const distFromFocalPlane = Math.abs(actualScreenDist - imageV);
      const blurPx = Math.min(45, (distFromFocalPlane / Math.max(imageV, 5)) * 60);

      ctx.save();
      if (blurPx > 0.5) {
        ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
      }

      // Draw projected luminous arrow
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // Inverted arrow: base at center, tip pointing DOWN
      const scaledHeight = Math.min(110, Math.abs(calc.imageHeight) * 9);

      // Glowing flame / arrow gradient
      const grad = ctx.createLinearGradient(centerX, centerY, centerX, centerY + scaledHeight);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.7, '#ef4444');
      grad.addColorStop(1, '#dc2626');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 3;

      // Draw downward-pointing inverted arrow
      ctx.beginPath();
      // Arrow shaft
      ctx.rect(centerX - 5, centerY, 10, scaledHeight - 20);
      ctx.fill();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + scaledHeight);
      ctx.lineTo(centerX - 18, centerY + scaledHeight - 24);
      ctx.lineTo(centerX + 18, centerY + scaledHeight - 24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Sharpness indicator overlay on screen border
      if (calc.isFocused) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ IN FOCUS (Sharp Image) ★', canvas.width / 2, 22);
      }
    }

    screenTextureRef.current.needsUpdate = true;
  };

  // Build / update 3D rays
  const updateRays3D = () => {
    if (!raysGroupRef.current || !sceneRef.current) return;
    const group = raysGroupRef.current;

    // Remove existing ray meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
    }

    if (!showRays) return;

    const rays = generatePrincipalRays(state, calc);
    const lensX3D = cmTo3D(lensPos);

    rays.forEach((ray) => {
      // Main ray points
      const points: THREE.Vector3[] = ray.points.map((pt) => {
        // Physics pt.x is relative to lens (0)
        // Global 3D X = cmTo3D(lensPos + pt.x)
        const globalX = cmTo3D(lensPos + pt.x);
        const globalY = 1.0 + (pt.y || 0) * 0.1; // optical axis is at y = 1.0
        return new THREE.Vector3(globalX, globalY, 0);
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(ray.color),
        linewidth: 3,
        transparent: true,
        opacity: 0.95,
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);

      // Virtual extensions
      if (ray.virtualPoints && ray.virtualPoints.length > 0) {
        const vPoints: THREE.Vector3[] = ray.virtualPoints.map((pt) => {
          const globalX = cmTo3D(lensPos + pt.x);
          const globalY = 1.0 + (pt.y || 0) * 0.1;
          return new THREE.Vector3(globalX, globalY, 0);
        });

        const vGeom = new THREE.BufferGeometry().setFromPoints(vPoints);
        const vMat = new THREE.LineDashedMaterial({
          color: new THREE.Color(ray.color),
          dashSize: 0.08,
          gapSize: 0.04,
          transparent: true,
          opacity: 0.65,
        });
        const vLine = new THREE.Line(vGeom, vMat);
        vLine.computeLineDistances();
        group.add(vLine);
      }
    });
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // prevent going below floor
    controls.minDistance = 1.5;
    controls.maxDistance = 14;
    controls.target.set(0, 1.0, 0); // focus on optical axis
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const blueRimLight = new THREE.PointLight(0x00f0ff, 1.2, 12);
    blueRimLight.position.set(0, 2.5, -2);
    scene.add(blueRimLight);

    // Laboratory Floor Grid
    const gridHelper = new THREE.GridHelper(18, 36, 0x00d4ff, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // ==========================================
    // OPTICAL BENCH BED & RAILS (0 to 100 cm)
    // ==========================================
    const benchGroup = new THREE.Group();

    // Heavy Cast Iron Bed Base
    const bedGeo = new THREE.BoxGeometry(11.2, 0.25, 1.2);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(0, 0.125, 0);
    bedMesh.receiveShadow = true;
    benchGroup.add(bedMesh);

    // Dual Stainless Steel Cylindrical Rails
    const railGeo = new THREE.CylinderGeometry(0.045, 0.045, 10.8, 32);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });

    const frontRail = new THREE.Mesh(railGeo, railMat);
    frontRail.rotation.z = Math.PI / 2;
    frontRail.position.set(0, 0.3, 0.35);
    benchGroup.add(frontRail);

    const backRail = new THREE.Mesh(railGeo, railMat);
    backRail.rotation.z = Math.PI / 2;
    backRail.position.set(0, 0.3, -0.35);
    benchGroup.add(backRail);

    // Metric Scale Plate (0 to 100 cm markings)
    const scaleGeo = new THREE.PlaneGeometry(10.0, 0.12);
    // Canvas texture for scale markings
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = 2048;
    scaleCanvas.height = 128;
    const sCtx = scaleCanvas.getContext('2d');
    if (sCtx) {
      sCtx.fillStyle = '#0f172a';
      sCtx.fillRect(0, 0, scaleCanvas.width, scaleCanvas.height);
      sCtx.fillStyle = '#f8fafc';
      sCtx.strokeStyle = '#38bdf8';
      sCtx.lineWidth = 2;
      sCtx.font = 'bold 22px monospace';

      for (let i = 0; i <= 100; i++) {
        const x = (i / 100) * (scaleCanvas.width - 40) + 20;
        const isTen = i % 10 === 0;
        const isFive = i % 5 === 0;
        const tickH = isTen ? 45 : isFive ? 30 : 15;

        sCtx.beginPath();
        sCtx.moveTo(x, scaleCanvas.height);
        sCtx.lineTo(x, scaleCanvas.height - tickH);
        sCtx.stroke();

        if (isTen) {
          sCtx.textAlign = 'center';
          sCtx.fillText(`${i}`, x, scaleCanvas.height - tickH - 8);
        }
      }
    }
    const scaleTex = new THREE.CanvasTexture(scaleCanvas);
    const scaleMat = new THREE.MeshBasicMaterial({ map: scaleTex });
    const scaleMesh = new THREE.Mesh(scaleGeo, scaleMat);
    scaleMesh.position.set(0, 0.28, 0.58);
    scaleMesh.rotation.x = -Math.PI / 6;
    benchGroup.add(scaleMesh);

    scene.add(benchGroup);

    // ==========================================
    // UPRIGHT 1: OBJECT (Illuminated Arrow/Candle)
    // ==========================================
    const objectGroup = new THREE.Group();

    // Slider base on bench rails
    const objBaseGeo = new THREE.BoxGeometry(0.45, 0.2, 0.85);
    const sliderMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });
    const objBase = new THREE.Mesh(objBaseGeo, sliderMat);
    objBase.position.y = 0.35;
    objectGroup.add(objBase);

    // Vertical Upright Pillar (Chrome)
    const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const objPillar = new THREE.Mesh(pillarGeo, pillarMat);
    objPillar.position.set(0, 0.68, 0);
    objectGroup.add(objPillar);

    // Glowing Object Arrow
    const arrowShaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 16);
    const arrowAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
    });
    const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowAmberMat);
    arrowShaft.position.set(0, 1.0, 0); // optical axis at y=1.0
    objectGroup.add(arrowShaft);

    // Arrow Tip Cone
    const arrowTipGeo = new THREE.ConeGeometry(0.05, 0.12, 16);
    const arrowTip = new THREE.Mesh(arrowTipGeo, arrowAmberMat);
    arrowTip.position.set(0, 1.25, 0);
    objectGroup.add(arrowTip);

    // Warm Glow Light from Object
    const objectLight = new THREE.PointLight(0xf59e0b, 1.8, 2.5);
    objectLight.position.set(0, 1.2, 0);
    objectGroup.add(objectLight);

    objectUprightRef.current = objectGroup;
    scene.add(objectGroup);

    // ==========================================
    // UPRIGHT 2: CONVEX LENS (Glass with brass ring)
    // ==========================================
    const lensGroup = new THREE.Group();

    // Lens slider base
    const lensBase = new THREE.Mesh(objBaseGeo, sliderMat);
    lensBase.position.y = 0.35;
    lensGroup.add(lensBase);

    // Upright pillar
    const lensPillar = new THREE.Mesh(pillarGeo, pillarMat);
    lensPillar.position.set(0, 0.68, 0);
    lensGroup.add(lensPillar);

    // Circular Brass Holder Ring
    const ringGeo = new THREE.TorusGeometry(0.35, 0.03, 16, 48);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, brassMat);
    ringMesh.rotation.y = Math.PI / 2;
    ringMesh.position.set(0, 1.0, 0);
    lensGroup.add(ringMesh);

    // Double Convex Lens (Glass Sphere squeezed on X-axis)
    const glassGeo = new THREE.SphereGeometry(0.34, 32, 32);
    glassGeo.scale(0.3, 1.0, 1.0); // thin along X
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52, // Crown glass refractive index
      thickness: 0.2,
      reflectivity: 0.9,
    });
    const lensMesh = new THREE.Mesh(glassGeo, glassMat);
    lensMesh.position.set(0, 1.0, 0);
    lensGroup.add(lensMesh);

    lensUprightRef.current = lensGroup;
    scene.add(lensGroup);

    // ==========================================
    // UPRIGHT 3: PROJECTION SCREEN (Ground Glass)
    // ==========================================
    const screenGroup = new THREE.Group();

    // Screen base
    const screenBase = new THREE.Mesh(objBaseGeo, sliderMat);
    screenBase.position.y = 0.35;
    screenGroup.add(screenBase);

    // Screen pillar
    const screenPillar = new THREE.Mesh(pillarGeo, pillarMat);
    screenPillar.position.set(0, 0.68, 0);
    screenGroup.add(screenPillar);

    // Screen Canvas for dynamic projection
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 512;
    screenCanvasRef.current = screenCanvas;
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTextureRef.current = screenTexture;

    // Ground Glass Screen Plate
    const screenPlateGeo = new THREE.BoxGeometry(0.02, 0.75, 0.75);
    const screenPlateMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.4,
      metalness: 0.1,
    });
    const screenPlate = new THREE.Mesh(screenPlateGeo, screenPlateMat);
    screenPlate.rotation.y = Math.PI / 2;
    screenPlate.position.set(0, 1.0, 0);
    screenPlate.castShadow = true;
    screenPlate.receiveShadow = true;
    screenGroup.add(screenPlate);

    screenUprightRef.current = screenGroup;
    scene.add(screenGroup);

    // ==========================================
    // 3D LIGHT RAYS GROUP
    // ==========================================
    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update positions and visual elements when props change
  useEffect(() => {
    if (objectUprightRef.current) {
      objectUprightRef.current.position.x = cmTo3D(objectPos);
    }
    if (lensUprightRef.current) {
      lensUprightRef.current.position.x = cmTo3D(lensPos);
    }
    if (screenUprightRef.current) {
      screenUprightRef.current.position.x = cmTo3D(screenPos);
    }

    updateScreenTexture();
    updateRays3D();
  }, [objectPos, lensPos, screenPos, focalLength, objectHeight, showRays]);

  // Camera preset handler
  const setCameraView = (view: 'perspective' | 'side' | 'top' | 'screen') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraAngle(view);

    if (view === 'perspective') {
      camera.position.set(0, 3.0, 5.2);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'side') {
      // True Orthogonal-style side view for clear ray tracing
      camera.position.set(0, 1.0, 6.2);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'top') {
      // Top down view of optical bench
      camera.position.set(0, 7.0, 0.05);
      controls.target.set(0, 0.3, 0);
    } else if (view === 'screen') {
      // Looking directly at projection screen
      const screenX = cmTo3D(screenPos);
      camera.position.set(screenX + 1.2, 1.0, 0);
      controls.target.set(screenX, 1.0, 0);
    }
    controls.update();
  };

  // Snap screen to exact focal position
  const snapScreenToFocus = () => {
    if (!calc.isReal || !isFinite(calc.imageDistance) || !onScreenPosChange) return;
    const exactScreenPos = Number((lensPos + calc.imageDistance).toFixed(1));
    if (exactScreenPos <= 100) {
      onScreenPosChange(exactScreenPos);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[540px]'
      } ${className}`}
    >
      {/* Top HUD Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Bench Position Indicators */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Object:</span>
            <span className="font-mono font-bold text-amber-300">{objectPos.toFixed(1)} cm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">Lens:</span>
            <span className="font-mono font-bold text-cyan-300">{lensPos.toFixed(1)} cm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">Screen:</span>
            <span className="font-mono font-bold text-white">{screenPos.toFixed(1)} cm</span>
          </div>
        </div>

        {/* Right: Camera Presets & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg">
          <button
            onClick={() => setCameraView('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'perspective' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setCameraView('side')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'side' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ray View (Side)
          </button>
          <button
            onClick={() => setCameraView('screen')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraAngle === 'screen' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Screen View
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

      {/* Screen Focus Banner (Bottom overlay inside 3D viewport) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl flex items-center gap-3">
          {calc.isFocused ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Screen in Focus (Sharp Image)
                </p>
                <p className="text-[11px] text-slate-300">
                  Screen matched at v = {calc.imageDistance.toFixed(1)} cm
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
                <p className="text-xs font-bold text-purple-300">Virtual Image</p>
                <p className="text-[11px] text-slate-400">Cannot be projected on screen (Look through lens)</p>
              </div>
            </div>
          )}

          {calc.isReal && !calc.isFocused && onScreenPosChange && (
            <button
              onClick={snapScreenToFocus}
              className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Snap to Focus</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click & drag to rotate • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
