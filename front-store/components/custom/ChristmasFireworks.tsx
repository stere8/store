"use client";

import { useCallback } from "react";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import  * as React from 'react'

export default function ChristmasFireworks() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <Particles
      id="christmas-fireworks"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        particles: {
          number: {
            value: 0,
          },
          color: {
            value: ["#ff0000", "#00ff00", "#ffffff", "#ff69b4", "#ffd700"],
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 1,
            animation: {
              enable: true,
              minimumValue: 0,
              speed: 2,
              startValue: "max",
              destroy: "min",
            },
          },
          size: {
            value: 20,
            random: {
              enable: true,
              minimumValue: 2,
            },
          },
          life: {
            duration: {
              sync: true,
              value: 5,
            },
            count: 1,
          },
          move: {
            enable: true,
            gravity: {
              enable: true,
              acceleration: 10,
            },
            speed: { min: 10, max: 20 },
            decay: 0.1,
            direction: "none",
            straight: false,
            outModes: {
              default: "destroy",
              top: "none",
            },
          },
        },
        background: {
          color: "#fff",
        },
        emitters: {
          direction: "top",
          rate: {
            delay: 0.1,
            quantity: 1,
          },
          position: {
            x: 50,
            y: 100,
          },
          size: {
            width: 100,
            height: 0,
          },
          particles: {
            speed: { min: 10, max: 50 },
            move: {
              straight: true,
            },
          },
        },
      }}
    />
  );
}