import { motion } from 'framer-motion';
import { Menu, X, Star, Check, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagneticButton } from './MagneticButton';
import { useAccessibleMenu } from '../hooks/useAccessibleMenu';

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8%' as const },
  transition: { duration: 0.45, ease: easeOut },
};

const destinations = [
  { img: '/card1.jpg', name: 'Dubai', tag: 'Skyline & desert' },
  { img: '/card2.jpg', name: 'Maldives', tag: 'Overwater calm' },
  { img: '/card3.jpg', name: 'Santorini', tag: 'Aegean light' },
  { img: '/card4.jpg', name: 'Kyoto', tag: 'Quiet temples' },
];

const steps = [
  { num: '01', title: 'Share Your Vision', desc: 'Tell us where you want to go and what you want to feel.' },
  { num: '02', title: 'We Craft Your Journey', desc: 'Experts design a personalized itinerary around you.' },
  { num: '03', title: 'Travel with Confidence', desc: 'Flights, stays, and hidden gems — handled.' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    trip: 'Maldives, 2024',
    text: 'Every detail was perfect — from the overwater villa to the private dinner on the beach.',
  },
  {
    name: 'James Chen',
    trip: 'Japan, 2024',
    text: 'Visas, hotels, even restaurant reservations. Absolutely seamless.',
  },
  {
    name: 'Priya Sharma',
    trip: 'Iceland, 2023',
    text: 'They found us a hidden hot spring away from the crowds. Unforgettable.',
  },
];

type StaticExperienceProps = {
  isLoading: boolean;
};

/**
 * Dedicated premium Static-tier experience.
 * Not a clone of the 3D scroll film — a mobile-first luxury editorial landing.
 */
export function StaticExperience({ isLoading }: StaticExperienceProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { menuRef, openMenu, closeMenu } = useAccessibleMenu(menuOpen, setMenuOpen);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ destination: '', style: '', travelers: '2' });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const scrollTo = useCallback((id: string) => {
    closeMenu();
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    });
  }, [closeMenu, reduceMotion]);

  const handleDestinationSelect = useCallback((destination: string) => {
    setFormData((prev) => ({ ...prev, destination }));
    setFormSubmitted(false);
    requestAnimationFrame(() => {
      document.getElementById('cta')?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    });
    window.setTimeout(() => {
      document.getElementById('static-destination')?.focus();
    }, 500);
  }, [reduceMotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const reveal = reduceMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: !isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
      };

  return (
    <div className="w-full min-h-[100svh] bg-[#FAFAF9] text-[#0C0A09] font-sans">
      {/* Mobile menu */}
      {createPortal(
        <motion.div
          ref={menuRef}
          id="luxfly-static-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 bg-[#0C0A09]/96 z-[100] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
          aria-hidden={!menuOpen}
        >
          <button
            type="button"
            onClick={closeMenu}
            className="absolute top-[max(2rem,env(safe-area-inset-top))] right-6 text-white p-3 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <nav className="flex flex-col items-center gap-8 text-white text-2xl font-medium">
            {[
              ['hero', 'Home'],
              ['destinations', 'Destinations'],
              ['how-it-works', 'How It Works'],
              ['story', 'Our Story'],
              ['cta', 'Plan a Trip'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className="hover:text-[#A16207] transition-colors duration-200 min-h-[44px] cursor-pointer"
              >
                {label}
              </button>
            ))}
          </nav>
        </motion.div>,
        document.body
      )}

      {/* ─── HERO: one composition, brand first, full-bleed sky ─── */}
      <section
        id="hero"
        className="relative min-h-[100svh] w-full flex flex-col overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/new_bg.png)' }}
          aria-hidden="true"
        />
        {/* Soft light atmosphere — not crushed black */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-[42%] bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9]/85 to-transparent" />

        <motion.header
          {...reveal}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="relative z-20 w-full px-5 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 flex justify-between items-center"
        >
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[#1C1917]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2L2 12L9 14.5L16 8L11 16L18 19L22 2Z" fill="currentColor" />
            </svg>
            LuxFly
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => openMenu(e.currentTarget)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="luxfly-static-menu"
              className="flex items-center justify-center text-[#1C1917] bg-[#FAFAF9]/90 border border-[#1C1917]/12 rounded-full p-3 min-h-[44px] min-w-[44px] cursor-pointer hover:bg-white transition-colors duration-200"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            <MagneticButton
              type="button"
              aria-label="Plan My Trip"
              onClick={() => scrollTo('cta')}
              className="hidden sm:flex min-h-[44px] bg-[#A16207] text-white border-none px-5 py-2.5 rounded-full text-xs font-medium hover:bg-[#8B5506] transition-colors duration-200 tracking-wide cursor-pointer"
            >
              Plan My Trip
            </MagneticButton>
          </div>
        </motion.header>

        <div className="relative z-20 flex-1 flex flex-col items-center justify-end pb-14 sm:pb-20 px-5 text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOut }}
            className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#A16207] uppercase mb-4"
          >
            Luxury Travel
          </motion.p>
          <motion.h1
            {...reveal}
            transition={{ duration: 0.85, delay: 0.28, ease: easeOut }}
            className="font-medium text-[clamp(2.75rem,11vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-[#0C0A09] max-w-[14ch]"
          >
            Discover Your Next Adventure.
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
            className="mt-5 text-[#44403C] text-[15px] sm:text-base font-medium leading-relaxed max-w-sm"
          >
            Curated journeys to extraordinary places. We plan, you travel.
          </motion.p>
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3"
          >
            <MagneticButton
              aria-label="Plan My Trip"
              onClick={() => scrollTo('cta')}
              className="min-h-[48px] min-w-[180px] bg-[#1C1917] text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer hover:bg-black transition-colors duration-200"
            >
              Plan My Trip
            </MagneticButton>
            <button
              onClick={() => scrollTo('destinations')}
              className="min-h-[48px] px-6 text-sm font-medium text-[#1C1917] underline-offset-4 hover:underline cursor-pointer transition-colors duration-200"
            >
              Explore destinations
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── PROMISE ─── */}
      <section className="relative bg-[#FAFAF9] px-6 sm:px-10 py-20 sm:py-28">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#A16207] uppercase mb-5">
            The LuxFly way
          </p>
          <h2 className="text-[clamp(2rem,6vw,3.25rem)] font-medium leading-[1.05] tracking-tight text-[#0C0A09]">
            Travel the world without the stress.
          </h2>
          <p className="mt-6 text-[#57534E] text-base leading-relaxed">
            Personal itineraries, trusted partners, and concierge support from inquiry to homecoming —
            so every journey feels effortless.
          </p>
        </motion.div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section id="destinations" className="bg-[#0C0A09] text-white py-16 sm:py-24">
        <div className="px-6 sm:px-10 mb-10 sm:mb-14 max-w-6xl mx-auto">
          <motion.div {...fadeUp}>
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E8B86D] uppercase mb-4">
              Destinations
            </p>
            <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-light leading-none tracking-tight">
              Curated <span className="font-medium">places.</span>
            </h2>
            <p className="mt-4 text-white/70 text-sm sm:text-base max-w-md leading-relaxed">
              Handpicked for atmosphere, access, and the kind of days you remember.
            </p>
          </motion.div>
        </div>

        <div
          className="flex gap-4 overflow-x-auto px-6 sm:px-10 pb-4 snap-x snap-mandatory scroll-px-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="list"
          aria-label="Destination carousel"
        >
          {destinations.map((d, i) => (
            <motion.button
              key={d.name}
              type="button"
              role="listitem"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: easeOut }}
              onClick={() => handleDestinationSelect(d.name)}
              aria-label={`Plan a trip to ${d.name}`}
              className="relative shrink-0 w-[78vw] max-w-[320px] sm:w-[280px] aspect-[3/4] snap-center overflow-hidden rounded-sm text-left cursor-pointer group"
            >
              <img
                src={d.img}
                alt={`${d.name} — ${d.tag}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#E8B86D] mb-1">{d.tag}</p>
                <h3 className="text-2xl font-medium tracking-tight">{d.name}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/80 tracking-wide">
                  Plan this trip <ChevronRight size={12} aria-hidden="true" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="px-6 sm:px-10 mt-10 max-w-6xl mx-auto flex flex-wrap gap-8 sm:gap-14">
          {[
            ['200+', 'Destinations'],
            ['10,000+', 'Trips planned'],
            ['98%', 'Satisfaction'],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl sm:text-4xl font-medium text-white">{n}</div>
              <span className="text-[10px] text-white/55 uppercase tracking-widest mt-1 block">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CABIN (full-bleed — correct use of interior photo) ─── */}
      <section className="relative min-h-[85svh] w-full flex items-end overflow-hidden">
        <img
          src="/luxury_jet_interior.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <motion.div
          {...fadeUp}
          className="relative z-10 px-6 sm:px-10 pb-16 sm:pb-20 max-w-xl text-white"
        >
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E8B86D] uppercase mb-4">
            Cabin class
          </p>
          <h2 className="text-[clamp(2rem,6vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
            Arrive before you land.
          </h2>
          <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">
            Quiet luxury in the air — the same standard we hold for every hotel, transfer, and evening we arrange on the ground.
          </p>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-[#FAFAF9] px-6 sm:px-10 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14 sm:mb-16">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#A16207] uppercase mb-4">
              Simple process
            </p>
            <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-light tracking-tight text-[#0C0A09]">
              How it <span className="font-medium">works.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
                className="text-center md:text-left"
              >
                <div className="text-4xl sm:text-5xl font-light text-[#A16207]/35 mb-4">{s.num}</div>
                <h3 className="text-xl font-medium text-[#0C0A09] mb-3">{s.title}</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section id="story" className="bg-[#1C1917] text-white px-6 sm:px-10 py-20 sm:py-28">
        <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E8B86D] uppercase mb-4">
            Our story
          </p>
          <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-tight mb-6">
            A decade of dream journeys.
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8">
            For over 10 years, LuxFly has crafted travel that feels personal. We don&apos;t just book trips —
            we design days our experts have lived themselves.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
            {[
              ['10+', 'Years'],
              ['500+', 'Partner hotels'],
              ['100%', 'Personalized'],
              ['24/7', 'Concierge'],
            ].map(([n, l]) => (
              <div key={l} className="border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-2xl font-medium">{n}</div>
                <span className="text-[10px] text-white/50 uppercase tracking-wider mt-1 block">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section id="social-proof" className="bg-[#FAFAF9] px-6 sm:px-10 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12 sm:mb-16">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#A16207] uppercase mb-4">
              Traveler stories
            </p>
            <h2 className="text-[clamp(1.85rem,5vw,2.75rem)] font-light tracking-tight text-[#0C0A09]">
              What our <span className="font-medium">travelers say.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.blockquote
                key={t.name}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: easeOut }}
                className="border border-[#D6D3D1] bg-white p-6 sm:p-7"
              >
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-[#A16207] text-[#A16207]" />
                  ))}
                </div>
                <p className="text-sm text-[#44403C] leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <footer>
                  <div className="text-[#0C0A09] font-medium text-sm">{t.name}</div>
                  <div className="text-[10px] text-[#78716C] uppercase tracking-wider mt-0.5">{t.trip}</div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {['Condé Nast', 'Travel + Leisure', 'AFAR', 'Lonely Planet'].map((brand) => (
              <span
                key={brand}
                className="text-[11px] text-[#57534E] tracking-wider px-3 py-1.5 border border-[#D6D3D1] bg-white"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        id="cta"
        className="relative min-h-[100svh] flex items-center justify-center px-5 sm:px-8 py-16 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: 'url(/new_bg.png)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0C0A09]/72" />

        <motion.div
          {...fadeUp}
          className="relative z-10 w-full max-w-[440px] bg-[#0C0A09]/85 border border-white/15 backdrop-blur-md p-7 sm:p-10 text-white"
        >
          {!formSubmitted ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-medium mb-3 tracking-tight">Start planning</h2>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                Tell us your dream destination — we&apos;ll craft the itinerary.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                <div className="minimal-input-container">
                  <label htmlFor="static-destination" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">
                    Destination
                  </label>
                  <input
                    id="static-destination"
                    name="destination"
                    type="text"
                    placeholder="Where do you want to go?"
                    required
                    aria-required="true"
                    className="minimal-input"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                  <div className="minimal-input-highlight" />
                </div>
                <div className="minimal-input-container">
                  <label htmlFor="static-style" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">
                    Travel style
                  </label>
                  <select
                    id="static-style"
                    name="style"
                    required
                    aria-required="true"
                    className="minimal-input bg-transparent"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  >
                    <option value="" className="bg-black">Select your style</option>
                    <option value="adventure" className="bg-black">Adventure</option>
                    <option value="relaxation" className="bg-black">Relaxation</option>
                    <option value="cultural" className="bg-black">Cultural</option>
                    <option value="romance" className="bg-black">Romance</option>
                    <option value="family" className="bg-black">Family</option>
                  </select>
                  <div className="minimal-input-highlight" />
                </div>
                <div className="minimal-input-container">
                  <label htmlFor="static-travelers" className="text-[11px] text-[#E7E5E4] uppercase tracking-wider mb-1 block font-semibold">
                    Travelers
                  </label>
                  <input
                    id="static-travelers"
                    name="travelers"
                    type="number"
                    min={1}
                    max={20}
                    required
                    aria-required="true"
                    className="minimal-input"
                    value={formData.travelers}
                    onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                  />
                  <div className="minimal-input-highlight" />
                </div>
                <MagneticButton
                  type="submit"
                  aria-label="Start Planning"
                  className="min-h-[48px] w-full bg-[#A16207] text-white font-semibold text-sm py-4 mt-1 hover:bg-[#8B5506] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  Start Planning
                  <ChevronRight size={16} aria-hidden="true" />
                </MagneticButton>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
              role="status"
              aria-live="polite"
            >
              <div className="w-14 h-14 bg-[#A16207] rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Thank you</h3>
              <p className="text-white/70 text-sm mb-6">
                We&apos;ll be in touch within 24 hours to start crafting your trip.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ destination: '', style: '', travelers: '2' });
                }}
                className="text-[#E8B86D] text-sm font-medium hover:underline cursor-pointer min-h-[44px]"
              >
                Plan another trip
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      <footer className="bg-[#0C0A09] text-white/40 text-center text-[11px] tracking-wider py-8 px-4">
        LuxFly · Curated journeys
      </footer>
    </div>
  );
}
