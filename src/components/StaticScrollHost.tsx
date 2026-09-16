import { useEffect, useRef, type ReactNode } from 'react';
import type { MotionValue } from 'framer-motion';

type StaticScrollHostProps = {
  isLoading: boolean;
  scrollOffset: MotionValue<number>;
  children: ReactNode;
};

/**
 * Native document-style scroll that feeds the same scrollOffset MotionValue
 * used by OverlayHTML / StaticHero — no WebGL ScrollControls.
 */
export function StaticScrollHost({
  isLoading,
  scrollOffset,
  children,
}: StaticScrollHostProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      const max = el.scrollHeight - el.clientHeight;
      const t = max > 0 ? el.scrollTop / max : 0;
      scrollOffset.set(Math.min(1, Math.max(0, t)));
    };

    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [scrollOffset]);

  useEffect(() => {
    if (isLoading && scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
      scrollOffset.set(0);
    }
  }, [isLoading, scrollOffset]);

  return (
    <div
      ref={scrollerRef}
      className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-none"
      style={{
        WebkitOverflowScrolling: 'touch',
        pointerEvents: isLoading ? 'none' : 'auto',
      }}
    >
      {children}
    </div>
  );
}
