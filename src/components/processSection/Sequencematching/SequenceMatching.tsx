import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../ui/Index';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ProcessFlowDiagram from './ProcessFlowDiagram';
import InteractiveDiagram from './InteractiveDiagram';
import DnaLoader from './Dnaloading';
import matchingSteps from './MatchingSteps';
import blastResults from './blastResult';
import diagramComponents from './diagramComponents'

const SequenceMatching: React.FC = (): JSX.Element => {
  
  return (
    <div className="min-h-screen bg-slate-900 text-white mt-5">
      {/* DNA-themed Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-teal-900/25 to-slate-900/60" />
        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/6 backdrop-blur-md">
                <DnaLoader size={180} />
              </div>
            </div>

            <div className="w-full md:w-2/3 text-center md:text-left">
              <div className="mb-3 text-sm text-teal-300 font-semibold">Sequence Matching</div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-white">
                Sequence Matching
              </h1>
              <p className="mt-4 text-lg text-slate-200/90 max-w-2xl">
                The final step — identifying species through database comparison. Visualize BLAST matches,
                compare identity & coverage, and explore likely taxonomic matches.
              </p>
              <div className="mt-6">
                <Link
                  to={createPageUrl('Home')}
                  className="inline-flex items-center gap-2 text-slate-100/90 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Overview
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* decorative blurred radial highlight */}
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-teal-600/30 to-cyan-400/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">The Power of Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-300 text-lg leading-relaxed">
                Sequence matching is the computational process of comparing an unknown DNA sequence against
                vast databases of known sequences. This critical step transforms raw genetic data into
                meaningful biological identification, enabling species discovery and classification.
              </p>

              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Database className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-400 mb-2">400M+</div>
                  <div className="text-slate-300 text-sm">Sequences in GenBank</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-pink-400 mb-2">97%+</div>
                  <div className="text-slate-300 text-sm">Identity for Species Match</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <Search className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-400 mb-2">&lt;1sec</div>
                  <div className="text-slate-300 text-sm">BLAST Search Time</div>
                </div>
                <div className="text-center p-6 bg-slate-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-2">1e-50</div>
                  <div className="text-slate-300 text-sm">Significant E-value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Process Flow */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <ProcessFlowDiagram title="Sequence Matching Workflow" steps={matchingSteps} />
        </motion.div>

        {/* Interactive Components */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <InteractiveDiagram title="BLAST Search Components" components={diagramComponents} />
        </motion.div>

        {/* Results Visualization */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Example BLAST Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-red-400 mb-4">Identity vs Coverage</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={blastResults}>
                        <CartesianGrid strokeDasharray="3,3" stroke="#334155" />
                        <XAxis
                          type="number"
                          dataKey="coverage"
                          domain={[70, 100]}
                          stroke="#94A3B8"
                          label={{ value: 'Coverage (%)', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="identity"
                          domain={[85, 100]}
                          stroke="#94A3B8"
                          label={{ value: 'Identity (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f1724', border: '1px solid #475569' }}
                          formatter={(value: any, name: string) => {
                            if (name === 'identity') return [`${value}%`, 'Identity'];
                            return [value, name === 'coverage' ? 'Coverage' : name];
                          }}
                        />
                        <Scatter name="Matches" data={blastResults} dataKey="identity" fill="#EF4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-red-400 mb-4">Top Matches</h4>
                  {blastResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="p-4 bg-slate-900 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-bold text-white italic">{result.species}</h5>
                        <div
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            result.identity > 97 ? 'bg-green-600' : result.identity > 95 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                        >
                          {result.identity}% ID
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                        <div>Coverage: {result.coverage}%</div>
                        <div>E-value: {result.evalue}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Details and Databases */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Major Databases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">NCBI GenBank</h4>
                  <p className="text-slate-300 text-sm">
                    Comprehensive nucleotide sequence database with 400M+ sequences from all domains of life
                  </p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">BOLD Systems</h4>
                  <p className="text-slate-300 text-sm">Specialized DNA barcode reference library focused on species identification</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">UNITE</h4>
                  <p className="text-slate-300 text-sm">Molecular identification database specifically for fungi and other eukaryotes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Interpretation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">Species-level Match</h4>
                  <p className="text-slate-300 text-sm">≥97% identity with ≥95% coverage typically indicates same species</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">Genus-level Match</h4>
                  <p className="text-slate-300 text-sm">90-97% identity suggests related species within the same genus</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg">
                  <h4 className="font-bold text-pink-400 mb-2">No Reliable Match</h4>
                  <p className="text-slate-300 text-sm">&lt;90% identity may indicate novel species or contamination</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SequenceMatching;