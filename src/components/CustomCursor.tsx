import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const cursorX = useMotionValue(-9999);
  const cursorY = useMotionValue(-9999);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsTouchDevice(!finePointer.matches);
    setReduceMotion(motionMq.matches);

    const onPointerChange = () => setIsTouchDevice(!finePointer.matches);
    const onMotionChange = () => setReduceMotion(motionMq.matches);
    finePointer.addEventListener('change', onPointerChange);
    motionMq.addEventListener('change', onMotionChange);

    return () => {
      finePointer.removeEventListener('change', onPointerChange);
      motionMq.removeEventListener('change', onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice || reduceMotion) return;

    let ticking = false;
    const moveCursor = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          cursorX.set(e.clientX);
          cursorY.set(e.clientY);
          setIsVisible(true);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleHoverStart);
    window.addEventListener('mouseout', handleHoverEnd);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleHoverStart);
      window.removeEventListener('mouseout', handleHoverEnd);
    };
  }, [cursorX, cursorY, isTouchDevice, reduceMotion]);

  if (isTouchDevice || reduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-white/80 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isVisible ? (isHovering ? 2.5 : 1) : 0, 
        opacity: isVisible ? 0.9 : 0 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-hidden="true"
    />
  );
}
