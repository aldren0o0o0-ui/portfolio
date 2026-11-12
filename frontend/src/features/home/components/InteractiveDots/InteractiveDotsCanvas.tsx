import React, { useEffect, useRef } from "react";
import { useThemeStore } from "../../../theme/themeStore";
import styles from "./InteractiveDotsCanvas.module.css";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  isPrimary: boolean;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  followSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const InteractiveDotsCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse tracking
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    // Ambient floating dots
    let dots: Dot[] = [];

    // Cursor-following satellite trail particles
    const trailParticles: TrailParticle[] = Array.from(
      { length: 8 },
      (_, i) => ({
        x: -1000,
        y: -1000,
        vx: 0,
        vy: 0,
        radius: 2 + (i % 3) * 1.2,
        baseRadius: 2 + (i % 3) * 1.2,
        angle: (i * Math.PI * 2) / 8,
        orbitRadius: 10 + i * 4,
        orbitSpeed: 0.02 + (i % 3) * 0.015,
        followSpeed: 0.16 - i * 0.015, // Staggered trailing response
      }),
    );

    // Click ripples
    const ripples: Ripple[] = [];

    const initDots = (w: number, h: number) => {
      // Density: approx 1 dot per 13,000 px^2, clamped between 35 and 90
      const count = Math.min(Math.max(Math.floor((w * h) / 13000), 35), 90);
      dots = [];
      for (let i = 0; i < count; i++) {
        const isPrimary = Math.random() > 0.45;
        const baseRadius = isPrimary
          ? 1.8 + Math.random() * 1.5
          : 1.2 + Math.random() * 1.0;
        const baseAlpha = isPrimary
          ? 0.35 + Math.random() * 0.35
          : 0.2 + Math.random() * 0.25;

        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          baseRadius,
          radius: baseRadius,
          alpha: baseAlpha,
          baseAlpha,
          isPrimary,
        });
      }
    };

    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initDots(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Mouse listener on window to track smoothly across the whole viewport
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        mouse.targetX = x;
        mouse.targetY = y;
        if (!mouse.active) {
          mouse.x = x;
          mouse.y = y;
          mouse.active = true;
          // Teleport trail particles near cursor on first enter
          trailParticles.forEach((p) => {
            p.x = x;
            p.y = y;
          });
        }
      } else {
        mouse.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        ripples.push({
          x,
          y,
          radius: 10,
          maxRadius: 180,
          opacity: 0.6,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });

    let time = 0;

    // Animation Loop
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const isDark = resolvedTheme === "dark";
      // Palette definitions
      const primaryRgb = isDark ? "96, 165, 250" : "37, 99, 235"; // Blue 400 / 600
      const neutralRgb = isDark ? "245, 245, 245" : "71, 85, 105"; // Light neutral / Slate
      const lineRgb = isDark ? "96, 165, 250" : "37, 99, 235";

      // Smooth mouse interpolation (inertia)
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.2;
        mouse.y += (mouse.targetY - mouse.y) * 0.2;
      }

      // Update and draw ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const ripple = ripples[r];
        ripple.radius += 5.5;
        ripple.opacity *= 0.94;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryRgb}, ${ripple.opacity * 0.45})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Push dots with ripple wave
        dots.forEach((dot) => {
          const dx = dot.x - ripple.x;
          const dy = dot.y - ripple.y;
          const dist = Math.hypot(dx, dy);
          if (Math.abs(dist - ripple.radius) < 25 && dist > 0) {
            const push = (1 - Math.abs(dist - ripple.radius) / 25) * 3;
            dot.x += (dx / dist) * push;
            dot.y += (dy / dist) * push;
          }
        });

        if (ripple.opacity < 0.02 || ripple.radius > ripple.maxRadius) {
          ripples.splice(r, 1);
        }
      }

      // Proximity connection radius
      const maxConnectDist = 95;
      const mouseInfluenceDist = 145;

      // Update and draw ambient dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (!prefersReducedMotion) {
          dot.x += dot.vx;
          dot.y += dot.vy;

          // Boundary bouncing
          if (dot.x < 0) {
            dot.x = 0;
            dot.vx *= -1;
          } else if (dot.x > width) {
            dot.x = width;
            dot.vx *= -1;
          }

          if (dot.y < 0) {
            dot.y = 0;
            dot.vy *= -1;
          } else if (dot.y > height) {
            dot.y = height;
            dot.vy *= -1;
          }
        }

        // Mouse attraction and glow
        let distToMouse = 9999;
        if (mouse.active) {
          const mdx = mouse.x - dot.x;
          const mdy = mouse.y - dot.y;
          distToMouse = Math.hypot(mdx, mdy);

          if (distToMouse < mouseInfluenceDist) {
            const factor = (1 - distToMouse / mouseInfluenceDist);
            // Gentle gravitational pull towards cursor
            if (!prefersReducedMotion) {
              dot.x += (mdx / distToMouse) * factor * 1.4;
              dot.y += (mdy / distToMouse) * factor * 1.4;
            }

            dot.alpha = Math.min(dot.baseAlpha + factor * 0.6, 0.95);
            dot.radius = dot.baseRadius + factor * 1.8;

            // Draw line connecting cursor to nearby dots
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(dot.x, dot.y);
            const lineAlpha = factor * (isDark ? 0.35 : 0.25);
            ctx.strokeStyle = `rgba(${lineRgb}, ${lineAlpha})`;
            ctx.lineWidth = factor * 1.2;
            ctx.stroke();
          } else {
            // Smoothly restore default size & alpha
            dot.alpha += (dot.baseAlpha - dot.alpha) * 0.05;
            dot.radius += (dot.baseRadius - dot.radius) * 0.05;
          }
        } else {
          dot.alpha += (dot.baseAlpha - dot.alpha) * 0.05;
          dot.radius += (dot.baseRadius - dot.radius) * 0.05;
        }

        // Connect ambient dots to each other
        for (let j = i + 1; j < dots.length; j++) {
          const dot2 = dots[j];
          const dx = dot.x - dot2.x;
          const dy = dot.y - dot2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * (isDark ? 0.12 : 0.08);
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.strokeStyle = `rgba(${lineRgb}, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        const rgb = dot.isPrimary ? primaryRgb : neutralRgb;
        ctx.fillStyle = `rgba(${rgb}, ${dot.alpha})`;
        ctx.fill();

        // Subtle glow halo for primary dots
        if (dot.isPrimary && dot.radius > 2.5) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryRgb}, ${dot.alpha * 0.15})`;
          ctx.fill();
        }
      }

      // Draw Cursor Satellite Dots (particles that follow the mouse pointer)
      if (mouse.active) {
        trailParticles.forEach((p, idx) => {
          // Orbit angle rotates continuously
          p.angle += p.orbitSpeed;
          const orbitX = Math.cos(p.angle + idx) * p.orbitRadius;
          const orbitY = Math.sin(p.angle + idx) * p.orbitRadius * 0.75;

          const targetX = mouse.x + orbitX;
          const targetY = mouse.y + orbitY;

          // Spring / lag follow physics
          p.x += (targetX - p.x) * p.followSpeed;
          p.y += (targetY - p.y) * p.followSpeed;

          // Connecting thread to mouse
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          const threadAlpha = (1 - idx / trailParticles.length) * (isDark ? 0.28 : 0.18);
          ctx.strokeStyle = `rgba(${primaryRgb}, ${threadAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Satellite dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          const dotAlpha = 0.5 + Math.sin(time * 3 + idx) * 0.25;
          ctx.fillStyle = `rgba(${primaryRgb}, ${dotAlpha})`;
          ctx.fill();

          // Soft ambient halo
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${primaryRgb}, 0.12)`;
          ctx.fill();
        });

        // Glowing cursor focus point
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgb}, 0.9)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgb}, 0.12)`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={styles.canvasContainer}
      aria-hidden="true"
      data-testid="interactive-dots-canvas"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};
