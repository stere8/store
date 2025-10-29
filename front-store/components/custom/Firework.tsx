
"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import * as React from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const colors = [
  "#FF69B4", // Pink
  "#FFD700", // Gold
  "#FF4500", // Orange Red
  "#00FF00", // Lime
  "#1E90FF", // Dodger Blue
  "#FF1493", // Deep Pink
  "#00FFFF", // Cyan
  "#FF00FF", // Magenta
];

export default function Firework() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [count, setCount] = useState(0);

  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const particleCount = 30;
    // const angleStep = (2 * Math.PI) / particleCount;

    for (let i = 0; i < particleCount; i++) {
    //   const angle = angleStep * i;
      newParticles.push({
        id: count + i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
    setCount((prev) => prev + particleCount);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight - 100 + Math.random() * 50;
      createParticles(x, y);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  useEffect(() => {
    const cleanup = setTimeout(() => {
      setParticles((prev) => prev.slice(Math.max(prev.length - 150, 0)));
    }, 2000);

    return () => clearTimeout(cleanup);
  }, [particles]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <m.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 200,
            y: particle.y - 200 - Math.random() * 200,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
