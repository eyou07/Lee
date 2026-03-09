import { motion } from "motion/react";
import { Instagram, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export default function Contact() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings/contact_content")
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-40 text-center"
    >
      <h1 className="text-4xl font-light tracking-tight mb-20">Get in touch</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex justify-center text-black/20"><Mail size={32} strokeWidth={1} /></div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-black/40">Email</h3>
          <p className="text-sm">{content.email}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center text-black/20"><Instagram size={32} strokeWidth={1} /></div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-black/40">Instagram</h3>
          <p className="text-sm">{content.instagram}</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center text-black/20"><MapPin size={32} strokeWidth={1} /></div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-black/40">Studio</h3>
          <p className="text-sm">{content.location}</p>
        </div>
      </div>

      <div className="mt-40 pt-20 border-t border-black/5">
        <p className="text-xs uppercase tracking-[0.4em] text-black/30">Available for collaborations and commissions</p>
      </div>
    </motion.div>
  );
}
