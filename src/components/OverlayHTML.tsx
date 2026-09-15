import { motion, useMotionValueEvent } from 'framer-motion';
import { Menu, X, MapPin, Calendar, Users, Compass, Star, ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from './MagneticButton';
import { SketchbookSection } from './SketchbookSection';
import type { MotionValue } from 'framer-motion';

export function OverlayHTML({ isLoading, scrollOffset }: { isLoading: boolean, scrollOffset?: MotionValue<number> }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progressPct, setProgressPct] = useState("0%");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ destination: '', style: '', travelers: '2' });

  useMotionValueEvent(scrollOffset ?? { on: () => ({}) } as any, "change", (v: number) => {
    setProgressPct(`${Math.round(v * 100)}%`);
  });

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
              <button className="hidden lg:flex items-center gap-3 text-sm font-medium hover:opacity-70 transition-opacity text-white mix-blend-difference pointer-events-auto cursor-pointer" aria-label="Menu">
                 <Menu size={20} strokeWidth={1.5} />
                 Menu
              </button>
              <MagneticButton aria-label="Plan My Trip" className="hidden md:flex min-h-[44px] min-w-[44px] bg-[#A16207] text-white border-none px-6 md:px-8 py-3 md:py-3.5 rounded-full text-xs md:text-sm font-medium shadow-sm hover:bg-[#8B5506] transition-colors tracking-wide cursor-pointer z-50 pointer-events-auto">
                 Plan My Trip
              </MagneticButton>
           </div>
        </motion.header>

        {/* Ghost Text */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={!isLoading ? { opacity: 0.08, y: 0, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none"
        >
          <span className="text-[clamp(4rem,20vw,25vw)] font-bold text-[#D6D3D1] whitespace-nowrap tracking-tighter">
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
            <h1 className="text-[clamp(3.5rem,8vw,8rem)] font-medium text-center leading-[0.95] tracking-[-0.04em] text-[#1C1917]">
               Discover Your Next<br/>Adventure.
            </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={!isLoading ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.0, ease: "easeOut" }}
          className="relative z-50 flex flex-col items-center w-full mt-2 md:mt-4 pointer-events-none"
        >
            <p className="text-[#444] max-w-sm md:max-w-md text-center text-xs md:text-sm font-medium leading-relaxed px-4 drop-shadow-md">
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
            className="text-center max-w-2xl z-50"
         >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 block">
               What We Offer
            </span>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light mb-6 tracking-tight leading-none text-white">
               Curated <span className="font-medium">Destinations.</span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
               From the towering skylines of Dubai to the sun-kissed coasts of the Maldives, we handpick destinations that match your travel style — whether it's adventure, relaxation, or cultural immersion.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
               <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">200+</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Destinations</span>
               </div>
               <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">10,000+</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Trips Planned</span>
               </div>
               <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Satisfaction</span>
               </div>
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 3: TRAVEL THE WORLD ═══════ */}
      <section id="travel" className="h-screen w-full relative flex flex-col items-center justify-center">
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
               <MagneticButton aria-label="Explore Destinations" className="mt-8 min-h-[44px] min-w-[44px] bg-white text-black font-medium text-[15px] px-[26px] py-[12px] rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer pointer-events-auto">
                  Explore Destinations
               </MagneticButton>
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
            className="max-w-4xl w-full z-50"
         >
            <div className="text-center mb-12">
               <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#A16207] uppercase mb-4 block">
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
                     <div className="text-5xl font-bold text-[#A16207]/30 mb-4">{step.num}</div>
                     <h3 className="text-xl font-medium text-white mb-3">{step.title}</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
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
            className="glass-glow bg-black/20 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 w-full"
         >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light mb-4 tracking-tight leading-none">Seamless<br/><span className="font-medium">Experience.</span></h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
               From the moment you inquire to the moment you return home, every detail is handled. Personal itineraries, 24/7 concierge support, and exclusive access to hidden gems.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">10+</div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Years Experience</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">500+</div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Partner Hotels</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">100%</div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Personalized</span>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold">24/7</div>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wider block">Concierge Support</span>
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
            className="glass-glow bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] text-white max-w-xl z-50 text-center"
         >
            <span className="text-xs tracking-[0.2em] text-[#A16207] uppercase mb-4 block">Our Story</span>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-medium mb-6 tracking-tight leading-none">A Decade of Dream<br/>Journeys.</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
               For over 10 years, LuxFly has been crafting unforgettable travel experiences. We don't just book trips — we create memories that last a lifetime. Our team of travel experts has personally visited every destination we recommend.
            </p>
            <MagneticButton aria-label="Meet Our Team" className="min-h-[44px] min-w-[44px] bg-transparent border border-[#A16207]/50 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#A16207] hover:text-white transition-colors pointer-events-auto cursor-pointer">
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
               <h2 className="text-[clamp(2rem,5vw,3rem)] font-light tracking-tight leading-none text-white">
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
                     className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
                  >
                     <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-[#A16207] text-[#A16207]" />)}
                     </div>
                     <p className="text-sm text-gray-300 leading-relaxed mb-4 italic">"{t.text}"</p>
                     <div>
                        <div className="text-white font-medium text-sm">{t.name}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{t.trip}</div>
                     </div>
                  </motion.div>
               ))}
            </div>
            <div className="flex justify-center gap-8 md:gap-16 mt-10 opacity-40">
               {['Condé Nast', 'Travel + Leisure', 'AFAR', 'Lonely Planet'].map((brand, i) => (
                  <span key={i} className="text-white text-xs md:text-sm font-medium tracking-wider">{brand}</span>
               ))}
            </div>
         </motion.div>
      </section>

      {/* ═══════ SECTION 8: DESTINATIONS SKETCHBOOK ═══════ */}
      <SketchbookSection />

      {/* ═══════ SECTION 9: CTA / BOOKING FORM ═══════ */}
      <section id="cta" className="h-screen w-full relative flex flex-col items-center justify-center px-4">
         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true, margin: "-20%" }}
            className="glass-glow bg-black/60 backdrop-blur-2xl p-8 md:p-14 rounded-[2rem] shadow-2xl flex flex-col items-center text-white z-50 w-[95%] max-w-[500px]"
         >
            {!formSubmitted ? (
               <>
                  <h2 className="text-3xl md:text-4xl font-medium mb-4">Start Planning</h2>
                  <p className="text-gray-300 text-center mb-8 max-w-sm text-sm">
                     Tell us your dream destination and we'll craft the perfect itinerary.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                     <div className="minimal-input-container">
                        <label htmlFor="destination" className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Destination</label>
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
                        <label htmlFor="travel-style" className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Travel Style</label>
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
                        <label htmlFor="travelers" className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Number of Travelers</label>
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
