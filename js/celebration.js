// js/celebration.js - Lightweight Particle Physics & Victory FX for Test Execution
import { prefersReducedMotion } from "./utils.js";

class CelebrationFX {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.particles = [];
    this.rings = [];
    this.animId = null;
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
  }

  init(canvas, container) {
    if (!canvas || !container) return;
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext("2d");

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  // Micro-sparks for an individual passing test case chip
  triggerChipSpark(chipElement) {
    if (prefersReducedMotion() || !this.canvas || !chipElement) return;
    this.resize();

    const canvasRect = this.canvas.getBoundingClientRect();
    const chipRect = chipElement.getBoundingClientRect();

    // Center of the chip relative to the canvas
    const originX = chipRect.left - canvasRect.left + chipRect.width / 2;
    const originY = chipRect.top - canvasRect.top + chipRect.height / 2;

    const colors = ["#3fb950", "#56d364", "#7ee787", "#e3b341", "#ffffff"];

    // 8-10 micro-particles
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9 + (Math.random() - 0.5) * 0.4;
      const speed = 2.2 + Math.random() * 2.8;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.04 + Math.random() * 0.03,
        drag: 0.92,
        shape: Math.random() > 0.5 ? "square" : "circle",
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }

    this.startLoop();
  }

  // Grand Finale Victory Celebration when ALL test cases pass
  triggerVictoryCelebration(bannerElement) {
    if (prefersReducedMotion() || !this.canvas) return;
    this.resize();

    const canvasRect = this.canvas.getBoundingClientRect();
    let originX = this.width / 2;
    let originY = this.height * 0.35;

    if (bannerElement) {
      const bannerRect = bannerElement.getBoundingClientRect();
      originX = bannerRect.left - canvasRect.left + bannerRect.width / 2;
      originY = bannerRect.top - canvasRect.top + bannerRect.height / 2;
    }

    // 1. Shockwave Expanding Ring
    this.rings.push({
      x: originX,
      y: originY,
      radius: 12,
      maxRadius: Math.min(this.width, this.height) * 0.6,
      lineWidth: 3.5,
      alpha: 0.9,
      decay: 0.024,
      color: "#3fb950"
    });

    // 2. High-energy developer geometric particles (36-44 items)
    const victoryColors = [
      "#2ea043", // Core Emerald
      "#3fb950", // Vibrant Green
      "#56d364", // Neon Mint
      "#7ee787", // Soft Bright Green
      "#e3b341", // Warm Code Gold
      "#f0f6fc"  // Crisp White Flash
    ];

    const shapes = ["square", "diamond", "circle"];

    for (let i = 0; i < 42; i++) {
      const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.5;
      const speed = 3.5 + Math.random() * 5.5;
      this.particles.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // Slight upward trajectory
        size: 3 + Math.random() * 3.5,
        color: victoryColors[Math.floor(Math.random() * victoryColors.length)],
        alpha: 1,
        decay: 0.018 + Math.random() * 0.016, // Lasts ~650-850ms
        drag: 0.94,
        gravity: 0.12,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.25
      });
    }

    // 3. Subtle ambient glow pulse on container using GSAP
    if (window.gsap && this.container) {
      gsap.fromTo(
        this.container,
        {
          boxShadow: "inset 0 0 0px rgba(46, 160, 67, 0), 0 0 0px rgba(46, 160, 67, 0)"
        },
        {
          boxShadow: "inset 0 0 28px rgba(46, 160, 67, 0.22), 0 0 24px rgba(46, 160, 67, 0.18)",
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          clearProps: "boxShadow"
        }
      );
    }

    this.startLoop();
  }

  startLoop() {
    if (this.animId) return;
    const render = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render & update shockwave rings
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const ring = this.rings[i];
        ring.radius += (ring.maxRadius - ring.radius) * 0.12;
        ring.alpha -= ring.decay;

        if (ring.alpha <= 0) {
          this.rings.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = ring.color;
        this.ctx.lineWidth = ring.lineWidth;
        this.ctx.globalAlpha = Math.max(0, ring.alpha);
        this.ctx.shadowColor = "#3fb950";
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Render & update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.drag;
        p.vy *= p.drag;
        if (p.gravity) p.vy += p.gravity;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.shape === "diamond") {
          this.ctx.beginPath();
          this.ctx.moveTo(0, -p.size);
          this.ctx.lineTo(p.size * 0.7, 0);
          this.ctx.lineTo(0, p.size);
          this.ctx.lineTo(-p.size * 0.7, 0);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          // Square
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        this.ctx.restore();
      }

      if (this.particles.length > 0 || this.rings.length > 0) {
        this.animId = requestAnimationFrame(render);
      } else {
        this.animId = null;
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    };

    this.animId = requestAnimationFrame(render);
  }

  clear() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.particles = [];
    this.rings = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

export const celebrationFX = new CelebrationFX();

// Rolling numerical counter animation using GSAP
export function animateCounter(element, targetValue, duration = 0.45, suffix = "") {
  if (!element) return;
  if (prefersReducedMotion() || !window.gsap) {
    element.textContent = `${targetValue}${suffix}`;
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: targetValue,
    duration: duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = `${Math.round(obj.val)}${suffix}`;
    }
  });
}
