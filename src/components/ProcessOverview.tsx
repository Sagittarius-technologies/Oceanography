import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FileDown, Copy, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProcessOverviewInteractiveModal.tsx
 * - Clicking a step opens a centered modal (popup) with full details.
 * - Modal is scrollable and accessible; Left/Right navigation works while modal is open.
 *
 * Add Google fonts if you want the exact typography:
 * <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
 */

type Process = {
  id: number;
  number: string;
  title: string;
  colorClass: string;
  short: string;
  details: string;
  confidence?: number;
  metadata?: Record<string, string>;
  protocolSteps?: string[];
  estimatedTime?: string;
  commonPitfalls?: string[];
};

type Props = { processes?: Process[]; className?: string };

const defaultProcesses: Process[] = [
  // same default data as you had — truncated here for brevity (use your full data)
  {
    id: 1,
    number: "01.",
    title: "Sample Collection",
    colorClass: "text-teal-600",
    short: "Sterile collection across depths; chain-of-custody & environmental metadata.",
    details:
      "Purpose: obtain representative specimens and environmental metadata while minimizing contamination. Typical sample types include tissue biopsies, whole small organisms, mucus swabs and eDNA water samples. Preservation strategy (ethanol, RNAlater, freezing) depends on downstream assays.",
    confidence: 85,
    metadata: { Location: "Pacific - 120m", Collector: "Team A", Vessel: "RV Explorer" },
    protocolSteps: ["Prepare sterile sampling tools and labels", "Record GPS, depth, temperature and substrate", "Collect specimen into pre-labeled tube with preservative", "Store in cold-chain and log into LIMS"],
    estimatedTime: "15–45 min per sample",
    commonPitfalls: ["Cross-contamination between samples", "Insufficient preservative leading to DNA degradation", "Missing metadata (GPS/depth)"]
  },
  {
    id: 2,
    number: "02.",
    title: "DNA Extraction",
    colorClass: "text-orange-500",
    short: "Optimized extraction protocols per tissue type, with negative controls and quantification.",
    details:
      "Purpose: isolate high-quality nucleic acid suitable for PCR and sequencing. Choice of extraction chemistry depends on sample matrix (muscle, cartilage, mucus, or environmental samples). Key steps: lysis, binding, wash, elution; include negative controls and spike-ins when needed.",
    confidence: 78,
    metadata: { Kit: "Qiagen DNeasy", Lab: "Lab 1", Technician: "Alex" },
    protocolSteps: ["Thaw and subsample tissue under sterile conditions", "Perform lysis with proteinase K/Buffer", "Use kit columns or magnetic beads for purification", "Quantify DNA (Qubit) and assess on gel if needed"],
    estimatedTime: "1–3 hours per batch",
    commonPitfalls: ["Low yield from degraded samples", "Carryover contaminants inhibiting PCR", "Insufficient negative controls"]
  },
  {
    id: 3,
    number: "03.",
    title: "Sequencing",
    colorClass: "text-sky-600",
    short: "Library prep, indexing and run on short- or long-read platforms. Basecalling + QC.",
    details:
      "Purpose: generate nucleotide reads that capture the target markers. Depending on goals, choose amplicon sequencing (e.g., COI, 16S) or shotgun/metagenomics. Important steps: library preparation, indexing, pooling and running on appropriate platform. Post-run: demultiplex, trim adapters, and perform quality filtering.",
    confidence: 88,
    metadata: { Platform: "Illumina NovaSeq", ReadLength: "150bp", RunID: "2025-09-01-A" },
    protocolSteps: ["Prepare libraries and add unique dual indices", "Quantify and normalize libraries", "Pool libraries and load sequencer", "Perform basecalling and initial QC"],
    estimatedTime: "1–3 days depending on queue",
    commonPitfalls: ["Index-hopping or barcode bleed-through", "Low-complexity libraries causing poor cluster generation", "Insufficient read depth for target markers"]
  },
  {
    id: 4,
    number: "04.",
    title: "Database Matching",
    colorClass: "text-rose-600",
    short: "Curated reference-matching (BLAST-like) with confidence scoring and manual review.",
    details:
      "Purpose: assign taxonomic labels and confidence to query sequences by comparing to a curated reference library. Typical outputs include percent identity, e-value, alignment length, and taxonomic lineage. Ambiguous hits or low identity scores are flagged for expert curation.",
    confidence: 92,
    metadata: { DB: "MarineRef v2", Curator: "Dr. X" },
    protocolSteps: ["Pre-filter reads and extract marker regions", "Run alignment/search (BLAST/USEARCH) against curated DB", "Compute identity, coverage and confidence scores", "Flag ambiguous assignments for manual review"],
    estimatedTime: "minutes to hours per batch",
    commonPitfalls: ["Incomplete reference libraries for rare taxa", "Contaminant sequences causing false matches", "Over-reliance on single-marker identifications"]
  }
];

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{children}</span>;
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full" aria-hidden>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>Confidence</span><span>{pct}%</span></div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }} /></div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 shadow-lg rounded-md px-4 py-3 text-sm font-medium">
      {message}
    </motion.div>
  );
}

function FlipCard({ front, back, flipped, setFlipped }: { front: React.ReactNode; back: React.ReactNode; flipped: boolean; setFlipped: (v: boolean) => void }) {
  return (
    <div className="relative w-full h-full" onMouseLeave={() => setFlipped(false)}>
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.45 }} style={{ transformStyle: "preserve-3d" as any }} className="w-full h-full">
        <div style={{ backfaceVisibility: "hidden" as any }} className="absolute inset-0">{front}</div>
        <div style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" as any }} className="absolute inset-0">{back}</div>
      </motion.div>
      <button aria-hidden className="absolute top-2 right-2 text-xs text-gray-400" onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}>{flipped ? "Front" : "Flip"}</button>
    </div>
  );
}

export default function ProcessOverviewInteractiveModal({ processes = defaultProcesses, className = "" }: Props) {
  const [modal, setModal] = useState<Process | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "confidence">("id");
  const [toast, setToast] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState<number | null>(null);
  const [flippedMap, setFlippedMap] = useState<Record<number, boolean>>({});

  const previousActiveRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation: when modal open, Left/Right navigate between processes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!modal) return;
      const visible = processes;
      const idx = Math.max(0, visible.findIndex((p) => p.id === modal.id));
      if (e.key === "ArrowRight") {
        const next = visible[(idx + 1) % visible.length];
        setModal(next);
      } else if (e.key === "ArrowLeft") {
        const prev = visible[(idx - 1 + visible.length) % visible.length];
        setModal(prev);
      } else if (e.key === "Escape") {
        setModal(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, processes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = processes.filter((p) => p.title.toLowerCase().includes(q) || p.short.toLowerCase().includes(q) || p.details.toLowerCase().includes(q));
    if (sortKey === "confidence") arr = arr.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    else arr = arr.sort((a, b) => a.id - b.id);
    return arr;
  }, [processes, query, sortKey]);

  const copyMetadata = useCallback(async (p: Process) => {
    const newline = "\n";
    const text = `Process: ${p.title}${newline}Details: ${p.details}${newline}` + Object.entries(p.metadata ?? {}).map(([k, v]) => `${k}: ${v}`).join(newline);
    try {
      await navigator.clipboard.writeText(text);
      setToast("Metadata copied");
    } catch {
      setToast("Copy failed — check clipboard permissions");
    }
  }, []);

  const simulateIdentify = useCallback((p: Process) => {
    setIdentifying(p.id);
    setTimeout(() => {
      setIdentifying(null);
      setToast(`${p.title} — identification complete`);
      // show modal result preview if not already open
      setModal({ ...p, details: `${p.details}\n\nResult: Closest match — Species X (98.4% identity)` });
    }, 1200 + Math.random() * 800);
  }, []);

  const downloadCSV = useCallback((list: Process[]) => {
    const newline = "\n";
    const rows = ["id,number,title,confidence", ...list.map((p) => `${p.id},"${p.number}","${p.title}",${p.confidence ?? ""}`)];
    const blob = new Blob([rows.join(newline)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processes_export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast("Export ready — check your downloads");
  }, []);

  // Focus management: when modal opens, save previous focus and focus modal; restore on close.
  useEffect(() => {
    if (modal) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      // small timeout to allow modal element to mount
      setTimeout(() => modalRef.current?.focus(), 50);
      // prevent body scrolling while modal open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousActiveRef.current?.focus?.();
      previousActiveRef.current = null;
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <section className={`py-14 bg-white ${className} font-ui`} aria-labelledby="process-overview">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 font-sans antialiased text-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium mb-3">Overview</div>
            <h2 id="process-overview" className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 max-w-4xl">Identifying marine species — standardized DNA workflow</h2>
            <p className="mt-3 text-gray-600 text-base leading-relaxed max-w-2xl">A concise, auditable workflow for collecting, processing, sequencing and matching marine samples to a curated DNA reference library. Click any step to view details in a popup.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none text-sm w-48 font-ui" placeholder="Search title, summary or details..." aria-label="Search processes" />
              <button onClick={() => downloadCSV(processes)} className="p-2 rounded-md hover:bg-gray-100" title="Export CSV"><FileDown className="w-4 h-4 text-gray-600" /></button>
            </div>

            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="rounded-md border-gray-200 bg-white text-sm px-3 py-2">
              <option value="id">Sort: Order</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((p) => {
            const flipped = flippedMap[p.id] ?? false;
            return (
              <motion.article key={p.id} data-id={`step-${p.id}`} layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} viewport={{ once: true }} className="group h-full">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setModal(p)}
                  onKeyDown={(e) => { if (e.key === "Enter") setModal(p); }}
                  className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg cursor-pointer border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 h-full flex flex-col justify-between min-h-[220px]"
                  aria-label={`Open details for ${p.title}`}
                >
                  <FlipCard
                    front={
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <div className="text-sm text-gray-500 font-medium mb-2 tracking-wide uppercase">{p.number}</div>
                          <h3 className={`${p.colorClass} text-2xl font-semibold tracking-tight leading-snug mb-3`}>{p.title}</h3>
                          <p className="text-base text-gray-700 mb-4 leading-relaxed">{p.short}</p>

                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <Badge>Protocol</Badge>
                            <span className="font-mono">ID-{p.id.toString().padStart(2, "0")}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); setFlippedMap(m => ({ ...m, [p.id]: !flipped })); }} className="text-sm px-4 py-2 rounded-md border border-gray-200 bg-white inline-flex items-center gap-2"><Zap className="w-4 h-4" />Quick stats</button>
                          </div>

                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); copyMetadata(p); }} className="text-sm px-4 py-2 rounded-md border border-gray-200 bg-white inline-flex items-center gap-2" aria-label={`Copy metadata for ${p.title}`}><Copy className="w-4 h-4" />Copy</button>
                            <button onClick={(e) => { e.stopPropagation(); simulateIdentify(p); }} className={`text-sm px-4 py-2 rounded-md inline-flex items-center gap-2 ${identifying === p.id ? "bg-gray-200 text-gray-700" : "bg-emerald-600 text-white"}`}>{identifying === p.id ? "Identifying..." : "Identify"}</button>
                          </div>
                        </div>
                      </div>
                    }
                    back={
                      <div className="h-full p-4 bg-white rounded-md border border-dashed border-gray-100 flex flex-col justify-center items-start">
                        <div className="text-xs text-gray-500">Quick stats</div>
                        <div className="mt-3 text-sm text-gray-700">Est. time: <strong className="text-gray-900">{p.estimatedTime}</strong></div>
                        <div className="mt-3 w-full"><ConfidenceMeter value={p.confidence ?? 0} /></div>
                        <div className="mt-3 text-xs text-gray-500">Platform: {p.metadata?.Platform ?? "—"}</div>
                        <div className="mt-3 text-sm text-gray-700 flex items-center gap-2"><Check className="w-4 h-4 text-green-500" />Ready</div>
                      </div>
                    }
                    flipped={flipped}
                    setFlipped={(v) => setFlippedMap((m) => ({ ...m, [p.id]: v }))}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} viewport={{ once: true }} className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold tracking-tight leading-tight text-gray-900">Identify unknown marine samples with our DNA reference library.</h3>
              <p className="text-sm text-gray-600 mt-2">Upload sequences or run automated pipelines to match samples to curated references with transparent scoring.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => downloadCSV(processes)} className="inline-flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl font-medium shadow-sm"><FileDown className="w-4 h-4" /><span>Export all</span></button>
              <button onClick={() => { setToast("Batch identify started"); setTimeout(() => setToast("Batch identify complete"), 1200); }} className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium shadow-md"><span>Identify Now</span><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.div>

        {/* Modal (popup) */}
        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6">
              {/* backdrop */}
              <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />

              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 overflow-hidden"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 overflow-y-auto pr-4">
                    <div className="text-sm text-gray-400 font-medium mb-1 tracking-wide uppercase">{modal.number}</div>
                    <h3 id="modal-title" className={`text-2xl font-semibold mb-3 ${modal.colorClass}`}>{modal.title}</h3>
                    <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{modal.details}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="text-xs text-gray-500">Protocol steps</div>
                        <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                          {modal.protocolSteps?.map((s, i) => (<li key={i}>{s}</li>))}
                        </ol>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="text-xs text-gray-500">Common pitfalls</div>
                        <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
                          {modal.commonPitfalls?.map((c, i) => (<li key={i}>{c}</li>))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">Metadata: {Object.entries(modal.metadata ?? {}).map(([k, v]) => (<span key={k} className="ml-3 text-xs font-mono">{k}: {v}</span>))}</div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => copyMetadata(modal)} className="text-sm px-4 py-2 rounded-md border">Copy</button>
                        <button onClick={() => simulateIdentify(modal)} className="text-sm px-4 py-2 rounded-md bg-emerald-600 text-white">Identify</button>
                        <button onClick={() => setModal(null)} className="text-sm px-4 py-2 rounded-md bg-gray-100">Close</button>
                      </div>
                    </div>
                  </div>

                  <aside className="w-80 flex-shrink-0">
                    <div className="p-4 bg-gray-50 rounded-md mb-4">
                      <div className="text-xs text-gray-500">Summary</div>
                      <div className="text-sm text-gray-700 mt-2">Est. time: <strong>{modal.estimatedTime}</strong></div>
                      <div className="mt-3"><ConfidenceMeter value={modal.confidence ?? 0} /></div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="text-xs text-gray-500">Actions</div>
                      <div className="mt-3 flex flex-col gap-3">
                        <button onClick={() => copyMetadata(modal)} className="w-full text-sm px-3 py-2 rounded-md border">Copy metadata</button>
                        <button onClick={() => simulateIdentify(modal)} className="w-full text-sm px-3 py-2 rounded-md bg-emerald-600 text-white">Identify</button>
                        <button onClick={() => setModal(null)} className="w-full text-sm px-3 py-2 rounded-md bg-gray-100">Close</button>
                      </div>
                    </div>
                  </aside>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{toast && <Toast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>
      </div>
    </section>
  );
}
