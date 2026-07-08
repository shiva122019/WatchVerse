import { motion } from "framer-motion";

export function PrismoLogoMark({ size = 40, animate = false }) {
  const draw = animate
    ? {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i = 1) => ({
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { delay: i * 0.15, duration: 0.9, ease: "easeInOut" },
            opacity: { delay: i * 0.15, duration: 0.2 },
          },
        }),
      }
    : {};

  const G = animate ? motion.g : "g";
  const C = animate ? motion.circle : "circle";
  const P = animate ? motion.path : "path";
  const L = animate ? motion.line : "line";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Prismo logo"
    >
      <defs>
        <linearGradient id="prismoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <G>
        {/* Outer film reel ring */}
        <C
          cx="32"
          cy="32"
          r="26"
          stroke="url(#prismoGrad)"
          strokeWidth="2"
          fill="none"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={0}
        />
        {/* Inner book/soundwave bars */}
        <L
          x1="20"
          y1="24"
          x2="20"
          y2="40"
          stroke="#00F0FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={1}
        />
        <L
          x1="27"
          y1="18"
          x2="27"
          y2="46"
          stroke="#F5F5F5"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={1.4}
        />
        <L
          x1="34"
          y1="22"
          x2="34"
          y2="42"
          stroke="#FFB300"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={1.8}
        />
        <L
          x1="41"
          y1="20"
          x2="41"
          y2="44"
          stroke="#F5F5F5"
          strokeWidth="2.5"
          strokeLinecap="round"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={2.2}
        />
        {/* Small orbiting dot (film sprocket) */}
        <C
          cx="32"
          cy="6"
          r="2"
          fill="#00F0FF"
          variants={draw}
          initial={animate ? "hidden" : false}
          animate={animate ? "visible" : false}
          custom={2.6}
        />
      </G>
    </svg>
  );
}

export function PrismoWordmark({ className = "" }) {
  return (
    <span
      className={`font-display text-2xl font-semibold tracking-tight ${className}`}
    >
      Prismo
    </span>
  );
}
