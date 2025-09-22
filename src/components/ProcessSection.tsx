import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { TestTube, Dna, Search, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './ui/Index';
import { ProcessStep } from '../types/ProcessSectionTypes';

const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'DNA Extraction',
    description:
      'Isolating pure DNA from your sample. The foundation of all genetic analysis.',
    icon: TestTube,
    color: 'from-teal-500 to-cyan-500',
    page: '/DnaExtraction',
  },
  {
    number: '02',
    title: 'PCR (Polymerase Chain Reaction)',
    description:
      'Amplifying a specific DNA region to create millions of copies for analysis.',
    icon: Dna,
    color: 'from-orange-500 to-amber-500',
    page: '/Pcr',
  },
  {
    number: '03',
    title: 'Sequencing',
    description: 'Reading the precise order of nucleotides to reveal the unique genetic code.',
    icon: Search,
    color: 'from-blue-500 to-indigo-500',
    page: '/Sequencing',
  },
  {
    number: '04',
    title: 'Sequence Matching',
    description: 'Comparing your sequence to a global database to identify the species.',
    icon: Target,
    color: 'from-red-500 to-pink-500',
    page: '/SequenceMatching',
  },
];

const ProcessSection: React.FC = (): JSX.Element => {
  return (
    <section id="process" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 font-semibold mb-4">Interactive Overview</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">The DNA Identification Workflow</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Click on any step to launch a dedicated analysis workbench and learn more about the process.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                <Link to={createPageUrl(step.page)}>
                  <motion.div whileHover={{ y: -10, scale: 1.03 }} className="group h-full">
                    <Card className="h-full bg-slate-800 border-slate-700 group-hover:border-teal-500 transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-2xl font-bold text-teal-400 mb-2">{step.number}</div>
                          <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
