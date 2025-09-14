// Footer.tsx
import React, { useEffect, useRef } from "react";
import { Github, Twitter, Mail, MapPin, Phone } from "lucide-react";

/* ---------------- images for two separate sliders ---------------- */
/* Top slider images */
const imagesTop = [
  "/images/ir01.jpg",
  "/images/ir0.jpg",
  "/images/ir2.jpg",
  "/images/ir1.jpg",
  "/images/ir3.jpg",
  "/images/ir4.jpg",
  "/images/ir5.jpg",
  "/images/ir6.jpg",
];

/* Bottom slider images (different set) */
const imagesBottom = [
  "/images/ir02.jpg",
  "/images/ir03.jpg",
  "/images/ir7.jpg",
  "/images/ir8.jpg",
  "/images/ir9.jpg",
  "/images/ir10.jpg",
  "/images/ir11.jpg",
  "/images/ir12.jpg",
];

/* ---------------- Continuous Loop Slider (keeps same optimized implementation) ---------------- */
type SliderProps = {
  images: string[];
  baseSpeedPxPerSec: number;
  direction: 1 | -1; // 1 moves items left visually (increases offset)
  tileSize?: number;
  maxBoost?: number; // maximum multiplier from scroll/wheel
};

const ContinuousLoopSlider: React.FC<SliderProps> = ({
  images,
  baseSpeedPxPerSec,
  direction,
  tileSize = 116,
  maxBoost = 6,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // runtime refs to avoid re-renders
  const offsetRef = useRef(0);
  const lastRAFRef = useRef<number | null>(null);
  const rafHandleRef = useRef<number | null>(null);
  const trackWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);

  // speed multiplier (boost from scroll/wheel). Decays smoothly
  const speedMultRef = useRef(1);
  const decayRef = useRef(0.92); // per-frame decay factor (adjustable for smoothness)
  const boostResetTimeout = useRef<number | null>(null);

  // scroll velocity detector
  const lastScrollYRef = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const lastScrollTSRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);

  // measure track width (one set)
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      // track contains two copies; width of one copy is half of scrollWidth
      trackWidthRef.current = trackRef.current.scrollWidth / 2 || 0;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [images.length, tileSize]);

  // smooth decay function called from RAF (keeps multiplier >1 briefly)
  const decayMultiplier = () => {
    // multiply toward 1 each frame (but not below 1)
    if (speedMultRef.current > 1.001) {
      speedMultRef.current *= decayRef.current;
      if (speedMultRef.current < 1) speedMultRef.current = 1;
    } else {
      speedMultRef.current = 1;
    }
  };

  // main animation loop
  useEffect(() => {
    const step = (t: number) => {
      if (!lastRAFRef.current) lastRAFRef.current = t;
      const dt = (t - lastRAFRef.current) / 1000;
      lastRAFRef.current = t;

      if (!isPausedRef.current && !isDraggingRef.current && trackWidthRef.current > 0) {
        const pxToMove = baseSpeedPxPerSec * speedMultRef.current * dt;
        offsetRef.current += pxToMove * direction;

        // modular wrap: keep in [0, trackWidth)
        const tw = trackWidthRef.current;
        if (tw > 0) {
          const m = ((offsetRef.current % tw) + tw) % tw;
          offsetRef.current = m;
        }

        // set transform using translate3d for GPU
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
        }
      }

      // decay multiplier each frame (smooth)
      decayMultiplier();

      rafHandleRef.current = requestAnimationFrame(step);
    };

    rafHandleRef.current = requestAnimationFrame(step);
    return () => {
      if (rafHandleRef.current) cancelAnimationFrame(rafHandleRef.current);
      lastRAFRef.current = null;
    };
  }, [baseSpeedPxPerSec, direction]);

  // handle wheel boost (small spike)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // small immediate boost depending on deltaY
      const boost = 1 + Math.min(Math.abs(e.deltaY) / 200, maxBoost - 1);
      speedMultRef.current = Math.max(speedMultRef.current, boost);
      if (boostResetTimeout.current) window.clearTimeout(boostResetTimeout.current);
      // ensure we start a timeout that will eventually allow decay to 1
      boostResetTimeout.current = window.setTimeout(() => {
        if (speedMultRef.current < 1) speedMultRef.current = 1;
      }, 200);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (boostResetTimeout.current) window.clearTimeout(boostResetTimeout.current);
    };
  }, [maxBoost]);

  // handle page scroll velocity to boost slider speed
  useEffect(() => {
    let lastY = lastScrollYRef.current;
    let lastT = lastScrollTSRef.current;

    const onScroll = () => {
      const nowT = performance.now();
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      const dt = Math.max(8, nowT - lastT); // ms, avoid zero
      lastY = y;
      lastT = nowT;

      // px/sec approximation
      const velocity = (dy / dt) * 1000;
      // map velocity -> multiplier (tweak divisor for sensitivity)
      const mapped = 1 + Math.min(velocity / 1200, maxBoost - 1); // velocity/1200 gives reasonable scale
      speedMultRef.current = Math.max(speedMultRef.current, mapped);

      // schedule a reset (we rely on RAF decay too)
      if (boostResetTimeout.current) window.clearTimeout(boostResetTimeout.current);
      boostResetTimeout.current = window.setTimeout(() => {
        if (speedMultRef.current < 1) speedMultRef.current = 1;
      }, 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [maxBoost]);

  // pointer drag (pause while dragging and update offset)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      isPausedRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartOffsetRef.current = offsetRef.current;
      try {
        el.setPointerCapture((e as any).pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      const newOffset = dragStartOffsetRef.current - dx;
      if (trackWidthRef.current > 0) {
        const mod = ((newOffset % trackWidthRef.current) + trackWidthRef.current) % trackWidthRef.current;
        offsetRef.current = mod;
      } else {
        offsetRef.current = newOffset;
      }
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-offsetRef.current}px,0,0)`;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      isPausedRef.current = false;
      try {
        el.releasePointerCapture((e as any).pointerId);
      } catch {}
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // hover to pause (container-level)
  const onEnter = () => {
    isPausedRef.current = true;
  };
  const onLeave = () => {
    if (!isDraggingRef.current) isPausedRef.current = false;
  };

  // render duplicated images for seamless loop
  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={trackRef}
        className="flex gap-4 items-center"
        style={{
          willChange: "transform",
          transform: "translate3d(0,0,0)",
          backfaceVisibility: "hidden",
        }}
      >
        {images.map((src, i) => (
          <div
            key={`a-${i}`}
            /* make this div the "group" so hover styles apply to the whole tile */
            className="flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-gray-800 transition-all duration-300 ease-out group"
            style={{ width: tileSize, height: tileSize }}
          >
            <div className="relative w-full h-full">
              {/* image scales and brightens on group hover */}
              <img
                src={src}
                alt={`tile-${i}`}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
              />
              {/* soft overlay to add depth on hover */}
              <div className="absolute inset-0 rounded-xl pointer-events-none transition-shadow duration-300 ease-out group-hover:shadow-2xl" />
              {/* subtle border/ring on hover */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-400 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-80 pointer-events-none" />
            </div>
          </div>
        ))}
        {images.map((src, i) => (
          <div
            key={`b-${i}`}
            className="flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-gray-800 transition-all duration-300 ease-out group"
            style={{ width: tileSize, height: tileSize }}
          >
            <div className="relative w-full h-full">
              <img
                src={src}
                alt={`tile-dup-${i}`}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
              />
              <div className="absolute inset-0 rounded-xl pointer-events-none transition-shadow duration-300 ease-out group-hover:shadow-2xl" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-yellow-400 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-80 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- Footer (two sliders + content) ---------------- */
const Footer: React.FC = () => {
  // tweakable
  const tileSize = 116;
  const topSpeed = 48; // px/sec
  const bottomSpeed = 70; // px/sec
  const maxBoost = 6; // cap multiplier from scroll/wheel

  return (
    <footer className="bg-[#041726] text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* top slider uses imagesTop */}
        <ContinuousLoopSlider images={imagesTop} baseSpeedPxPerSec={topSpeed} direction={1} tileSize={tileSize} maxBoost={maxBoost} />
        <div className="h-4" />
        {/* bottom slider uses imagesBottom (different images) */}
        <ContinuousLoopSlider images={imagesBottom} baseSpeedPxPerSec={bottomSpeed} direction={-1} tileSize={tileSize} maxBoost={maxBoost} />
      </div>

      {/* footer content (keeps the screenshot-like alignment) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10">
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-extrabold text-yellow-400 tracking-tight">SAGITTARIUS</span>
            </div>
            <p className="text-gray-300 max-w-xs">
              Advancing biodiversity science through DNA-based species identification.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a href="https://github.com/sagittariusin" className="p-2 rounded-md bg-blue-700 text-white hover:opacity-90">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-md bg-blue-700 text-white hover:opacity-90">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-md bg-blue-700 text-white hover:opacity-90">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Data</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="#" className="hover:text-white">Portal</a></li>
                  <li><a href="#" className="hover:text-white">Data Packages</a></li>
                  <li><a href="#" className="hover:text-white">Primers</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
                  <li><a href="#" className="hover:text-white">Taxonomy</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Research Tools</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="#" className="hover:text-white">Workbench</a></li>
                  <li><a href="#" className="hover:text-white">Barcode ID</a></li>
                  <li><a href="#" className="hover:text-white">BOLDconnectR</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">About</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="#" className="hover:text-white">Mission</a></li>
                  <li><a href="#" className="hover:text-white">Team</a></li>
                  <li><a href="#" className="hover:text-white">Sponsors</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-3">Resources</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                  <li><a href="#" className="hover:text-white">Documentation</a></li>
                  <li><a href="#" className="hover:text-white">Standards</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact row and bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>Hindusthan college of engineering and technology, Coimbatore</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="w-5 h-5 text-yellow-400" />
              <span>+91 7305096778</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-5 h-5 text-yellow-400" />
              <span>sagittarius3in@gmail.com</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">© 2025 Sagittarius. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Advancing biodiversity science through DNA-based species identification.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
