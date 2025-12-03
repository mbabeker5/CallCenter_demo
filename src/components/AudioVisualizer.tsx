'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isSpeaking: boolean;
  isActive: boolean;
}

export default function AudioVisualizer({ isSpeaking, isActive }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(0));
      return;
    }

    const interval = setInterval(() => {
      if (isSpeaking) {
        // Simulate audio frequency data when speaking
        setBars(Array(12).fill(0).map(() => Math.random() * 100));
      } else {
        // Gentle ambient animation when connected but not speaking
        setBars(prev => prev.map(val => Math.max(0, val * 0.8 + Math.random() * 10)));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isSpeaking, isActive]);

  return (
    <div className="flex items-center justify-center space-x-1 h-16">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className={`w-1 bg-gradient-to-t rounded-full ${
            isSpeaking 
              ? 'from-green-400 to-blue-500' 
              : 'from-gray-300 to-gray-400'
          }`}
          animate={{
            height: `${Math.max(4, height)}%`,
            opacity: isActive ? 1 : 0.3
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut'
          }}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}