import { useRef, useEffect, useState, useCallback } from 'react';
import type { MotionValue } from 'framer-motion';

const TOTAL_FRAMES = 280;
const SCROLL_START = 0.35;
const SCROLL_END = 0.60;

function getFramePath(index: number, isMobile: boolean): string {
  const padded = String(index + 1).padStart(3, '0');
  return `/frames/${isMobile ? 'mobile' : 'desktop'}/frame-${padded}.webp`;
}

function loadFrame(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function FrameSequence({ scrollOffset }: { scrollOffset: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentIndexRef = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(img, 0, 0, displayW, displayH);
  }, []);

  // Preload all frames progressively
  useEffect(() => {
    let cancelled = false;

    async function preloadAll() {
      // First: load frame 1 immediately for instant poster
      try {
        const poster = await loadFrame(getFramePath(0, isMobile));
        if (!cancelled) {
          imagesRef.current[0] = poster;
          setLoadedCount(1);
          drawFrame(0);
        }
      } catch {}

      // Then: load remaining frames in parallel batches of 20
      const BATCH_SIZE = 20;
      for (let batch = 0; batch < TOTAL_FRAMES; batch += BATCH_SIZE) {
        if (cancelled) break;
        const indices = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_FRAMES - batch) }, (_, i) => batch + i);
        await Promise.allSettled(
          indices.map(i => loadFrame(getFramePath(i, isMobile)).then(img => {
            if (!cancelled) {
              imagesRef.current[i] = img;
              setLoadedCount(prev => prev + 1);
            }
          }))
        );
      }
    }

    preloadAll();
    return () => { cancelled = true; };
  }, [isMobile, drawFrame]);

  // Subscribe to scrollOffset changes
  useEffect(() => {
    const unsubscribe = scrollOffset.on('change', (latest) => {
      const progress = Math.max(0, Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START)));
      const frameIndex = Math.round(progress * (TOTAL_FRAMES - 1));

      if (frameIndex !== currentIndexRef.current) {
        currentIndexRef.current = frameIndex;
        drawFrame(frameIndex);
      }
    });
    return unsubscribe;
  }, [scrollOffset, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
