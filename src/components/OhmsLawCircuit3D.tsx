'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  calculateOhmsLaw,
  CircuitConfig,
  OhmsLawState,
} from '@/lib/ohmsLawPhysics';
import {
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Power,
  RotateCcw,
} from 'lucide-react';

interface OhmsLawCircuit3DProps {
  config: CircuitConfig;
  r1: number;
  r2: number;
  rheostatResistance: number;
  cellCount: number;
  isPlugKeyClosed: boolean;
  onToggleKey?: () => void;
  className?: string;
}

export function OhmsLawCircuit3D({
  config,
  r1,
  r2,
  rheostatResistance,
  cellCount,
  isPlugKeyClosed,
  onToggleKey,
  className = '',
}: OhmsLawCircuit3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const ammeterNeedleRef = useRef<THREE.Mesh | null>(null);
  const voltmeterNeedleRef = useRef<THREE.Mesh | null>(null);
  const rheostatSliderRef = useRef<THREE.Mesh | null>(null);
  const plugPinRef = useRef<THREE.Mesh | null>(null);
  const wiresGroupRef = useRef<THREE.Group | null>(null);
  const electronMeshesRef = useRef<{ mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; progress: number }[]>([]);
  const rebuildWiresRef = useRef<(() => void) | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<'top' | 'perspective' | 'meters'>('perspective');

  const calc = calculateOhmsLaw({
    config,
    r1,
    r2,
    rheostatResistance,
    cellCount,
    isPlugKeyClosed,
  });

  // Update needle deflections, slider positions, and dynamic circuit wires
  const updateCircuitVisuals = () => {
    // 1. Ammeter needle rotation (0 to 500 mA mapped to -45° to +45°)
    if (ammeterNeedleRef.current) {
      const maxMA = 500;
      const ratio = Math.min(1.0, calc.measuredCurrentMA / maxMA);
      const angle = -Math.PI / 4 + ratio * (Math.PI / 2);
      ammeterNeedleRef.current.rotation.z = -angle;
    }

    // 2. Voltmeter needle rotation (0 to 5 V mapped to -45° to +45°)
    if (voltmeterNeedleRef.current) {
      const maxV = 5.0;
      const ratio = Math.min(1.0, calc.measuredVoltageV / maxV);
      const angle = -Math.PI / 4 + ratio * (Math.PI / 2);
      voltmeterNeedleRef.current.rotation.z = -angle;
    }

    // 3. Rheostat slider position along its tube (0 to 50 Ohms mapped to -0.6 to +0.6 units)
    if (rheostatSliderRef.current) {
      const ratio = rheostatResistance / 50;
      rheostatSliderRef.current.position.x = -0.6 + ratio * 1.2;
    }

    // 4. Plug pin inserted into key block
    if (plugPinRef.current) {
      plugPinRef.current.position.y = isPlugKeyClosed ? 0.32 : 0.65;
    }

    // 5. Rebuild wires dynamically with slider position & electron pulses
    if (rebuildWiresRef.current) {
      rebuildWiresRef.current();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 5.5, 6.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    // ==========================================
    // 1. LAB CIRCUIT BOARD PLATFORM
    // ==========================================
    const boardGeo = new THREE.BoxGeometry(8.0, 0.2, 5.6);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 0, 0);
    scene.add(board);

    // ==========================================
    // 2. DC BATTERY ELIMINATOR (Back-Left)
    // ==========================================
    const battGroup = new THREE.Group();
    const battBoxGeo = new THREE.BoxGeometry(1.4, 0.7, 1.0);
    const battBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const battBox = new THREE.Mesh(battBoxGeo, battBoxMat);
    battBox.position.set(0, 0.35, 0);
    battGroup.add(battBox);

    // Terminal knobs (+ Red, - Black)
    const termGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16);
    const redTerm = new THREE.Mesh(termGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    redTerm.position.set(0.35, 0.75, 0);
    battGroup.add(redTerm);

    const blackTerm = new THREE.Mesh(termGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    blackTerm.position.set(-0.35, 0.75, 0);
    battGroup.add(blackTerm);

    battGroup.position.set(-2.8, 0.1, -1.8);
    scene.add(battGroup);

    // ==========================================
    // 3. PLUG KEY (Brass Blocks with Removable Pin)
    // ==========================================
    const keyGroup = new THREE.Group();
    const keyBaseGeo = new THREE.BoxGeometry(0.9, 0.15, 0.6);
    const keyBase = new THREE.Mesh(keyBaseGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    keyBase.position.set(0, 0.08, 0);
    keyGroup.add(keyBase);

    // Brass blocks
    const brassGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
    const b1 = new THREE.Mesh(brassGeo, brassMat);
    b1.position.set(-0.2, 0.25, 0);
    keyGroup.add(b1);

    const b2 = new THREE.Mesh(brassGeo, brassMat);
    b2.position.set(0.2, 0.25, 0);
    keyGroup.add(b2);

    // Removable brass plug pin
    const pinGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.25, 16);
    const pinTopGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    const pinGroup = new THREE.Group();
    const pinShaft = new THREE.Mesh(pinGeo, brassMat);
    const pinTop = new THREE.Mesh(pinTopGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
    pinTop.position.set(0, 0.15, 0);
    pinGroup.add(pinShaft);
    pinGroup.add(pinTop);
    pinGroup.position.set(0, isPlugKeyClosed ? 0.32 : 0.65, 0);
    plugPinRef.current = pinGroup as any;
    keyGroup.add(pinGroup);

    keyGroup.position.set(-0.8, 0.1, -1.8);
    scene.add(keyGroup);

    // ==========================================
    // 4. WIRE-WOUND RHEOSTAT (Front-Left)
    // ==========================================
    const rheoGroup = new THREE.Group();
    const tubeGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.6, 24);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Ceramic porcelain
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 0.3, 0);
    rheoGroup.add(tube);

    // Guide rod on top
    const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.7, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 0.55, 0);
    rheoGroup.add(rod);

    // Slider contact
    const sliderGeo = new THREE.BoxGeometry(0.12, 0.16, 0.2);
    const sliderMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });
    const slider = new THREE.Mesh(sliderGeo, sliderMat);
    slider.position.set(0, 0.55, 0);
    rheostatSliderRef.current = slider;
    rheoGroup.add(slider);

    rheoGroup.position.set(-2.0, 0.1, 0.8);
    scene.add(rheoGroup);

    // ==========================================
    // 5. ANALOG AMMETER (Center-Front)
    // ==========================================
    const meterGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.3, 32);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

    const ammeterGroup = new THREE.Group();
    const aBox = new THREE.Mesh(meterGeo, meterMat);
    aBox.position.set(0, 0.25, 0);
    ammeterGroup.add(aBox);

    const aDial = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), dialMat);
    aDial.rotation.x = -Math.PI / 2;
    aDial.position.set(0, 0.41, 0);
    ammeterGroup.add(aDial);

    // Needle
    const needleGeo = new THREE.BoxGeometry(0.02, 0.48, 0.01);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const aNeedle = new THREE.Mesh(needleGeo, needleMat);
    aNeedle.position.set(0, 0.43, -0.15);
    aNeedle.rotation.x = Math.PI / 2;
    ammeterNeedleRef.current = aNeedle;
    ammeterGroup.add(aNeedle);

    ammeterGroup.position.set(0.6, 0.1, 1.2);
    scene.add(ammeterGroup);

    // ==========================================
    // 6. ANALOG VOLTMETER (Right-Front)
    // ==========================================
    const voltmeterGroup = new THREE.Group();
    const vBox = new THREE.Mesh(meterGeo, meterMat);
    vBox.position.set(0, 0.25, 0);
    voltmeterGroup.add(vBox);

    const vDial = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), dialMat);
    vDial.rotation.x = -Math.PI / 2;
    vDial.position.set(0, 0.41, 0);
    voltmeterGroup.add(vDial);

    const vNeedle = new THREE.Mesh(needleGeo, needleMat);
    vNeedle.position.set(0, 0.43, -0.15);
    vNeedle.rotation.x = Math.PI / 2;
    voltmeterNeedleRef.current = vNeedle;
    voltmeterGroup.add(vNeedle);

    voltmeterGroup.position.set(2.6, 0.1, 1.2);
    scene.add(voltmeterGroup);

    // ==========================================
    // 7. TEST RESISTORS (Back-Right)
    // ==========================================
    const resGroup = new THREE.Group();
    const resBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    resBase.position.set(0, 0.08, 0);
    resGroup.add(resBase);

    // Resistor cylinder with color bands
    const rCylGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const r1Cyl = new THREE.Mesh(rCylGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }));
    r1Cyl.rotation.z = Math.PI / 2;
    r1Cyl.position.set(0, 0.25, -0.15);
    resGroup.add(r1Cyl);

    if (config === 'series' || config === 'parallel') {
      const r2Cyl = new THREE.Mesh(rCylGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
      r2Cyl.rotation.z = Math.PI / 2;
      r2Cyl.position.set(0, 0.25, 0.15);
      resGroup.add(r2Cyl);
    }

    resGroup.position.set(1.8, 0.1, -1.8);
    scene.add(resGroup);

    // Add Terminal Binding Posts to instruments for realistic wire attachment
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
    const postRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const postBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.3 });
    const brassPostMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });

    // Plug Key binding posts
    const kp1 = new THREE.Mesh(postGeo, brassPostMat);
    kp1.position.set(-0.2, 0.36, 0);
    keyGroup.add(kp1);
    const kp2 = new THREE.Mesh(postGeo, brassPostMat);
    kp2.position.set(0.2, 0.36, 0);
    keyGroup.add(kp2);

    // Rheostat lower terminal
    const rhLower = new THREE.Mesh(postGeo, brassPostMat);
    rhLower.position.set(-0.8, 0.25, 0);
    rheoGroup.add(rhLower);

    // Rheostat top slider terminal
    const rhSliderTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16), brassPostMat);
    rhSliderTerm.position.set(0, 0.12, 0);
    slider.add(rhSliderTerm);

    // Ammeter binding posts (+ on left, - on right)
    const ammeterPostPos = new THREE.Mesh(postGeo, postRedMat);
    ammeterPostPos.position.set(-0.25, 0.32, 0.25);
    ammeterGroup.add(ammeterPostPos);
    const ammeterPostNeg = new THREE.Mesh(postGeo, postBlackMat);
    ammeterPostNeg.position.set(0.25, 0.32, 0.25);
    ammeterGroup.add(ammeterPostNeg);

    // Voltmeter binding posts (+ on left, - on right)
    const voltPostPos = new THREE.Mesh(postGeo, postRedMat);
    voltPostPos.position.set(-0.25, 0.32, 0.25);
    voltmeterGroup.add(voltPostPos);
    const voltPostNeg = new THREE.Mesh(postGeo, postBlackMat);
    voltPostNeg.position.set(0.25, 0.32, 0.25);
    voltmeterGroup.add(voltPostNeg);

    // Resistor board binding posts
    const resPostL = new THREE.Mesh(postGeo, brassPostMat);
    resPostL.position.set(-0.7, 0.25, 0);
    resGroup.add(resPostL);
    const resPostR = new THREE.Mesh(postGeo, brassPostMat);
    resPostR.position.set(0.7, 0.25, 0);
    resGroup.add(resPostR);

    // ==========================================
    // 8. 3D CIRCUIT CONNECTING WIRES (Physics-Accurate)
    // Series: Batt(+) -> Key -> Rheostat -> Ammeter -> Resistor -> Batt(-)
    // Parallel: Voltmeter across Resistor
    // ==========================================
    const wiresGroup = new THREE.Group();
    wiresGroupRef.current = wiresGroup;
    scene.add(wiresGroup);

    // Function to build insulated 3D tube wire with banana plugs & electron pulses
    const electronGeo = new THREE.SphereGeometry(0.024, 12, 12);
    const electronMatSeries = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Electric Cyan
    const electronMatVolt = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald Green

    const rebuildWires = () => {
      while (wiresGroup.children.length > 0) {
        const child = wiresGroup.children[0];
        wiresGroup.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      }
      electronMeshesRef.current = [];

      const makeBananaPlug = (pos: THREE.Vector3, col: number) => {
        const plug = new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.022, 0.08, 16),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
        );
        plug.position.copy(pos);
        wiresGroup.add(plug);
      };

      const makeTubeWire = (pts: THREE.Vector3[], hexColor: number, electronCount = 0, isVolt = false) => {
        const curve = new THREE.CatmullRomCurve3(pts);
        makeBananaPlug(pts[0], hexColor);
        makeBananaPlug(pts[pts.length - 1], hexColor);

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.016, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: hexColor,
          roughness: 0.5,
          metalness: 0.1,
        });
        wiresGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

        if (electronCount > 0 && isPlugKeyClosed && calc.measuredCurrentMA > 0.1) {
          for (let i = 0; i < electronCount; i++) {
            const eMesh = new THREE.Mesh(electronGeo, isVolt ? electronMatVolt : electronMatSeries);
            const prog = i / electronCount;
            eMesh.position.copy(curve.getPointAt(prog));
            wiresGroup.add(eMesh);
            electronMeshesRef.current.push({ mesh: eMesh, curve, progress: prog });
          }
        }
      };

      // Calculate dynamic slider world X
      const sliderRatio = Math.max(0, Math.min(1, rheostatResistance / 50));
      const sliderWorldX = -2.0 + (-0.6 + sliderRatio * 1.2);

      // 1. Series Wire 1: Battery (+) to Plug Key (Red)
      makeTubeWire([
        new THREE.Vector3(-2.45, 0.85, -1.8),
        new THREE.Vector3(-1.7, 0.55, -1.8),
        new THREE.Vector3(-1.0, 0.38, -1.8),
      ], 0xef4444, 4);

      // 2. Series Wire 2: Plug Key to Rheostat Lower Terminal (Red)
      makeTubeWire([
        new THREE.Vector3(-0.6, 0.38, -1.8),
        new THREE.Vector3(-1.1, 0.16, -1.0),
        new THREE.Vector3(-2.2, 0.16, 0.0),
        new THREE.Vector3(-2.8, 0.35, 0.8),
      ], 0xef4444, 5);

      // 3. Series Wire 3: Rheostat Slider Contact to Ammeter (+) (Yellow/Amber)
      makeTubeWire([
        new THREE.Vector3(sliderWorldX, 0.73, 0.8),
        new THREE.Vector3(-0.8, 0.22, 1.1),
        new THREE.Vector3(-0.1, 0.18, 1.3),
        new THREE.Vector3(0.35, 0.42, 1.45),
      ], 0xeab308, 5);

      // 4. Series Wire 4: Ammeter (-) to Resistor Left Terminal (Yellow/Amber)
      makeTubeWire([
        new THREE.Vector3(0.85, 0.42, 1.45),
        new THREE.Vector3(1.3, 0.18, 0.5),
        new THREE.Vector3(1.2, 0.18, -0.7),
        new THREE.Vector3(1.1, 0.35, -1.8),
      ], 0xeab308, 6);

      // 5. Series Wire 5: Resistor Right Terminal back to Battery (-) (Black)
      makeTubeWire([
        new THREE.Vector3(2.5, 0.35, -1.8),
        new THREE.Vector3(1.5, 0.15, -2.4),
        new THREE.Vector3(0.0, 0.15, -2.5),
        new THREE.Vector3(-1.8, 0.15, -2.4),
        new THREE.Vector3(-3.15, 0.85, -1.8),
      ], 0x1e293b, 8);

      // 6. Parallel Branch 1: Voltmeter (+) to Resistor Left Terminal (Green)
      makeTubeWire([
        new THREE.Vector3(2.35, 0.42, 1.45),
        new THREE.Vector3(2.0, 0.18, 0.4),
        new THREE.Vector3(1.5, 0.18, -0.6),
        new THREE.Vector3(1.1, 0.35, -1.8),
      ], 0x10b981, 4, true);

      // 7. Parallel Branch 2: Voltmeter (-) to Resistor Right Terminal (Green)
      makeTubeWire([
        new THREE.Vector3(2.85, 0.42, 1.45),
        new THREE.Vector3(3.0, 0.18, 0.4),
        new THREE.Vector3(2.8, 0.18, -0.6),
        new THREE.Vector3(2.5, 0.35, -1.8),
      ], 0x10b981, 4, true);
    };

    rebuildWiresRef.current = rebuildWires;
    rebuildWires();

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Real-time flowing electron charges along the circuit
      if (electronMeshesRef.current.length > 0) {
        const speed = 0.003 + Math.min(0.02, (calc.measuredCurrentMA / 500) * 0.015);
        electronMeshesRef.current.forEach((el) => {
          el.progress = (el.progress + speed) % 1.0;
          el.mesh.position.copy(el.curve.getPointAt(el.progress));
        });
      }

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
  }, [config]);

  useEffect(() => {
    updateCircuitVisuals();
  }, [calc.measuredCurrentMA, calc.measuredVoltageV, rheostatResistance, isPlugKeyClosed]);

  const handleCameraPreset = (view: 'top' | 'perspective' | 'meters') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setCameraView(view);

    if (view === 'top') {
      camera.position.set(0, 8.5, 0.05);
      controls.target.set(0, 0, 0);
    } else if (view === 'perspective') {
      camera.position.set(0, 5.5, 6.0);
      controls.target.set(0, 0.4, 0);
    } else if (view === 'meters') {
      camera.position.set(1.6, 3.2, 3.2);
      controls.target.set(1.6, 0.4, 1.2);
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
            <span className={`w-2.5 h-2.5 rounded-full ${isPlugKeyClosed ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-400">Circuit:</span>
            <span className="font-bold text-white">{isPlugKeyClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">Voltmeter V:</span>
            <span className="font-mono font-bold text-cyan-300">{calc.measuredVoltageV.toFixed(2)} V</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Ammeter I:</span>
            <span className="font-mono font-bold text-amber-300">{calc.measuredCurrentMA.toFixed(1)} mA</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0f1d]/85 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg">
          {onToggleKey && (
            <button
              onClick={onToggleKey}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isPlugKeyClosed
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isPlugKeyClosed ? 'Open Key (OFF)' : 'Insert Key (ON)'}</span>
            </button>
          )}

          <button
            onClick={() => handleCameraPreset('perspective')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'perspective' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => handleCameraPreset('meters')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraView === 'meters' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Meters Close-up
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

      {/* Bottom Floating Resistance Banner */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#0a0f1d]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/90 shadow-xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Resistance Ratio: R = V / I = {calc.ohmsRatio.toFixed(2)} Ω
              </p>
              <p className="text-[11px] text-slate-400">
                {calc.formulaNote} • Power Dissipated: {calc.powerWatts.toFixed(3)} W
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto bg-[#0a0f1d]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive 3D Circuit • Move rheostat to vary I</span>
        </div>
      </div>
    </div>
  );
}
