/* مكون الكور المتطيرة - قابل للاستخدام في أي صفحة */
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const MouseTrackingBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let mouseX = -999;
    let mouseY = -999;

    /* ضبط حجم الـ canvas */
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* تتبع الماوس */
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', onMouseMove);

    /* ألوان حسب الثيم */
    const isDark = theme === 'dark';
    const colors = isDark
      ? ['#6b63ff3c', '#11182762']
      : ['#6b63ff30', '#c7d2fe50'];

    /* إنشاء الكور */
    const circles = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 3 + Math.random() * 5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: 0.2 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    /* حلقة الرسم */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      circles.forEach(c => {

        /* تحريك الكورة */
        c.x += c.speedX;
        c.y += c.speedY;

        /* ابعاد الكورة عن الماوس */
        const dx = mouseX - c.x;
        const dy = mouseY - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          c.x -= dx * 0.03;
          c.y -= dy * 0.03;
        }

        /* إعادة الكورة من الجهة الأخرى لو خرجت */
        if (c.x < -10) c.x = canvas.width + 10;
        if (c.x > canvas.width + 10) c.x = -10;
        if (c.y < -10) c.y = canvas.height + 10;
        if (c.y > canvas.height + 10) c.y = -10;

        /* رسم الكورة */
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    /* تنظيف عند إزالة المكون */
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="mouse-tracking-bg" />;
};

export default MouseTrackingBackground;