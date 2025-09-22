// src/components/Pcr.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Thermometer, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../ui/Index";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ProcessFlowDiagram from "../Sequencematching/ProcessFlowDiagram";
import InteractiveDiagram from "../Sequencematching/InteractiveDiagram";
import DnaLoader from "../Sequencematching/Dnaloading"; // adjust path/name if your loader file differs
import diagramDataComponent from "./DiagramDataComponent";

const Pcr: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // simulated initial load — replace with real async work if needed
    const t = window.setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const pcrSteps = [
    {
      title: "Denaturation (94-98°C)",
      description: "Separating double-stranded DNA into single strands",
      details: "High temperature breaks hydrogen bonds between base pairs, creating single-stranded DNA templates.",
    },
    {
      title: "Annealing (50-65°C)",
      description: "Primers bind to target sequences",
      details: "Temperature lowered to allow primers to hybridize to complementary sequences on template DNA.",
    },
    {
      title: "Extension (72°C)",
      description: "DNA polymerase synthesizes new strands",
      details: "Taq polymerase extends primers, synthesizing new DNA strands complementary to the template.",
    },
  ];

  const thermalCycleData = [
    { cycle: 0, temperature: 25, copies: 1 },
    { cycle: 1, temperature: 94, copies: 2 },
    { cycle: 2, temperature: 55, copies: 4 },
    { cycle: 3, temperature: 72, copies: 8 },
    { cycle: 10, temperature: 94, copies: 1024 },
    { cycle: 20, temperature: 94, copies: 1048576 },
    { cycle: 30, temperature: 94, copies: 1073741824 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white mg-top-20 relative mt-5">
    
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <defs>
              <linearGradient id="bgG1_pcr" x1="0" x2="1">
                <stop offset="0%" stopColor="#063447" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#014f58" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#06293a" stopOpacity="0.95" />
              </linearGradient>
              <filter id="blurMe_pcr"><feGaussianBlur stdDeviation="20" /></filter>
              <linearGradient id="helixA_pcr" x1="0" x2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
              <linearGradient id="helixB_pcr" x1="1" x2="0"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#bgG1_pcr)" />

            <g transform="translate(60,20)" opacity="0.35" filter="url(#blurMe_pcr)">
              <path d="M40 20 C160 80 160 420 40 480" stroke="url(#helixA_pcr)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.95" />
              <path d="M900 20 C780 80 780 420 900 480" stroke="url(#helixB_pcr)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.95" />
            </g>

            <g stroke="#66f6ff" strokeOpacity="0.06" strokeWidth="2" fill="none" transform="translate(0,10)">
              {Array.from({ length: 18 }).map((_, i) => {
                const t = i / 17;
                const y = 30 + t * 460;
                const x1 = 120 + Math.sin(t * Math.PI * 6) * 160;
                const x2 = 1080 - Math.sin(t * Math.PI * 6) * 160;
                return <line key={i} x1={x1} y1={y} x2={x2} y2={y} strokeLinecap="round" />;
              })}
            </g>
          </svg>
        </div>

        {/* Hero content — Back link placed inline (Sequencing-style). PCR logo preserved. */}
        <div className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md">
                <DnaLoader size={160} />
              </div>
            </div>

            <div className="w-full md:w-2/3 text-center md:text-left">
              <div className="mb-3 text-sm text-amber-300 font-semibold">PCR</div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4">PCR</h1>
              <p className="text-lg text-slate-200/90 max-w-3xl">
                Polymerase Chain Reaction - The revolutionary DNA amplification technique
              </p>

              {/* Back link inline (aligned like Sequencing) */}
              <div className="mt-6">
                <Link
                  to={createPageUrl("Home")}
                  className="inline-flex items-center gap-2 text-slate-100/90 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to Overview
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-orange-600/22 to-amber-400/06 blur-3xl" />
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">The PCR Revolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                Polymerase Chain Reaction (PCR) is a revolutionary molecular biology technique that amplifies
                specific DNA sequences exponentially. Invented by Kary Mullis in 1983, PCR has become
                indispensable in research, diagnostics, forensics, and biotechnology.
              </p>

              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Thermometer className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-orange-400 mb-2">94-98°C</div>
                  <div className="text-slate-300 text-sm">Denaturation Temp</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Timer className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-amber-400 mb-2">2-4 hrs</div>
                  <div className="text-slate-300 text-sm">Total Runtime</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">25-35</div>
                  <div className="text-slate-300 text-sm">Typical Cycles</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-2">10⁹</div>
                  <div className="text-slate-300 text-sm">Amplification Factor</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PCR Cycle Diagram */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <ProcessFlowDiagram title="PCR Thermal Cycling Process" steps={pcrSteps} />
        </motion.div>

        {/* Interactive Components */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <InteractiveDiagram title="PCR Reaction Components" components={diagramDataComponent} />
        </motion.div>

        {/* Amplification Curve */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Exponential Amplification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={thermalCycleData}>
                    <CartesianGrid strokeDasharray="3,3" stroke="#334155" />
                    <XAxis dataKey="cycle" stroke="#94A3B8" />
                    <YAxis scale="log" domain={[1, 'dataMax']} stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }}
                      labelStyle={{ color: '#E2E8F0' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="copies"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-slate-300 text-center">
                DNA copies double with each cycle, resulting in exponential amplification
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications & Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">PCR Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-amber-400 mb-2">Medical Diagnostics</h4>
                  <p className="text-slate-300 text-sm">
                    Detecting pathogens, genetic disorders, and viral infections like COVID-19
                  </p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-amber-400 mb-2">Forensic Analysis</h4>
                  <p className="text-slate-300 text-sm">
                    Amplifying trace DNA evidence for criminal investigations and paternity testing
                  </p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-amber-400 mb-2">Evolutionary Studies</h4>
                  <p className="text-slate-300 text-sm">
                    Analyzing ancient DNA and studying phylogenetic relationships
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Technical Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Primer Design</h4>
                  <p className="text-slate-300 text-sm">
                    Tm: 50-65°C, Length: 18-25 bp, GC content: 40-60%
                  </p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Reaction Conditions</h4>
                  <p className="text-slate-300 text-sm">Template: 10ng-1μg, Primers: 0.1-1μM, dNTPs: 200μM each</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-orange-400 mb-2">Quality Control</h4>
                  <p className="text-slate-300 text-sm">Gel electrophoresis, qPCR analysis, sequencing verification</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Pcr;