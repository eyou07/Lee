import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Project } from "../types";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.slice(0, 6))); // Show first 6 on home
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      {/* Hero Section */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-tight">
              Crafting <span className="italic">tactile</span> stories through textile.
            </h1>
            <p className="text-black/60 max-w-md leading-relaxed">
              Seoul-based textile designer exploring the intersection of traditional craftsmanship and contemporary digital structures.
            </p>
            <div className="pt-4">
              <Link
                to="/projects"
                className="text-xs uppercase tracking-[0.3em] font-medium border-b border-black pb-2 hover:text-black/40 hover:border-black/40 transition-all"
              >
                Explore Portfolio
              </Link>
            </div>
          </div>
          <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop" 
              alt="Textile Detail" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="group block space-y-6"
          >
            <div className="relative overflow-hidden aspect-[4/3] bg-neutral-100">
              <motion.img
                initial={{ scale: 1.1 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                src={project.mainImage}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-light tracking-tight">{project.title}</h3>
                <p className="text-black/40 text-[10px] tracking-widest uppercase mt-1">{project.category}</p>
              </div>
              <p className="text-black/40 text-[10px] tracking-widest uppercase">{project.year}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-32 text-center">
        <Link
          to="/projects"
          className="text-xs uppercase tracking-[0.3em] font-medium border-b border-black pb-2 hover:text-black/40 hover:border-black/40 transition-all"
        >
          View All Projects
        </Link>
      </div>
    </motion.div>
  );
}
