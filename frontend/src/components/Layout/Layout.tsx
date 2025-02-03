import React, { useEffect, useRef } from "react";
import styles from "./Layout.module.scss";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<{ x: number; y: number; r: number; dx: number; dy: number }[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleColor = getComputedStyle(document.documentElement).getPropertyValue("--particle-color").trim();

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 20 + 5,
      dx: Math.random() * 1 - 0.5,
      dy: Math.random() * 1 - 0.5,
    }));
    particlesRef.current = particles;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          p.x += dx * 0.05;
          p.y += dy * 0.05;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
        ctx.closePath();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x - p.r < 0 || p.x + p.r > canvas.width) p.dx *= -1;
        if (p.y - p.r < 0 || p.y + p.r > canvas.height) p.dy *= -1;
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.layout}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Layout;
