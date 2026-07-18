/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: "red" | "white";
  duration: number;
  delay: number;
}

export const BackgroundBendera: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 25 red and white falling particles with random positions & timings
    const list: Particle[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      y: -10 - Math.random() * 20, // initial height offset
      size: 4 + Math.random() * 6, // 4px to 10px
      color: Math.random() > 0.5 ? "red" : "white",
      duration: 8 + Math.random() * 12, // 8s to 20s
      delay: Math.random() * 5, // up to 5s delay
    }));
    setParticles(list);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50 pointer-events-none">
      {/* Background Ornaments (Dayak Inspired Geometric Shapes) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dayakPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 0 L100 50 L50 100 L0 50 Z M0 0 L20 20 M80 80 L100 100" stroke="#CE2029" strokeWidth="2" fill="none"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#dayakPattern)" />
        </svg>
      </div>

      {/* Wave pattern top (Waving Flag effect) */}
      <div className="absolute top-0 inset-x-0 h-40 opacity-10 bg-linear-to-b from-red-600 via-red-300 to-transparent blur-xl animate-pulse" />
      
      {/* Glowing orbs */}
      <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-red-600/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-red-900/5 blur-[100px]" />
      
      {/* Floating Red and Slate Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color === "red" ? "bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]" : "bg-slate-400/20 shadow-[0_0_8px_rgba(148,163,184,0.15)]"}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{ y: `${p.y}vh`, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.7, 0.7, 0],
            x: [`${p.x}%`, `${p.x + (Math.random() * 6 - 3)}%`, `${p.x + (Math.random() * 6 - 3)}%`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Elegant Thin Dayak Ethnic Lines on Left and Right borders */}
      <div className="absolute left-0 inset-y-0 w-8 md:w-16 flex flex-col justify-between items-center py-20 opacity-15 text-red-500">
        <svg viewBox="0 0 100 1000" className="h-full w-full stroke-current fill-none stroke-[2]">
          {/* Dayak Batang Garing (Tree of life) stylized linear segments */}
          <path d="M 50 50 L 50 950" />
          <path d="M 50 150 Q 10 120 50 200" />
          <path d="M 50 150 Q 90 120 50 200" />
          <path d="M 50 350 Q 15 300 50 400" />
          <path d="M 50 350 Q 85 300 50 400" />
          <path d="M 50 550 Q 20 490 50 600" />
          <path d="M 50 550 Q 80 490 50 600" />
          <path d="M 50 750 Q 25 680 50 800" />
          <path d="M 50 750 Q 75 680 50 800" />
        </svg>
      </div>
      <div className="absolute right-0 inset-y-0 w-8 md:w-16 flex flex-col justify-between items-center py-20 opacity-15 text-red-500">
        <svg viewBox="0 0 100 1000" className="h-full w-full stroke-current fill-none stroke-[2]">
          <path d="M 50 50 L 50 950" />
          <path d="M 50 150 Q 10 120 50 200" />
          <path d="M 50 150 Q 90 120 50 200" />
          <path d="M 50 350 Q 15 300 50 400" />
          <path d="M 50 350 Q 85 300 50 400" />
          <path d="M 50 550 Q 20 490 50 600" />
          <path d="M 50 550 Q 80 490 50 600" />
          <path d="M 50 750 Q 25 680 50 800" />
          <path d="M 50 750 Q 75 680 50 800" />
        </svg>
      </div>
    </div>
  );
};
