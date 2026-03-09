import { motion } from "motion/react";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
        <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
          <img 
            src="https://picsum.photos/seed/designer/800/1200" 
            alt="Designer" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2">Eunpyo</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">Textile Designer</p>
          </div>

          <p className="text-xl font-light leading-relaxed text-black/80">
            Textile designer exploring material, texture and visual narratives through textile, drawing and photography.
          </p>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-black/40">Interests</h3>
            <ul className="space-y-2 text-sm tracking-wide">
              <li>Textile</li>
              <li>Drawing</li>
              <li>Photography</li>
            </ul>
          </div>

          <div className="pt-12 border-t border-black/5">
            <p className="text-sm leading-relaxed text-black/60">
              Based in Seoul, working globally. Focused on sustainable materials and traditional techniques reimagined for modern contexts.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
