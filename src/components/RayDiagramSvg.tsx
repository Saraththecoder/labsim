'use client';

import React from 'react';
import { calculateOptics, generatePrincipalRays, LensSystemState } from '@/lib/physics';

interface RayDiagramSvgProps {
  state: LensSystemState;
  showRays?: {
    ray1?: boolean;
    ray2?: boolean;
    ray3?: boolean;
    virtual?: boolean;
    labels?: boolean;
  };
  width?: number | string;
  height?: number;
  className?: string;
}

export function RayDiagramSvg({
  state,
  showRays = { ray1: true, ray2: true, ray3: true, virtual: true, labels: true },
  width = '100%',
  height = 320,
  className = '',
}: RayDiagramSvgProps) {
  const calc = calculateOptics(state);
  const { focalLength: f, objectDistance: u, objectHeight: ho } = state;
  const { isReal, cartesianV, imageHeight: hi } = calc;

  // Coordinate mapping for SVG:
  // Let SVG viewBox be from x: -100 to +100 cm, y: -25 to +25 cm
  // We'll scale coordinates to fit standard 800x320 SVG viewBox
  const vbWidth = 840;
  const vbHeight = 320;
  const cx = vbWidth / 2; // Lens optical centre X in SVG
  const cy = vbHeight / 2; // Principal axis Y in SVG
  const scale = 5.2; // 1 cm = 5.2 px

  // Function to map physics (x, y) to SVG (px, py)
  // Physics x: cm (lens is at 0, object is at -u, etc.)
  // Physics y: cm (above axis is positive)
  const toSvgX = (x: number) => cx + x * scale;
  const toSvgY = (y: number) => cy - y * scale;

  const rays = generatePrincipalRays(state, calc);

  // Position coordinates
  const objX = toSvgX(-u);
  const objYBase = cy;
  const objYTip = toSvgY(ho);

  // Focal point coordinates
  const f1X = toSvgX(-f);
  const f2X = toSvgX(f);
  const twoF1X = toSvgX(-2 * f);
  const twoF2X = toSvgX(2 * f);

  // Image coordinates
  const imgX = toSvgX(cartesianV);
  const imgYBase = cy;
  const imgYTip = toSvgY(hi);

  return (
    <div className={`w-full overflow-hidden rounded-xl bg-[#090e1a] border border-slate-800/80 p-2 shadow-inner ${className}`}>
      <svg
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="w-full h-auto select-none"
        style={{ maxHeight: height }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="lensGlass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="roseGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow markers */}
          <marker id="arrowCyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00f0ff" />
          </marker>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
          </marker>
          <marker id="arrowRose" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Grid lines (subtle) */}
        <line x1="0" y1={cy - 80} x2={vbWidth} y2={cy - 80} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="0" y1={cy + 80} x2={vbWidth} y2={cy + 80} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

        {/* Principal Axis */}
        <line
          x1="20"
          y1={cy}
          x2={vbWidth - 20}
          y2={cy}
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
        <text x="35" y={cy - 8} fill="#64748b" fontSize="11" fontFamily="monospace">
          Principal Axis
        </text>

        {/* Optical Axis of Lens (vertical centerline) */}
        <line
          x1={cx}
          y1={25}
          x2={cx}
          y2={vbHeight - 25}
          stroke="#0284c7"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.6"
        />

        {/* Focal Points and 2F Markers */}
        {[
          { x: twoF1X, label: '2F₁', sub: `(-${(2 * f).toFixed(0)}cm)` },
          { x: f1X, label: 'F₁', sub: `(-${f.toFixed(0)}cm)` },
          { x: cx, label: 'O', sub: '(0,0)' },
          { x: f2X, label: 'F₂', sub: `(+${f.toFixed(0)}cm)` },
          { x: twoF2X, label: '2F₂', sub: `(+${(2 * f).toFixed(0)}cm)` },
        ].map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={cy} r="3" fill="#38bdf8" />
            <text
              x={pt.x}
              y={cy + 18}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="12"
              fontWeight="bold"
            >
              {pt.label}
            </text>
            <text
              x={pt.x}
              y={cy + 30}
              textAnchor="middle"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {pt.sub}
            </text>
          </g>
        ))}

        {/* Convex Lens Shape */}
        <g>
          {/* Double convex lens path */}
          <path
            d={`M ${cx} 30 C ${cx + 28} ${cy * 0.6}, ${cx + 28} ${cy * 1.4}, ${cx} ${vbHeight - 30} C ${cx - 28} ${cy * 1.4}, ${cx - 28} ${cy * 0.6}, ${cx} 30 Z`}
            fill="url(#lensGlass)"
            stroke="#38bdf8"
            strokeWidth="1.75"
          />
          {/* Lens curvature highlights */}
          <path
            d={`M ${cx - 2} 40 C ${cx + 20} ${cy * 0.65}, ${cx + 20} ${cy * 1.35}, ${cx - 2} ${vbHeight - 40}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity="0.4"
          />
          <text x={cx} y="22" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="600">
            Convex Lens (f = +{f}cm)
          </text>
        </g>

        {/* Light Rays */}
        {rays.map((ray) => {
          const isRay1 = ray.id === 'ray1';
          const isRay2 = ray.id === 'ray2';
          const isRay3 = ray.id === 'ray3';

          if (isRay1 && !showRays.ray1) return null;
          if (isRay2 && !showRays.ray2) return null;
          if (isRay3 && !showRays.ray3) return null;

          const filter = isRay1 ? 'url(#cyanGlow)' : isRay2 ? 'url(#amberGlow)' : 'url(#roseGlow)';
          const marker = isRay1 ? 'url(#arrowCyan)' : isRay2 ? 'url(#arrowAmber)' : 'url(#arrowRose)';

          // SVG path from points
          const pathD = ray.points.reduce((acc, pt, idx) => {
            const sx = toSvgX(pt.x);
            const sy = toSvgY(pt.y);
            return `${acc} ${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
          }, '');

          // Virtual backward extensions
          let virtPathD = '';
          if (ray.virtualPoints && showRays.virtual) {
            virtPathD = ray.virtualPoints.reduce((acc, pt, idx) => {
              const sx = toSvgX(pt.x);
              const sy = toSvgY(pt.y);
              return `${acc} ${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
            }, '');
          }

          return (
            <g key={ray.id}>
              {/* Virtual extension line */}
              {virtPathD && (
                <path
                  d={virtPathD}
                  fill="none"
                  stroke={ray.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
              )}
              {/* Primary light ray */}
              <path
                d={pathD}
                fill="none"
                stroke={ray.color}
                strokeWidth="2.2"
                filter={filter}
                markerMid={marker}
              />
            </g>
          );
        })}

        {/* Object Arrow (AB) */}
        <g>
          {/* Arrow shaft */}
          <line
            x1={objX}
            y1={objYBase}
            x2={objX}
            y2={objYTip}
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <polygon
            points={`${objX},${objYTip - 6} ${objX - 6},${objYTip + 4} ${objX + 6},${objYTip + 4}`}
            fill="#fbbf24"
          />
          {/* Object labels */}
          <text x={objX - 12} y={objYTip} fill="#fbbf24" fontSize="12" fontWeight="bold">
            A
          </text>
          <text x={objX - 12} y={objYBase - 4} fill="#fbbf24" fontSize="12" fontWeight="bold">
            B
          </text>
          <text x={objX} y={objYBase + 18} textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="600">
            Object (hₒ={ho}cm)
          </text>
        </g>

        {/* Image Arrow (A'B') */}
        {isFinite(cartesianV) && Math.abs(cartesianV) < 150 && (
          <g>
            {/* Arrow shaft */}
            <line
              x1={imgX}
              y1={imgYBase}
              x2={imgX}
              y2={imgYTip}
              stroke={isReal ? '#34d399' : '#a855f7'}
              strokeWidth={isReal ? '3.5' : '2.5'}
              strokeDasharray={isReal ? undefined : '5 3'}
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            {isReal ? (
              // Inverted arrowhead pointing downward
              <polygon
                points={`${imgX},${imgYTip + 6} ${imgX - 6},${imgYTip - 4} ${imgX + 6},${imgYTip - 4}`}
                fill="#34d399"
              />
            ) : (
              // Erect arrowhead pointing upward
              <polygon
                points={`${imgX},${imgYTip - 6} ${imgX - 6},${imgYTip + 4} ${imgX + 6},${imgYTip + 4}`}
                fill="#a855f7"
              />
            )}
            {/* Image labels */}
            <text x={imgX + 10} y={imgYTip} fill={isReal ? '#34d399' : '#c084fc'} fontSize="12" fontWeight="bold">
              A&apos;
            </text>
            <text x={imgX + 10} y={imgYBase - 4} fill={isReal ? '#34d399' : '#c084fc'} fontSize="12" fontWeight="bold">
              B&apos;
            </text>
            <text
              x={imgX}
              y={isReal ? imgYBase + 18 : imgYBase + 18}
              textAnchor="middle"
              fill={isReal ? '#6ee7b7' : '#e9d5ff'}
              fontSize="11"
              fontWeight="600"
            >
              {isReal ? 'Real Image' : 'Virtual Image'} (hᵢ={hi.toFixed(1)}cm)
            </text>
          </g>
        )}

        {/* Object Distance Indicator u */}
        {showRays.labels && (
          <g>
            <line x1={objX} y1={cy + 42} x2={cx} y2={cy + 42} stroke="#fbbf24" strokeWidth="1" />
            <line x1={objX} y1={cy + 37} x2={objX} y2={cy + 47} stroke="#fbbf24" strokeWidth="1" />
            <line x1={cx} y1={cy + 37} x2={cx} y2={cy + 47} stroke="#fbbf24" strokeWidth="1" />
            <text x={(objX + cx) / 2} y={cy + 55} textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">
              u = {u.toFixed(1)} cm
            </text>
          </g>
        )}

        {/* Image Distance Indicator v */}
        {showRays.labels && isFinite(cartesianV) && Math.abs(cartesianV) < 150 && (
          <g>
            <line x1={cx} y1={cy + 42} x2={imgX} y2={cy + 42} stroke={isReal ? '#34d399' : '#a855f7'} strokeWidth="1" />
            <line x1={cx} y1={cy + 37} x2={cx} y2={cy + 47} stroke={isReal ? '#34d399' : '#a855f7'} strokeWidth="1" />
            <line x1={imgX} y1={cy + 37} x2={imgX} y2={cy + 47} stroke={isReal ? '#34d399' : '#a855f7'} strokeWidth="1" />
            <text
              x={(cx + imgX) / 2}
              y={cy + 55}
              textAnchor="middle"
              fill={isReal ? '#34d399' : '#a855f7'}
              fontSize="11"
              fontFamily="monospace"
            >
              v = {calc.imageDistance.toFixed(1)} cm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
