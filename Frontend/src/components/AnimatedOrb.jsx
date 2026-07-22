import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ============================================================
   AnimatedOrb - production-ready recreation of the reference
   video: a glassy dark-teal sphere with a soft rotating rainbow
   arc (not a closed ring - it fades out for part of the turn)
   and two eyes that blink, then glance right, then left, on a loop.

   Built with real SVG geometry (no CSS conic-gradient hack):
   the arc is drawn as ~72 thin wedge slices, each colour
   interpolated from a handful of keyframe stops, then softened
   with an SVG Gaussian blur so the seams disappear and it reads
   as a smooth gradient. Framer Motion drives the rotation, the
   idle "breathing" of the core, and the eye blink/gaze cycle.

   Usage:
     <AnimatedOrb size={64} />                 // launcher button
     <AnimatedOrb size={28} spin={false} />     // static header mark
     <AnimatedOrb size={96} spinDuration={4} /> // faster spin

   Props:
     size          number  - max width/height in px (default 64)
     spin          bool    - rotate the arc (default true)
     spinDuration  number  - seconds per revolution (default 6)
     breathe       bool    - subtle core pulse (default true)
     className     string  - passthrough class on the wrapper
     style         object  - passthrough style on the wrapper
============================================================= */

// Keyframe stops for the arc: angle (0-360) -> [r,g,b].
// Continuous loop - no gap, no transparency, no white - pure rainbow
// all the way around. First and last stop match so it wraps seamlessly.
const ARC_STOPS = [
  [0, [47, 165, 146]], // teal
  [51, [63, 169, 245]], // blue
  [103, [124, 108, 255]], // purple
  [154, [255, 93, 162]], // pink
  [206, [255, 122, 69]], // orange
  [257, [255, 210, 63]], // yellow
  [309, [143, 214, 148]], // green
  [360, [47, 165, 146]], // wrap back to teal
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorAt(angle) {
  const a = ((angle % 360) + 360) % 360;
  for (let i = 0; i < ARC_STOPS.length - 1; i++) {
    const [a0, c0] = ARC_STOPS[i];
    const [a1, c1] = ARC_STOPS[i + 1];
    if (a >= a0 && a <= a1) {
      const t = a1 === a0 ? 0 : (a - a0) / (a1 - a0);
      return c0.map((v, idx) => lerp(v, c1[idx], t));
    }
  }
  return ARC_STOPS[0][1];
}

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Gentle organic wobble so the ring reads as a soft, flowing band rather
// than a crisp geometric circle - like the "watery" edge in the reference.
function wobble(angleDeg, amp) {
  const rad = (angleDeg * Math.PI) / 180;
  return amp * (Math.sin(rad * 3 + 0.6) * 0.6 + Math.sin(rad * 7 + 2.1) * 0.4);
}

// One thin annulus wedge, used as a "pixel" of the faked conic gradient.
function wedgePath(cx, cy, innerR, outerR, a0, a1) {
  const o0 = polar(cx, cy, outerR, a0);
  const o1 = polar(cx, cy, outerR, a1);
  const i1 = polar(cx, cy, innerR, a1);
  const i0 = polar(cx, cy, innerR, a0);
  return `M ${o0.x} ${o0.y} A ${outerR} ${outerR} 0 0 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 0 0 ${i0.x} ${i0.y} Z`;
}

function useArcSegments(segments, innerR, outerR, wobbleAmp = 0) {
  return useMemo(() => {
    const step = 360 / segments;
    const out = [];
    for (let i = 0; i < segments; i++) {
      const a0 = i * step;
      const a1 = a0 + step;
      const mid = a0 + step / 2;
      const [r, g, b] = colorAt(mid);
      const outerWobbled = outerR + wobble(mid, wobbleAmp);
      out.push({
        d: wedgePath(50, 50, innerR, outerWobbled, a0, a1),
        fill: `rgb(${r}, ${g}, ${b})`,
      });
    }
    return out;
  }, [segments, innerR, outerR, wobbleAmp]);
}

function ArcLayer({ innerR, outerR, segments = 72, blurId, opacity = 1, wobbleAmp = 0 }) {
  const wedges = useArcSegments(segments, innerR, outerR, wobbleAmp);
  return (
    <g filter={blurId ? `url(#${blurId})` : undefined} opacity={opacity}>
      {wedges.map((w, i) => (
        <path key={i} d={w.d} fill={w.fill} />
      ))}
    </g>
  );
}

function AnimatedOrb({
  size = 64,
  spin = true,
  spinDuration = 6,
  breathe = true,
  className,
  style,
}) {
  const prefersReducedMotion = useReducedMotion();
  const shouldSpin = spin && !prefersReducedMotion;
  const shouldBreathe = breathe && !prefersReducedMotion;

  const uid = useMemo(() => Math.random().toString(36).slice(2, 9), []);
  const glowBlurId = `orb-glow-${uid}`;
  const softBlurId = `orb-soft-${uid}`;
  const coreGradId = `orb-core-${uid}`;
  const eyeGlowId = `orb-eye-${uid}`;

  return (
    <div
      className={className}
      style={{
        width: size,
        maxWidth: "100%",
        aspectRatio: "1 / 1",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="Assistant">
        <defs>
          {/* soft wide halo blur for the outer glow bleed */}
          <filter id={softBlurId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5.5" />
          </filter>
          {/* soft blur so wedge seams melt into a smooth, edge-less gradient */}
          <filter id={glowBlurId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          {/* glassy core: highlight offset toward upper-left */}
          <radialGradient id={coreGradId} cx="34%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#468e84" />
            <stop offset="40%" stopColor="#265c50" />
            <stop offset="75%" stopColor="#102c27" />
            <stop offset="100%" stopColor="#0a1c19" />
          </radialGradient>
          <filter id={eyeGlowId} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* rotating rainbow arc - two layers: soft outer bleed + defined band.
            Thin band, continuous hue (no gap/white), wobbled edge so it
            reads as a soft flowing band rather than a crisp circle. */}
        <motion.g
          style={{ originX: 0.5, originY: 0.5 }}
          animate={shouldSpin ? { rotate: 360 } : { rotate: 0 }}
          transition={
            shouldSpin
              ? { duration: spinDuration, repeat: Infinity, ease: "linear" }
              : { duration: 0 }
          }
        >
          <ArcLayer innerR={33} outerR={45} segments={48} blurId={softBlurId} opacity={0.5} wobbleAmp={3.5} />
          <ArcLayer innerR={33} outerR={41} segments={96} blurId={glowBlurId} wobbleAmp={2} />
        </motion.g>

        {/* glassy core */}
        <motion.circle
          cx="50"
          cy="50"
          r="32"
          fill={`url(#${coreGradId})`}
          animate={shouldBreathe ? { scale: [1, 1.02, 1] } : undefined}
          transition={
            shouldBreathe
              ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
          style={{ originX: 0.5, originY: 0.5 }}
        />

        {/* eyes: blink, then glance right, then left (looping) */}
        <g filter={`url(#${eyeGlowId})`}>
          <motion.rect
            y="41"
            width="6"
            height="18"
            rx="3"
            fill="#ffffff"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={
              shouldBreathe
                ? {
                    x: [36, 36, 36, 36, 40, 40, 36, 32, 32, 36, 36, 36, 36],
                    scaleY: [1, 1, 0.15, 1, 1, 1, 1, 1, 1, 1, 0.15, 1, 1],
                  }
                : { x: 36 }
            }
            transition={
              shouldBreathe
                ? {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.06, 0.1, 0.14, 0.3, 0.42, 0.5, 0.58, 0.7, 0.86, 0.92, 0.96, 1],
                  }
                : undefined
            }
          />
          <motion.rect
            y="41"
            width="6"
            height="18"
            rx="3"
            fill="#ffffff"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={
              shouldBreathe
                ? {
                    x: [58, 58, 58, 58, 62, 62, 58, 54, 54, 58, 58, 58, 58],
                    scaleY: [1, 1, 0.15, 1, 1, 1, 1, 1, 1, 1, 0.15, 1, 1],
                  }
                : { x: 58 }
            }
            transition={
              shouldBreathe
                ? {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.06, 0.1, 0.14, 0.3, 0.42, 0.5, 0.58, 0.7, 0.86, 0.92, 0.96, 1],
                  }
                : undefined
            }
          />
        </g>
      </svg>
    </div>
  );
}

export default React.memo(AnimatedOrb);
