import { motion } from 'framer-motion';

export function SketchbookSection() {
  return (
    <section id="destinations" className="h-screen w-full relative flex flex-col items-center justify-center pointer-events-none px-0">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true, margin: "-10%" }}
        className="w-full h-full pointer-events-auto"
      >
        <iframe 
          src="/sketchbook/index.html" 
          title="LuxFly Destinations Sketchbook"
          className="w-full h-full border-none outline-none bg-[#f7f5f0]"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      </motion.div>
    </section>
  );
}
