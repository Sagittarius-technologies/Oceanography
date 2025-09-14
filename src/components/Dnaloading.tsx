import React from "react";

/**
 * Simple, lightweight DNA loader — SVG double-helix with animated strokes + rungs.
 * Props:
 *  - size: px diameter (number). Default 200.
 */
const DnaLoader: React.FC<{ size?: number }> = ({ size = 200 }) => {
  // SVG viewbox is 120x160, scale by size
  const style: React.CSSProperties = {
    width: size,
    height: (size * 160) / 120,
    display: "block",
    margin: "0 auto",
  };

  return (
    <div aria-hidden="true" style={{ width: size, height: (size * 160) / 120 }}>
      <svg
        viewBox="0 0 120 160"
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        className="dna-rotator"
      >
        <defs>
          <linearGradient id="strandA" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="strandB" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* left and right helical strands (smooth cubic curves) */}
        <g strokeWidth="2" fill="none">
          <path
            className="strand strand-left"
            d="M20 10 C44 30 44 130 20 150"
            stroke="url(#strandA)"
            strokeLinecap="round"
          />
          <path
            className="strand strand-right"
            d="M100 10 C76 30 76 130 100 150"
            stroke="url(#strandB)"
            strokeLinecap="round"
          />
        </g>

        {/* rungs connecting two strands — multiple short lines across helix */}
        <g stroke="#14b8a6" strokeWidth="1.6" strokeLinecap="round" className="rungs">
          {Array.from({ length: 11 }).map((_, i) => {
            const t = i / 10;
            // compute simple y position across range 15..145
            const y = 15 + t * 130;
            // compute x offsets to angle the rungs (visual)
            const offset = 18 * Math.sin(t * Math.PI * 2);
            const x1 = 20 + offset * 0.65;
            const x2 = 100 - offset * 0.65;
            return <line key={i} x1={x1} y1={y} x2={x2} y2={y} className="rung" />;
          })}
        </g>

        {/* subtle pulsing core dots for depth */}
        <g>
          {[30, 60, 90, 120].map((y) => (
            <circle
              key={y}
              cx="60"
              cy={y}
              r="2.6"
              fill="#ffffff"
              opacity="0.06"
              className="dna-core"
            />
          ))}
        </g>
      </svg>

      {/* component-local CSS to animate the loader */}
      <style>{`
        /* rotate whole SVG slowly */
        .dna-rotator {
          transform-origin: 50% 50%;
          animation: dna-rotate 10s linear infinite;
        }

        @keyframes dna-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* animated dash on strands to give 'flow' */
        .strand {
          stroke-dasharray: 6 10;
          stroke-dashoffset: 0;
          animation: strand-flow 2.6s linear infinite;
        }
        .strand-left { animation-direction: normal; }
        .strand-right { animation-direction: reverse; }

        @keyframes strand-flow {
          to { stroke-dashoffset: -100; }
        }

        /* rungs pulse in opacity to look alive */
        .rung { opacity: 0.18; animation: rung-pulse 1.8s ease-in-out infinite; }
        .rungs line:nth-child(odd) { animation-delay: 0.15s; }
        .rungs line:nth-child(even) { animation-delay: 0.45s; }

        @keyframes rung-pulse {
          0% { opacity: 0.12; transform: translateY(0); }
          50% { opacity: 0.9; transform: translateY(-1px); }
          100% { opacity: 0.12; transform: translateY(0); }
        }

        /* subtle core shimmer */
        .dna-core { animation: core-shimmer 3.2s ease-in-out infinite; }
        @keyframes core-shimmer {
          0% { opacity: 0.04; transform: scale(1); }
          50% { opacity: 0.12; transform: scale(1.15); }
          100% { opacity: 0.04; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default DnaLoader;
