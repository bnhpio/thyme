import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'cta';
  intensity?: 'low' | 'medium' | 'high';
}

export function AnimatedBackground({
  variant = 'section',
  intensity = 'medium',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const getIntensityMultiplier = () => {
      switch (intensity) {
        case 'low':
          return 0.5;
        case 'high':
          return 1.5;
        default:
          return 1;
      }
    };

    const initParticles = () => {
      const count = Math.floor(30 * getIntensityMultiplier());
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: `hsl(${160 + Math.random() * 100}, 70%, ${60 + Math.random() * 20}%)`,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.globalAlpha = ((150 - distance) / 150) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-30"
        />
        {/* Animated mesh gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(at 0% 0%, oklch(from var(--primary) l c h / 0.4) 0%, transparent 50%),
              radial-gradient(at 100% 0%, oklch(from var(--accent-secondary) l c h / 0.4) 0%, transparent 50%),
              radial-gradient(at 100% 100%, oklch(from var(--accent) l c h / 0.4) 0%, transparent 50%),
              radial-gradient(at 0% 100%, oklch(from var(--accent-tertiary) l c h / 0.3) 0%, transparent 50%)
            `,
            backgroundSize: '200% 200%',
            animation: 'mesh-move 20s ease infinite',
          }}
        />
        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div
            className="absolute w-64 h-64 rounded-full blur-3xl animate-float"
            style={{
              background: 'oklch(from var(--primary) l c h / 0.15)',
              top: '10%',
              left: '10%',
              animationDuration: '20s',
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl animate-float-slow"
            style={{
              background: 'oklch(from var(--accent-secondary) l c h / 0.15)',
              top: '50%',
              right: '10%',
              animationDuration: '25s',
              animationDelay: '2s',
            }}
          />
          <div
            className="absolute w-80 h-80 rounded-full blur-3xl animate-float"
            style={{
              background: 'oklch(from var(--accent) l c h / 0.15)',
              bottom: '20%',
              left: '30%',
              animationDuration: '18s',
              animationDelay: '4s',
            }}
          />
          {/* Geometric shapes */}
          <div
            className="absolute w-32 h-32 rotate-45 blur-2xl animate-rotate-slow"
            style={{
              background: 'oklch(from var(--primary) l c h / 0.1)',
              top: '30%',
              right: '20%',
              animationDuration: '40s',
            }}
          />
          <div
            className="absolute w-24 h-24 rounded-full blur-xl animate-blob-float"
            style={{
              background: 'oklch(from var(--accent-tertiary) l c h / 0.12)',
              bottom: '30%',
              right: '30%',
              animationDuration: '15s',
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'cta') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-20"
        />
        {/* Pulsing gradient orbs */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-glow"
            style={{
              background: 'oklch(from var(--primary) l c h / 0.2)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-3xl animate-pulse-glow"
            style={{
              background: 'oklch(from var(--accent-secondary) l c h / 0.2)',
              top: '30%',
              right: '20%',
              animationDelay: '1s',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-pulse-glow"
            style={{
              background: 'oklch(from var(--accent) l c h / 0.2)',
              bottom: '20%',
              left: '20%',
              animationDelay: '2s',
            }}
          />
        </div>
      </div>
    );
  }

  // Default section variant
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-15"
      />
      {/* Subtle animated grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(oklch(from var(--primary) l c h / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, oklch(from var(--primary) l c h / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 30s linear infinite',
        }}
      />
      {/* Floating shapes */}
      <div className="absolute inset-0">
        <div
          className="absolute w-48 h-48 rounded-full blur-2xl animate-float"
          style={{
            background: 'oklch(from var(--primary) l c h / 0.1)',
            top: '20%',
            left: '15%',
            animationDuration: '22s',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-2xl animate-float-slow"
          style={{
            background: 'oklch(from var(--accent-secondary) l c h / 0.1)',
            top: '60%',
            right: '15%',
            animationDuration: '28s',
            animationDelay: '3s',
          }}
        />
        {/* Additional geometric elements */}
        <div
          className="absolute w-20 h-20 rotate-45 blur-xl animate-rotate-slow"
          style={{
            background: 'oklch(from var(--accent) l c h / 0.08)',
            bottom: '25%',
            left: '25%',
            animationDuration: '35s',
          }}
        />
      </div>
    </div>
  );
}
