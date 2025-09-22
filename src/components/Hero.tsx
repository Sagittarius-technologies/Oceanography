// src/components/HeroSection.tsx
import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronDown, Dna, Microscope, Fish } from 'lucide-react';

// types
interface Item {
  id: number;
  image: string;
  name: string;
  section: string;
  position?: { x: number; y: number };
}

interface HeroSectionProps {
  onNavigate?: (sectionId: string) => void;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'outline' | 'default';
}

// lightweight Button fallback
const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300';
  const outline = variant === 'outline'
    ? 'bg-transparent border border-teal-500 text-teal-600 hover:bg-teal-50'
    : 'text-white';
  const gradient = variant === 'outline' ? '' : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600';

  return (
    <button {...props} className={`${base} ${outline} ${gradient} ${className}`.trim()}>
      {children}
    </button>
  );
};

// thumbnails (your data)
const itemsTemplate: Item[] = [
  { id: 1, image: '/images/jellyfish-2.jpg', name: 'Marine Life', section: 'map' },
  { id: 2, image: '/images/parrot 2.jpg', name: 'Birds', section: 'gallery' },
  { id: 3, image: '/images/monkey.jpg', name: 'Mammals', section: 'process' },
  { id: 4, image: '/images/bee.jpg', name: 'Insects', section: 'data' },
];

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  // compute initial positions once (responsive)
  useEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      const leftX = Math.max(8, Math.round(cw * 0.02));
      const rightX = Math.max(200, Math.round(cw - cw * 0.06 - 96));

      const computed: Item[] = itemsTemplate.map((t, idx) => {
        const isLeft = idx < 2;
        if (isLeft) {
          const base = leftX;
          const spread = 28;
          const x = Math.max(4, base - (idx === 0 ? spread : Math.max(spread - 12, 8)));
          const y = Math.round(ch * (0.22 + idx * 0.18));
          return { ...t, position: { x, y } };
        } else {
          const x = rightX;
          const y = Math.round(ch * (0.18 + (idx - 2) * 0.22));
          return { ...t, position: { x, y } };
        }
      });

      setItems(computed);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // update a single item's position
  const updatePosition = (id: number, x: number, y: number) => {
    setItems(prev => prev.map(p => (p.id === id ? { ...p, position: { x, y } } : p)));
  };

  // keyboard navigation and Enter -> scroll
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, item: Item) => {
    const step = e.shiftKey ? 20 : 8;
    let { x, y } = item.position || { x: 0, y: 0 };
    if (e.key === 'ArrowUp') y -= step;
    else if (e.key === 'ArrowDown') y += step;
    else if (e.key === 'ArrowLeft') x -= step;
    else if (e.key === 'ArrowRight') x += step;
    else if (e.key === 'Enter') {
      const el = document.getElementById(item.section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (onNavigate) onNavigate(item.section);
      return;
    } else return;

    e.preventDefault();
    updatePosition(item.id, x, y);
  };

  // drag end: compute absolute coords relative to container and persist
  const handleDragEnd = (e: React.DragEvent | MouseEvent | TouchEvent, _info: PanInfo, item: Item) => {
    const el = e.currentTarget as HTMLDivElement;
    const container = containerRef.current;
    if (!el || !container) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const newX = Math.round(elRect.left - containerRect.left);
    const newY = Math.round(elRect.top - containerRect.top);

    // clear transform so it snaps visually to left/top positioning
    el.style.transform = 'none';

    updatePosition(item.id, newX, newY);
  };

  // helper scroll
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    if (onNavigate) onNavigate(sectionId);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.08),transparent_50%)]" />

      {/* Draggable overlay container (full-section) */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-auto z-40">
        {items.map((item) => (
          <motion.div
            key={item.id}
            drag
            dragConstraints={containerRef}
            dragElastic={0.14}
            dragMomentum
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1 }}
            onDragEnd={(e, info) => handleDragEnd(e, info, item)}
            onDoubleClick={() => {
              const containerRect = containerRef.current?.getBoundingClientRect();
              if (!containerRect) return;
              const cw = containerRect.width;
              const ch = containerRect.height;
              const idx = itemsTemplate.findIndex(s => s.id === item.id);
              const isLeft = idx < 2;
              const x = isLeft ? Math.max(40, Math.round(cw * 0.06)) : Math.max(200, Math.round(cw - cw * 0.06 - 96));
              const y = Math.round(ch * (isLeft ? (0.25 + idx * 0.2) : (0.18 + (idx - 2) * 0.22)));
              updatePosition(item.id, x, y);
            }}
            onKeyDown={(e) => handleKeyDown(e, item)}
            tabIndex={0}
            role="button"
            aria-label={`Draggable ${item.name}. Press arrow keys to move or Enter to open ${item.section}`}
            className="absolute z-50 cursor-grab focus:ring-2 focus:ring-teal-300"
            style={{
              left: item.position?.x ?? 0,
              top: item.position?.y ?? 0,
              touchAction: 'none'
            }}
          >
            <div className="relative group pointer-events-auto">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="absolute inset-0 bg-teal-500/18 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content (hero and right preview) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: content card */}
        <div className="relative">
          <div className="w-full min-h-[520px] p-8 mt-10 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Dna className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">SAGITTARIUS</h1>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              Identifying species through <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">DNA barcodes</span>
            </h2>

            <p className="text-base md:text-lg text-slate-600 max-w-2xl mt-4">
              Advanced biodiversity research platform providing species identification through DNA barcoding and global biodiversity data analysis.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
              <Button onClick={() => scrollToSection('analysis')} className="px-6 py-3 text-base">
                <Microscope className="w-4 h-4 mr-2" /> Start DNA Analysis
              </Button>

              <Button variant="outline" onClick={() => scrollToSection('map')} className="px-6 py-3 text-base">
                <Fish className="w-4 h-4 mr-2" /> Explore Biodiversity
              </Button>
            </div>
          </div>
        </div>

        {/* Right: preview card (single video source) */}
        <div className="flex items-center justify-center">
          <div className="w-full md:w-[520px] p-6 mt-10 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md shadow-xl">
            <video
              className="w-full h-72 md:h-80 object-cover rounded-lg mb-4"
              src="/images/dnavideo.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>

            <h3 className="text-lg font-semibold text-black mb-1">DNA Prediction</h3>
            <p className="text-sm text-slate-500">
              Visualize predicted species & confidence from uploaded DNA barcodes.
            </p>
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1.2 }, y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-teal-600 cursor-pointer"
        onClick={() => scrollToSection('gallery')}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
