import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { useScroll } from '@react-three/drei';
import { Menu, X, Star, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from './MagneticButton';
import type { MotionValue } from 'framer-motion';
import { useAccessibleMenu } from '../hooks/useAccessibleMenu';
import { scrollDreiToId } from '../lib/scrollToSection';

export function OverlayHTML({ isLoading, scrollOffset }: { isLoading: boolean, scrollOffset?: MotionValue<number> }) {
  const scroll = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const { menuRef, openMenu, closeMenu } = useAccessibleMenu(menuOpen, setMenuOpen);
  const [progressPct, setProgressPct] = useState("0%");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ destination: '', style: '', travelers: '2' });
  const [sketchbookReady, setSketchbookReady] = useState(false);
  const fallbackOffset = useMotionValue(0);
  const offset = scrollOffset ?? fallbackOffset;

  // Early card (Destinations): visible before window, clears during open
  const earlyCardOpacity = useTransform(offset, [0.08, 0.12, 0.18, 0.215], [0, 1, 1, 0]);

  // Mid cards right after open ends (0.35) — short breathe, no long freeze
  const postOpenCardsOpacity = useTransform(offset, [0.20, 0.22, 0.355, 0.38], [0, 0, 0, 1]);

  useMotionValueEvent(offset, "change", (v: number) => {
    setProgressPct(`${Math.round(v * 100)}%`);
    if (v >= 0.55) setSketchbookReady(true);
  });

  const scrollToSection = useCallback((id: string) => {
    closeMenu();
    // Defer so menu close doesn't steal layout
    requestAnimationFrame(() => {
      scrollDreiToId(id, scroll.el);
    });
  }, [closeMenu, scroll]);

  const handleDestinationSelect = useCallback((destination: string) => {
    setFormData(prev => ({ ...prev, destination }));
    setFormSubmitted(false);
    requestAnimationFrame(() => {
      scrollDreiToId('cta', scroll.el);
    });
    window.setTimeout(() => {
      const input = document.getElementById('destination') as HTMLInputElement | null;
      input?.focus();
    }, 700);
  }, [scroll]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.destination) {
        handleDestinationSelect(event.data.destination);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleDestinationSelect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-screen relative font-sans text-black" style={{ height: '900svh' }}>
      
      {/* Scroll Progress Indicator */}
      <div className="fixed right-2 top-[20svh] bottom-[20svh] w-[1px] md:w-[2px] bg-white/10 z-50 rounded-full" aria-hidden="true">
        <div 
          className="w-full bg-[#A16207] rounded-full origin-top"
          style={{ height: progressPct }}
          role="progressbar"
          aria-valuenow={Math.round(parseFloat(progressPct))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scroll progress"
        />
      </div>

      {/* Mobile Menu Overlay */}
      {createPortal(
        <motion.div 
          ref={menuRef}
          id="luxfly-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
          aria-hidden={!menuOpen}
        >
          <button 
            onClick={closeMenu} 
            className="absolute top-[max(2rem,env(safe-area-inset-top))] right-6 text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <nav className="flex flex-col items-center gap-8 text-white text-2xl font-medium">
            <button type="button" onClick={() => scrollToSection('hero')} className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer">Home</button>
            <button type="button" onClick={() => scrollToSection('destinations')} className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer">Destinations</button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer">How It Works</button>
            <button type="button" onClick={() => scrollToSection('story')} className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer">Our Story</button>
            <button type="button" onClick={() => scrollToSection('cta')} className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer">Plan a Trip</button>
          </nav>
        </motion.div>,
        document.body
      )}

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section id="hero" className="h-screen w-full relative flex flex-col items-center justify-start pt-[5vh] md:pt-[8vh]">
        <motion.header 
          initial={{ y: -36, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 w-full px-6 md:px-12 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 md:pb-8 flex justify-between items-center z-50"
        >
            <div className="flex items-center gap-3 font-bold text-xl md:text-2xl tracking-tight text-[#1C1917] bg-[#FAFAF9] px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] border border-[#1C1917]/18">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 2L2 12L9 14.5L16 8L11 16L18 19L22 2Z" fill="currentColor"/>
               </svg>
               LuxFly
            </div>
           <div className="flex items-center gap-3 md:gap-5">
              <button 
                type="button"
                onClick={(e) => openMenu(e.currentTarget)}
                aria-label="Open Menu"
                aria-expanded={menuOpen}
                aria-controls="luxfly-site-menu"
                className="flex lg:hidden items-center text-[#1C1917] bg-[#FAFAF9] border border-[#1C1917]/18 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] hover:bg-white transition-colors duration-200 pointer-events-auto p-3 min-h-[44px] min-w-[44px] cursor-pointer"
              >
                 <Menu size={24} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => openMenu(e.currentTarget)}
                className="hidden lg:flex items-center gap-2.5 text-sm font-semibold tracking-wide text-[#1C1917] bg-[#FAFAF9] border border-[#1C1917]/18 px-4 py-2.5 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] hover:bg-white transition-colors duration-200 pointer-events-auto cursor-pointer min-h-[44px]"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="luxfly-site-menu"
              >
                 <Menu size={18} strokeWidth={2} />
                 Menu
              </button>
              <MagneticButton
                type="button"
                aria-label="Plan My Trip"
                onClick={() => scrollToSection('cta')}
                className="hidden md:flex min-h-[44px] min-w-[44px] bg-[#A16207] text-white border-none px-6 md:px-8 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-[#8B5506] transition-colors duration-200 tracking-wide cursor-pointer z-50 pointer-events-auto"
              >
                 Plan My Trip
              </MagneticButton>
           </div>
        </motion.header>

        <motion.div 
          initial={{ y: 28, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.05, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 flex flex-col items-center justify-start w-full pointer-events-none"
        >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 md:mb-6">
               Luxury Travel
            </span>
            <h1 className="text-[clamp(2.5rem,6.5vw,6rem)] font-medium text-center leading-[0.95] tracking-[-0.04em] text-[#0C0A09] px-4 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">
               Discover Your Next<br />Adventure.
            </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 24, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.0, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-50 flex flex-col items-center w-full mt-2 md:mt-4 pointer-events-none"
        >
            <p className="text-[#292524] max-w-sm md:max-w-md text-center text-sm md:text-base font-medium leading-relaxed px-4">
               Curated journeys to the world's most extraordinary<br className="hidden md:block"/> destinations. We plan, you travel.
            </p>
            <MagneticButton
              type="button"
              aria-label="Plan My Trip Main"
              onClick={() => scrollToSection('cta')}
              className="mt-4 md:mt-6 min-h-[44px] min-w-[44px] bg-[#1C1917] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-xs md:text-sm font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-shadow duration-200 pointer-events-auto tracking-wide cursor-pointer"
            >
               Plan My Trip
            </MagneticButton>
        </motion.div>
      </section>

      {/* ═══════ SECTION 2: CURATED DESTINATIONS (early card — clears during window open) ═══════ */}
      <section id="destinations" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-24">
         <motion.div 
            style={{ opacity: earlyCardOpacity }}
            className="text-center max-w-2xl z-50 rounded-3xl bg-black/50 backdrop-blur-md border border-white/15 px-8 py-10 md:px-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
         >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 block">
               What We Offer
            </span>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light mb-6 tracking-tight leading-none text-white">
               Curated <span className="font-medium">Destinations.</span>
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto drop-shadow-sm">
               From the towering skylines of Dubai to the sun-kissed coasts of the Maldives, we handpick destinations that match your travel style, whether it's adventure, relaxation, or cultural immersion.
            </p>
<div className="flex flex-wrap justify-center gap-8 md:gap-12">
                <div className="text-center">
                   <div className="text-3xl md:text-4xl font-bold text-white">200+</div>
                   <span className="text-[10px] text-white/80 uppercase tracking-widest block mt-1">Destinations</span>
                </div>
                <div className="text-center">
                   <div className="text-3xl md:text-4xl font-bold text-white">10,000+</div>
                   <span className="text-[10px] text-white/80 uppercase tracking-widest block mt-1">Trips Planned</span>
                </div>
                <div className="text-center">
                   <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
                   <span className="text-[10px] text-white/80 uppercase tracking-widest block mt-1">Satisfaction</span>
                </div>
             </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 3: TRAVEL — returns after window fully open ═══════ */}
      <section id="travel" className="h-screen w-full relative flex flex-col items-center justify-center">
         <motion.div
            style={{ opacity: postOpenCardsOpacity }}
            className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center z-50"
         >
            <div className="rounded-3xl bg-black/50 backdrop-blur-md border border-white/15 px-8 py-10 md:px-12 md:py-12 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h2 
               className="text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-[1.1] text-white"
            >
               Travel the World<br/>Without Any Stress
            </h2>
            <p 
               className="mt-6 text-[15px] md:text-[18px] text-white/95 max-w-2xl mx-auto"
            >
               Let us take care of the planning while you enjoy meaningful travel experiences crafted just for you.
            </p>
            <div className="mt-2">
               <MagneticButton
                 type="button"
                 aria-label="Explore Destinations"
                 onClick={() => scrollToSection('destinations')}
                 className="mt-8 min-h-[44px] min-w-[44px] bg-white text-black font-medium text-[15px] px-[26px] py-[12px] rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer pointer-events-auto"
               >
                  Explore Destinations
               </MagneticButton>
            </div>
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 4: HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-16">
         <motion.div 
            style={{ opacity: postOpenCardsOpacity }}
            className="max-w-4xl w-full z-50 rounded-3xl bg-black/50 backdrop-blur-md border border-white/15 px-6 py-10 md:px-10 md:py-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
         >
            <div className="text-center mb-12">
               <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#E8B86D] uppercase mb-4 block">
                  Simple Process
               </span>
               <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light tracking-tight leading-none text-white">
                  How It <span className="font-medium">Works.</span>
               </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
               {[
                  { num: '01', title: 'Share Your Vision', desc: 'Tell us where you want to go and what you want to experience.' },
                  { num: '02', title: 'We Craft Your Journey', desc: 'Our travel experts design a personalized itinerary just for you.' },
                  { num: '03', title: 'Travel with Confidence', desc: 'Every detail handled, from flights to hidden gems.' },
               ].map((step, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: i * 0.15 }}
                     viewport={{ once: true }}
                     className="text-center md:text-left"
                  >
                     <div className="text-5xl font-light text-[#A16207]/45 mb-4">{step.num}</div>
                     <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                     <p className="text-sm text-white/80 leading-relaxed">{step.desc}</p>
                  </motion.div>
               ))}
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 5: SEAMLESS EXPERIENCE ═══════ */}
      <section id="experience" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-24">
         <motion.div 
            style={{ opacity: postOpenCardsOpacity }}
            className="bg-black/50 backdrop-blur-md p-8 md:p-10 rounded-3xl text-white max-w-xl z-50 w-full border border-white/15"
         >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light mb-4 tracking-tight leading-none">Seamless<br/><span className="font-medium">Experience.</span></h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
               From the moment you inquire to the moment you return home, every detail is handled. Personal itineraries, 24/7 concierge support, and exclusive access to hidden gems.
            </p>
<div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/15 p-4 rounded-xl">
                   <div className="text-2xl font-bold">10+</div>
                   <span className="text-[10px] text-white/70 uppercase tracking-wider block">Years Experience</span>
                </div>
                <div className="bg-white/10 border border-white/15 p-4 rounded-xl">
                   <div className="text-2xl font-bold">500+</div>
                   <span className="text-[10px] text-white/70 uppercase tracking-wider block">Partner Hotels</span>
                </div>
                <div className="bg-white/10 border border-white/15 p-4 rounded-xl">
                   <div className="text-2xl font-bold">100%</div>
                   <span className="text-[10px] text-white/70 uppercase tracking-wider block">Personalized</span>
                </div>
                <div className="bg-white/10 border border-white/15 p-4 rounded-xl">
                   <div className="text-2xl font-bold">24/7</div>
                   <span className="text-[10px] text-white/70 uppercase tracking-wider block">Concierge Support</span>
                </div>
             </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 6: OUR STORY ═══════ */}
      <section id="story" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-24">
         <motion.div 
            style={{ opacity: postOpenCardsOpacity }}
            className="bg-black/50 backdrop-blur-md p-8 md:p-10 rounded-3xl text-white max-w-xl z-50 text-center border border-white/15"
         >
            <span className="text-xs tracking-[0.2em] text-[#E8B86D] uppercase mb-4 block font-semibold">Our Story</span>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-medium mb-6 tracking-tight leading-none">A Decade of Dream<br/>Journeys.</h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
               For over 10 years, LuxFly has been crafting unforgettable travel experiences. We don't just book trips, we create memories that last a lifetime. Our team of travel experts has personally visited every destination we recommend.
            </p>
            <MagneticButton
              type="button"
              aria-label="Meet Our Team"
              onClick={() => scrollToSection('story')}
              className="min-h-[44px] min-w-[44px] bg-transparent border border-[#A16207]/80 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#A16207] hover:text-white transition-colors duration-200 pointer-events-auto cursor-pointer"
            >
               Meet Our Team
            </MagneticButton>
         </motion.div>
      </section>

      {/* ═══════ SECTION 7: SOCIAL PROOF ═══════ */}
      <section id="social-proof" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-16">
         {/* Soft handoff toward sketchbook cream */}
         <div
           className="absolute inset-x-0 bottom-0 h-[28%] z-[1] pointer-events-none"
           style={{
             background: 'linear-gradient(180deg, transparent 0%, rgba(239,232,220,0.22) 100%)',
           }}
           aria-hidden="true"
         />
         <motion.div 
            style={{ opacity: postOpenCardsOpacity }}
            className="max-w-5xl w-full z-50 relative"
         >
            <div className="text-center mb-10">
               <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 block">
                  Traveler Stories
               </span>
               <h2 className="text-[clamp(2rem,5vw,3rem)] font-light tracking-tight leading-none text-white drop-shadow-lg">
                  What Our <span className="font-medium">Travelers Say.</span>
               </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  { name: 'Sarah Mitchell', trip: 'Maldives, 2024', text: 'LuxFly planned the most incredible honeymoon. Every detail was perfect, from the overwater villa to the private dinner on the beach.' },
                  { name: 'James Chen', trip: 'Japan, 2024', text: 'As a first-time traveler to Japan, I was nervous. LuxFly handled everything, visas, hotels, even restaurant reservations. Absolutely seamless.' },
                  { name: 'Priya Sharma', trip: 'Iceland, 2023', text: 'The Northern Lights trip was a dream come true. LuxFly found us a hidden hot spring away from the crowds. Unforgettable experience.' },
               ].map((t, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: i * 0.1 }}
                     viewport={{ once: true }}
                     className="bg-black/45 backdrop-blur-md border border-white/12 p-6 rounded-2xl transition-colors duration-200"
                  >
                     <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
                        {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-[#A16207] text-[#A16207]" aria-hidden="true" />)}
                     </div>
                     <p className="text-sm text-white/90 leading-relaxed mb-4 italic">"{t.text}"</p>
                     <div>
                        <div className="text-white font-medium text-sm">{t.name}</div>
                        <div className="text-[10px] text-white/60 uppercase tracking-wider">{t.trip}</div>
                     </div>
                  </motion.div>
               ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-10">
               {['Condé Nast', 'Travel + Leisure', 'AFAR', 'Lonely Planet'].map((brand, i) => (
                  <span key={i} className="text-white/85 text-[11px] md:text-xs font-medium tracking-wider bg-white/10 px-3 py-1.5 rounded-full border border-white/15">{brand}</span>
               ))}
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 8: DESTINATIONS SKETCHBOOK ═══════ */}
      <section id="sketchbook" className="h-screen w-full relative flex flex-col items-center justify-center pointer-events-none overflow-hidden">
        {/* Longer dark→cream→dark bridge so the book feels like a LuxFly chapter */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: [
              'linear-gradient(180deg, rgba(12,10,9,0.92) 0%, rgba(12,10,9,0.55) 10%, rgba(239,232,220,0) 28%)',
              'linear-gradient(0deg, rgba(12,10,9,0.88) 0%, rgba(12,10,9,0.35) 12%, rgba(239,232,220,0) 26%)',
              'radial-gradient(ellipse 90% 70% at 50% 42%, rgba(255,252,245,0.92) 0%, transparent 68%)',
              'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(180,150,110,0.14) 0%, transparent 55%)',
              '#efe8dc',
            ].join(', '),
          }}
        />

        {/* Chapter framing — LuxFly voice over the desk */}
        <div className="absolute top-0 inset-x-0 z-[3] pt-5 md:pt-7 px-6 pointer-events-none flex flex-col items-center text-center">
          <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.28em] text-[#A16207] uppercase">
            Destinations · Sketchbook
          </span>
          <p className="mt-2 text-[13px] md:text-sm text-white/80 font-medium max-w-md leading-relaxed">
            Flip through places we&apos;ve lived, then pick one to begin.
          </p>
          <div className="mt-3 w-10 h-px bg-[#A16207]/55" aria-hidden="true" />
        </div>

        <div className="w-full h-full pointer-events-auto relative z-[2] pt-16 md:pt-20">
          {sketchbookReady ? (
            <iframe
              src="/sketchbook/index.html"
              title="LuxFly Destinations Sketchbook"
              className="w-full h-full border-0 outline-none block"
              style={{ background: 'transparent', colorScheme: 'light' }}
              sandbox="allow-scripts"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
              <span className="text-[#1C1917]/35 text-xs tracking-[0.2em] uppercase">Opening sketchbook…</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ SECTION 9: CTA / BOOKING FORM ═══════ */}
      <section id="cta" className="h-screen w-full relative flex flex-col items-center justify-center px-4">
         {/* Continuity from sketchbook cream into final dark chapter */}
         <div
           className="absolute inset-0 z-0 pointer-events-none"
           style={{
             background:
               'linear-gradient(180deg, rgba(239,232,220,0.35) 0%, rgba(12,10,9,0) 18%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(161,98,7,0.12) 0%, transparent 55%)',
           }}
           aria-hidden="true"
         />
         <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-18%' }}
            className="relative z-50 bg-black/70 backdrop-blur-md p-7 md:p-10 lg:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-white w-[95%] max-w-[480px] border border-white/15"
         >
            {!formSubmitted ? (
               <>
                  <span className="text-[10px] font-semibold tracking-[0.28em] text-[#E8B86D] uppercase mb-3">
                    Begin your journey
                  </span>
                  <h2 className="text-3xl md:text-4xl font-medium mb-3 tracking-tight">Start Planning</h2>
                  <p className="text-white/70 text-center mb-8 max-w-sm text-sm leading-relaxed">
                     Tell us your dream destination and we&apos;ll craft the perfect itinerary.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                     <div className="minimal-input-container">
                        <label htmlFor="destination" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">Destination</label>
                        <input
                           id="destination" name="destination" type="text"
                           placeholder="Where do you want to go?"
                           required aria-required="true"
                           className="minimal-input"
                           value={formData.destination}
                           onChange={(e) => setFormData({...formData, destination: e.target.value})}
                        />
                        <div className="minimal-input-highlight"></div>
                     </div>

                     <div className="minimal-input-container">
                        <label htmlFor="travel-style" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">Travel Style</label>
                        <select
                           id="travel-style" name="style"
                           required aria-required="true"
                           className="minimal-input bg-transparent"
                           value={formData.style}
                           onChange={(e) => setFormData({...formData, style: e.target.value})}
                        >
                           <option value="" className="bg-black">Select your style</option>
                           <option value="adventure" className="bg-black">Adventure</option>
                           <option value="relaxation" className="bg-black">Relaxation</option>
                           <option value="cultural" className="bg-black">Cultural</option>
                           <option value="romance" className="bg-black">Romance</option>
                           <option value="family" className="bg-black">Family</option>
                        </select>
                        <div className="minimal-input-highlight"></div>
                     </div>

                     <div className="minimal-input-container">
                        <label htmlFor="travelers" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">Number of Travelers</label>
                        <input
                           id="travelers" name="travelers" type="number" min="1" max="20"
                           placeholder="2"
                           required aria-required="true"
                           className="minimal-input"
                           value={formData.travelers}
                           onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                        />
                        <div className="minimal-input-highlight"></div>
                     </div>

                     <MagneticButton type="submit" aria-label="Start Planning" className="min-h-[48px] w-full bg-[#A16207] text-white font-semibold text-sm py-4 rounded-xl mt-1 hover:bg-[#8B5506] transition-colors duration-200 cursor-pointer">
                        Start Planning
                     </MagneticButton>
                  </form>
               </>
            ) : (
               <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                  role="status"
                  aria-live="polite"
               >
                  <div className="w-16 h-16 bg-[#A16207] rounded-full flex items-center justify-center mx-auto mb-6">
                     <Check size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-3">Thank You!</h3>
                  <p className="text-white/70 text-sm mb-6">We&apos;ll be in touch within 24 hours to start crafting your perfect trip.</p>
                  <button
                     onClick={() => { setFormSubmitted(false); setFormData({ destination: '', style: '', travelers: '2' }); }}
                     className="text-[#E8B86D] text-sm font-medium hover:underline cursor-pointer min-h-[44px]"
                  >
                     Plan Another Trip
                  </button>
               </motion.div>
            )}
         </motion.div>
      </section>

    </div>
  );
}
