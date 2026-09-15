import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseMove?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
  onTouchMove?: React.TouchEventHandler<HTMLButtonElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLButtonElement>;
  onTouchCancel?: React.TouchEventHandler<HTMLButtonElement>;
}

export function MagneticButton({ 
  children, 
  className = "", 
  magneticStrength = 0.3,
  ...props 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    setPosition({ 
      x: deltaX * magneticStrength, 
      y: deltaY * magneticStrength 
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !e.touches[0]) return;
    
    const { clientX, clientY } = e.touches[0];
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    setPosition({ 
      x: deltaX * magneticStrength, 
      y: deltaY * magneticStrength 
    });
  };

  const handlePointerEnd = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handlePointerEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerEnd}
      onTouchCancel={handlePointerEnd}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
