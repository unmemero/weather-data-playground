/**
 * AuroraParticleCanvas.tsx
 * 
 * Interactive background blending Aurora Borealis atmospheric flow with
 * microscopic twinkling aerosol particle scattering.
 * 
 * Design Inspirations & Open-Source Credits:
 * - Aurora Flow: Ahmod Musa (https://codepen.io/Ahmod-Musa/pen/emNqPQd)
 * - Twinkling Particle System: TheMOZZARELLA (https://codepen.io/TheMOZZARELLA/pen/ZYzpWPw)
 */

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

export const AuroraParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle micro-particle pool (~45 particles for elegance without distraction)
    const count = 45;
    const particles: Particle[] = [];
    const colors = [
      'rgba(255, 255, 255,', // Neutral stardust
      'rgba(165, 243, 252,', // Atmospheric cyan
      'rgba(196, 181, 253,', // Soft ionospheric violet
      'rgba(167, 243, 208,', // Aurora emerald
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.6, // Micro dots (0.6px - 1.8px)
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.05, // Slow upward aerosol drift
        baseAlpha: Math.random() * 0.2 + 0.15, // Subtle baseline (0.15 - 0.35)
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        // Gentle sinusoidal twinkle
        const alpha = Math.max(
          0.05,
          Math.min(0.5, p.baseAlpha + Math.sin(tick * p.twinkleSpeed + p.phase) * 0.15)
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* 1. Organic Aurora Borealis Flow Layer */}
      <div className="absolute inset-0 opacity-25 filter blur-[90px] saturate-150 transform-gpu">
        {/* Luminous Emerald Wave */}
        <div className="absolute -top-[15%] left-[10%] w-[55vw] h-[45vh] rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-transparent animate-aurora-1" />

        {/* Ionospheric Violet / Indigo Wave */}
        <div className="absolute top-[5%] right-[5%] w-[60vw] h-[50vh] rounded-full bg-gradient-to-bl from-indigo-600/35 via-violet-500/25 to-transparent animate-aurora-2" />

        {/* Deep Atmospheric Cyan Core */}
        <div className="absolute top-[25%] left-[25%] w-[50vw] h-[40vh] rounded-full bg-gradient-to-tr from-cyan-500/30 via-sky-400/20 to-transparent animate-aurora-3" />
      </div>

      {/* 2. Micro-Aerosol Twinkle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
