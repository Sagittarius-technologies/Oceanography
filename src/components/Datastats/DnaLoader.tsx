// src/components/DnaLoader.tsx
import React from 'react';
import { motion } from 'framer-motion';

type DNALoaderProps = {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
};

export default function DNALoader({ size = 'medium', showText = true }: DNALoaderProps) {
  const sizeClasses = {
    small: { container: 'w-8 h-8', strand: 'w-0.5 h-8', bases: 'w-3 h-0.5' },
    medium: { container: 'w-16 h-16', strand: 'w-1 h-16', bases: 'w-6 h-0.5' },
    large: { container: 'w-24 h-24', strand: 'w-1.5 h-24', bases: 'w-8 h-1' }
  } as const;

  const currentSize = sizeClasses[size];

  const baseCount = size === 'large' ? 8 : size === 'medium' ? 6 : 4;
  const spacing = 70 / baseCount;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${currentSize.container}`}>
        {/* DNA Double Helix Animation */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Left strand */}
          <motion.div
            className={`absolute ${currentSize.strand} bg-gradient-to-b from-teal-400 via-blue-400 to-teal-400 rounded-full`}
            style={{ left: '30%', transformOrigin: 'center' }}
            animate={{
              scaleY: [1, 0.7, 1, 0.7, 1],
              x: [-2, 2, -2, 2, -2]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Right strand */}
          <motion.div
            className={`absolute ${currentSize.strand} bg-gradient-to-b from-blue-400 via-teal-400 to-blue-400 rounded-full`}
            style={{ right: '30%', transformOrigin: 'center' }}
            animate={{
              scaleY: [1, 0.7, 1, 0.7, 1],
              x: [2, -2, 2, -2, 2]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Base pairs */}
          {Array.from({ length: baseCount }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${currentSize.bases} bg-gradient-to-r from-teal-300 via-white to-blue-300 rounded-full`}
              style={{
                top: `${15 + i * spacing}%`,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scaleX: [0.6, 1.3, 0.6],
                rotateZ: [0, 180, 360]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </motion.div>

        {/* Glowing effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, rgba(59,130,246,0.4) 50%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {showText && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.p
            className="text-teal-600 font-medium text-sm"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Analyzing genetic sequences...
          </motion.p>
          <div className="flex justify-center mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-teal-400 rounded-full mx-0.5"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
