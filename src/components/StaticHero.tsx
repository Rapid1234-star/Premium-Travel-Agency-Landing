import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

type StaticHeroProps = {
  scrollOffset: MotionValue<number>;
};

/**
 * Premium cinematic stills journey — used when tier === 'static'.
 * Same brand story without WebGL or 280-frame scrub.
 */
export function StaticHero({ scrollOffset }: StaticHeroProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const cloudOpacity = useTransform(scrollOffset, [0, 0.08, 0.16, 0.88, 0.95], [1, 1, 0, 0, 1]);
  const cloudDark = useTransform(scrollOffset, [0.08, 0.16, 0.78, 0.86], [0, 0.88, 0.88, 0]);
  const jetOpacity = useTransform(scrollOffset, [0, 0.06, 0.14, 0.2, 0.76, 0.84], [1, 1, 0.85, 0, 0, 0.55]);
  const jetScale = useTransform(
    scrollOffset,
    [0, 0.12],
    reduceMotion ? [1, 1] : [1, 1.04]
  );
  const jetY = useTransform(scrollOffset, [0, 0.14], reduceMotion ? [0, 0] : [0, -18]);
  const windowOpacity = useTransform(scrollOffset, [0.14, 0.2, 0.72, 0.8], [0, 1, 1, 0]);
  const windowScale = useTransform(
    scrollOffset,
    [0.2, 0.35],
    reduceMotion ? [1, 1] : [1.02, 1]
  );
  const scrim = useTransform(
    scrollOffset,
    [0.18, 0.22, 0.35, 0.38, 0.72, 0.78],
    [0.55, 0.18, 0.18, 0.45, 0.55, 0.7]
  );

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Cloud atmosphere */}
      <motion.div style={{ opacity: cloudOpacity }} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/new_bg.png)' }}
        />
        <div className="absolute inset-0 bg-white/15" />
        <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
        <motion.div
          style={{ opacity: cloudDark }}
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/88 to-black/95"
        />
      </motion.div>

      {/* Jet plate — luxury still (silhouette + interior glow) */}
      <motion.div
        style={{ opacity: jetOpacity, scale: jetScale, y: jetY }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[min(92vw,720px)] aspect-[16/10]">
          <div
            className="absolute inset-0 rounded-[2px] overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse at 55% 40%, rgba(255,255,255,0.12) 0%, transparent 55%), linear-gradient(135deg, #0a0a0c 0%, #1a1520 45%, #0c0c10 100%)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
            }}
          >
            <img
              src="/posters/jet-hero.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-95 z-[1]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('[data-jet-fallback]');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            {/* Fallback silhouette if poster missing */}
            <div
              data-jet-fallback
              className="absolute inset-0 hidden items-center justify-center z-0"
            >
              <svg
                viewBox="0 0 240 80"
                className="w-[78%] max-w-[520px] text-white/90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M8 42 L95 38 L130 18 L148 20 L120 40 L210 36 L230 42 L210 48 L118 46 L145 62 L128 64 L95 48 L8 52 Z"
                  opacity="0.92"
                />
                <ellipse cx="168" cy="42" rx="8" ry="4" fill="#ff6600" opacity="0.55" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
        </div>
      </motion.div>

      {/* Cabin window poster chapter */}
      <motion.div
        style={{ opacity: windowOpacity, scale: windowScale }}
        className="absolute inset-0"
      >
        <img
          src="/posters/window-open.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (!el.dataset.fallback) {
              el.dataset.fallback = '1';
              el.src = '/luxury_jet_interior.jpg';
            }
          }}
        />
        <motion.div
          style={{ opacity: scrim }}
          className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"
        />
      </motion.div>
    </div>
  );
}
