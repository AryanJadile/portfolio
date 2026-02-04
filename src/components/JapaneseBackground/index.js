import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from 'hooks';

const JapaneseBackground = () => {
  const canvasRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // if (reduceMotion) return;
    // console.log('JapaneseBackground mounted, reduceMotion:', reduceMotion);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Katakana characters
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const charArray = chars.split('');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 14 + 10; // Random size 10-24px
        this.char = charArray[Math.floor(Math.random() * charArray.length)];
        this.color = '#0ca3a3'; // Requested Teal color
        this.speedX = 0; // No horizontal spread
        this.speedY = Math.random() * 1 + 0.5; // Slow motion fall (0.5-1.5px/frame)
        this.life = 1;
        this.decay = Math.random() * 0.005 + 0.002; // Slower fade (longer delay)
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;

        // Occasionally change character for "glitch" effect
        if (Math.random() < 0.1) {
          this.char = charArray[Math.floor(Math.random() * charArray.length)];
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px monospace`;
        ctx.globalAlpha = this.life;
        ctx.fillText(this.char, this.x, this.y);
        ctx.globalAlpha = 1.0;
      }
    }

    const handleMouseMove = (e) => {
      // Calculate distance from last spawn point
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Threshold: Spawn only if moved more than 30px
      if (dist > 30) {
        lastPos.current = { x: e.clientX, y: e.clientY };

        // Spawn 1 particle
        particles.push(new Particle(e.clientX, e.clientY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through
        zIndex: 9999, // Overlay on top of everything
        // If content is covering it, we might need a higher Z-index or check App structure
      }}
    />
  );
};

export default JapaneseBackground;
