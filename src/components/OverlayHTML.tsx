import { motion, useMotionValueEvent } from 'framer-motion';
import { Menu, X, MapPin, Calendar, Users, Compass, Star, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from './MagneticButton';
import type { MotionValue } from 'framer-motion';

export function OverlayHTML({ isLoading, scrollOffset }: { isLoading: boolean, scrollOffset?: MotionValue<number> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressPct, setProgressPct] = useState("0%");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ destination: '', style: '', travelers: '2' });

  useMotionValueEvent(scrollOffset ?? { on: () => ({}) } as any, "change", (v: number) => {
    setProgressPct(`${Math.round(v * 100)}%`);
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.destination) {
        handleDestinationSelect(event.data.destination);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDestinationSelect = (destination: string) => {
    setFormData(prev => ({ ...prev, destination }));
    setFormSubmitted(false);
    const ctaEl = document.getElementById('cta');
    if (ctaEl) ctaEl.scrollIntoView({ behavior: 'smooth' });
    // Focus the destination input after scroll
    setTimeout(() => {
      const input = document.getElementById('destination') as HTMLInputElement;
      if (input) input.focus();
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-screen relative font-sans text-black" style={{ height: '900vh' }}>
      
      {/* Scroll Progress Indicator */}
      <div className="fixed right-2 top-[20vh] bottom-[20vh] w-[1px] md:w-[2px] bg-white/10 z-50 rounded-full">
        <div 
          className="w-full bg-[#A16207] rounded-full origin-top"
          style={{ height: progressPct }}
          role="progressbar"
          aria-valuenow={Math.round(parseFloat(progressPct))}
          aria-label="Scroll progress"
        />
      </div>

      {/* Mobile Menu Overlay */}
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
            <button onClick={() => scrollToSection('hero')} className="hover:text-[#A16207] transition-colors">Home</button>
            <button onClick={() => scrollToSection('destinations')} className="hover:text-[#A16207] transition-colors">Destinations</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#A16207] transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('story')} className="hover:text-[#A16207] transition-colors">Our Story</button>
            <button onClick={() => scrollToSection('cta')} className="hover:text-[#A16207] transition-colors">Plan a Trip</button>
          </div>
        </motion.div>,
        document.body
      )}

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section id="hero" className="h-screen w-full relative flex flex-col items-center justify-start pt-[5vh] md:pt-[8vh]">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="absolute top-0 w-full px-6 md:px-12 py-6 md:py-8 flex justify-between items-center z-50"
        >
            <div className="flex items-center gap-3 font-bold text-xl md:text-2xl tracking-tight text-[#1C1917] bg-[#FAFAF9] px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] border border-[#1C1917]/18">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 2L2 12L9 14.5L16 8L11 16L18 19L22 2Z" fill="currentColor"/>
               </svg>
               LuxFly
            </div>
           <div className="flex items-center gap-3 md:gap-5">
              <button 
                onClick={() => setMenuOpen(true)}
                aria-label="Open Menu"
                className="flex lg:hidden items-center text-[#1C1917] bg-[#FAFAF9] border border-[#1C1917]/18 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] hover:bg-white transition-colors pointer-events-auto p-3 min-h-[44px] min-w-[44px] cursor-pointer"
              >
                 <Menu size={24} strokeWidth={2} />
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="hidden lg:flex items-center gap-2.5 text-sm font-semibold tracking-wide text-[#1C1917] bg-[#FAFAF9] border border-[#1C1917]/18 px-4 py-2.5 rounded-full shadow-[0_4px_16px_rgba(28,25,23,0.18)] hover:bg-white transition-colors pointer-events-auto cursor-pointer min-h-[44px]"
                aria-label="Open menu"
              >
                 <Menu size={18} strokeWidth={2} />
                 Menu
              </button>
              <MagneticButton aria-label="Plan My Trip" className="hidden md:flex min-h-[44px] min-w-[44px] bg-[#A16207] text-white border-none px-6 md:px-8 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-[#8B5506] transition-colors tracking-wide cursor-pointer z-50 pointer-events-auto">
                 Plan My Trip
              </MagneticButton>
           </div>
        </motion.header>

        {/* Subtle atmospheric watermark — kept very faint so it never fights the CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={!isLoading ? { opacity: 0.04, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[clamp(4rem,18vw,22vw)] font-bold text-[#1C1917] whitespace-nowrap tracking-tighter">
            EXPLORE THE WORLD
          </span>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
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
          initial={{ y: 30, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
          className="relative z-50 flex flex-col items-center w-full mt-2 md:mt-4 pointer-events-none"
        >
            <p className="text-[#292524] max-w-sm md:max-w-md text-center text-sm md:text-base font-medium leading-relaxed px-4">
               Curated journeys to the world's most extraordinary<br className="hidden md:block"/> destinations. We plan, you travel.
            </p>
            <MagneticButton aria-label="Plan My Trip Main" className="mt-4 md:mt-6 min-h-[44px] min-w-[44px] bg-[#1C1917] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full text-xs md:text-sm font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-shadow pointer-events-auto tracking-wide cursor-pointer">
               Plan My Trip
            </MagneticButton>
        </motion.div>
      </section>

      {/* ═══════ SECTION 2: CURATED DESTINATIONS ═══════ */}
      <section id="destinations" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-24">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="text-center max-w-2xl z-50 rounded-[2rem] bg-black/40 backdrop-blur-md border border-white/15 px-8 py-10 md:px-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
         >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 block">
               What We Offer
            </span>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light mb-6 tracking-tight leading-none text-white">
               Curated <span className="font-medium">Destinations.</span>
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto drop-shadow-sm">
               From the towering skylines of Dubai to the sun-kissed coasts of the Maldives, we handpick destinations that match your travel style — whether it's adventure, relaxation, or cultural immersion.
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

      {/* ═══════ SECTION 3: TRAVEL THE WORLD ═══════ */}
      <section id="travel" className="h-screen w-full relative flex flex-col items-center justify-center">
         <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center z-50">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true, margin: "-10%" }}
               className="rounded-[2rem] bg-black/45 backdrop-blur-md border border-white/15 px-8 py-10 md:px-12 md:py-12 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
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
               <MagneticButton aria-label="Explore Destinations" className="mt-8 min-h-[44px] min-w-[44px] bg-white text-black font-medium text-[15px] px-[26px] py-[12px] rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer pointer-events-auto">
                  Explore Destinations
               </MagneticButton>
            </div>
            </motion.div>
         </div>
      </section>

      {/* ═══════ SECTION 4: HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-16">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="max-w-4xl w-full z-50 rounded-[2rem] bg-black/45 backdrop-blur-md border border-white/15 px-6 py-10 md:px-10 md:py-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
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
                     <div className="text-5xl font-bold text-[#C4A574] mb-4">{step.num}</div>
                     <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                     <p className="text-sm text-white/85 leading-relaxed">{step.desc}</p>
                  </motion.div>
               ))}
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 5: SEAMLESS EXPERIENCE ═══════ */}
      <section id="experience" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-24">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="glass-glow bg-black/55 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 w-full border border-white/15"
         >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light mb-4 tracking-tight leading-none">Seamless<br/><span className="font-medium">Experience.</span></h2>
            <p className="text-white/85 text-sm leading-relaxed mb-6">
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
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="glass-glow bg-black/55 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 text-center border border-white/15"
         >
            <span className="text-xs tracking-[0.2em] text-[#E8B86D] uppercase mb-4 block font-semibold">Our Story</span>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-medium mb-6 tracking-tight leading-none">A Decade of Dream<br/>Journeys.</h2>
            <p className="text-white/85 text-sm leading-relaxed mb-6">
               For over 10 years, LuxFly has been crafting unforgettable travel experiences. We don't just book trips — we create memories that last a lifetime. Our team of travel experts has personally visited every destination we recommend.
            </p>
            <MagneticButton aria-label="Meet Our Team" className="min-h-[44px] min-w-[44px] bg-transparent border border-[#E8B86D]/70 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#A16207] hover:text-white transition-colors pointer-events-auto cursor-pointer">
               Meet Our Team
            </MagneticButton>
         </motion.div>
      </section>

      {/* ═══════ SECTION 7: SOCIAL PROOF ═══════ */}
      <section id="social-proof" className="h-screen w-full relative flex flex-col items-center justify-center px-8 md:px-16">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="max-w-5xl w-full z-50"
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
                  { name: 'Sarah Mitchell', trip: 'Maldives, 2024', text: 'LuxFly planned the most incredible honeymoon. Every detail was perfect — from the overwater villa to the private dinner on the beach.' },
                  { name: 'James Chen', trip: 'Japan, 2024', text: 'As a first-time traveler to Japan, I was nervous. LuxFly handled everything — visas, hotels, even restaurant reservations. Absolutely seamless.' },
                  { name: 'Priya Sharma', trip: 'Iceland, 2023', text: 'The Northern Lights trip was a dream come true. LuxFly found us a hidden hot spring away from the crowds. Unforgettable experience.' },
               ].map((t, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6, delay: i * 0.1 }}
                     viewport={{ once: true }}
                     className="bg-black/50 backdrop-blur-md border border-white/15 p-6 rounded-2xl"
                  >
                     <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-[#E8B86D] text-[#E8B86D]" />)}
                     </div>
                     <p className="text-sm text-white leading-relaxed mb-4 italic">"{t.text}"</p>
                     <div>
                        <div className="text-white font-medium text-sm">{t.name}</div>
                        <div className="text-[10px] text-white/70 uppercase tracking-wider">{t.trip}</div>
                     </div>
                  </motion.div>
               ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10">
               {['Condé Nast', 'Travel + Leisure', 'AFAR', 'Lonely Planet'].map((brand, i) => (
                  <span key={i} className="text-white text-xs md:text-sm font-medium tracking-wider bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/25">{brand}</span>
               ))}
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 8: DESTINATIONS SKETCHBOOK ═══════ */}
      <section id="sketchbook" className="h-screen w-full relative flex flex-col items-center justify-center pointer-events-none overflow-hidden">
        {/* Soft blend from previous dark section into warm desk */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,10,9,0.55) 0%, rgba(239,232,220,0) 14%), radial-gradient(ellipse 90% 70% at 50% 42%, rgba(255,252,245,0.95) 0%, transparent 68%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(180,150,110,0.14) 0%, transparent 55%), #efe8dc',
          }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          viewport={{ once: true, margin: "-10%" }}
          className="w-full h-full pointer-events-auto relative z-[2] pt-2"
        >
          <iframe 
            src="/sketchbook/index.html" 
            title="LuxFly Destinations Sketchbook"
            className="w-full h-full border-0 outline-none block"
            style={{ background: 'transparent', colorScheme: 'light' }}
            sandbox="allow-scripts"
            loading="lazy"
          />
        </motion.div>
      </section>

      {/* ═══════ SECTION 9: CTA / BOOKING FORM ═══════ */}
      <section id="cta" className="h-screen w-full relative flex flex-col items-center justify-center px-4">
         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true, margin: "-20%" }}
            className="glass-glow bg-black/75 backdrop-blur-2xl p-6 md:p-10 lg:p-14 rounded-[2rem] shadow-2xl flex flex-col items-center text-white z-50 w-[95%] max-w-[500px] border border-white/15"
         >
            {!formSubmitted ? (
               <>
                  <h2 className="text-3xl md:text-4xl font-medium mb-4">Start Planning</h2>
                  <p className="text-white/80 text-center mb-8 max-w-sm text-sm">
                     Tell us your dream destination and we'll craft the perfect itinerary.
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

                     <MagneticButton type="submit" aria-label="Start Planning" className="min-h-[44px] w-full bg-[#A16207] text-white font-bold text-sm py-4 rounded-xl mt-2 hover:bg-[#8B5506] transition-colors cursor-pointer">
                        Start Planning
                     </MagneticButton>
                  </form>
               </>
            ) : (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
               >
                  <div className="w-16 h-16 bg-[#A16207] rounded-full flex items-center justify-center mx-auto mb-6">
                     <Check size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-3">Thank You!</h3>
                  <p className="text-gray-300 text-sm mb-6">We'll be in touch within 24 hours to start crafting your perfect trip.</p>
                  <button 
                     onClick={() => { setFormSubmitted(false); setFormData({ destination: '', style: '', travelers: '2' }); }}
                     className="text-[#A16207] text-sm font-medium hover:underline cursor-pointer"
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
