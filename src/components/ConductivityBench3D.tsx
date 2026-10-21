'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  calculateConductivity,
  ConductivityCellState,
} from '@/lib/conductivityPhysics';
import {
  Maximize2,
  Minimize2,
  Zap,
  Eye,
  Sliders,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { createWaterCausticTexture, createCausticPoolTexture } from '@/lib/waterTexture';

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
  const bulbGlassRef = useRef<THREE.Mesh | null>(null);
  const ionsGroupRef = useRef<THREE.Group | null>(null);
  const bubblesGroupRef = useRef<THREE.Group | null>(null);
  const ammeterNeedleRef = useRef<THREE.Mesh | null>(null);
  const psuDisplayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const psuDisplayTexRef = useRef<THREE.CanvasTexture | null>(null);
  const waterCausticRef = useRef<{ texture: THREE.CanvasTexture; update: (t: number) => void } | null>(null);
  const causticPoolRef = useRef<THREE.Mesh | null>(null);
  const liquidTopRef = useRef<THREE.Mesh | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<'perspective' | 'beaker' | 'circuit' | 'top'>('perspective');

  const calc = calculateConductivity(state);

  // Create Beaker Graduation Texture (Pyrex style markings)
  const createBeakerTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Beaker white enamel graduation markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.font = 'bold 28px sans-serif';

    // Logo
    ctx.fillText('PYREX®', 180, 260);
    ctx.font = '20px sans-serif';
    ctx.fillText('250 mL', 180, 290);
    ctx.fillText('± 5%', 180, 315);

    // Graduation lines (from 50ml to 250ml)
    const marks = [
      { y: 820, ml: '50' },
      { y: 700, ml: '100' },
      { y: 580, ml: '150' },
      { y: 460, ml: '200' },
      { y: 340, ml: '250' },
    ];

    marks.forEach((m) => {
      ctx.beginPath();
      ctx.moveTo(180, m.y);
      ctx.lineTo(260, m.y);
      ctx.stroke();

      ctx.font = 'bold 24px monospace';
      ctx.fillText(m.ml, 275, m.y + 8);

      // Sub-divisions
      ctx.lineWidth = 2;
      for (let sub = 1; sub <= 4; sub++) {
        const subY = m.y - sub * 24;
        if (subY > 300) {
          ctx.beginPath();
          ctx.moveTo(180, subY);
          ctx.lineTo(220, subY);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 4;
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  // Update PSU LED Display texture
  const updatePsuDisplay = () => {
    if (!psuDisplayCanvasRef.current || !psuDisplayTexRef.current) return;
    const canvas = psuDisplayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    if (state.isPowerOn) {
      // Glowing green/cyan 7-segment style text
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${state.appliedVoltage.toFixed(1)} V`, canvas.width / 2, 54);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 32px monospace';
      ctx.fillText(`${calc.circuitCurrent_mA.toFixed(1)} mA`, canvas.width / 2, 98);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STANDBY', canvas.width / 2, 70);
    }

    psuDisplayTexRef.current.needsUpdate = true;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 1.2;
    controls.maxDistance = 14;
    controls.target.set(0, 0.85, 0);
    controlsRef.current = controls;

    // Atmospheric Studio Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.65);
    scene.add(ambient);

    const mainSpot = new THREE.SpotLight(0xffffff, 2.5);
    mainSpot.position.set(3, 8, 4);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.4;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const cyanRim = new THREE.PointLight(0x00f0ff, 1.4, 8);
    cyanRim.position.set(-3, 2, -2);
    scene.add(cyanRim);

    // Workbench Table Surface
    const benchGeo = new THREE.BoxGeometry(10, 0.25, 6);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.125, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    const grid = new THREE.GridHelper(14, 28, 0x00d4ff, 0x1e293b);
    grid.position.y = 0.005;
    scene.add(grid);

    // ==========================================
    // 1. BEAKER & RETORT CLAMP STAND
    // ==========================================
    const beakerArea = new THREE.Group();
    beakerArea.position.set(-1.0, 0, 0);

    // Retort Stand Base (Cast Iron)
    const standBaseGeo = new THREE.BoxGeometry(0.9, 0.08, 1.4);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.set(-0.7, 0.04, -0.2);
    standBase.receiveShadow = true;
    beakerArea.add(standBase);

    // Retort Vertical Steel Rod
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.6, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const standRod = new THREE.Mesh(rodGeo, rodMat);
    standRod.position.set(-0.7, 1.3, -0.7);
    beakerArea.add(standRod);

    // Bosshead Clamp
    const bossGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const bossMesh = new THREE.Mesh(bossGeo, standMat);
    bossMesh.position.set(-0.7, 2.0, -0.7);
    beakerArea.add(bossMesh);

    // Horizontal Clamp Arm
    const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 16);
    const clampArm = new THREE.Mesh(armGeo, rodMat);
    clampArm.rotation.x = Math.PI / 2;
    clampArm.position.set(-0.7, 2.0, -0.3);
    beakerArea.add(clampArm);

    // Insulated Electrode Carrier Block
    const carrierGeo = new THREE.BoxGeometry(0.8, 0.1, 0.25);
    const carrierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const carrier = new THREE.Mesh(carrierGeo, carrierMat);
    carrier.position.set(0, 1.95, 0);
    beakerArea.add(carrier);

    // Pyrex 250ml Glass Beaker
    const beakerTex = createBeakerTexture();
    const glassGeo = new THREE.CylinderGeometry(0.88, 0.84, 1.75, 36, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.06,
      ior: 1.52,
      thickness: 0.15,
      side: THREE.DoubleSide,
      map: beakerTex,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 0.88;
    glassMesh.castShadow = true;
    beakerArea.add(glassMesh);

    // Beaker Bottom disc
    const botGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.04, 36);
    const botMesh = new THREE.Mesh(botGeo, glassMat);
    botMesh.position.y = 0.02;
    beakerArea.add(botMesh);

    // Procedural Water Caustic & Normal Texture
    const waterCaustic = createWaterCausticTexture(256, 256);
    waterCausticRef.current = waterCaustic;

    // Table Caustic Light Pool under beaker
    const poolTex = createCausticPoolTexture(256);
    const poolGeo = new THREE.PlaneGeometry(2.0, 2.0);
    const poolMat = new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      opacity: 0.6,
      color: new THREE.Color(calc.solution.colorHex),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const causticPool = new THREE.Mesh(poolGeo, poolMat);
    causticPool.rotation.x = -Math.PI / 2;
    causticPool.position.set(-1.0, 0.012, 0);
    scene.add(causticPool);
    causticPoolRef.current = causticPool;

    // Liquid Cylinder with realistic depth absorption and caustic bump
    const liquidGeo = new THREE.CylinderGeometry(0.82, 0.82, 1.3, 36);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      roughness: 0.04,
      ior: 1.333,
      thickness: 1.2,
      attenuationColor: new THREE.Color(calc.solution.colorHex),
      attenuationDistance: 0.6,
      bumpMap: waterCaustic.texture,
      bumpScale: 0.04,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.67;
    liquidMeshRef.current = liquidMesh;
    beakerArea.add(liquidMesh);

    // Top Liquid Surface (Flat reflective meniscus disk)
    const topGeo = new THREE.CircleGeometry(0.81, 32);
    const topMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(calc.solution.colorHex),
      transmission: 0.85,
      transparent: true,
      opacity: 0.92,
      roughness: 0.03,
      ior: 1.333,
      bumpMap: waterCaustic.texture,
      bumpScale: 0.05,
    });
    const liquidTop = new THREE.Mesh(topGeo, topMat);
    liquidTop.rotation.x = -Math.PI / 2;
    liquidTop.position.y = 1.32;
    liquidTopRef.current = liquidTop;
    beakerArea.add(liquidTop);

    // Meniscus ring on liquid rim
    const meniscusGeo = new THREE.TorusGeometry(0.81, 0.02, 16, 36);
    const meniscus = new THREE.Mesh(meniscusGeo, liquidMat);
    meniscus.rotation.x = Math.PI / 2;
    meniscus.position.y = 1.32;
    beakerArea.add(meniscus);

    // ==========================================
    // 2. PLATINUM ELECTRODES & ALLIGATOR CLIPS
    // ==========================================
    const electrodeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });

    // Left Electrode (Anode +)
    const elLeftGroup = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(0.03, 1.45, 0.38);
    const plateLeft = new THREE.Mesh(plateGeo, electrodeMat);
    plateLeft.position.y = 1.15;
    elLeftGroup.add(plateLeft);

    // Red Alligator Clip
    const clipGeo = new THREE.BoxGeometry(0.08, 0.22, 0.12);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 });
    const clipLeft = new THREE.Mesh(clipGeo, redMat);
    clipLeft.position.y = 1.88;
    elLeftGroup.add(clipLeft);

    electrodeLeftRef.current = elLeftGroup;
    beakerArea.add(elLeftGroup);

    // Right Electrode (Cathode -)
    const elRightGroup = new THREE.Group();
    const plateRight = new THREE.Mesh(plateGeo, electrodeMat);
    plateRight.position.y = 1.15;
    elRightGroup.add(plateRight);

    // Black Alligator Clip
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 });
    const clipRight = new THREE.Mesh(clipGeo, blackMat);
    clipRight.position.y = 1.88;
    elRightGroup.add(clipRight);

    electrodeRightRef.current = elRightGroup;
    beakerArea.add(elRightGroup);

    // Dynamic Bubbles Group (Effervescence during conduction)
    const bubblesGroup = new THREE.Group();
    bubblesGroupRef.current = bubblesGroup;
    beakerArea.add(bubblesGroup);

    // Microscopic Ions Group
    const ionsGroup = new THREE.Group();
    ionsGroupRef.current = ionsGroup;
    beakerArea.add(ionsGroup);

    scene.add(beakerArea);

    // ==========================================
    // 3. DC POWER SUPPLY INSTRUMENT
    // ==========================================
    const psuGroup = new THREE.Group();
    psuGroup.position.set(1.5, 0.5, -0.6);

    const psuBoxGeo = new THREE.BoxGeometry(1.5, 1.0, 1.1);
    const psuChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.3,
    });
    const psuBox = new THREE.Mesh(psuBoxGeo, psuChassisMat);
    psuBox.castShadow = true;
    psuGroup.add(psuBox);

    // Canvas LED Display
    const psuCanvas = document.createElement('canvas');
    psuCanvas.width = 256;
    psuCanvas.height = 128;
    psuDisplayCanvasRef.current = psuCanvas;
    const psuTex = new THREE.CanvasTexture(psuCanvas);
    psuDisplayTexRef.current = psuTex;
    const psuDispGeo = new THREE.PlaneGeometry(0.65, 0.35);
    const psuDispMat = new THREE.MeshBasicMaterial({ map: psuTex });
    const psuDisp = new THREE.Mesh(psuDispGeo, psuDispMat);
    psuDisp.position.set(-0.25, 0.18, 0.56);
    psuGroup.add(psuDisp);

    // Voltage Control Knob (Rotary)
    const knobGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.42, 0.18, 0.56);
    psuGroup.add(knob);

    // Red & Black Binding Post Jacks
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
    const postRed = new THREE.Mesh(postGeo, redMat);
    postRed.rotation.x = Math.PI / 2;
    postRed.position.set(-0.25, -0.25, 0.56);
    psuGroup.add(postRed);

    const postBlack = new THREE.Mesh(postGeo, blackMat);
    postBlack.rotation.x = Math.PI / 2;
    postBlack.position.set(0.25, -0.25, 0.56);
    psuGroup.add(postBlack);

    scene.add(psuGroup);

    // ==========================================
    // 4. EDISON INCANDESCENT INDICATOR BULB
    // ==========================================
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(1.5, 0.15, 0.9);

    // Brass Socket
    const socketGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.3, 24);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const socket = new THREE.Mesh(socketGeo, brassMat);
    bulbGroup.add(socket);

    // Clear Glass Bulb Dome
    const bulbDomeGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const bulbDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });
    const bulbDome = new THREE.Mesh(bulbDomeGeo, bulbDomeMat);
    bulbDome.position.y = 0.55;
    bulbGlassRef.current = bulbDome;
    bulbGroup.add(bulbDome);

    // Tungsten Filament Coil
    const filamentGeo = new THREE.TorusGeometry(0.1, 0.018, 16, 32);
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const filament = new THREE.Mesh(filamentGeo, filamentMat);
    filament.position.y = 0.55;
    bulbFilamentRef.current = filament;
    bulbGroup.add(filament);

    // Dynamic Omni Point Light from Bulb
    const bulbLight = new THREE.PointLight(0xffea00, 0, 8);
    bulbLight.position.y = 0.6;
    bulbLight.castShadow = true;
    bulbGlowLightRef.current = bulbLight;
    bulbGroup.add(bulbLight);

    scene.add(bulbGroup);

    // ==========================================
    // 5. HEAVY COPPER WIRES WITH SAG
    // ==========================================
    const wireMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const wireMatBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

    // Red Lead: PSU (+) to Left Electrode (+)
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.25, 0.25, -0.05),
      new THREE.Vector3(0.5, 0.8, -0.4),
      new THREE.Vector3(-0.5, 1.4, -0.3),
      new THREE.Vector3(-1.0 - (state.electrodeDistance * 0.05), 1.9, 0),
    ]);
    const wire1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 32, 0.022, 8, false), wireMatRed);
    scene.add(wire1);

    // Black Lead: Right Electrode (-) to Bulb
    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0 + (state.electrodeDistance * 0.05), 1.9, 0),
      new THREE.Vector3(-0.2, 0.6, 0.4),
      new THREE.Vector3(0.8, 0.2, 0.8),
      new THREE.Vector3(1.25, 0.2, 0.9),
    ]);
    const wire2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 32, 0.022, 8, false), wireMatBlack);
    scene.add(wire2);

    // Return Lead: Bulb back to PSU (-)
    const curve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.75, 0.2, 0.9),
      new THREE.Vector3(2.3, 0.3, 0.2),
      new THREE.Vector3(1.75, 0.25, -0.05),
    ]);
    const wire3 = new THREE.Mesh(new THREE.TubeGeometry(curve3, 24, 0.022, 8, false), wireMatBlack);
    scene.add(wire3);

    // Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate drifting ions inside beaker
      if (ionsGroupRef.current && state.isPowerOn && calc.circuitCurrent > 0.001) {
        ionsGroupRef.current.children.forEach((ionMesh: any) => {
          if (ionMesh.userData.isCation) {
            ionMesh.position.x += 0.006;
            if (ionMesh.position.x > 0.35) ionMesh.position.x = -0.35;
          } else {
            ionMesh.position.x -= 0.006;
            if (ionMesh.position.x < -0.35) ionMesh.position.x = 0.35;
          }
          ionMesh.position.y += Math.sin(elapsed * 3 + ionMesh.position.z * 10) * 0.0015;
        });
      }

      // Animate rising electrolysis bubbles when current is active
      if (bubblesGroupRef.current && state.isPowerOn && calc.circuitCurrent_mA > 15) {
        bubblesGroupRef.current.children.forEach((b: any) => {
          b.position.y += b.userData.speed;
          if (b.position.y > 1.3) {
            b.position.y = 0.35 + Math.random() * 0.2;
          }
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

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update dynamic visuals when state changes
  useEffect(() => {
    // 1. Update electrode separation distance l
    const halfDist = (state.electrodeDistance / 2) * 0.08;
    if (electrodeLeftRef.current) {
      electrodeLeftRef.current.position.x = -halfDist;
    }
    if (electrodeRightRef.current) {
      electrodeRightRef.current.position.x = halfDist;
    }

    // 2. Liquid Color & Opacity & Caustic Pool
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

    // 3. Bulb Filament Glow & Lighting
    if (bulbFilamentRef.current && bulbGlowLightRef.current) {
      const filMat = bulbFilamentRef.current.material as THREE.MeshStandardMaterial;
      const bRatio = calc.bulbBrightnessPercent / 100;

      if (state.isPowerOn && bRatio > 0.02) {
        const glowHex = bRatio > 0.4 ? 0xffea00 : 0xf97316;
        filMat.emissive.setHex(glowHex);
        filMat.emissiveIntensity = bRatio * 3.5;
        bulbGlowLightRef.current.intensity = bRatio * 5.0;
        bulbGlowLightRef.current.color.setHex(glowHex);
      } else {
        filMat.emissive.setHex(0x000000);
        filMat.emissiveIntensity = 0;
        bulbGlowLightRef.current.intensity = 0;
      }
    }

    // 4. Update LED PSU Display
    updatePsuDisplay();

    // 5. Recreate Microscopic Ions
    if (ionsGroupRef.current) {
      while (ionsGroupRef.current.children.length > 0) {
        ionsGroupRef.current.remove(ionsGroupRef.current.children[0]);
      }

      if (showIons && calc.ionsActiveCount > 0) {
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

        const sphereGeo = new THREE.SphereGeometry(0.04, 16, 16);

        for (let i = 0; i < calc.ionsActiveCount; i++) {
          const isCation = i % 2 === 0;
          const ionMesh = new THREE.Mesh(sphereGeo, isCation ? catMat : anMat);
          ionMesh.position.set(
            (Math.random() - 0.5) * 0.7,
            0.35 + Math.random() * 0.8,
            (Math.random() - 0.5) * 0.7
          );
          (ionMesh as any).userData = { isCation };
          ionsGroupRef.current.add(ionMesh);
        }
      }
    }

    // 6. Recreate Effervescence Bubbles at Electrodes
    if (bubblesGroupRef.current) {
      while (bubblesGroupRef.current.children.length > 0) {
        bubblesGroupRef.current.remove(bubblesGroupRef.current.children[0]);
      }

      if (state.isPowerOn && calc.circuitCurrent_mA > 15) {
        const bubbleMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.9,
          transparent: true,
          roughness: 0.1,
        });
        const bGeo = new THREE.SphereGeometry(0.018, 8, 8);

        // Generate rising bubbles along the cathode plate
        for (let b = 0; b < 24; b++) {
          const bubble = new THREE.Mesh(bGeo, bubbleMat);
          const isCathode = b % 2 === 0;
          const xBase = isCathode ? halfDist : -halfDist;
          bubble.position.set(
            xBase + (Math.random() - 0.5) * 0.08,
            0.35 + Math.random() * 0.9,
            (Math.random() - 0.5) * 0.3
          );
          (bubble as any).userData = { speed: 0.005 + Math.random() * 0.008 };
          bubblesGroupRef.current.add(bubble);
        }
      }
    }
  }, [state, calc.solution, calc.bulbBrightnessPercent, calc.ionsActiveCount, showIons]);

  const setView = (v: 'perspective' | 'beaker' | 'circuit' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraView(v);
    if (v === 'perspective') {
      cameraRef.current.position.set(0, 3.2, 5.2);
      controlsRef.current.target.set(0, 0.85, 0);
    } else if (v === 'beaker') {
      cameraRef.current.position.set(-1.0, 1.2, 2.6);
      controlsRef.current.target.set(-1.0, 0.9, 0);
    } else if (v === 'circuit') {
      cameraRef.current.position.set(1.5, 1.1, 2.6);
      controlsRef.current.target.set(1.5, 0.5, 0);
    } else if (v === 'top') {
      cameraRef.current.position.set(0, 6.5, 0.1);
      controlsRef.current.target.set(0, 0.5, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#060913] select-none shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[540px]'
      } ${className}`}
    >
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Solution Badge */}
        <div className="flex items-center gap-3 pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: calc.solution.colorHex, color: calc.solution.colorHex }}
            />
            <span className="font-bold text-white text-sm">{calc.solution.name}</span>
            <span className="font-mono text-cyan-400 font-bold">({calc.solution.formula})</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                state.isPowerOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="font-bold text-slate-300">
              {state.isPowerOn ? 'Circuit Active' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Camera Views & Fullscreen & AR Launch */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setView('perspective')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'perspective' ? 'bg-amber-400 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Lab
          </button>
          <button
            onClick={() => setView('beaker')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'beaker' ? 'bg-amber-400 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Beaker Zoom
          </button>
          <button
            onClick={() => setView('circuit')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'circuit' ? 'bg-amber-400 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulb & PSU
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              cameraView === 'top' ? 'bg-amber-400 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top View
          </button>
          <Link
            href="/conductivity/ar"
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Launch AR</span>
          </Link>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Meter HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-2xl flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${calc.bulbBrightnessPercent > 5 ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-sans">Current</span>
              <span className="font-bold text-amber-300 text-base">{calc.circuitCurrent_mA} mA</span>
            </div>
          </div>

          <span className="text-slate-700">|</span>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Conductance (G)</span>
            <span className="font-bold text-cyan-300 text-base">{calc.cellConductance.toFixed(3)} mS</span>
          </div>

          <span className="text-slate-700">|</span>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Specific Cond. (κ)</span>
            <span className="font-bold text-emerald-400 text-base">{calc.specificConductivity_mS_cm} mS/cm</span>
          </div>

          <span className="text-slate-700">|</span>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Bulb Illumination</span>
            <span
              className={`font-bold text-sm ${
                calc.bulbBrightnessPercent > 40
                  ? 'text-yellow-300'
                  : calc.bulbBrightnessPercent > 5
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}
            >
              {calc.bulbState} ({calc.bulbBrightnessPercent}%)
            </span>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5 shadow-lg">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Click & drag to rotate • Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
