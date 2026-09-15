import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from './MagneticButton';
import type { MotionValue } from 'framer-motion';

export function OverlayHTML({ isLoading, scrollOffset }: { isLoading: boolean, scrollOffset?: MotionValue<number> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressPct, setProgressPct] = useState("0%");
  const { scrollYProgress } = useScroll();
  const sourceOffset = scrollOffset ?? scrollYProgress;

  useMotionValueEvent(sourceOffset, "change", (v) => {
    setProgressPct(`${Math.round(v * 100)}%`);
  });

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-screen relative font-sans text-black" style={{ height: '600vh' }}>
      
      {/* Scroll Progress Indicator */}
      <div className="fixed right-2 top-[20vh] bottom-[20vh] w-[2px] bg-white/10 z-50 rounded-full hidden md:block">
        <div 
          className="w-full bg-white rounded-full origin-top"
          style={{ height: progressPct }}
        />
      </div>

      {/* Mobile Menu Overlay — portal to body so fixed positioning works outside R3F ScrollControls */}
      {createPortal(
        <motion.div 
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
        >
          <button 
            onClick={() => setMenuOpen(false)} 
            className="absolute top-8 right-6 text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <div className="flex flex-col items-center gap-8 text-white text-2xl font-medium">
            <button onClick={() => scrollToSection('hero')} className="hover:text-gray-400 transition-colors">Home</button>
            <button onClick={() => scrollToSection('engineering')} className="hover:text-gray-400 transition-colors">Engineering</button>
            <button onClick={() => scrollToSection('comfort')} className="hover:text-gray-400 transition-colors">Comfort</button>
            <button onClick={() => scrollToSection('brand')} className="hover:text-gray-400 transition-colors">Our Heritage</button>
          </div>
        </motion.div>,
        document.body
      )}

      {/* SECTION 1: HERO (0vh - 100vh) */}
      <section id="hero" className="h-screen w-full relative flex flex-col items-center justify-start pt-[5vh] md:pt-[8vh]">
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="absolute top-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-50"
        >
           <div className="flex items-center gap-3 font-bold text-xl md:text-2xl tracking-tight text-white mix-blend-difference">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22 2L2 12L9 14.5L16 8L11 16L18 19L22 2Z" fill="currentColor"/>
              </svg>
              LuxFly
           </div>
           <div className="flex items-center gap-4 md:gap-8">
              <button 
                onClick={() => setMenuOpen(true)}
                aria-label="Open Menu"
                className="flex md:hidden items-center text-white mix-blend-difference hover:opacity-70 transition-opacity pointer-events-auto p-3 min-h-[44px] min-w-[44px]"
              >
                 <Menu size={28} strokeWidth={1.5} />
              </button>
              <button className="hidden md:flex items-center gap-3 text-sm font-medium hover:opacity-70 transition-opacity text-white mix-blend-difference pointer-events-auto cursor-pointer" aria-label="Menu">
                 <Menu size={20} strokeWidth={1.5} />
                 Menu
              </button>
              <MagneticButton aria-label="Get Ticket Now" className="hidden md:flex min-h-[44px] min-w-[44px] bg-transparent text-white border border-white px-6 md:px-8 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-white hover:text-black transition-colors tracking-wide cursor-pointer z-50 pointer-events-auto">
                 Get Ticket Now
              </MagneticButton>
           </div>
        </motion.header>

        {/* Huge Faded Text Background */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={!isLoading ? { opacity: 0.15, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none"
        >
          <span className="text-[clamp(4rem,20vw,25vw)] font-bold text-[#6a7585] whitespace-nowrap tracking-tighter">
            LUXURY FLIGHT
          </span>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="relative z-30 flex flex-col items-center justify-start w-full pointer-events-none"
        >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-gray-500 uppercase mb-4 md:mb-6">
               Flight Booking
            </span>
            <h1 className="text-[clamp(3.5rem,8vw,8rem)] font-medium text-center leading-[0.95] tracking-[-0.04em] text-[#222]">
               Fly Smarter,<br/>Explore Further.
            </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
          className="relative z-50 flex flex-col items-center w-full mt-2 md:mt-4 pointer-events-none"
        >
            <p className="text-[#444] max-w-sm md:max-w-md text-center text-xs md:text-sm font-medium leading-relaxed px-4 drop-shadow-md">
               Elevate your journey with intelligent travel that takes you<br className="hidden md:block"/> farther, faster, and with unmatched ease.
            </p>
            <MagneticButton aria-label="Get Ticket Now Main" className="mt-4 md:mt-6 min-h-[44px] min-w-[44px] bg-white text-black px-8 md:px-10 py-3.5 md:py-4 rounded-full text-xs md:text-sm font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow pointer-events-auto tracking-wide cursor-pointer">
               Get Ticket Now
            </MagneticButton>
        </motion.div>
      </section>

      {/* SECTION 2: INTELLIGENT ENGINEERING (100vh - 200vh) */}
      <section id="engineering" className="h-screen w-full relative flex flex-col items-start justify-center px-8 md:px-24">
         <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="text-white max-w-xl z-50 mix-blend-difference"
         >
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light mb-6 tracking-tight leading-none">Intelligent<br/><span className="font-medium">Engineering.</span></h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
               Designed for absolute aerodynamic perfection. The sleek fuselage cuts through the stratosphere with minimal resistance, delivering a completely silent, buttery smooth ride at Mach 0.9.
            </p>
            <div className="flex gap-6">
               <div>
                  <div className="text-3xl font-bold">0.9</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Mach Speed</span>
               </div>
               <div>
                  <div className="text-3xl font-bold">5,000</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Nautical Miles</span>
               </div>
            </div>
         </motion.div>
      </section>

      {/* SECTION 3: SEAMLESS TRAVEL / VIDEO (200vh - 300vh) */}
      <section id="video" className="h-screen w-full relative flex flex-col items-center justify-center pointer-events-none">
         <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center z-50">
            <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true, margin: "-10%" }}
               className="text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-[1.1] text-white"
            >
               Travel the World<br/>Without Any Stress
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               viewport={{ once: true, margin: "-10%" }}
               className="mt-6 text-[15px] md:text-[18px] text-white/80 max-w-2xl"
            >
               Let us take care of the planning while you enjoy meaningful travel experiences crafted just for you.
            </motion.p>
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               viewport={{ once: true, margin: "-10%" }}
            >
               <MagneticButton aria-label="Start Exploring" className="mt-8 min-h-[44px] min-w-[44px] bg-white text-black font-medium text-[15px] px-[26px] py-[12px] rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer pointer-events-auto">
                  Start Exploring
               </MagneticButton>
            </motion.div>
         </div>
      </section>

      {/* SECTION 4: UNCOMPROMISED COMFORT (300vh - 400vh) */}
      <section id="comfort" className="h-screen w-full relative flex flex-col items-start justify-center px-8 md:px-24">
         <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="glass-glow bg-black/20 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 mix-blend-screen"
         >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light mb-4 tracking-tight leading-none">Uncompromised<br/><span className="font-medium">Comfort.</span></h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
               Experience the most spacious cabin in its class. Featuring bespoke lie-flat seating, panoramic windows, and a state-of-the-art whisper-quiet acoustic design that reduces cabin noise to absolute minimums.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">14</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Passenger Capacity</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">1,000</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Cubic Ft Volume</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">100%</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Fresh Air Supply</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">52<span className="text-sm font-normal">dB</span></div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Cabin Noise Level</span>
               </div>
            </div>
         </motion.div>
      </section>

      {/* SECTION 5: THE BRAND (400vh - 500vh) */}
      <section id="brand" className="h-screen w-full relative flex flex-col items-end justify-center px-8 md:px-24">
         <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="glass-glow bg-white/5 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 text-right"
         >
            <span className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-4 block">Our Heritage</span>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-medium mb-6 tracking-tight leading-none">Redefining the<br/>Skies.</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
               Founded on the principle that time is your most valuable asset, LuxFly has spent over a decade perfecting the art of private aviation. We don't just fly you to your destination; we ensure the journey itself is a masterpiece.
            </p>
            <MagneticButton aria-label="Learn More about LuxFly" className="min-h-[44px] min-w-[44px] bg-transparent border border-white/30 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-white hover:text-black transition-colors pointer-events-auto cursor-pointer">
               Learn More
            </MagneticButton>
         </motion.div>
      </section>

      {/* SECTION 6: THE APPROACH / CTA (500vh - 600vh) */}
      <section id="cta" className="h-screen w-full relative flex flex-col items-center justify-center pointer-events-none px-4">
         <motion.form 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true, margin: "-20%" }}
            onSubmit={(e) => { e.preventDefault(); alert('Flight request submitted!'); }}
            className="glass-glow bg-black/60 backdrop-blur-2xl p-8 md:p-14 rounded-[2rem] shadow-2xl flex flex-col items-center text-white z-50 pointer-events-auto w-[95%] max-w-[500px]"
         >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">Begin Your Journey</h2>
            <p className="text-gray-300 text-center mb-8 max-w-sm">
               Experience the pinnacle of private aviation. Reserve your next flight with LuxFly.
            </p>
            <div className="flex flex-col gap-8 w-full">
               
               <div className="minimal-input-container">
                  <label htmlFor="destination" className="sr-only">Destination</label>
                  <input id="destination" name="destination" type="text" placeholder="Destination" required aria-required="true" aria-label="Destination" className="minimal-input" />
                  <div className="minimal-input-highlight"></div>
               </div>
               
               <div className="minimal-input-container">
                  <label htmlFor="date" className="sr-only">Flight Date</label>
                  <input id="date" name="date" type="date" required aria-required="true" aria-label="Flight Date" className="minimal-input" />
                  <div className="minimal-input-highlight"></div>
               </div>

               <MagneticButton type="submit" aria-label="Submit Flight Request" className="min-h-[44px] w-full bg-white text-black font-bold text-sm py-4 rounded-xl mt-4 hover:bg-gray-200 transition-colors cursor-pointer">
                  Request Flight
               </MagneticButton>
            </div>
         </motion.form>
      </section>

    </div>
  );
}
