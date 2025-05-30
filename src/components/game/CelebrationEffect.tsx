"use client";

import type React from 'react';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StarStyle {
  left: string;
  top: string;
  animationDelay: string;
  width: string;
  height: string;
  transform: string;
}

const CelebrationEffect: React.FC<{ active: boolean }> = ({ active }) => {
  const [styles, setStyles] = useState<StarStyle[]>([]);

  useEffect(() => {
    if (active) {
      const newStyles = Array.from({ length: 8 }).map(() => ({
        left: `${Math.random() * 90 + 5}%`, // Spread more widely
        top: `${Math.random() * 90 + 5}%`,
        animationDelay: `${Math.random() * 0.4}s`,
        width: `${Math.random() * 15 + 15}px`, // Slightly smaller stars
        height: `${Math.random() * 15 + 15}px`,
        transform: `rotate(${Math.random() * 360}deg) scale(0)`, // Initial state for animation
      }));
      setStyles(newStyles);
    } else {
       // Delay clearing styles to allow animation to finish if component re-renders quickly
      const timer = setTimeout(() => setStyles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || styles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50">
      {styles.map((style, i) => (
        <Star
          key={i}
          className="absolute text-accent animate-celebrate-star"
          style={style}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

export default CelebrationEffect;