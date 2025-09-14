import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

type ExtractionStep = {
  title: string;
  description: string;
  details?: string;
  icon?: React.ReactNode;
};

type ProcessFlowDiagramProps = {
  steps: ExtractionStep[];
  title?: string;
};

export default function ProcessFlowDiagram({ steps, title }: ProcessFlowDiagramProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isPlaying && currentStep < steps.length - 1) {
      intervalId = window.setInterval(() => {
        setCurrentStep((prev) => {
          const next = Math.min(prev + 1, steps.length - 1);

          setCompletedSteps((prevCompleted) => {
            // avoid duplicates
            if (prevCompleted.includes(prev)) return prevCompleted;
            return [...prevCompleted, prev];
          });

          if (next >= steps.length - 1) {
            setIsPlaying(false);
          }

          return next;
        });
      }, 2000) as unknown as number;
    }

    return () => {
      if (intervalId) clearInterval(intervalId as unknown as number);
    };
  }, [isPlaying, currentStep, steps.length]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setCompletedSteps([]);
    }
    setIsPlaying((s) => !s);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <div className="flex gap-2">
            <Button onClick={handlePlay} className="bg-teal-600 hover:bg-teal-700" size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center gap-6 p-4 rounded-lg transition-all duration-500 cursor-pointer ${
                index === currentStep
                  ? 'bg-teal-900/50 border border-teal-500'
                  : completedSteps.includes(index)
                  ? 'bg-green-900/30 border border-green-500'
                  : 'bg-slate-900/50 hover:bg-slate-700/50'
              }`}
              onClick={() => !isPlaying && setCurrentStep(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex-shrink-0">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    index === currentStep
                      ? 'bg-teal-500 text-white'
                      : completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-600 text-slate-300'
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ repeat: index === currentStep ? Infinity : 0, duration: 1 }}
                >
                  {step.icon ?? index + 1}
                </motion.div>
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{step.title}</h4>
                <p className="text-slate-300 text-sm">{step.description}</p>

                <AnimatePresence>
                  {index === currentStep && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-teal-300 text-sm"
                    >
                      {step.details}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {index < steps.length - 1 && (
                <motion.div
                  animate={{
                    opacity: completedSteps.includes(index) ? 1 : 0.3,
                    x: completedSteps.includes(index) ? [0, 5, 0] : 0,
                  }}
                  transition={{ repeat: completedSteps.includes(index) ? 3 : 0, duration: 0.5 }}
                >
                  <ChevronRight className="w-6 h-6 text-teal-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
