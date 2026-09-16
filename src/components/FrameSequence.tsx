import { useRef, useEffect, useState, useCallback } from 'react';
import type { MotionValue } from 'framer-motion';

const TOTAL_FRAMES = 280;
const SCROLL_START = 0.22;
const SCROLL_END = 0.35;
const INITIAL_LOAD_COUNT = 30;
const BATCH_SIZE = 20;

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
  const [highestLoadedIndex, setHighestLoadedIndex] = useState(INITIAL_LOAD_COUNT - 1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Handle canvas resize in a separate effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.clientWidth;
      const displayH = canvas.clientHeight;

      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
        setCanvasSize({ width: displayW, height: displayH });
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: displayW, height: displayH } = canvasSize;
    if (displayW === 0 || displayH === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [canvasSize]);

  // Preload initial frames (0-29) immediately
  useEffect(() => {
    let cancelled = false;

    async function preloadInitial() {
      // Load frame 0 immediately for instant poster
      try {
        const poster = await loadFrame(getFramePath(0, isMobile));
        if (!cancelled) {
          imagesRef.current[0] = poster;
          setLoadedCount(1);
          drawFrame(0);
        }
      } catch {}

      // Load frames 1-29 in parallel
      const initialIndices = Array.from({ length: INITIAL_LOAD_COUNT - 1 }, (_, i) => i + 1);
      await Promise.allSettled(
        initialIndices.map(i => loadFrame(getFramePath(i, isMobile)).then(img => {
          if (!cancelled) {
            imagesRef.current[i] = img;
            setLoadedCount(prev => prev + 1);
          }
        }))
      );
      if (!cancelled) {
        setHighestLoadedIndex(INITIAL_LOAD_COUNT - 1);
      }
    }

    preloadInitial();
    return () => { cancelled = true; };
  }, [isMobile, drawFrame]);

  // Lazy load remaining frames as scroll approaches
  useEffect(() => {
    let cancelled = false;

    const checkAndLoadFrames = (scrollProgress: number) => {
      if (cancelled) return;
      
      const targetIndex = Math.round(scrollProgress * (TOTAL_FRAMES - 1));
      const loadAheadThreshold = 50; // Start loading 50 frames ahead
      
      if (targetIndex + loadAheadThreshold > highestLoadedIndex && highestLoadedIndex < TOTAL_FRAMES - 1) {
        const nextBatchStart = highestLoadedIndex + 1;
        const nextBatchEnd = Math.min(nextBatchStart + BATCH_SIZE, TOTAL_FRAMES);
        
        const batchIndices = Array.from({ length: nextBatchEnd - nextBatchStart }, (_, i) => nextBatchStart + i);
        
        Promise.allSettled(
          batchIndices.map(i => loadFrame(getFramePath(i, isMobile)).then(img => {
            if (!cancelled) {
              imagesRef.current[i] = img;
              setLoadedCount(prev => prev + 1);
            }
          }))
        ).then(() => {
          if (!cancelled) {
            setHighestLoadedIndex(nextBatchEnd - 1);
          }
        });
      }
    };

    const unsubscribe = scrollOffset.on('change', (latest) => {
      const progress = Math.max(0, Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START)));
      const frameIndex = Math.round(progress * (TOTAL_FRAMES - 1));

      if (frameIndex !== currentIndexRef.current) {
        currentIndexRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      // Check if we need to load more frames
      checkAndLoadFrames(progress);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [scrollOffset, drawFrame, isMobile, highestLoadedIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
