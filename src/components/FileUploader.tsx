/// <reference types="vite/client" />
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Dna,
  XCircle,
  Download,
  Trash2,
  Copy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

/* ---------------------------
   Configuration
   --------------------------- */
const API_BASE: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ||
  (typeof process !== "undefined" && (process as any).env?.REACT_APP_API_BASE) ||
  "http://localhost:8000";

const MAX_FILE_MB = 25;

/* ---------------------------
   Small UI primitives
   --------------------------- */
const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md ${className}`}>{children}</div>
);
const CardHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 rounded-t-2xl ${className}`}>{children}</div>
);
const CardContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = "" }) => (
  <div className={`px-6 py-8 ${className}`}>{children}</div>
);
const CardTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "solid" }> = ({
  children,
  className = "",
  variant = "solid",
  ...props
}) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-300";
  const solid = "bg-teal-600 hover:bg-teal-700 text-white shadow-sm";
  const outline = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50";
  return (
    <button {...props} className={`${base} ${variant === "solid" ? solid : outline} ${className}`}>
      {children}
    </button>
  );
};
const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => (
  <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
    <div style={{ width: `${value}%` }} className="h-2 rounded-full bg-teal-600 transition-all duration-300" />
  </div>
);
const Alert: React.FC<{ type?: "error" | "info"; children?: React.ReactNode; onClose?: () => void }> = ({ type = "error", children, onClose }) => (
  <div className={`p-3 rounded-lg flex items-start justify-between ${type === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
    <div className="flex-1">{children}</div>
    {onClose && <button onClick={onClose} className="ml-4 text-sm font-medium text-blue-700/80 hover:text-blue-900">Dismiss</button>}
  </div>
);

/* ---------------------------
   Helpers
   --------------------------- */
async function safeParseResponse(resp: Response): Promise<any> {
  try {
    const txt = await resp.clone().text();
    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  } catch {
    return null;
  }
}

function parseCsvToRows(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return { headers: [], rows: [] };
  const splitter = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
  const headers = lines[0].split(splitter).map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map((line) => {
    const parts = line.split(splitter).map((p) => p.replace(/^"|"$/g, "").trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = parts[i] ?? ""));
    return obj;
  });
  return { headers, rows };
}

function normalizeResultsToRows(results: any): Record<string, any>[] {
  if (!results) return [];
  if (Array.isArray(results) && results.length && typeof results[0] === "object") return results;
  if (Array.isArray(results?.predictions)) return results.predictions;
  if (typeof results === "string" && results.includes("\n") && results.includes(",")) return parseCsvToRows(results).rows;
  for (const k of Object.keys(results || {})) {
    const v = results[k];
    if (typeof v === "string" && v.includes("\n") && v.includes(",")) {
      const parsed = parseCsvToRows(v);
      if (parsed.rows.length) return parsed.rows;
    }
    if (Array.isArray(v) && v.length && typeof v[0] === "object") return v;
  }
  if (typeof results === "object") return [results];
  return [];
}

function formatTopProbs(tp: any): string {
  try {
    if (!tp) return "-";
    if (typeof tp === "string") {
      const tuples = Array.from(tp.matchAll(/\(([^()]+)\)/g)).map((m) => m[1]);
      if (tuples.length) {
        return tuples.map((t) => {
          const nums = t.match(/-?\d+\.?\d*/g) ?? [];
          const idx = nums[0] ?? "";
          const prob = nums[1] ? `${(parseFloat(nums[1]) * 100).toFixed(1)}%` : "?";
          return `${idx} (${prob})`;
        }).join(", ");
      }
      return tp;
    }
    if (Array.isArray(tp)) {
      return tp.map((it) => {
        if (Array.isArray(it) && it.length >= 2) {
          const label = String(it[0]);
          const prob = typeof it[1] === "number" ? `${(it[1] * 100).toFixed(1)}%` : String(it[1]);
          return `${label} (${prob})`;
        }
        if (typeof it === "object") {
          const label = it.label ?? it[0] ?? it.name ?? "";
          const probRaw = it.prob ?? it.probability ?? it[1] ?? null;
          const prob = typeof probRaw === "number" ? `${(probRaw * 100).toFixed(1)}%` : String(probRaw);
          return label ? `${label} (${prob})` : JSON.stringify(it);
        }
        return String(it);
      }).join(", ");
    }
    return String(tp);
  } catch {
    return JSON.stringify(tp);
  }
}

function prettyVisualLabel(filename: string) {
  const n = filename.replace(/\.png$/i, "").replace(/_/g, " ");
  return n.split(" ").map((w, i) => (i === 0 ? capitalize(w) : w)).join(" ");
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function normalizeUrlForClient(url: string | undefined, rid?: string) {
  if (!url) return "";
  try {
    // absolute URL?
    // eslint-disable-next-line no-new
    new URL(url);
    return url;
  } catch {
    const base = API_BASE.replace(/\/+$/, "");
    if (url.startsWith("/")) return `${base}${url}`;
    if (rid) return `${base}/runs/${encodeURIComponent(rid)}/file/${encodeURIComponent(url)}`;
    return `${base}/${url}`;
  }
}

/* ---------------------------
   Main component
   --------------------------- */
const FileUploader: React.FC = () => {
  // Inject Inter font once
  useEffect(() => {
    const id = "fileuploader-google-font-inter";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext)!;

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // selected file (not necessarily uploaded)
  const [fileSeqCount, setFileSeqCount] = useState<number | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileSelectedAt, setFileSelectedAt] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [visuals, setVisuals] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortPollingRef = useRef<{ abort: boolean }>({ abort: false });

  useEffect(() => {
    return () => { abortPollingRef.current.abort = true; };
  }, []);

  function humanFileSize(bytes: number) {
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${["B", "KB", "MB", "GB"][i]}`;
  }

  function isImageFile(file: File) {
    return file.type.startsWith("image/") || /\.(jpe?g|png|gif)$/i.test(file.name);
  }

  /* Count FASTA sequences (used on selection so user can review before upload) */
  function countFastaSequences(file: File): Promise<number> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const txt = String(reader.result ?? "");
        const lines = txt.split(/\r?\n/);
        const count = lines.reduce((acc, line) => acc + (line.trim().startsWith(">") ? 1 : 0), 0);
        if (count > 0) return resolve(count);
        const hasContent = txt.split(/\r?\n/).some((l) => l.trim().length > 0);
        return resolve(hasContent ? 1 : 0);
      };
      reader.onerror = () => resolve(0);
      reader.readAsText(file);
    });
  }

  /* When user selects/drops a file, set selectedFile and compute details,
     then automatically start upload.
  */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files)[0];
    if (!file) return;
    setSelectedFile(file);
    setFileMime(file.type || "unknown");
    setFileSize(file.size || null);
    setFileSelectedAt(new Date().toLocaleString());
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (["fasta", "fa", "fastq", "fq", "txt"].includes(ext) || file.type === "text/plain") {
      const cnt = await countFastaSequences(file);
      setFileSeqCount(cnt);
    } else {
      setFileSeqCount(1);
    }
    // auto-upload immediately
    doUpload(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileMime(file.type || "unknown");
    setFileSize(file.size || null);
    setFileSelectedAt(new Date().toLocaleString());
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (["fasta", "fa", "fastq", "fq", "txt"].includes(ext) || file.type === "text/plain") {
      const cnt = await countFastaSequences(file);
      setFileSeqCount(cnt);
    } else {
      setFileSeqCount(1);
    }
    // auto-upload immediately
    doUpload(file);
  };

  /* Core upload (unchanged) — called automatically on select/drop */
  const doUpload = async (file: File) => {
    setError("");
    setWarning("");
    setTableRows([]);
    setTableColumns([]);
    setIsProcessing(true);
    setProgress(2);
    abortPollingRef.current.abort = false;
    setVisuals({});

    try {
      const requestedK = 10;
      let seqCount = 0;
      const name = file.name || "";
      const ext = name.split(".").pop()?.toLowerCase() ?? "";

      if (["fasta", "fa", "fastq", "fq", "txt"].includes(ext) || file.type === "text/plain") {
        seqCount = await countFastaSequences(file);
      } else {
        seqCount = 1;
      }

      if (seqCount === 0) throw new Error("Uploaded file appears empty or unreadable. Please check the file and try again.");

      const safeK = Math.max(1, Math.min(requestedK, seqCount));
      if (safeK < requestedK) setWarning(`Requested k=${requestedK} reduced to k=${safeK} because only ${seqCount} sample(s) were detected.`);

      const fd = new FormData();
      fd.append("raw_fasta", file);
      fd.append("cluster_method", "kmeans");
      fd.append("kmeans_n", String(Math.max(1, safeK)));
      fd.append("threshold", "0.7");

      try {
        const modelsResp = await fetch(`${API_BASE}/models`);
        if (modelsResp.ok) {
          const modelsJson = await modelsResp.json();
          if (Array.isArray(modelsJson?.models) && modelsJson.models.length > 0) {
            fd.set("model_run_id", modelsJson.models[0].run_id);
          }
        }
      } catch { /* ignore */ }

      const resp = await fetch(`${API_BASE}/predict`, { method: "POST", body: fd });
      if (!resp.ok) {
        const parsed = await safeParseResponse(resp);
        const bodyMsg = parsed && typeof parsed === "object" ? (parsed.detail ?? JSON.stringify(parsed)) : parsed;
        throw new Error(`Upload failed: ${bodyMsg ?? `HTTP ${resp.status}`}`);
      }

      const payload = await resp.json();
      const rid = payload.run_id;
      if (!rid) throw new Error("Server did not return run_id for prediction job.");
      setRunId(rid);
      setModelUsed(payload.model_used ?? null);
      setProgress(10);

      startPollingForResults(rid);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  /* Polling and results parsing (same as before) */
  const startPollingForResults = async (rid: string) => {
    setPolling(true);
    setProgress(10);
    abortPollingRef.current.abort = false;

    try {
      const maxAttempts = 180;
      let attempts = 0;
      while (!abortPollingRef.current.abort && attempts < maxAttempts) {
        attempts += 1;
        const res = await fetch(`${API_BASE}/runs/${encodeURIComponent(rid)}`);
        if (res.status === 200) {
          const ctype = (res.headers.get("content-type") || "");
          const payload = ctype.includes("application/json") ? await res.json() : await safeParseResponse(res);
          const jobStatus = payload?.job_details?.status;

          if (jobStatus === "failed") {
            const snippet = payload.job_details?.error ?? "Job failed - check server logs.";
            throw new Error(typeof snippet === "string" ? snippet : JSON.stringify(snippet));
          }

          if (jobStatus === "completed") {
            setProgress(100);
            setPolling(false);
            setRunId(rid);
            setModelUsed(payload.job_details?.parameters?.model_run_id ?? payload.results?.model_used ?? null);

            // --- MEDOID parsing: try multiple strategies (payload, medoid endpoint, CSV file, fallback) ---
            let medoidRows: Record<string, any>[] = [];
            try {
              medoidRows = await (async () => {
                if (Array.isArray(payload?.results?.medoid_predictions) && payload.results.medoid_predictions.length > 0) {
                  return payload.results.medoid_predictions;
                }
                try {
                  const jsonRes = await fetch(`${API_BASE}/runs/${encodeURIComponent(rid)}/medoid/json`);
                  if (jsonRes.ok) {
                    const j = await jsonRes.json();
                    const arr = j?.medoid_predictions;
                    if (Array.isArray(arr) && arr.length) return arr;
                  }
                } catch { /* ignore */ }

                const outputs: string[] = Array.isArray(payload?.results?.files) ? payload.results.files :
                  (Array.isArray(payload?.job_details?.outputs) ? payload.job_details.outputs : []);

                let medoidCandidate = outputs.find((fn: string) => typeof fn === 'string' && fn.toLowerCase().includes('medoid') && fn.toLowerCase().endsWith('.csv'))
                  || outputs.find((fn: string) => typeof fn === 'string' && fn.toLowerCase().endsWith('.csv'));

                const defaultNames = ["cluster_medoid_predictions.csv", "medoid_predictions.csv"];
                if (!medoidCandidate) {
                  for (const n of defaultNames) {
                    try {
                      const attemptUrl = `${API_BASE}/runs/${encodeURIComponent(rid)}/file/${encodeURIComponent(n)}`;
                      const attemptResp = await fetch(attemptUrl);
                      if (attemptResp.ok) { medoidCandidate = n; break; }
                    } catch { /* ignore */ }
                  }
                }

                if (medoidCandidate) {
                  try {
                    const url = `${API_BASE}/runs/${encodeURIComponent(rid)}/file/${encodeURIComponent(medoidCandidate)}`;
                    const resp = await fetch(url);
                    if (resp.ok) {
                      const txt = await resp.text();
                      const parsed = parseCsvToRows(txt);
                      if (parsed.rows && parsed.rows.length > 0) return parsed.rows;
                    }
                  } catch (e) {
                    console.warn("Failed to fetch/parse medoid CSV:", e);
                  }
                }
                return [];
              })();
            } catch (e) {
              console.debug("fetchMedoidRowsFromPayload failed:", e);
            }

            if (medoidRows.length > 0) {
              const formatted = medoidRows.map((r: any) => {
                const copy: Record<string, any> = { ...r };
                const confKeys = ["confidence", "conf", "prob", "probability"];
                for (const k of confKeys) {
                  if (copy[k] !== undefined && copy[k] !== null) {
                    const num = typeof copy[k] === "number" ? copy[k] : parseFloat(String(copy[k]));
                    if (!Number.isNaN(num)) {
                      copy.confidence = `${(num * 100).toFixed(1)}%`;
                    } else {
                      copy.confidence = String(copy[k]);
                    }
                    if (k !== "confidence") delete copy[k];
                    break;
                  }
                }
                if (Array.isArray(copy.top_labels)) copy.top_labels = copy.top_labels.join(", ");
                if (typeof copy.top_labels === "string") copy.top_labels = copy.top_labels.replace(/^"|"$/g, "");
                if (copy.top_probs) copy.top_probs = typeof copy.top_probs === "string" ? copy.top_probs : formatTopProbs(copy.top_probs);
                if (!copy.predicted_species && (copy.species || copy.prediction || copy.label)) {
                  copy.predicted_species = copy.species ?? copy.prediction ?? copy.label;
                }
                return copy;
              });

              const preferred = ["cluster", "medoid_index", "medoid_id", "predicted_species", "confidence", "top_probs", "top_labels"];
              const colsSet = new Set<string>();
              preferred.forEach(k => { if (formatted[0] && k in formatted[0]) colsSet.add(k); });
              Object.keys(formatted[0] || {}).forEach(k => colsSet.add(k));
              setTableColumns(Array.from(colsSet));
              setTableRows(formatted);
            } else {
              const rows = normalizeResultsToRows(payload.results);
              if (rows.length === 0) {
                setError("Prediction finished but no tabular results were found.");
              } else {
                const cols = Array.from(rows.reduce((acc: Set<string>, r: any) => { Object.keys(r).forEach((k) => acc.add(k)); return acc; }, new Set<string>()));
                setTableColumns(cols);
                setTableRows(rows);
              }
            }

            // visuals: build absolute URLs for client
            const visualsFromPayload = payload.results?.visualizations ?? payload.results?.visuals ?? payload.results?.images;
            const built: Record<string,string> = {};
            if (visualsFromPayload && typeof visualsFromPayload === "object") {
              Object.entries(visualsFromPayload).forEach(([k, url]) => {
                const u = typeof url === "string" ? url : String(url);
                built[k] = normalizeUrlForClient(u, rid);
              });
            } else {
              const candidates = ["cluster_scatter.png", "species_abundance_bar.png", "species_composition_pie.png"];
              candidates.forEach((fn) => { built[fn] = normalizeUrlForClient(fn, rid); });
            }
            setVisuals(built);

            setIsProcessing(false);
            return;
          }

          setProgress((p) => Math.min(95, p + 4));
        } else if (res.status === 404) {
          setProgress((p) => Math.min(90, p + 3));
        } else {
          const parsed = await safeParseResponse(res);
          const detail = (parsed && typeof parsed === "object" && parsed.detail) ? parsed.detail : parsed ?? `HTTP ${res.status}`;
          throw new Error(`Server responded ${res.status}: ${detail}`);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (abortPollingRef.current.abort) {
        setError("Polling aborted.");
        setPolling(false);
        setIsProcessing(false);
      } else {
        setError("Timed out waiting for prediction results. Try again later.");
        setPolling(false);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err?.message ?? "An unknown error occurred while polling for results.");
      setPolling(false);
      setIsProcessing(false);
    }
  };

  /* UI helpers */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleSelectButtonClick = () => inputRef.current?.click();

  const resetUpload = () => {
    if (polling) { abortPollingRef.current.abort = true; setPolling(false); }
    setSelectedFile(null);
    setFileSeqCount(null);
    setFileMime(null);
    setFileSize(null);
    setFileSelectedAt(null);
    setTableRows([]);
    setTableColumns([]);
    setIsProcessing(false);
    setProgress(0);
    setError("");
    setWarning("");
    setRunId(null);
    setVisuals({});
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadResultsZip = async () => {
    if (!runId) return;
    try {
      const url = `${API_BASE}/runs/${runId}/download`;
      const res = await fetch(url);
      if (!res.ok) {
        const parsed = await safeParseResponse(res);
        throw new Error(parsed ?? `Failed to download results: ${res.statusText}`);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `${runId}_results.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err: any) {
      setError(err?.message ?? "Download failed.");
    }
  };

  const copyRunIdToClipboard = async () => {
    if (!runId) return;
    try {
      await navigator.clipboard.writeText(runId);
      setWarning("Run ID copied to clipboard");
      setTimeout(() => setWarning(""), 2000);
    } catch {
      setError("Failed to copy run id to clipboard");
    }
  };

  /* download file details as JSON */
  const downloadFileDetails = () => {
    if (!selectedFile) return;
    const details = {
      filename: selectedFile.name,
      mimeType: fileMime ?? selectedFile.type ?? "unknown",
      sizeBytes: fileSize ?? selectedFile.size,
      sizeHuman: fileSize ? humanFileSize(fileSize) : humanFileSize(selectedFile.size),
      detectedSequences: fileSeqCount,
      selectedAt: fileSelectedAt,
      runId: runId,
      modelUsed: modelUsed,
      progress: progress,
    };
    const blob = new Blob([JSON.stringify(details, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}_details.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  /* visual order (ensure 3 slots) */
  const visualOrder = ["cluster_scatter.png", "species_abundance_bar.png", "species_composition_pie.png"];

  // Button enablement:
  const canDownloadDetails = (tableRows.length > 0) || (!!runId && !isProcessing);

  /* Render */
  return (
    <section
      id="analysis"
      className="py-12 bg-gradient-to-b from-white to-slate-50"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-slate-900 mb-2">Sequence & Image Analysis</h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Upload an image (JPG/PNG) or DNA sequence (FASTA/TXT). We run clustering & species-matching against our curated reference set.
          </p>
        </motion.div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full grid place-items-center"><Dna className="w-6 h-6 text-white" /></div>
              <div>
                <CardTitle className="text-white">Upload & Analyze</CardTitle>
                <div className="text-sm text-white/90">Secure, auditable species identification</div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* grid: 5 columns on md, results take 3, visuals take 2 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left column: uploader + details + results  (span 3) */}
              <div className="md:col-span-3 space-y-6">
                {/* Upload area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 rounded-2xl p-6 transition-transform cursor-pointer ${isDragging ? "border-teal-400 bg-teal-50 scale-101 shadow-lg" : "border-slate-200 bg-white hover:shadow"} `}
                  onClick={() => inputRef.current?.click()}
                  aria-label="File upload area"
                  role="button"
                >
                  <input ref={inputRef} type="file" onChange={handleFileSelect} accept=".jpg,.jpeg,.png,.fasta,.txt,.fa,.fq,.fastq" className="hidden" />
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-teal-50 rounded-lg grid place-items-center shrink-0">
                      <Upload className="w-7 h-7 text-teal-600" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900">Drop your file here or click to browse</h3>
                      <p className="text-sm text-slate-500">Supports JPG, PNG for images, or FASTA / TXT for sequence data. Max {MAX_FILE_MB} MB.</p>

                      <div className="mt-4 flex gap-3 items-center">
                        <Button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="px-4 py-2"><FileText className="w-4 h-4" /> Select</Button>
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); if (!user) navigate('/login'); else setWarning("You are signed in"); }} className="px-3 py-2">
                          {user ? "Signed in" : "Request access"}
                        </Button>

                        {selectedFile && <Button variant="outline" onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="px-3 py-2"><Trash2 className="w-4 h-4" /> Clear</Button>}
                      </div>
                    </div>

                    <div className="w-44 text-right">
                      {selectedFile ? (
                        <div className="text-xs text-slate-700">
                          <div className="font-medium truncate">{selectedFile.name}</div>
                          <div className="text-2xs text-slate-400">{fileSize ? humanFileSize(fileSize) : "-"}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400">No file selected</div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isDragging && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/30 rounded-2xl pointer-events-none grid place-items-center">
                        <div className="text-lg font-semibold text-teal-700">Release to upload</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* DETAILS card (Download File Details button replaces Upload) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2 rounded-lg border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-700">File Details</div>
                        <div className="text-xs text-slate-400">Download metadata after analysis completes</div>
                      </div>
                      <div className="text-xs text-slate-400">{fileSelectedAt ?? ""}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Filename</div>
                        <div className="text-sm text-slate-700 truncate">{selectedFile?.name ?? "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Type</div>
                        <div className="text-sm text-slate-700 truncate">{fileMime ?? "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Size</div>
                        <div className="text-sm text-slate-700">{fileSize ? humanFileSize(fileSize) : "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500">Detected sequences</div>
                        <div className="text-sm text-slate-700">{fileSeqCount !== null ? String(fileSeqCount) : "-"}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-3">
                      {/* Smaller / lower-height buttons for File Details area */}
                      <button
                        onClick={downloadFileDetails}
                        disabled={!canDownloadDetails}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-300 px-2 py-1 text-sm flex-1 ${
                          canDownloadDetails ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                        aria-disabled={!canDownloadDetails}
                      >
                        <Download className="w-4 h-4" /> Download File Details
                      </button>

                      <button
                        onClick={resetUpload}
                        className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-300 px-2 py-1 text-sm bg-slate-700 text-white flex-1"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* compact info card */}
                  <div className="rounded-lg border bg-white p-3 text-xs text-slate-600 flex flex-col justify-between">
                    <div>
                      <div className="font-medium mb-1">Quick notes</div>
                      <div>Files are processed securely on the server.</div>
                      <div className="mt-2">Tip: upload clear photos or properly formatted FASTA files.</div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">Main project section — results will appear below.</div>
                  </div>
                </div>

                {/* processing / mini-progress */}
                <AnimatePresence>
                  {(selectedFile || isProcessing) && !tableRows.length && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="text-center py-6">
                      <div className="mb-3">{isProcessing ? <Loader2 className="w-12 h-12 text-teal-600 mx-auto animate-spin" /> : <FileText className="w-12 h-12 text-slate-400 mx-auto" />}</div>
                      <div className="text-sm text-slate-700 mb-2">{isProcessing ? "Analyzing specimen..." : "Ready"}</div>
                      <div className="max-w-xl mx-auto">
                        <div className="flex justify-between text-sm mb-2"><span className="text-slate-600">Progress</span><span className="text-slate-600">{progress}%</span></div>
                        <Progress value={progress} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* results table (wider) */}
                <div>
                  {tableRows.length > 0 && (
                    <Card className="overflow-hidden">
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 text-green-600"><CheckCircle className="w-6 h-6" /><h4 className="text-lg font-semibold text-slate-900">Prediction results</h4></div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={downloadResultsZip} className="px-3 py-1"><Download className="w-4 h-4" /> Download</Button>
                            <Button onClick={resetUpload} className="px-3 py-1 bg-slate-700">New</Button>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                          <table className="min-w-[900px] md:min-w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                {tableColumns.map((col) => <th key={col} className="px-4 py-2 text-left font-medium text-slate-600">{col}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {tableRows.map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  {tableColumns.map((col) => (
                                    <td key={col} className="px-4 py-2 align-top max-w-xs whitespace-normal">
                                      {col === "top_probs" ? (typeof row[col] === "string" ? row[col] : formatTopProbs(row[col])) :
                                        (col === "confidence" && typeof row[col] === "number" ? `${(row[col]*100).toFixed(1)}%` :
                                          renderCellValue(row[col]))}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right column: visuals expanded (span 2) */}
              <div className="md:col-span-2 space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700">Run</div>
                      <div className="text-xs text-slate-500">{isProcessing ? "Running" : runId ? "Completed" : "Idle"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Progress</div>
                      <div className="text-sm font-semibold">{progress}%</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <div className="text-xs text-slate-500">Run ID</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="truncate text-sm font-mono text-slate-700">{runId ?? "-"}</div>
                      <button onClick={copyRunIdToClipboard} title="Copy run id" className="p-1 rounded hover:bg-slate-50"><Copy className="w-4 h-4 text-slate-500" /></button>
                    </div>

                    <div className="pt-3 border-t mt-3">
                      <div className="text-xs text-slate-500">Model used</div>
                      <div className="text-sm truncate mt-1">{modelUsed ?? "-"}</div>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" onClick={downloadResultsZip} className="flex-1 px-2 py-1"><Download className="w-4 h-4" /> Download</Button>
                      <Button onClick={resetUpload} className="flex-1 px-2 py-1 bg-slate-700">Reset</Button>
                    </div>
                  </div>
                </Card>

                {/* Visuals: vertical stack of 3 images; object-contain */}
                <Card className="p-3">
                  <div className="text-sm font-medium text-slate-700 mb-3">Visuals</div>

                  <div className="grid grid-cols-1 gap-3">
                    {visualOrder.map((name) => {
                      const fallbackKey = Object.keys(visuals).find(k => k.toLowerCase().includes(name.split('.')[0]));
                      const finalUrl = visuals[name] ?? (fallbackKey ? visuals[fallbackKey] : undefined);

                      return (
                        <div key={name} className="rounded overflow-hidden border bg-white">
                          {finalUrl ? (
                            <a href={finalUrl} target="_blank" rel="noreferrer" className="block">
                              <div className="w-full h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {/* object-contain to avoid cropping */}
                                <img src={finalUrl} alt={name} className="max-h-full w-full object-contain" />
                              </div>
                              <div className="p-3 text-sm text-slate-600">{prettyVisualLabel(name)}</div>
                            </a>
                          ) : (
                            <div className="w-full h-48 bg-slate-50 flex items-center justify-center">
                              <div className="text-xs text-slate-400">No visual available: {prettyVisualLabel(name)}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="mt-4"><Alert type="error"><div className="flex items-center gap-2"><XCircle className="w-4 h-4" /><div className="text-sm">{error}</div></div></Alert></div>
                </motion.div>
              )}
              {warning && !error && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-4"><Alert type="info" onClose={() => setWarning("")}><div className="text-sm">{warning}</div></Alert></motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

/* small renderers */
function renderCellValue(v: any) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return <div className="space-y-1">{v.map((it, i) => <div key={i} className="text-xs text-slate-700">{typeof it === "object" ? JSON.stringify(it) : String(it)}</div>)}</div>;
  if (typeof v === "object") return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(v)}</pre>;
  return String(v);
}

export default FileUploader;
