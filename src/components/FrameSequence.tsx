import { useRef, useEffect, useState, useCallback } from 'react';
import type { MotionValue } from 'framer-motion';

/** LOCKED — window shade open timing (do not change) */
export const TOTAL_FRAMES = 280;
export const SCROLL_START = 0.22;
export const SCROLL_END = 0.35;

const PRELOAD_SCROLL = 0.10;
const BATCH_SIZE = 24;
const LOAD_AHEAD = 40;
const LOAD_BEHIND = 24;
/** Pause densify while user is actively scrubbing */
const SCROLL_IDLE_MS = 180;
/** Every Nth source frame for scrub (keeps 0.22–0.35 timing) */
const SCRUB_STEP = 2;

function getFramePath(index: number, isMobile: boolean): string {
  const padded = String(index + 1).padStart(3, '0');
  return `/frames/${isMobile ? 'mobile' : 'desktop'}/frame-${padded}.webp`;
}

function cappedDpr() {
  // Frames canvas at 1× — cheapest draw, pairs with WebGL at dpr 1
  return 1;
}

/** Map open progress 0–1 → source frame index (stepped for perf). */
export function progressToFrameIndex(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const steps = Math.ceil(TOTAL_FRAMES / SCRUB_STEP);
  const step = Math.round(clamped * (steps - 1));
  return Math.min(TOTAL_FRAMES - 1, step * SCRUB_STEP);
}

async function loadBitmap(src: string): Promise<ImageBitmap> {
  const res = await fetch(src, { cache: 'force-cache' });
  const blob = await res.blob();
  return createImageBitmap(blob, {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none',
  });
}

function nearestBitmap(
  bitmaps: (ImageBitmap | null)[],
  index: number,
  radius = 64
): ImageBitmap | null {
  if (bitmaps[index]) return bitmaps[index];
  for (let d = SCRUB_STEP; d <= radius; d += SCRUB_STEP) {
    const a = bitmaps[index - d];
    const b = bitmaps[index + d];
    if (a) return a;
    if (b) return b;
  }
  for (let d = 1; d <= radius; d++) {
    const a = bitmaps[index - d];
    const b = bitmaps[index + d];
    if (a) return a;
    if (b) return b;
  }
  return null;
}

type FrameSequenceProps = {
  scrollOffset: MotionValue<number>;
  eagerWarm?: boolean;
  onCriticalReady?: () => void;
};

export function FrameSequence({
  scrollOffset,
  eagerWarm = true,
  onCriticalReady,
}: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentIndexRef = useRef(-1);
  const loadingBatchRef = useRef(false);
  const startedRef = useRef(false);
  const criticalNotifiedRef = useRef(false);
  const drawRafRef = useRef(0);
  const pendingIndexRef = useRef(-1);
  const scrollingRef = useRef(false);
  const idleTimerRef = useRef(0);
  const densifyQueueRef = useRef<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const onReadyRef = useRef(onCriticalReady);
  onReadyRef.current = onCriticalReady;

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const ensureCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      });
    }
    return ctxRef.current;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = cappedDpr();
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    const tw = Math.max(1, Math.round(displayW * dpr));
    const th = Math.max(1, Math.round(displayH * dpr));
    if (canvas.width !== tw || canvas.height !== th) {
      canvas.width = tw;
      canvas.height = th;
      ctxRef.current = null;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = ensureCtx();
    const bmp = nearestBitmap(bitmapsRef.current, index);
    if (!canvas || !ctx || !bmp) return;
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  }, [ensureCtx]);

  const scheduleDraw = useCallback((index: number) => {
    pendingIndexRef.current = index;
    if (drawRafRef.current) return;
    drawRafRef.current = requestAnimationFrame(() => {
      drawRafRef.current = 0;
      const idx = pendingIndexRef.current;
      currentIndexRef.current = idx;
      drawFrame(idx);
    });
  }, [drawFrame]);

  const loadIndices = useCallback(async (indices: number[], cancelled: () => boolean) => {
    const unique = [...new Set(indices)].filter(
      i => i >= 0 && i < TOTAL_FRAMES && !bitmapsRef.current[i]
    );
    if (!unique.length) return;

    // Parallel batches to avoid saturating main thread
    for (let start = 0; start < unique.length; start += BATCH_SIZE) {
      if (cancelled()) return;
      const slice = unique.slice(start, start + BATCH_SIZE);
      await Promise.allSettled(
        slice.map(async i => {
          try {
            const bmp = await loadBitmap(getFramePath(i, isMobile));
            if (cancelled()) {
              bmp.close();
              return;
            }
            const prev = bitmapsRef.current[i];
            bitmapsRef.current[i] = bmp;
            if (prev) prev.close();
          } catch { /* ignore */ }
        })
      );
    }
  }, [isMobile]);

  const pumpDensify = useCallback(async (cancelled: () => boolean) => {
    if (cancelled() || loadingBatchRef.current || scrollingRef.current) return;
    const q = densifyQueueRef.current;
    if (!q.length) return;

    const batch = q.splice(0, BATCH_SIZE);
    loadingBatchRef.current = true;
    await loadIndices(batch, cancelled);
    loadingBatchRef.current = false;

    // Never redraw from densify while scrubbing — avoids hitching
    if (!scrollingRef.current && currentIndexRef.current >= 0) {
      scheduleDraw(currentIndexRef.current);
    }

    if (!cancelled() && densifyQueueRef.current.length && !scrollingRef.current) {
      window.setTimeout(() => void pumpDensify(cancelled), 16);
    }
  }, [loadIndices, scheduleDraw]);

  // Eager warm: full scrub grid before ready → densify odd frames on idle
  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    const startPreload = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      try {
        const poster = await loadBitmap(getFramePath(0, isMobile));
        if (cancelled) {
          poster.close();
          return;
        }
        bitmapsRef.current[0] = poster;
        scheduleDraw(0);
      } catch { /* ignore */ }

      // Full scrub-step grid BEFORE critical ready (no holes mid-open)
      const scrubGrid: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i += SCRUB_STEP) scrubGrid.push(i);
      // Always include last frame
      if (!scrubGrid.includes(TOTAL_FRAMES - 1)) scrubGrid.push(TOTAL_FRAMES - 1);

      await loadIndices(scrubGrid, isCancelled);

      if (!criticalNotifiedRef.current) {
        criticalNotifiedRef.current = true;
        onReadyRef.current?.();
      }

      // Remaining odd frames densify only when idle
      const queue: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!bitmapsRef.current[i]) queue.push(i);
      }
      densifyQueueRef.current = queue;
      void pumpDensify(isCancelled);
    };

    if (eagerWarm) {
      void startPreload();
    } else {
      const unsub = scrollOffset.on('change', (latest) => {
        if (latest >= PRELOAD_SCROLL) void startPreload();
      });
      const idleTimer = window.setTimeout(() => void startPreload(), 1000);
      if (scrollOffset.get() >= PRELOAD_SCROLL) void startPreload();
      return () => {
        cancelled = true;
        unsub();
        window.clearTimeout(idleTimer);
      };
    }

    return () => {
      cancelled = true;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        bitmapsRef.current[i]?.close();
        bitmapsRef.current[i] = null;
      }
    };
  }, [isMobile, scrollOffset, scheduleDraw, loadIndices, pumpDensify, eagerWarm]);

  // Scroll scrub — pause densify while moving; resume on idle
  useEffect(() => {
    let cancelled = false;

    const markScrolling = () => {
      scrollingRef.current = true;
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        scrollingRef.current = false;
        void pumpDensify(() => cancelled);
      }, SCROLL_IDLE_MS);
    };

    const ensureNeighborhood = (frameIndex: number) => {
      // Only enqueue — never await on scroll path
      if (scrollingRef.current) return;
      if (loadingBatchRef.current) return;
      const q = densifyQueueRef.current;
      const add = (i: number) => {
        if (i >= 0 && i < TOTAL_FRAMES && !bitmapsRef.current[i] && !q.includes(i)) {
          q.unshift(i);
        }
      };
      for (let i = frameIndex; i <= frameIndex + LOAD_AHEAD && i < TOTAL_FRAMES; i += SCRUB_STEP) add(i);
      for (let i = frameIndex; i >= frameIndex - LOAD_BEHIND && i >= 0; i -= SCRUB_STEP) add(i);
    };

    const unsubscribe = scrollOffset.on('change', (latest) => {
      markScrolling();

      const progress = Math.max(0, Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START)));
      const frameIndex = progressToFrameIndex(progress);
      scheduleDraw(frameIndex);

      if (latest >= PRELOAD_SCROLL || eagerWarm) {
        ensureNeighborhood(frameIndex);
      }
    });

    const latest = scrollOffset.get();
    const progress = Math.max(0, Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START)));
    scheduleDraw(progressToFrameIndex(progress));

    return () => {
      cancelled = true;
      unsubscribe();
      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [scrollOffset, scheduleDraw, pumpDensify, eagerWarm]);

  useEffect(() => {
    const onResize = () => {
      resizeCanvas();
      if (currentIndexRef.current >= 0) drawFrame(currentIndexRef.current);
      else if (bitmapsRef.current[0]) drawFrame(0);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resizeCanvas, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
