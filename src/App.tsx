import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { JetScene } from './components/JetScene';
import { CustomCursor } from './components/CustomCursor';
import { FrameSequence } from './components/FrameSequence';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const { active, progress } = useProgress();

  const scrollOffset = useMotionValue(0);

  // Clouds only for hero; mid-journey stays dark; soft return near CTA
  const cloudOpacity = useTransform(scrollOffset, [0, 0.08, 0.16, 0.88, 0.95], [1, 1, 0, 0, 1]);

  const cloudDarkOverlay = useTransform(scrollOffset, [0.08, 0.16, 0.78, 0.86], [0, 0.9, 0.9, 0]);

  // Window frames — LOCKED feel: in before open, hold absorb, out before sketchbook
  const frameOpacity = useTransform(scrollOffset, [0.14, 0.20, 0.76, 0.84], [0, 1, 1, 0]);

  // Short absorb after open, then cards with scrim — no long last-frame stall
  const windowScrim = useTransform(
    scrollOffset,
    [0.18, 0.22, 0.35, 0.355, 0.38, 0.72, 0.78],
    [0.72, 0.2, 0.2, 0.22, 0.55, 0.62, 0.72]
  );

  // Real load progress for the bar
  const loadPct = Math.min(
    100,
    Math.round(
      (Math.min(progress, 100) * 0.55) +
      (framesReady ? 35 : 0) +
      (minTimeDone ? 10 : Math.min(10, (progress / 100) * 10))
    )
  );

  useEffect(() => {
    const t = window.setTimeout(() => setMinTimeDone(true), 1600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const assetsReady = (progress === 100 || !active) && framesReady;
    if (minTimeDone && assetsReady) {
      const t = window.setTimeout(() => setIsLoading(false), 280);
      return () => window.clearTimeout(t);
    }
  }, [minTimeDone, progress, active, framesReady]);

  // Safety: never block forever if frames fail
  useEffect(() => {
    const t = window.setTimeout(() => {
      setFramesReady(true);
      setMinTimeDone(true);
    }, 12000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative font-sans">
      <CustomCursor />

      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        <motion.div
          style={{ opacity: cloudOpacity }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          initial={{ backgroundImage: 'url(/new_bg.png)' }}
        >
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-gradient-to-t from-white/95 via-white/50 to-transparent" />
          <motion.div
            style={{ opacity: cloudDarkOverlay }}
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black/95"
          />
        </motion.div>

        <motion.div
          style={{ opacity: frameOpacity }}
          className="absolute inset-0 w-full h-full"
        >
          <FrameSequence
            scrollOffset={scrollOffset}
            eagerWarm
            onCriticalReady={() => setFramesReady(true)}
          />
          {/* Dynamic scrim: lighter during open so scenery can be absorbed */}
          <motion.div
            style={{ opacity: windowScrim }}
            className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-[0.2em] uppercase mb-4 relative overflow-hidden flex items-center gap-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white" aria-hidden="true">
                  <path d="M22 2L2 12L9 14.5L16 8L11 16L18 19L22 2Z" fill="currentColor" />
                </svg>
                LuxFly
              </h1>
              <div className="w-48 h-[2px] bg-white/20 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#e9ecf0]"
                  style={{ width: `${loadPct}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-white/40">
                {framesReady ? 'Preparing cabin' : 'Loading journey'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 w-full h-full z-10">
        <JetScene isLoading={isLoading} scrollOffset={scrollOffset} />
      </div>
    </div>
  );
}
