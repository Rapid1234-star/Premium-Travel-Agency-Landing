import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  collectSignals,
  demoteTier,
  resolveInitialTier,
  type DeviceSignals,
  type DeviceTier,
} from '../lib/deviceTier';

type DeviceTierContextValue = {
  tier: DeviceTier;
  signals: DeviceSignals | null;
  demote: (p75Ms: number) => void;
  setTier: (tier: DeviceTier) => void;
};

const DeviceTierContext = createContext<DeviceTierContextValue | null>(null);

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

export function DeviceTierProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<DeviceSignals | null>(null);
  const [tier, setTier] = useState<DeviceTier>(() =>
    typeof window !== 'undefined' ? resolveInitialTier() : 'full'
  );
  const demotedRef = useRef(false);

  useEffect(() => {
    const s = collectSignals();
    setSignals(s);
    setTier(resolveInitialTier(s));
  }, []);

  // FPS probe after first paint — demote only
  useEffect(() => {
    if (tier === 'static') return;
    let cancelled = false;
    const samples: number[] = [];
    let last = performance.now();
    let frames = 0;
    let raf = 0;

    const start = window.setTimeout(() => {
      const tick = (now: number) => {
        if (cancelled) return;
        const dt = now - last;
        last = now;
        frames += 1;
        if (frames > 10) samples.push(dt);
        if (samples.length < 45) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const sorted = [...samples].sort((a, b) => a - b);
        const p75 = percentile(sorted, 0.75);
        if (!demotedRef.current) {
          const next = demoteTier(tier, p75);
          if (next !== tier) {
            demotedRef.current = true;
            setTier(next);
          }
        }
      };
      raf = requestAnimationFrame(tick);
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tier]);

  const demote = useCallback(
    (p75Ms: number) => {
      setTier((current) => {
        const next = demoteTier(current, p75Ms);
        if (next !== current) demotedRef.current = true;
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ tier, signals, demote, setTier }),
    [tier, signals, demote]
  );

  return (
    <DeviceTierContext.Provider value={value}>{children}</DeviceTierContext.Provider>
  );
}

export function useDeviceTier() {
  const ctx = useContext(DeviceTierContext);
  if (!ctx) {
    throw new Error('useDeviceTier must be used within DeviceTierProvider');
  }
  return ctx;
}
