import * as THREE from 'three';

/**
 * Generates an animated, procedural water caustic and normal texture
 * for realistic fluid refraction, liquid ripples, and caustic light patterns.
 */
export function createWaterCausticTexture(width = 512, height = 512): {
  texture: THREE.CanvasTexture;
  update: (time: number) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const update = (time: number) => {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const t = time * 1.5;
    const w = width;
    const h = height;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        // Multi-frequency sine wave caustics
        const fx = x * 0.035;
        const fy = y * 0.035;

        const wave1 = Math.sin(fx + t * 0.8) + Math.cos(fy + t * 0.6);
        const wave2 = Math.sin(fx * 1.8 - t * 0.7) + Math.cos(fy * 1.5 + t * 0.9);
        const wave3 = Math.sin((fx + fy) * 1.2 + t * 1.1);

        // Caustic cell intensity
        let v = (wave1 + wave2 + wave3) / 3;
        v = Math.pow(Math.abs(v), 2.2); // sharpen caustics
        const intensity = Math.min(255, Math.floor(v * 200 + 40));

        // Normal-map components (R=dX, G=dY, B=dZ)
        const dX = Math.floor(128 + Math.cos(fx + t) * 60);
        const dY = Math.floor(128 + Math.sin(fy + t) * 60);

        const idx = (y * w + x) * 4;
        data[idx] = dX;
        data[idx + 1] = dY;
        data[idx + 2] = intensity;
        data[idx + 3] = 255;

        // duplicate to 2x2 for speed
        const idxR = (y * w + (x + 1)) * 4;
        data[idxR] = dX;
        data[idxR + 1] = dY;
        data[idxR + 2] = intensity;
        data[idxR + 3] = 255;

        const idxD = ((y + 1) * w + x) * 4;
        data[idxD] = dX;
        data[idxD + 1] = dY;
        data[idxD + 2] = intensity;
        data[idxD + 3] = 255;

        const idxDR = ((y + 1) * w + (x + 1)) * 4;
        data[idxDR] = dX;
        data[idxDR + 1] = dY;
        data[idxDR + 2] = intensity;
        data[idxDR + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    texture.needsUpdate = true;
  };

  // initial paint
  update(0);

  return { texture, update };
}

/**
 * Creates a soft caustic pool projection texture for the beaker bottom
 */
export function createCausticPoolTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const rad = size / 2;
  const grad = ctx.createRadialGradient(rad, rad, 10, rad, rad, rad);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.6)');
  grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle web spokes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(rad, rad);
    ctx.quadraticCurveTo(
      rad + Math.cos(angle + 0.3) * (rad * 0.6),
      rad + Math.sin(angle + 0.3) * (rad * 0.6),
      rad + Math.cos(angle) * (rad * 0.85),
      rad + Math.sin(angle) * (rad * 0.85)
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/**
 * Creates a white enamel Pyrex graduation texture for 250mL beaker
 */
export function createBeakerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.font = 'bold 28px sans-serif';

  // Pyrex Logo
  ctx.fillText('PYREX®', 180, 260);
  ctx.font = '20px sans-serif';
  ctx.fillText('250 mL', 180, 290);
  ctx.fillText('± 5%', 180, 315);

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
}
