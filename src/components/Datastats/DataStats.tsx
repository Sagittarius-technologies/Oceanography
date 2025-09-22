// DataStats.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '../ui/card';
import { Database, FileText, Leaf, Fish } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import DNALoader from './DnaLoader';

const statsData = [
  { name: 'Pending Validation', value: 17800000, color: '#F59E0B' },
  { name: 'Available Records', value: 5800000, color: '#10B981' },
];

const totalBarcodes = 23656912;

const speciesStats = [
  { category: 'BINs', count: 1326000, suffix: 'k', icon: Database, color: 'text-teal-500' },
  { category: 'Animal Species', count: 267000, suffix: 'k', icon: Fish, color: 'text-blue-500' },
  { category: 'Plant Species', count: 101000, suffix: 'k', icon: Leaf, color: 'text-green-500' },
  { category: 'Fungi & Other', count: 26000, suffix: 'k', icon: FileText, color: 'text-purple-500' }
];

export default function DataStats(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = (event: any, info: any) => {
    // rotate pie a bit based on horizontal delta
    setRotation(prev => prev + info.delta.x * 0.5);
  };

  const activeData = activeIndex !== null ? statsData[activeIndex] : null;

  const onPieEnter = (_: any, index: number) => {
    setHoveredIndex(index);
  };

  const onPieLeave = () => {
    setHoveredIndex(null);
  };

  const onClick = (_: any, index: number) => {
    setIsLoading(true);
    setActiveIndex(index === activeIndex ? null : index);

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section id="data" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 font-semibold mb-4">Interactive Data Portal</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            A data portal that provides access to over
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-orange-400">
            <AnimatedCounter value={16500000} suffix="m+" /> public records representing <AnimatedCounter value={1300000} suffix="m+" /> Species
          </h3>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mt-6">
            The records in the portal are public and fully accessible. Drag the chart to rotate, hover to highlight, and click sections to explore details.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={handleDrag}
          >
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <DNALoader size="large" />
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90 + rotation}
                      endAngle={450 + rotation}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      onClick={onClick}
                    >
                      {statsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{
                            opacity: activeIndex === null
                              ? (hoveredIndex === null || hoveredIndex === index ? 1 : 0.6)
                              : (activeIndex === index ? 1 : 0.4),
                            filter: hoveredIndex === index ? 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none',
                            stroke: hoveredIndex === index ? '#ffffff' : 'none',
                            strokeWidth: hoveredIndex === index ? 3 : 0
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Center Display */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="text-center"
                key={activeData ? activeData.name : 'total'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {activeData ? (
                  <>
                    <div className="text-3xl font-bold text-white">
                      <AnimatedCounter value={activeData.value} />
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{activeData.name}</div>
                    <div
                      className="w-4 h-4 rounded-full mx-auto mt-2"
                      style={{ backgroundColor: activeData.color }}
                    />
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-white">
                      <AnimatedCounter value={totalBarcodes} />
                    </div>
                    <div className="text-sm text-slate-400 mt-1">Total Barcodes</div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Hover Tooltip */}
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-600"
              >
                <div className="text-white font-medium text-sm">
                  {statsData[hoveredIndex].name}
                </div>
                <div className="text-slate-300 text-xs">
                  Click to view details • Drag to rotate
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            {speciesStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="bg-slate-800 border-slate-700 text-center h-full hover:border-teal-500/50 transition-all duration-300 cursor-pointer overflow-hidden relative">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className={`w-10 h-10 mx-auto mb-4 ${stat.color}`} />
                      </motion.div>
                      <div className="text-3xl font-bold text-white mb-2">
                        <AnimatedCounter value={stat.count / 1000} suffix="k" />
                      </div>
                      <div className="text-sm text-slate-400">{stat.category}</div>

                      {/* Animated Background */}
                      <motion.div
                        className="absolute inset-0 opacity-0 hover:opacity-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(45deg, ${stat.color.includes('teal') ? '#14B8A6' :
                            stat.color.includes('blue') ? '#3B82F6' :
                              stat.color.includes('green') ? '#10B981' : '#8B5CF6'}, transparent)`
                        }}
                        whileHover={{ opacity: 0.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            Explore Data Portal →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
