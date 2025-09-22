// FileUploader.tsx
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Fish,
  CheckCircle,
  Loader2,
  X,
  Dna,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './login/AuthContext';

interface SpeciesPrediction {
  name: string;
  scientificName: string;
  phylum: string;
  order: string;
  genus: string;
  class: string;
  family: string;
  species: string;
  description: string;
  confidence: number;
}

/* ---------------------------
   Lightweight UI primitives
   --------------------------- */
const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 rounded-t-2xl ${className}`}>{children}</div>
);

const CardContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = '' }) => (
  <div className={`px-6 py-8 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'solid' }> = ({
  children,
  className = '',
  variant = 'solid',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-300';
  const solid = 'bg-teal-600 hover:bg-teal-700 text-white';
  const outline = 'bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50';
  return (
    <button {...props} className={`${base} ${variant === 'solid' ? solid : outline} ${className}`}>
      {children}
    </button>
  );
};

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
    <div style={{ width: `${value}%` }} className="h-2 rounded-full bg-teal-600 transition-all" />
  </div>
);

const Alert: React.FC<{ type?: 'error' | 'info'; children?: React.ReactNode }> = ({ type = 'error', children }) => (
  <div className={`p-3 rounded-lg ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{children}</div>
);

const Badge: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block ${className}`}>{children}</div>
);

/* Small AuthModal fallback used in DNAAnalysis-style example */
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess?: () => void }> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h4 className="text-lg font-semibold mb-2">Please login to upload a file</h4>
        <p className="text-sm text-gray-600 mb-4">
          You must be logged in to upload and analyze files. Please log in to continue.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button
            onClick={() => { onSuccess?.(); onClose(); }}
            className="px-4 py-2 rounded bg-teal-600 text-white"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------
   Main FileUploader
   --------------------------- */
const FileUploader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext)!;

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<SpeciesPrediction | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Sample predictions
  const samplePredictions: SpeciesPrediction[] = [
    {
      name: 'Vinciguerria Lanternfish',
      scientificName: 'Vinciguerria CBM:ZF:14736',
      phylum: 'Chordata',
      order: 'Stomiiformes',
      genus: 'Vinciguerria',
      class: 'Actinopterygii',
      family: 'Phosichthyidae',
      species: 'Cbm:zf:14736',
      description: 'A deep-sea lanternfish species that produces bioluminescence for communication and camouflage in the dark ocean depths.',
      confidence: 94.7
    },
    {
      name: 'Pacific Blue Tang',
      scientificName: 'Paracanthurus hepatus',
      phylum: 'Chordata',
      order: 'Perciformes',
      genus: 'Paracanthurus',
      class: 'Actinopterygii',
      family: 'Acanthuridae',
      species: 'P. hepatus',
      description: 'A vibrant blue marine fish commonly found in coral reefs of the Pacific Ocean, known for its distinctive blue coloration and yellow fins.',
      confidence: 97.2
    },
    {
      name: 'Giant Pacific Octopus',
      scientificName: 'Enteroctopus dofleini',
      phylum: 'Mollusca',
      order: 'Octopoda',
      genus: 'Enteroctopus',
      class: 'Cephalopoda',
      family: 'Octopodidae',
      species: 'E. dofleini',
      description: 'The largest octopus species in the world, found in the coastal waters of the Pacific Ocean, capable of remarkable camouflage and problem-solving abilities.',
      confidence: 91.8
    }
  ];

  const speciesOptions: string[] = [
    'Homo sapiens (modern humans)',
    'Homo neanderthalensis (Neanderthals)',
    'Homo erectus (early human ancestor)',
    'Homo habilis (early tool user)',
    'Australopithecus afarensis (“Lucy,” early hominin)',
    'Pan troglodytes (chimpanzee)',
    'Gorilla gorilla (western gorilla)',
    'Canis lupus (gray wolf)',
    'Felis catus (domestic cat)',
    'Elephas maximus (Asian elephant)',
    'Gallus gallus domesticus (domestic chicken)',
    'Columba livia (rock pigeon)',
    'Crocodylus niloticus (Nile crocodile)',
    'Delphinus delphis (common dolphin)',
    'Carcharodon carcharias (great white shark)',
    'Octopus vulgaris (common octopus)',
    'Oryza sativa (rice)',
    'Zea mays (maize/corn)',
    'Arabidopsis thaliana (model plant species)',
    'Saccharomyces cerevisiae (baker’s yeast)'
  ];

  const uploadAllowed = selectedSpecies === 'Homo sapiens (modern humans)';
  const showGlow = uploadAllowed && !uploadedFile && !isProcessing && !prediction;

  useEffect(() => {
    // small cleanup if component unmounts
    return () => setIsProcessing(false);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files[0]) return;

    if (!uploadAllowed) {
      setShowPermissionPopup(true);
      return;
    }
    handleFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!uploadAllowed) {
      setShowPermissionPopup(true);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    handleFile(file);
  };

  const handleSelectButtonClick = () => {
    if (!uploadAllowed) {
      setShowPermissionPopup(true);
      return;
    }
    inputRef.current?.click();
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setPrediction(null);
    setError('');
    setProgress(5);

    // simulate upload + analysis progress
    let p = 5;
    const interval = setInterval(() => {
      p = Math.min(95, p + Math.floor(Math.random() * 12));
      setProgress(p);
    }, 450);

    // simulate processing time
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      // pick a random prediction
      const randomPrediction = samplePredictions[Math.floor(Math.random() * samplePredictions.length)];
      setPrediction(randomPrediction);
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 600);
    }, 2600);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPrediction(null);
    setIsProcessing(false);
    setProgress(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // permission popup close focus select
  const closePopup = () => {
    setShowPermissionPopup(false);
    setTimeout(() => selectRef.current?.focus(), 50);
  };

  return (
    <section id="analysis" className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Marine Species Identification</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Upload an image or a DNA sequence file to identify species using our prediction pipeline.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full grid place-items-center">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Sequence / Image Analysis</CardTitle>
                  <div className="text-sm text-white/80">Secure & audited species identification</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Select row */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select scientific name</label>

                <div className="relative">
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-shadow duration-200 ${selectedSpecies ? 'ring-2 ring-blue-200 border-blue-200' : 'border-slate-200'}`}
                    onClick={() => selectRef.current?.focus()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex-1 min-w-0">
                      {!selectedSpecies ? (
                        <div className="text-sm text-slate-400">Choose a scientific name…</div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                            {selectedSpecies.split('(')[0].trim()}
                          </div>
                          <div className="truncate text-sm text-slate-700">{selectedSpecies}</div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex items-center gap-3">
                      <div className={`text-xs font-medium px-2 py-1 rounded ${uploadAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {uploadAllowed ? 'Allowed' : 'Restricted'}
                      </div>
                      {selectedSpecies && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedSpecies(''); selectRef.current?.focus(); }}
                          className="p-1 rounded-md hover:bg-slate-100"
                          aria-label="Clear selection"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <select
                    ref={selectRef}
                    aria-label="Scientific name select"
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className="absolute inset-0 w-full opacity-0 pointer-events-auto"
                  >
                    <option value="">-- Choose a scientific name --</option>
                    {speciesOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  Only <strong>Homo sapiens (modern humans)</strong> enables uploads (demo permission).
                </p>
              </div>

              {/* Upload area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200'} ${showGlow ? 'ring-4 ring-blue-100 shadow-lg' : ''}`}
              >
                <input ref={inputRef} type="file" onChange={handleFileSelect} accept=".jpg,.jpeg,.png,.fasta,.txt,.fa,.fq,.fastq" className="hidden" />
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className={`w-7 h-7 ${uploadAllowed ? 'text-teal-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-1">Drop your file here or click to browse</h4>
                <p className="text-sm text-slate-500 mb-4">Supports images (JPG, PNG) and DNA sequence files (FASTA, TXT)</p>

                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => { if (!uploadAllowed) { setShowPermissionPopup(true); } else inputRef.current?.click(); }} className="px-6 py-2" disabled={!uploadAllowed}>
                    <FileText className="w-4 h-4" />
                    {uploadAllowed ? 'Select File' : 'Select File (disabled)'}
                  </Button>

                  {/* Request Access: only show when user is NOT logged in */}
                  {!user ? (
                    <Button variant="outline" onClick={() => navigate('/login')} className="px-4 py-2">
                      Request Access
                    </Button>
                  ) : null}
                </div>

                {!uploadAllowed && <div className="mt-3 text-sm text-red-600">Please select <strong>Homo sapiens (modern humans)</strong> to enable upload.</div>}
              </div>

              {/* Uploading / Processing state */}
              <AnimatePresence>
                {(uploadedFile || isProcessing) && !prediction && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="text-center py-8">
                    <div className="mb-4">
                      {isProcessing ? <Loader2 className="w-14 h-14 text-teal-600 mx-auto animate-spin" /> : <FileText className="w-14 h-14 text-green-600 mx-auto" />}
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">{isProcessing ? 'Analyzing specimen...' : 'File uploaded'}</h4>
                    <p className="text-sm text-slate-600 mb-4">{isProcessing ? 'Processing and matching against database...' : uploadedFile?.name}</p>
                    {isProcessing && (
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Analyzing</span>
                          <span className="text-slate-600">{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prediction / Results */}
              <AnimatePresence>
                {prediction && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="space-y-6">
                    <div className="flex items-center gap-3 justify-center text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <h4 className="text-2xl font-bold text-slate-900">Species Identified!</h4>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Fish className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xl font-bold text-slate-900 mb-1">{prediction.scientificName}</h5>
                          <Badge>{Math.round(prediction.confidence)}% confidence</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h6 className="font-bold text-slate-900 mb-2">Taxonomic Classification</h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-600">Phylum:</span><span className="font-medium">{prediction.phylum}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Class:</span><span className="font-medium">{prediction.class}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Order:</span><span className="font-medium">{prediction.order}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Family:</span><span className="font-medium">{prediction.family}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Genus:</span><span className="font-medium">{prediction.genus}</span></div>
                          <div className="flex justify-between"><span className="text-slate-600">Species:</span><span className="font-medium">{prediction.species}</span></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <h6 className="font-bold text-slate-900 mb-2">Description</h6>
                        <p className="text-sm text-slate-600 leading-relaxed">{prediction.description}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button onClick={resetUpload} className="px-6 py-2 bg-slate-700">Upload Another File</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error area */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div className="mt-4">
                      <Alert type="error">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          <div className="text-sm">{error}</div>
                        </div>
                      </Alert>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Permission popup overlay */}
      <AnimatePresence>
        {showPermissionPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold mb-2">Select required scientific name</h4>
              <p className="text-sm text-gray-700 mb-4">To upload a file you must select <strong>Homo sapiens (modern humans)</strong> from the dropdown.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { closePopup(); }} className="px-4 py-2 rounded bg-gray-200">OK</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // For demo: allow upload by selecting Homo sapiens automatically
          setSelectedSpecies('Homo sapiens (modern humans)');
        }}
      />
    </section>
  );
};

export default FileUploader;
