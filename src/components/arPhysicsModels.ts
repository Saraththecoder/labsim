import * as THREE from 'three';
import { LensSystemState, OpticsCalculation } from '@/lib/physics';
import { MirrorSystemState, MirrorCalculationResult } from '@/lib/mirrorPhysics';
import { GlassSlabState, GlassSlabCalculationResult } from '@/lib/glassSlabPhysics';
import { PrismState, PrismCalculationResult, VIBGYOR_SPECTRUM } from '@/lib/prismPhysics';
import { OhmsLawState, OhmsLawCalculationResult } from '@/lib/ohmsLawPhysics';

// ============================================================================
// SHARED PROCEDURAL TEXTURES & MATERIALS
// ============================================================================

/**
 * Generate 100 cm laboratory millimeter scale texture
 */
export function createBenchScaleTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background brass/silver tone
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top metallic border highlight
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  // Graduation markings for 100 cm
  const margin = 24;
  const usableWidth = canvas.width - margin * 2;
  const pixelsPerCm = usableWidth / 100;

  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';

  for (let mm = 0; mm <= 1000; mm++) {
    const x = margin + (mm / 10) * pixelsPerCm;
    let tickHeight = 12;
    ctx.lineWidth = 1.0;

    if (mm % 10 === 0) {
      // 1 cm mark
      tickHeight = 36;
      ctx.lineWidth = 2.2;
      const cm = mm / 10;
      if (cm % 5 === 0) {
        tickHeight = 46;
        ctx.fillText(`${cm}`, x, 88);
      }
    } else if (mm % 5 === 0) {
      // 5 mm mark
      tickHeight = 24;
      ctx.lineWidth = 1.6;
    }

    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, 10 + tickHeight);
    ctx.stroke();
  }

  // Label
  ctx.font = 'italic 16px serif';
  ctx.textAlign = 'left';
  ctx.fillText('LABSIM DUAL-RAIL OPTICAL BENCH (100 cm) • LEAST COUNT 0.1 cm', margin + 30, 116);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Generate analog meter dial texture (Ammeter or Voltmeter)
 */
export function createMeterDialTexture(type: 'A' | 'V', maxVal: number): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dial face (cream off-white)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Outer border ring
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Mirrored anti-parallax strip
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(256, 290, 150, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  // Scale Arc
  const center = { x: 256, y: 290 };
  const radius = 175;
  const startAngle = Math.PI * 1.2;
  const endAngle = Math.PI * 1.8;
  const totalDivisions = 30; // 0 to 3 in 0.1 steps

  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle, endAngle);
  ctx.stroke();

  // Scale ticks & numbers
  for (let i = 0; i <= totalDivisions; i++) {
    const angle = startAngle + (i / totalDivisions) * (endAngle - startAngle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const isMajor = i % 10 === 0;
    const isMid = i % 5 === 0;
    const tickLen = isMajor ? 24 : isMid ? 16 : 9;

    ctx.lineWidth = isMajor ? 3.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(center.x + (radius - tickLen) * cos, center.y + (radius - tickLen) * sin);
    ctx.lineTo(center.x + radius * cos, center.y + radius * sin);
    ctx.stroke();

    if (isMajor) {
      const val = (i / totalDivisions) * maxVal;
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const numR = radius - 44;
      ctx.fillText(val.toFixed(0), center.x + numR * cos, center.y + numR * sin);
    }
  }

  // Unit Symbol
  ctx.font = 'bold 44px serif';
  ctx.textAlign = 'center';
  ctx.fillText(type, 256, 210);

  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(type === 'A' ? 'DIRECT CURRENT AMMETER (0 - 3A)' : 'DIRECT CURRENT VOLTMETER (0 - 3V)', 256, 244);
  ctx.fillText('CLASS 1.5 • MOVING COIL', 256, 264);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Generate laboratory drawing board paper texture with grid and protractor
 */
export function createDrawingPaperTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Cartridge paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft millimeter graph lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Central alignment axes
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(512, 60);
  ctx.lineTo(512, 964);
  ctx.moveTo(60, 512);
  ctx.lineTo(964, 512);
  ctx.stroke();

  // Title in pencil font
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LABORATORY REFRACTION DRAWING SHEET', 512, 110);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('NCERT Practical Observation • Normal N-N\' Reference', 512, 138);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Generate 1.5V Alkaline Industrial Battery Jacket Texture
 */
export function createBatteryLabelTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Top 35% metallic copper
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 512, 90);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 30, 512, 30);

  // Gold accent band
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 90, 512, 8);

  // Bottom 65% deep matte black
  ctx.fillStyle = '#171717';
  ctx.fillRect(0, 98, 512, 158);

  // Battery branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LABSIM INDUSTRIAL', 256, 145);

  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('1.5V ALKALINE POWER CELL', 256, 175);

  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('HEAVY DUTY DC • IEC LR6 / AA', 256, 202);

  // (+) Indicator
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('+ [POSITIVE TERMINAL]', 256, 55);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * Generate diamond knurled normal/bump texture for precision brass knobs
 */
export function createKnurlTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 1.5;
  for (let i = -128; i < 256; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 128);
    ctx.lineTo(i + 128, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

/**
 * Generate soft ambient occlusion contact shadow texture
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as any;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Common High Quality Materials
export const materials = {
  castIron: new THREE.MeshStandardMaterial({
    color: 0x1a2421,
    metalness: 0.85,
    roughness: 0.35,
  }),
  steelRail: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
  }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.88,
    roughness: 0.22,
  }),
  brassKnurled: new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.88,
    roughness: 0.35,
    bumpMap: createKnurlTexture(),
    bumpScale: 0.04,
  }),
  chrome: new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.98,
    roughness: 0.08,
  }),
  resistorCeramic: new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.5,
  }),
  crownGlass: new THREE.MeshPhysicalMaterial({
    color: 0xf0fdf4,
    transmission: 0.92,
    transparent: true,
    opacity: 1,
    ior: 1.52,
    roughness: 0.04,
    thickness: 0.85,
    reflectivity: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    attenuationColor: new THREE.Color(0xdcfce7),
    attenuationDistance: 1.5,
  }),
  concaveMirrorFront: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.99,
    roughness: 0.03,
  }),
  teakWood: new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.65,
    metalness: 0.05,
  }),
  copperWire: new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.85,
    roughness: 0.25,
  }),
  bakeliteBlack: new THREE.MeshStandardMaterial({
    color: 0x171e1a,
    roughness: 0.4,
    metalness: 0.1,
  }),
  flameGlow: new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
  }),
  pinRed: new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.4 }),
  pinBlue: new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.3, roughness: 0.4 }),
  pinYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.3, roughness: 0.4 }),
  pinGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.3, roughness: 0.4 }),
  steelPinShaft: new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 }),
};

// ============================================================================
// 1. CONVEX LENS HIGH FIDELITY AR MODEL
// ============================================================================

export function buildConvexLensModel(
  root: THREE.Group,
  state: LensSystemState,
  calc: OpticsCalculation,
  positions: { objectPos: number; lensPos: number; screenPos: number }
) {
  // Clear existing
  while (root.children.length > 0) root.remove(root.children[0]);

  const cmTo3D = (cm: number) => (cm - 50) * 0.05;

  // Contact shadow on table surface
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 2.0),
    new THREE.MeshBasicMaterial({ map: createContactShadowTexture(), transparent: true, opacity: 0.65 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  root.add(shadowPlane);

  // 1. Cast-iron dual-rail bed
  const bedGeo = new THREE.BoxGeometry(5.8, 0.12, 0.65);
  const bed = new THREE.Mesh(bedGeo, materials.castIron);
  bed.position.y = 0.06;
  root.add(bed);

  // Millimeter ruler strip on bed top
  const scaleTex = createBenchScaleTexture();
  const rulerGeo = new THREE.PlaneGeometry(5.4, 0.14);
  const rulerMat = new THREE.MeshStandardMaterial({ map: scaleTex, roughness: 0.4 });
  const ruler = new THREE.Mesh(rulerGeo, rulerMat);
  ruler.rotation.x = -Math.PI / 2;
  ruler.position.set(0, 0.125, 0);
  root.add(ruler);

  // Dual polished steel guide rails
  const railGeo = new THREE.CylinderGeometry(0.022, 0.022, 5.6, 24);
  const railFront = new THREE.Mesh(railGeo, materials.steelRail);
  railFront.rotation.z = Math.PI / 2;
  railFront.position.set(0, 0.17, 0.22);
  root.add(railFront);

  const railBack = new THREE.Mesh(railGeo, materials.steelRail);
  railBack.rotation.z = Math.PI / 2;
  railBack.position.set(0, 0.17, -0.22);
  root.add(railBack);

  // Bed Leveling Feet with knurled brass screws (4 corners)
  const footPositions = [
    [-2.7, 0, 0.26],
    [-2.7, 0, -0.26],
    [2.7, 0, 0.26],
    [2.7, 0, -0.26],
  ];
  footPositions.forEach(([x, y, z]) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 16), materials.brass);
    foot.position.set(x, 0.04, z);
    root.add(foot);
  });

  // Helper to create laboratory upright slider saddle
  const createSliderSaddle = (xPos: number, label: string) => {
    const saddleGroup = new THREE.Group();
    saddleGroup.position.x = cmTo3D(xPos);

    // Saddle block riding on rails
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.52), materials.castIron);
    block.position.y = 0.2;
    saddleGroup.add(block);

    // Chrome vernier index pointer
    const indexPointer = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.04, 16), materials.brass);
    indexPointer.rotation.z = Math.PI;
    indexPointer.position.set(0, 0.28, 0.1);
    saddleGroup.add(indexPointer);

    // Knurled brass locking thumbscrew
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), materials.brass);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0, 0.2, 0.28);
    saddleGroup.add(screw);

    // Heavy vertical chrome support pillar
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 20), materials.chrome);
    pillar.position.y = 0.42;
    saddleGroup.add(pillar);

    // Clamp collar with knurled screw
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 16), materials.brass);
    collar.position.y = 0.48;
    saddleGroup.add(collar);

    root.add(saddleGroup);
    return saddleGroup;
  };

  // ----------------------------------------------------
  // UPRIGHT 1: OBJECT (Illuminated Lamp House with Crosswires)
  // ----------------------------------------------------
  const objSaddle = createSliderSaddle(positions.objectPos, 'Object');
  const lampHouse = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.22), materials.bakeliteBlack);
  lampHouse.position.y = 0.65;
  objSaddle.add(lampHouse);

  // Glowing illuminated circular reticle aperture
  const reticleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32);
  const reticleMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
    roughness: 0.1,
  });
  const reticle = new THREE.Mesh(reticleGeo, reticleMat);
  reticle.rotation.z = Math.PI / 2;
  reticle.position.set(0.09, 0.65, 0);
  objSaddle.add(reticle);

  // Black cross-wire threads on aperture
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const wireV = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.15, 8), wireMat);
  wireV.position.set(0.102, 0.65, 0);
  objSaddle.add(wireV);

  const wireH = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.15, 8), wireMat);
  wireH.rotation.x = Math.PI / 2;
  wireH.position.set(0.102, 0.65, 0);
  objSaddle.add(wireH);

  // Warm point light emitted from target
  const lampLight = new THREE.PointLight(0xf59e0b, 1.8, 4.0);
  lampLight.position.set(0.12, 0.65, 0);
  objSaddle.add(lampLight);

  // ----------------------------------------------------
  // UPRIGHT 2: BICONVEX CROWN GLASS LENS & BRASS HOLDER
  // ----------------------------------------------------
  const lensSaddle = createSliderSaddle(positions.lensPos, 'Lens');

  // Brass circular lens rim
  const lensHolderRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.022, 20, 48),
    materials.brass
  );
  lensHolderRim.rotation.y = Math.PI / 2;
  lensHolderRim.position.y = 0.65;
  lensSaddle.add(lensHolderRim);

  // Double convex optical glass lens (beveled realistic curvature)
  const lensGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 36, 36),
    materials.crownGlass
  );
  lensGlass.scale.set(0.28, 1.0, 1.0);
  lensGlass.position.y = 0.65;
  lensSaddle.add(lensGlass);

  // Knurled tightening thumb screw on top of lens ring
  const topScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 16), materials.brass);
  topScrew.position.set(0, 0.92, 0);
  lensSaddle.add(topScrew);

  // ----------------------------------------------------
  // UPRIGHT 3: GROUND GLASS RECEIVING SCREEN WITH FOCUS
  // ----------------------------------------------------
  const screenSaddle = createSliderSaddle(positions.screenPos, 'Screen');

  // Screen canvas texture reflecting focus / blur
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 512;
  const sCtx = screenCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#f8fafc';
    sCtx.fillRect(0, 0, 512, 512);

    // Screen millimeter grid
    sCtx.strokeStyle = '#e2e8f0';
    sCtx.lineWidth = 1;
    for (let p = 0; p <= 512; p += 32) {
      sCtx.beginPath();
      sCtx.moveTo(p, 0);
      sCtx.lineTo(p, 512);
      sCtx.moveTo(0, p);
      sCtx.lineTo(512, p);
      sCtx.stroke();
    }

    // Cross-hairs
    sCtx.strokeStyle = '#94a3b8';
    sCtx.lineWidth = 2;
    sCtx.beginPath();
    sCtx.moveTo(256, 0);
    sCtx.lineTo(256, 512);
    sCtx.moveTo(0, 256);
    sCtx.lineTo(512, 256);
    sCtx.stroke();

    // Projected Inverted Image of Cross-Wire / Arrow
    const screenDist = positions.screenPos - positions.lensPos;
    const focusError = Math.abs(screenDist - calc.imageDistance);
    const blurPx = Math.min(40, (focusError / Math.max(calc.imageDistance, 1)) * 50);

    sCtx.save();
    if (blurPx > 0.5) sCtx.filter = `blur(${blurPx.toFixed(1)}px)`;

    if (calc.isReal) {
      // Inverted illuminated target image
      const imgH = Math.min(180, Math.abs(calc.magnification) * 60);
      sCtx.fillStyle = '#f59e0b';
      sCtx.strokeStyle = '#b45309';
      sCtx.lineWidth = 3;

      // Inverted arrow pointing down
      sCtx.beginPath();
      sCtx.moveTo(256, 256);
      sCtx.lineTo(256, 256 + imgH);
      sCtx.stroke();

      sCtx.beginPath();
      sCtx.moveTo(256, 256 + imgH);
      sCtx.lineTo(240, 256 + imgH - 24);
      sCtx.lineTo(272, 256 + imgH - 24);
      sCtx.closePath();
      sCtx.fill();
      sCtx.stroke();
    } else {
      sCtx.font = 'bold 20px system-ui';
      sCtx.fillStyle = '#64748b';
      sCtx.textAlign = 'center';
      sCtx.fillText('Virtual Image Formed', 256, 240);
      sCtx.font = '14px system-ui';
      sCtx.fillText('(Cannot be caught on screen)', 256, 275);
    }
    sCtx.restore();
  }

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.48, 0.48),
    new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.35 })
  );
  screenPlate.position.y = 0.65;
  screenSaddle.add(screenPlate);

  // Black screen bezel
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.52, 0.52), materials.bakeliteBlack);
  bezel.position.set(-0.005, 0.65, 0);
  screenSaddle.add(bezel);

  // ----------------------------------------------------
  // 4. LUMINOUS 3D RAY BEAMS
  // ----------------------------------------------------
  const raysGroup = new THREE.Group();
  root.add(raysGroup);

  const objX = cmTo3D(positions.objectPos);
  const lensX = cmTo3D(positions.lensPos);
  const objTipY = 0.65 + 0.08; // Height of object arrow tip
  const centerO = new THREE.Vector3(lensX, 0.65, 0);
  const f3D = (state.focalLength * 0.05);

  const createLuminousRay = (points: THREE.Vector3[], hexColor: number) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(curve, 32, 0.005, 8, false);
    const mat = new THREE.MeshBasicMaterial({ color: hexColor });
    const rayMesh = new THREE.Mesh(geom, mat);
    raysGroup.add(rayMesh);

    // Glowing traveling photons along light path
    const photonGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const photonMat = new THREE.MeshBasicMaterial({ color: hexColor });
    for (let i = 0; i < 4; i++) {
      const photon = new THREE.Mesh(photonGeo, photonMat);
      const initProg = i / 4;
      photon.position.copy(curve.getPointAt(initProg));
      photon.userData = {
        isLightPulse: true,
        curve,
        progress: initProg,
        speed: 0.012,
      };
      raysGroup.add(photon);
    }

    return rayMesh;
  };

  // Ray 1: Parallel to principal axis -> Refracts through right focus F2
  const p1Start = new THREE.Vector3(objX, objTipY, 0);
  const p1Lens = new THREE.Vector3(lensX, objTipY, 0);
  const p1Focus = new THREE.Vector3(lensX + f3D, 0.65, 0);
  const p1End = new THREE.Vector3(lensX + 2.5, 0.65 - ((2.5 - f3D) / f3D) * 0.08, 0);
  createLuminousRay([p1Start, p1Lens], 0x38bdf8);
  createLuminousRay([p1Lens, p1Focus, p1End], 0x38bdf8);

  // Ray 2: Passing straight through optical center O
  const p2Start = new THREE.Vector3(objX, objTipY, 0);
  const p2End = new THREE.Vector3(lensX + 2.5, 0.65 - (2.5 / (lensX - objX)) * 0.08, 0);
  createLuminousRay([p2Start, centerO, p2End], 0xa855f7);

  // Ray 3: Through left focus F1 -> Refracts parallel to principal axis
  if (lensX - f3D > objX) {
    const p3Start = new THREE.Vector3(objX, objTipY, 0);
    const p3Focus = new THREE.Vector3(lensX - f3D, 0.65, 0);
    const p3LensY = 0.65 - (f3D / (lensX - f3D - objX)) * 0.08;
    const p3Lens = new THREE.Vector3(lensX, p3LensY, 0);
    const p3End = new THREE.Vector3(lensX + 2.5, p3LensY, 0);
    createLuminousRay([p3Start, p3Focus, p3Lens], 0x22c55e);
    createLuminousRay([p3Lens, p3End], 0x22c55e);
  }
}

// ============================================================================
// 2. CONCAVE MIRROR HIGH FIDELITY AR MODEL
// ============================================================================

export function buildConcaveMirrorModel(
  root: THREE.Group,
  state: MirrorSystemState,
  calc: MirrorCalculationResult,
  positions: { objectPos: number; mirrorPos: number; screenPos: number }
) {
  while (root.children.length > 0) root.remove(root.children[0]);

  const cmTo3D = (cm: number) => (cm - 50) * 0.05;

  // Contact shadow on table surface
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 2.0),
    new THREE.MeshBasicMaterial({ map: createContactShadowTexture(), transparent: true, opacity: 0.65 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  root.add(shadowPlane);

  // 1. Dual Rail Bench with Scale
  const bedGeo = new THREE.BoxGeometry(5.8, 0.12, 0.65);
  const bed = new THREE.Mesh(bedGeo, materials.castIron);
  bed.position.y = 0.06;
  root.add(bed);

  const scaleTex = createBenchScaleTexture();
  const ruler = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.14), new THREE.MeshStandardMaterial({ map: scaleTex }));
  ruler.rotation.x = -Math.PI / 2;
  ruler.position.set(0, 0.125, 0);
  root.add(ruler);

  const railGeo = new THREE.CylinderGeometry(0.022, 0.022, 5.6, 24);
  const rail1 = new THREE.Mesh(railGeo, materials.steelRail);
  rail1.rotation.z = Math.PI / 2;
  rail1.position.set(0, 0.17, 0.22);
  root.add(rail1);
  const rail2 = new THREE.Mesh(railGeo, materials.steelRail);
  rail2.rotation.z = Math.PI / 2;
  rail2.position.set(0, 0.17, -0.22);
  root.add(rail2);

  const createSliderSaddle = (xPos: number) => {
    const grp = new THREE.Group();
    grp.position.x = cmTo3D(xPos);

    const blk = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.52), materials.castIron);
    blk.position.y = 0.2;
    grp.add(blk);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 20), materials.chrome);
    pillar.position.y = 0.42;
    grp.add(pillar);

    root.add(grp);
    return grp;
  };

  // UPRIGHT 1: OBJECT (Illuminated Candle with Flickering Flame)
  const objSaddle = createSliderSaddle(positions.objectPos);

  // Brass candle base
  const candleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 24), materials.brass);
  candleBase.position.y = 0.63;
  objSaddle.add(candleBase);

  // Wax candle cylinder
  const candleWax = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.22, 24),
    new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.5 })
  );
  candleWax.position.y = 0.75;
  objSaddle.add(candleWax);

  // Black wick
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.04, 8),
    new THREE.MeshBasicMaterial({ color: 0x111827 })
  );
  wick.position.y = 0.88;
  objSaddle.add(wick);

  // Glowing Teardrop Flame
  const flameGeo = new THREE.ConeGeometry(0.024, 0.08, 16);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = 0.93;
  objSaddle.add(flame);

  const flameLight = new THREE.PointLight(0xf59e0b, 1.8, 3.5);
  flameLight.position.y = 0.93;
  objSaddle.add(flameLight);

  // UPRIGHT 2: CONCAVE SPHERICAL MIRROR & GIMBAL
  const mirrorSaddle = createSliderSaddle(positions.mirrorPos);

  // Brass ring mount
  const mirrorRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.022, 20, 48),
    materials.brass
  );
  mirrorRing.rotation.y = Math.PI / 2;
  mirrorRing.position.y = 0.75;
  mirrorSaddle.add(mirrorRing);

  // Spherical Concave Dish (Curved inward facing left toward object)
  const mirrorDishGeo = new THREE.SphereGeometry(0.235, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const mirrorDish = new THREE.Mesh(mirrorDishGeo, materials.concaveMirrorFront);
  mirrorDish.rotation.z = -Math.PI / 2;
  mirrorDish.position.set(0.05, 0.75, 0);
  mirrorSaddle.add(mirrorDish);

  // Back protective casing
  const mirrorBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.46),
    materials.castIron
  );
  mirrorBack.rotation.z = -Math.PI / 2;
  mirrorBack.position.set(0.055, 0.75, 0);
  mirrorSaddle.add(mirrorBack);

  // Focus F and Center of Curvature C Markers
  const f3D = state.focalLength * 0.05;
  const fMarker = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 16), materials.pinRed);
  fMarker.position.set(-f3D, 0.75, 0);
  mirrorSaddle.add(fMarker);

  const cMarker = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 16), materials.pinBlue);
  cMarker.position.set(-2 * f3D, 0.75, 0);
  mirrorSaddle.add(cMarker);

  // UPRIGHT 3: GROUND GLASS HALF-SCREEN
  const screenSaddle = createSliderSaddle(positions.screenPos);

  // Ground glass half screen (so it does not block incoming rays from the candle)
  const halfScreenPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.38, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
    })
  );
  halfScreenPlate.position.set(0, 0.75, 0.12); // Offset to side
  screenSaddle.add(halfScreenPlate);

  // Reflected Converging 3D Rays
  const raysGroup = new THREE.Group();
  root.add(raysGroup);

  const objX = cmTo3D(positions.objectPos);
  const mirrorX = cmTo3D(positions.mirrorPos);
  const flameTip = new THREE.Vector3(objX, 0.93, 0);
  const poleP = new THREE.Vector3(mirrorX, 0.75, 0);
  const focusPt = new THREE.Vector3(mirrorX - f3D, 0.75, 0);

  const makeRay = (pts: THREE.Vector3[], col: number) => {
    const c = new THREE.CatmullRomCurve3(pts);
    return new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.005, 8, false), new THREE.MeshBasicMaterial({ color: col }));
  };

  // Ray 1: Parallel to axis -> Reflects back through focus F
  const r1Mirror = new THREE.Vector3(mirrorX, 0.93, 0);
  const r1End = new THREE.Vector3(mirrorX - 2.5, 0.75 - ((2.5 - f3D) / f3D) * 0.18, 0);
  raysGroup.add(makeRay([flameTip, r1Mirror, focusPt, r1End], 0xf59e0b));

  // Ray 2: Incident at Pole P with equal angle
  const r2End = new THREE.Vector3(mirrorX - 2.5, 0.75 - (2.5 / Math.abs(mirrorX - objX)) * 0.18, 0);
  raysGroup.add(makeRay([flameTip, poleP, r2End], 0xec4899));
}

// ============================================================================
// 3. RECTANGULAR GLASS SLAB HIGH FIDELITY AR MODEL
// ============================================================================

export function buildGlassSlabModel(
  root: THREE.Group,
  state: GlassSlabState,
  calc: GlassSlabCalculationResult
) {
  while (root.children.length > 0) root.remove(root.children[0]);

  // Contact shadow on table surface
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 3.8),
    new THREE.MeshBasicMaterial({ map: createContactShadowTexture(), transparent: true, opacity: 0.65 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  root.add(shadowPlane);

  // 1. Teak Laboratory Drawing Board
  const boardGeo = new THREE.BoxGeometry(4.2, 0.12, 3.2);
  const board = new THREE.Mesh(boardGeo, materials.teakWood);
  board.position.y = 0.06;
  root.add(board);

  // 2. White Drawing Paper Pinned Down
  const paperTex = createDrawingPaperTexture();
  const paperGeo = new THREE.PlaneGeometry(3.6, 2.7);
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.85 });
  const paper = new THREE.Mesh(paperGeo, paperMat);
  paper.rotation.x = -Math.PI / 2;
  paper.position.set(0, 0.125, 0);
  root.add(paper);

  // 4 Colored Round Thumb Pins at Corners
  const pinCoords = [
    [-1.7, 0.13, -1.25, materials.pinRed],
    [1.7, 0.13, -1.25, materials.pinBlue],
    [-1.7, 0.13, 1.25, materials.pinYellow],
    [1.7, 0.13, 1.25, materials.pinGreen],
  ];
  pinCoords.forEach(([x, y, z, mat]) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), mat as THREE.Material);
    cap.position.set(x as number, y as number, z as number);
    root.add(cap);
  });

  // 3. Rectangular Crown Glass Slab
  const slabWidth = 2.4;
  const slabThickness = (state.slabThicknessCm / 6.0) * 1.0; // Scaled thickness
  const slabHeight = 0.35;

  const slabGeo = new THREE.BoxGeometry(slabWidth, slabHeight, slabThickness);
  const slab = new THREE.Mesh(slabGeo, materials.crownGlass);
  slab.position.set(0, 0.125 + slabHeight / 2, 0);
  root.add(slab);

  // Beveled Edge Accents
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.9 });
  const edgeTop = new THREE.Mesh(new THREE.BoxGeometry(slabWidth + 0.01, 0.01, slabThickness + 0.01), edgeMat);
  edgeTop.position.set(0, 0.125 + slabHeight, 0);
  root.add(edgeTop);

  // 4. Helium-Neon Green Laser Projector on Mini Stand
  const laserAngleRad = calc.angleIncidenceRad;
  const laserDist = 1.6;
  const laserX = -Math.sin(laserAngleRad) * laserDist;
  const laserZ = -slabThickness / 2 - Math.cos(laserAngleRad) * laserDist;

  const laserBody = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 24), materials.bakeliteBlack);
  laserBody.rotation.x = Math.PI / 2;
  laserBody.position.set(laserX, 0.125 + slabHeight / 2, laserZ);
  laserBody.lookAt(0, 0.125 + slabHeight / 2, -slabThickness / 2);
  root.add(laserBody);

  const laserHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 24), materials.brass);
  laserHead.rotation.x = Math.PI / 2;
  laserHead.position.set(laserX * 0.9, 0.125 + slabHeight / 2, laserZ * 0.9);
  root.add(laserHead);

  // 5. Light Rays (Incident, Refracted, Emergent, Undeviated Original)
  const raysGroup = new THREE.Group();
  root.add(raysGroup);

  const rayY = 0.125 + slabHeight / 2;
  const pEntry = new THREE.Vector3(0, rayY, -slabThickness / 2);
  const pStart = new THREE.Vector3(laserX, rayY, laserZ);

  // Refracted point at bottom face:
  const dxInside = slabThickness * Math.tan(calc.angleRefractionRad);
  const pExit = new THREE.Vector3(dxInside, rayY, slabThickness / 2);

  // Emergent point
  const emergentDist = 1.4;
  const pEmergent = new THREE.Vector3(
    dxInside + Math.sin(calc.angleEmergenceRad) * emergentDist,
    rayY,
    slabThickness / 2 + Math.cos(calc.angleEmergenceRad) * emergentDist
  );

  const makeBeam = (pts: THREE.Vector3[], col: number, radius = 0.008) => {
    const c = new THREE.CatmullRomCurve3(pts);
    return new THREE.Mesh(new THREE.TubeGeometry(c, 24, radius, 8, false), new THREE.MeshBasicMaterial({ color: col }));
  };

  // Incident ray (Vibrant Green)
  raysGroup.add(makeBeam([pStart, pEntry], 0x10b981));
  // Refracted ray inside glass (Glowing Emerald)
  raysGroup.add(makeBeam([pEntry, pExit], 0x34d399, 0.01));
  // Emergent ray (Vibrant Green, parallel to incident)
  raysGroup.add(makeBeam([pExit, pEmergent], 0x10b981));

  // Undeviated original path (Dashed Amber line)
  const pUndeviated = new THREE.Vector3(
    Math.sin(laserAngleRad) * (slabThickness + emergentDist),
    rayY,
    -slabThickness / 2 + Math.cos(laserAngleRad) * (slabThickness + emergentDist)
  );
  raysGroup.add(makeBeam([pEntry, pUndeviated], 0xf59e0b, 0.003));

  // 6. Four Optical Pins (P1, P2 along incident, P3, P4 along emergent)
  const makePin = (x: number, z: number, headMat: THREE.Material, label: string) => {
    const grp = new THREE.Group();
    grp.position.set(x, 0.125, z);

    // Steel shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 16), materials.steelPinShaft);
    shaft.position.y = 0.225;
    grp.add(shaft);

    // Colored sphere head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 16), headMat);
    head.position.y = 0.45;
    grp.add(head);

    root.add(grp);
  };

  makePin(pStart.x * 0.7, pStart.z * 0.7, materials.pinRed, 'P1');
  makePin(pStart.x * 0.35, pStart.z * 0.35, materials.pinRed, 'P2');
  makePin(pExit.x + (pEmergent.x - pExit.x) * 0.4, pExit.z + (pEmergent.z - pExit.z) * 0.4, materials.pinBlue, 'P3');
  makePin(pExit.x + (pEmergent.x - pExit.x) * 0.8, pExit.z + (pEmergent.z - pExit.z) * 0.8, materials.pinBlue, 'P4');
}

// ============================================================================
// 4. TRIANGULAR GLASS PRISM HIGH FIDELITY AR MODEL
// ============================================================================

export function buildGlassPrismModel(
  root: THREE.Group,
  state: PrismState,
  calc: PrismCalculationResult
) {
  while (root.children.length > 0) root.remove(root.children[0]);

  // Contact shadow on table surface
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 4.0),
    new THREE.MeshBasicMaterial({ map: createContactShadowTexture(), transparent: true, opacity: 0.65 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  root.add(shadowPlane);

  // 1. Laboratory Turntable Stand
  const baseGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.1, 48);
  const base = new THREE.Mesh(baseGeo, materials.teakWood);
  base.position.y = 0.05;
  root.add(base);

  // Protractor degree scale disc
  const discGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.02, 48);
  const discMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = 0.11;
  root.add(disc);

  // 2. Precision 60° Equilateral Glass Prism
  const prismSide = 0.9;
  const prismHeight = 1.1;

  // Extrude equilateral triangle shape
  const shape = new THREE.Shape();
  const hTri = (Math.sqrt(3) / 2) * prismSide;
  shape.moveTo(0, (2 / 3) * hTri);
  shape.lineTo(-prismSide / 2, -(1 / 3) * hTri);
  shape.lineTo(prismSide / 2, -(1 / 3) * hTri);
  shape.closePath();

  const prismGeo = new THREE.ExtrudeGeometry(shape, {
    depth: prismHeight,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  const prism = new THREE.Mesh(prismGeo, materials.crownGlass);
  prism.rotation.x = Math.PI / 2;
  prism.position.set(0, 0.12 + prismHeight, 0);
  root.add(prism);

  // 3. Collimated Light Slit Source Projector
  const projDist = 1.5;
  const incAngleRad = calc.angleIncidenceRad;
  const projX = -Math.sin(incAngleRad) * projDist;
  const projZ = -Math.cos(incAngleRad) * projDist;

  const projBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.36), materials.bakeliteBlack);
  projBody.position.set(projX, 0.55, projZ);
  projBody.lookAt(0, 0.55, 0);
  root.add(projBody);

  // Brass slit aperture
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.04), materials.brass);
  slit.position.set(projX * 0.9, 0.55, projZ * 0.9);
  slit.lookAt(0, 0.55, 0);
  root.add(slit);

  // 4. Dispersion Rainbow Spectrum Ribbon vs Monochromatic
  const raysGroup = new THREE.Group();
  root.add(raysGroup);

  const makeBeam = (pts: THREE.Vector3[], col: number, radius = 0.007) => {
    const c = new THREE.CatmullRomCurve3(pts);
    return new THREE.Mesh(new THREE.TubeGeometry(c, 24, radius, 8, false), new THREE.MeshBasicMaterial({ color: col }));
  };

  const pEntry = new THREE.Vector3(-0.25, 0.55, -0.15);
  const pSource = new THREE.Vector3(projX, 0.55, projZ);

  // White incident beam from slit projector
  raysGroup.add(makeBeam([pSource, pEntry], 0xffffff, 0.012));

  if (state.mode === 'dispersion' && calc.spectralRays && calc.spectralRays.length > 0) {
    // 7-Color VIBGYOR Rainbow Spectrum Band
    calc.spectralRays.forEach((ray, idx) => {
      const devRad = (ray.deviationDeg * Math.PI) / 180;
      const rInside = new THREE.Vector3(0.2, 0.55, -0.1 + idx * 0.02);
      const rScreen = new THREE.Vector3(
        1.5 * Math.cos(devRad * 0.6 + 0.2),
        0.55,
        1.5 * Math.sin(devRad * 0.6 + 0.2)
      );

      const colorHex = parseInt(ray.colorHex.replace('#', '0x'), 16);
      // Ray inside prism
      raysGroup.add(makeBeam([pEntry, rInside], colorHex, 0.006));
      // Emergent dispersed ray
      raysGroup.add(makeBeam([rInside, rScreen], colorHex, 0.008));
    });

    // Curved White Observation Screen catching the spectrum
    const screenGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.6, 32, 1, true, Math.PI * 0.1, Math.PI * 0.4);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide, roughness: 0.5 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.45, 0);
    root.add(screen);
  } else {
    // Monochromatic Refracted Ray (Single Green Ray)
    const pInside = new THREE.Vector3(0.22, 0.55, 0);
    const devRad = calc.angleDeviationRad;
    const pEmergent = new THREE.Vector3(
      1.5 * Math.cos(devRad * 0.6 + 0.2),
      0.55,
      1.5 * Math.sin(devRad * 0.6 + 0.2)
    );

    raysGroup.add(makeBeam([pEntry, pInside], 0x10b981, 0.008));
    raysGroup.add(makeBeam([pInside, pEmergent], 0x10b981, 0.008));
  }
}

// ============================================================================
// 5. OHM'S LAW & CIRCUIT APPARATUS HIGH FIDELITY AR MODEL
// ============================================================================

export function buildOhmsLawCircuitModel(
  root: THREE.Group,
  state: OhmsLawState,
  calc: OhmsLawCalculationResult
) {
  while (root.children.length > 0) root.remove(root.children[0]);

  // Contact shadow on table surface
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 4.0),
    new THREE.MeshBasicMaterial({ map: createContactShadowTexture(), transparent: true, opacity: 0.65 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  root.add(shadowPlane);

  // 1. Polished Hardwood Circuit Baseboard
  const boardGeo = new THREE.BoxGeometry(4.6, 0.12, 3.4);
  const board = new THREE.Mesh(boardGeo, materials.teakWood);
  board.position.y = 0.06;
  root.add(board);

  // 2. DC Battery Eliminator Caddy with Real Cylindrical Cells (Back Left)
  const caddy = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.72), materials.bakeliteBlack);
  caddy.position.set(-1.6, 0.18, -1.0);
  root.add(caddy);

  const batteryTex = createBatteryLabelTexture();
  const batteryMat = new THREE.MeshStandardMaterial({ map: batteryTex, roughness: 0.35, metalness: 0.25 });
  const cellCount = Math.max(1, Math.min(4, state.cellCount));

  for (let i = 0; i < cellCount; i++) {
    const cellZ = -1.22 + i * 0.15;
    // Cylindrical battery body
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.54, 24), batteryMat);
    cell.rotation.z = Math.PI / 2;
    cell.position.set(-1.6, 0.25, cellZ);
    root.add(cell);

    // Raised brass positive button nipple (+)
    const nipple = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16), materials.brass);
    nipple.rotation.z = Math.PI / 2;
    nipple.position.set(-1.31, 0.25, cellZ);
    root.add(nipple);

    // Negative silver base (-)
    const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), materials.chrome);
    spring.rotation.z = Math.PI / 2;
    spring.position.set(-1.89, 0.25, cellZ);
    root.add(spring);
  }

  // Red (+) and Black (-) Knurled Binding Posts on Battery
  const postPos = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 16), materials.pinRed);
  postPos.position.set(-1.38, 0.36, -0.65);
  root.add(postPos);

  const postNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 16), materials.bakeliteBlack);
  postNeg.position.set(-1.82, 0.36, -0.65);
  root.add(postNeg);

  // 3. Brass Plug Key on Vulcanite Block (Center Left)
  const keyBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.3), materials.bakeliteBlack);
  keyBase.position.set(-1.6, 0.16, 0.2);
  root.add(keyBase);

  // Two solid brass blocks with tapered central hole
  const brassBlock1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.22), materials.brassKnurled);
  brassBlock1.position.set(-1.72, 0.26, 0.2);
  root.add(brassBlock1);

  const brassBlock2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.22), materials.brassKnurled);
  brassBlock2.position.set(-1.48, 0.26, 0.2);
  root.add(brassBlock2);

  // Removable Tapered Brass Plug Pin (Elevates if key is open!)
  const plugPinY = state.isPlugKeyClosed ? 0.34 : 0.52;
  const plugPin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.14, 16), materials.brass);
  plugPin.position.set(-1.6, plugPinY, 0.2);
  root.add(plugPin);

  const plugHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), materials.bakeliteBlack);
  plugHandle.position.set(-1.6, plugPinY + 0.08, 0.2);
  root.add(plugHandle);

  // 4. Laboratory Wire-Wound Sliding Rheostat (Front Bottom)
  const rheoGroup = new THREE.Group();
  rheoGroup.position.set(0, 0.12, 1.1);
  root.add(rheoGroup);

  // Ceramic tube core with metallic winding texture
  const rheoCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.8, 24),
    materials.copperWire
  );
  rheoCore.rotation.z = Math.PI / 2;
  rheoCore.position.y = 0.16;
  rheoGroup.add(rheoCore);

  // Steel end support feet
  const rheoFoot1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.3), materials.castIron);
  rheoFoot1.position.set(-0.95, 0.12, 0);
  rheoGroup.add(rheoFoot1);

  const rheoFoot2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.3), materials.castIron);
  rheoFoot2.position.set(0.95, 0.12, 0);
  rheoGroup.add(rheoFoot2);

  // Chrome slider guide rod
  const sliderRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.9, 16), materials.chrome);
  sliderRod.rotation.z = Math.PI / 2;
  sliderRod.position.set(0, 0.34, 0);
  rheoGroup.add(sliderRod);

  // Movable Contact Wiper Collar
  const sliderPosFraction = Math.max(0, Math.min(1, state.rheostatResistance / 50));
  const sliderX = -0.75 + sliderPosFraction * 1.5;
  const wiperCollar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.18), materials.brassKnurled);
  wiperCollar.position.set(sliderX, 0.34, 0);
  rheoGroup.add(wiperCollar);

  // 5. Analog DC Ammeter (0 - 3A DC) (Top Center)
  const ammeterTex = createMeterDialTexture('A', 3);
  const ammeterBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 36), materials.bakeliteBlack);
  ammeterBody.position.set(0.2, 0.23, -0.9);
  root.add(ammeterBody);

  const ammeterDial = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 36),
    new THREE.MeshStandardMaterial({ map: ammeterTex, roughness: 0.3 })
  );
  ammeterDial.rotation.x = -Math.PI / 2;
  ammeterDial.position.set(0.2, 0.345, -0.9);
  root.add(ammeterDial);

  // Deflecting Red Needle for Ammeter
  const currentFraction = Math.min(1.0, calc.currentA / 3.0);
  const aNeedleAngle = Math.PI * 0.3 - currentFraction * Math.PI * 0.6; // Sweeps arc
  const aNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.26), materials.pinRed);
  aNeedle.position.set(0.2, 0.35, -0.9);
  aNeedle.rotation.y = aNeedleAngle;
  root.add(aNeedle);

  // 6. Analog DC Voltmeter (0 - 3V DC) (Center Right)
  const voltTex = createMeterDialTexture('V', 3);
  const voltBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 36), materials.bakeliteBlack);
  voltBody.position.set(1.4, 0.23, 0);
  root.add(voltBody);

  const voltDial = new THREE.Mesh(
    new THREE.CircleGeometry(0.35, 36),
    new THREE.MeshStandardMaterial({ map: voltTex, roughness: 0.3 })
  );
  voltDial.rotation.x = -Math.PI / 2;
  voltDial.position.set(1.4, 0.345, 0);
  root.add(voltDial);

  // Deflecting Red Needle for Voltmeter
  const voltFraction = Math.min(1.0, calc.measuredVoltageV / 3.0);
  const vNeedleAngle = Math.PI * 0.3 - voltFraction * Math.PI * 0.6;
  const vNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.26), materials.pinRed);
  vNeedle.position.set(1.4, 0.35, 0);
  vNeedle.rotation.y = vNeedleAngle;
  root.add(vNeedle);

  // 7. Unknown Resistance Coil & Color-Banded Resistor (Center)
  const spoolGroup = new THREE.Group();
  spoolGroup.position.set(0.2, 0.12, 0.15);
  root.add(spoolGroup);

  const spoolWood = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.28, 20), materials.teakWood);
  spoolWood.position.y = 0.14;
  spoolGroup.add(spoolWood);

  // Copper coil wound around middle
  const coilWire = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 24), materials.copperWire);
  coilWire.position.y = 0.14;
  spoolGroup.add(coilWire);

  // Real 4-Band Axial Carbon Film Resistor Mounted on Top
  const resBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.24, 16), materials.resistorCeramic);
  resBody.rotation.z = Math.PI / 2;
  resBody.position.y = 0.32;
  spoolGroup.add(resBody);

  // Resistor Bands:
  let b1Color = 0x10b981; // Green for 5 ohm default
  if (state.r1 === 2) b1Color = 0xef4444; // Red
  if (state.r1 === 10) b1Color = 0x78350f; // Brown

  const makeBand = (xPos: number, col: number) => {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.024, 16), new THREE.MeshBasicMaterial({ color: col }));
    band.rotation.z = Math.PI / 2;
    band.position.set(xPos, 0.32, 0);
    spoolGroup.add(band);
  };
  makeBand(-0.07, b1Color);  // 1st digit
  makeBand(-0.02, 0x0f172a); // 2nd digit (Black)
  makeBand(0.03, 0x0f172a);  // Multiplier
  makeBand(0.08, 0xf59e0b);  // Tolerance (Gold 5%)

  // Axial silver leads
  const leadL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), materials.chrome);
  leadL.rotation.z = Math.PI / 2;
  leadL.position.set(-0.17, 0.32, 0);
  spoolGroup.add(leadL);

  const leadR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), materials.chrome);
  leadR.rotation.z = Math.PI / 2;
  leadR.position.set(0.17, 0.32, 0);
  spoolGroup.add(leadR);

  // 8. Connecting Wires with Injection-Molded Banana Plugs & Animated Current Flow
  const makeBananaPlug = (pos: THREE.Vector3, col: number) => {
    const plug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.02, 0.07, 16),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
    );
    plug.position.copy(pos);
    root.add(plug);
  };

  const pulseGeo = new THREE.SphereGeometry(0.022, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Electric cyan charge
  const voltPulseMat = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald charge

  const addCurrentFlow = (curve: THREE.CatmullRomCurve3, count: number, isVoltBranch: boolean = false) => {
    if (!state.isPlugKeyClosed || calc.currentA <= 0.001) return;
    const speed = Math.min(0.022, Math.max(0.004, calc.currentA * 0.012));
    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(pulseGeo, isVoltBranch ? voltPulseMat : pulseMat);
      const prog = i / count;
      pMesh.position.copy(curve.getPointAt(prog));
      pMesh.userData = {
        isCurrentPulse: true,
        curve,
        progress: prog,
        speed,
      };
      root.add(pMesh);
    }
  };

  const makeWire = (pts: THREE.Vector3[], hexCol: number, pulseCount: number = 0, isVolt: boolean = false) => {
    const c = new THREE.CatmullRomCurve3(pts);
    makeBananaPlug(pts[0], hexCol);
    makeBananaPlug(pts[pts.length - 1], hexCol);
    if (pulseCount > 0) {
      addCurrentFlow(c, pulseCount, isVolt);
    }
    return new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.012, 8, false), new THREE.MeshStandardMaterial({ color: hexCol, roughness: 0.6 }));
  };

  // Wire 1: Battery (+) to Plug Key (Red)
  root.add(makeWire([
    new THREE.Vector3(-1.38, 0.36, -0.65),
    new THREE.Vector3(-1.5, 0.25, -0.2),
    new THREE.Vector3(-1.72, 0.28, 0.2),
  ], 0xef4444, 4));

  // Wire 2: Plug Key to Rheostat bottom terminal (Red)
  root.add(makeWire([
    new THREE.Vector3(-1.48, 0.28, 0.2),
    new THREE.Vector3(-1.2, 0.18, 0.6),
    new THREE.Vector3(-0.95, 0.24, 1.1),
  ], 0xef4444, 4));

  // Wire 3: Rheostat wiper to Resistor Spool (Yellow)
  root.add(makeWire([
    new THREE.Vector3(sliderX, 0.46, 1.1),
    new THREE.Vector3(0.1, 0.2, 0.7),
    new THREE.Vector3(0.1, 0.26, 0.15),
  ], 0xeab308, 5));

  // Wire 4: Resistor to Ammeter (+) (Yellow)
  root.add(makeWire([
    new THREE.Vector3(0.3, 0.26, 0.15),
    new THREE.Vector3(0.3, 0.2, -0.3),
    new THREE.Vector3(0.2, 0.35, -0.75),
  ], 0xeab308, 5));

  // Wire 5: Ammeter (-) back to Battery (-) (Black)
  root.add(makeWire([
    new THREE.Vector3(0.05, 0.35, -0.9),
    new THREE.Vector3(-0.8, 0.22, -1.1),
    new THREE.Vector3(-1.82, 0.36, -0.65),
  ], 0x1e293b, 6));

  // Parallel Voltmeter Wires (Green) across Resistor Spool
  root.add(makeWire([
    new THREE.Vector3(0.1, 0.26, 0.15),
    new THREE.Vector3(0.7, 0.25, 0.25),
    new THREE.Vector3(1.25, 0.35, 0),
  ], 0x10b981, 3, true));

  root.add(makeWire([
    new THREE.Vector3(0.3, 0.26, 0.15),
    new THREE.Vector3(0.8, 0.25, 0.05),
    new THREE.Vector3(1.55, 0.35, 0),
  ], 0x10b981, 3, true));
}
