import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

export type DiagramComponent = {
  x: number;
  y: number;
  label?: string;
  color?: string;
  hoverColor?: string;
  icon?: React.ComponentType<any> | null;
  description?: string;
  details?: string;
};

export type Connection = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type InteractiveDiagramProps = {
  title?: string;
  components: DiagramComponent[];
  connections?: Connection[];
};

export default function InteractiveDiagram({
  title,
  components,
  connections = [],
}: InteractiveDiagramProps): JSX.Element {
  const [hoveredComponent, setHoveredComponent] = useState<number | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-8">
        {title && <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>}

        <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
          {/* Connections (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {connections.map((connection, index) => (
              <motion.line
                key={index}
                x1={`${connection.from.x}%`}
                y1={`${connection.from.y}%`}
                x2={`${connection.to.x}%`}
                y2={`${connection.to.y}%`}
                stroke="#14B8A6"
                strokeWidth={2}
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            ))}
          </svg>

          {/* Components */}
          {components.map((component, index) => {
            const Icon = component.icon;
            const isHovered = hoveredComponent === index;
            const isSelected = selectedComponent === index;

            return (
              <motion.div
                key={index}
                className="absolute cursor-pointer"
                style={{
                  left: `${component.x}%`,
                  top: `${component.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.45, type: 'spring' }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onHoverStart={() => setHoveredComponent(index)}
                onHoverEnd={() => setHoveredComponent((s) => (s === index ? null : s))}
                onClick={() => setSelectedComponent(index)}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                    isHovered || isSelected
                      ? component.hoverColor || 'bg-teal-500'
                      : component.color || 'bg-slate-600'
                  }`}
                >
                  {Icon ? <Icon className="w-8 h-8" /> : (component.label?.charAt(0) ?? index + 1)}
                </div>

                {component.label && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <Badge  className="text-xs">
                      {component.label}
                    </Badge>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Component Details */}
        {selectedComponent !== null && components[selectedComponent] && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-slate-900 rounded-lg border border-teal-500/30">
            <h4 className="font-bold text-white mb-2">{components[selectedComponent].label}</h4>
            <p className="text-slate-300 text-sm">{components[selectedComponent].description}</p>
            {components[selectedComponent].details && (
              <div className="mt-3 text-teal-300 text-sm">{components[selectedComponent].details}</div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
