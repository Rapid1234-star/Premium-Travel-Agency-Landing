import { useRef, useEffect, useCallback } from 'react';
import type { MotionValue } from 'framer-motion';
import { cappedDprForTier, scrubStepForTier, type DeviceTier } from '../lib/deviceTier';

/** LOCKED — window shade open timing (do not change) */
export const TOTAL_FRAMES = 280;
export const SCROLL_START = 0.22;
export const SCROLL_END = 0.35;

const PRELOAD_SCROLL = 0.10;
const BATCH_SIZE = 16;

function getFramePath(index: number, useMobileAssets: boolean): string {
  const padded = String(index + 1).padStart(3, '0');
  return `/frames/${useMobileAssets ? 'mobile' : 'desktop'}/frame-${padded}.webp`;
}

/** Map open progress 0–1 → source frame index (stepped for perf). */
export function progressToFrameIndex(progress: number, scrubStep = 2) {
  const clamped = Math.max(0, Math.min(1, progress));
  const steps = Math.ceil(TOTAL_FRAMES / scrubStep);
  const step = Math.round(clamped * (steps - 1));
  return Math.min(TOTAL_FRAMES - 1, step * scrubStep);
}

async function loadBitmap(src: string, resizeWidth?: number): Promise<ImageBitmap> {
  const res = await fetch(src, { cache: 'force-cache' });
  const blob = await res.blob();
  const opts: ImageBitmapOptions = {
    premultiplyAlpha: 'none',
    colorSpaceConversion: 'none',
  };
  if (resizeWidth && resizeWidth > 0) {
    opts.resizeWidth = resizeWidth;
    opts.resizeQuality = 'medium';
  }
  return createImageBitmap(blob, opts);
}

function nearestBitmap(
  bitmaps: (ImageBitmap | null)[],
  index: number,
  scrubStep: number,
  radius = 96
): ImageBitmap | null {
  if (bitmaps[index]) return bitmaps[index];
  for (let d = scrubStep; d <= radius; d += scrubStep) {
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
  tier?: DeviceTier;
};

export function FrameSequence({
  scrollOffset,
  eagerWarm = true,
  onCriticalReady,
  tier = 'full',
}: FrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentIndexRef = useRef(-1);
  const startedRef = useRef(false);
  const criticalNotifiedRef = useRef(false);
  const drawRafRef = useRef(0);
  const pendingIndexRef = useRef(-1);
  const scrubStepRef = useRef(scrubStepForTier(tier));
  const tierRef = useRef(tier);
  const onReadyRef = useRef(onCriticalReady);
  onReadyRef.current = onCriticalReady;
  tierRef.current = tier;
  scrubStepRef.current = scrubStepForTier(tier);

  const useMobileAssets = tier === 'lite' || (typeof window !== 'undefined' && window.innerWidth < 768);

  const ensureCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!ctxRef.current) {
      // Avoid desynchronized on iOS — can tear
      ctxRef.current = canvas.getContext('2d', { alpha: false });
    }
    return ctxRef.current;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = cappedDprForTier(tierRef.current);
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
  }, [resizeCanvas, tier]);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = ensureCtx();
    const bmp = nearestBitmap(bitmapsRef.current, index, scrubStepRef.current);
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

  const loadIndices = useCallback(
    async (indices: number[], cancelled: () => boolean, resizeWidth: number) => {
      const unique = [...new Set(indices)].filter(
        (i) => i >= 0 && i < TOTAL_FRAMES && !bitmapsRef.current[i]
      );
      if (!unique.length) return;

      for (let start = 0; start < unique.length; start += BATCH_SIZE) {
        if (cancelled()) return;
        const slice = unique.slice(start, start + BATCH_SIZE);
        await Promise.allSettled(
          slice.map(async (i) => {
            try {
              const bmp = await loadBitmap(getFramePath(i, useMobileAssets), resizeWidth);
              if (cancelled()) {
                bmp.close();
                return;
              }
              const prev = bitmapsRef.current[i];
              bitmapsRef.current[i] = bmp;
              if (prev) prev.close();
            } catch {
              /* ignore */
            }
          })
        );
      }
    },
    [useMobileAssets]
  );

  // Eager warm: scrub grid only — no densify of unused odd frames
  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    startedRef.current = false;
    criticalNotifiedRef.current = false;

    const startPreload = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      resizeCanvas();
      const resizeWidth = canvasRef.current?.width || Math.round(window.innerWidth * cappedDprForTier(tier));
      const step = scrubStepForTier(tier);

      try {
        const poster = await loadBitmap(getFramePath(0, useMobileAssets), resizeWidth);
        if (cancelled) {
          poster.close();
          return;
        }
        bitmapsRef.current[0] = poster;
        scheduleDraw(0);
      } catch {
        /* ignore */
      }

      const scrubGrid: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i += step) scrubGrid.push(i);
      if (!scrubGrid.includes(TOTAL_FRAMES - 1)) scrubGrid.push(TOTAL_FRAMES - 1);

      await loadIndices(scrubGrid, isCancelled, resizeWidth);

      if (!criticalNotifiedRef.current) {
        criticalNotifiedRef.current = true;
        onReadyRef.current?.();
      }
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
  }, [tier, scrollOffset, scheduleDraw, loadIndices, eagerWarm, useMobileAssets, resizeCanvas]);

  // Scroll scrub
  useEffect(() => {
    const unsubscribe = scrollOffset.on('change', (latest) => {
      const progress = Math.max(
        0,
        Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START))
      );
      scheduleDraw(progressToFrameIndex(progress, scrubStepRef.current));
    });

    const latest = scrollOffset.get();
    const progress = Math.max(
      0,
      Math.min(1, (latest - SCROLL_START) / (SCROLL_END - SCROLL_START))
    );
    scheduleDraw(progressToFrameIndex(progress, scrubStepRef.current));

    return () => {
      unsubscribe();
      if (drawRafRef.current) cancelAnimationFrame(drawRafRef.current);
    };
  }, [scrollOffset, scheduleDraw]);

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
