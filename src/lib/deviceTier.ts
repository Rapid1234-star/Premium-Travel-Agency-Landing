/** Capability tiers — Full / Lite / Static (progressive enhancement). */

export type DeviceTier = 'full' | 'lite' | 'static';

export type DeviceSignals = {
  dpr: number;
  cores: number;
  memoryGB: number | null;
  webgl2: boolean;
  maxTexture: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  slowNetwork: boolean;
  shortSide: number;
  isIOSSafari: boolean;
};

function probeWebGL(): { webgl2: boolean; maxTexture: number } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    }) as WebGL2RenderingContext | null;
    if (!gl) return { webgl2: false, maxTexture: 0 };
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const lose = gl.getExtension('WEBGL_lose_context');
    lose?.loseContext();
    return { webgl2: true, maxTexture: maxTexture || 0 };
  } catch {
    return { webgl2: false, maxTexture: 0 };
  }
}

function readOverride(): DeviceTier | null {
  try {
    const q = new URLSearchParams(window.location.search).get('tier');
    if (q === 'full' || q === 'lite' || q === 'static') return q;
  } catch {
    /* ignore */
  }
  return null;
}

export function collectSignals(): DeviceSignals {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cores = navigator.hardwareConcurrency || 4;
  const memoryGB = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(nav.connection?.saveData);
  const et = nav.connection?.effectiveType || '';
  const slowNetwork = et === '2g' || et === 'slow-2g';
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const ua = navigator.userAgent || '';
  const isIOSSafari =
    /iP(hone|od|ad)/.test(ua) ||
    (/Mac/.test(ua) && navigator.maxTouchPoints > 1);
  const { webgl2, maxTexture } = probeWebGL();

  return {
    dpr,
    cores,
    memoryGB,
    webgl2,
    maxTexture,
    coarsePointer,
    reducedMotion,
    saveData,
    slowNetwork,
    shortSide,
    isIOSSafari,
  };
}

/** Initial tier from device signals (before FPS probe). */
export function resolveInitialTier(signals?: DeviceSignals): DeviceTier {
  const override = typeof window !== 'undefined' ? readOverride() : null;
  if (override) return override;

  const s = signals ?? (typeof window !== 'undefined' ? collectSignals() : null);
  if (!s) return 'full';

  if (s.reducedMotion || s.saveData || s.slowNetwork) return 'static';
  if (!s.webgl2 || s.maxTexture < 4096) return 'static';
  if (s.memoryGB !== null && s.memoryGB <= 2) return 'static';
  if (s.cores <= 4 && s.coarsePointer && s.shortSide < 500) return 'static';

  if (s.coarsePointer || s.shortSide < 900 || (s.dpr >= 2 && s.cores <= 6)) {
    return 'lite';
  }

  return 'full';
}

/** Demote only — never promote after a failed FPS probe. */
export function demoteTier(current: DeviceTier, p75Ms: number): DeviceTier {
  if (readOverride()) return current;
  if (p75Ms > 34) return 'static';
  if (p75Ms > 22 && current === 'full') return 'lite';
  return current;
}

export function cappedDprForTier(tier: DeviceTier): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  if (tier === 'static') return 1;
  return Math.min(dpr, 2);
}

/** Scrub every Nth frame — thinner on Lite to cut memory. */
export function scrubStepForTier(tier: DeviceTier): number {
  if (tier === 'lite') return 4;
  return 2;
}

export function usesCinematicEffects(tier: DeviceTier): boolean {
  return tier === 'full' || tier === 'lite';
}
