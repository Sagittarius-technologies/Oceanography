// src/components/Sequencing.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Activity, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../ui/Index";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ProcessFlowDiagram from "../Sequencematching/ProcessFlowDiagram";
import InteractiveDiagram from "../Sequencematching/InteractiveDiagram";
import DnaLoader from "../Sequencematching/Dnaloading"; // adjust path/name if your loader file differs
import sequencingSteps from './sequensingSteps';
import sequencingTechnologies from './sequencingTechnologies';
import diagramComponents from "./diagramComponents";

const Sequencing: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <defs>
              <linearGradient id="bgG1" x1="0" x2="1">
                <stop offset="0%" stopColor="#063447" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#014f58" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#06293a" stopOpacity="0.95" />
              </linearGradient>
              <filter id="blurMe"><feGaussianBlur stdDeviation="20" /></filter>
              <linearGradient id="helixA" x1="0" x2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
              <linearGradient id="helixB" x1="1" x2="0"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#bgG1)" />

            <g transform="translate(60,20)" opacity="0.35" filter="url(#blurMe)">
              <path d="M40 20 C160 80 160 420 40 480" stroke="url(#helixA)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.95" />
              <path d="M900 20 C780 80 780 420 900 480" stroke="url(#helixB)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.95" />
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

        {/* Content over the background */}
        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md">
                <DnaLoader size={180} />
              </div>
            </div>

            <div className="w-full md:w-2/3 text-center md:text-left">
              <div className="mb-3 text-sm text-teal-300 font-semibold">Sequencing</div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">DNA Sequencing</h1>
              <p className="text-xl text-white/80 max-w-3xl">
                Reading the genetic code - determining the precise order of nucleotides
              </p>

              <div className="mt-6">
                <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-slate-100/90 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" /> Back to Overview
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-blue-600/22 to-indigo-400/06 blur-3xl" />
      </div>

      {/* Main page content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">The Genomic Revolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                DNA sequencing determines the exact order of nucleotides (A, T, G, C) in DNA molecules.
                From Sanger's pioneering method to modern next-generation sequencing, this technology
                has revolutionized biology, medicine, and our understanding of life itself.
              </p>

              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-400 mb-2">3.2B</div>
                  <div className="text-slate-300 text-sm">Human Genome Bases</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Activity className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-indigo-400 mb-2">99.9%</div>
                  <div className="text-slate-300 text-sm">Sanger Accuracy</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-400 mb-2">6TB</div>
                  <div className="text-slate-300 text-sm">Human Genome Data</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-2">$1000</div>
                  <div className="text-slate-300 text-sm">Current Genome Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <ProcessFlowDiagram title="DNA Sequencing Workflow" steps={sequencingSteps} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <InteractiveDiagram title="Sequencing Platform Components" components={diagramComponents} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Sequencing Technologies Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-blue-400 mb-4">Read Length vs Throughput</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sequencingTechnologies} layout="horizontal">
                        <CartesianGrid strokeDasharray="3,3" stroke="#334155" />
                        <XAxis type="number" stroke="#94A3B8" />
                        <YAxis type="category" dataKey="technology" stroke="#94A3B8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                        <Bar dataKey="readLength" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  {sequencingTechnologies.map((tech, index) => (
                    <motion.div key={tech.technology} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="p-4 bg-slate-900 rounded-lg">
                      <h5 className="font-bold text-white mb-2">{tech.technology}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-400">Accuracy:</span>
                          <span className="text-green-400 ml-2">{tech.accuracy}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Cost/Mb:</span>
                          <span className="text-yellow-400 ml-2">${tech.cost}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications & Future */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-2xl text-white">Current Applications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-blue-400 mb-2">Clinical Genomics</h4><p className="text-slate-300 text-sm">Diagnosing genetic diseases, cancer profiling, and personalized medicine</p></div>
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-blue-400 mb-2">Agricultural Genomics</h4><p className="text-slate-300 text-sm">Crop improvement, livestock breeding, and food safety monitoring</p></div>
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-blue-400 mb-2">Environmental Studies</h4><p className="text-slate-300 text-sm">Metagenomics, biodiversity assessment, and ecosystem monitoring</p></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-2xl text-white">Future Directions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-indigo-400 mb-2">Single-Cell Sequencing</h4><p className="text-slate-300 text-sm">Understanding cellular heterogeneity and development at unprecedented resolution</p></div>
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-indigo-400 mb-2">Real-Time Analysis</h4><p className="text-slate-300 text-sm">Portable sequencers enabling field research and point-of-care diagnostics</p></div>
                <div className="p-4 bg-slate-900 rounded-lg"><h4 className="font-bold text-indigo-400 mb-2">Epigenome Mapping</h4><p className="text-slate-300 text-sm">Direct detection of DNA modifications and chromatin structure</p></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Sequencing;