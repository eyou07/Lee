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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="group relative overflow-hidden aspect-[4/3] bg-neutral-100"
          >
            <motion.img
              initial={{ scale: 1.1 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              src={project.mainImage}
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <h3 className="text-white text-2xl font-light tracking-tight">{project.title}</h3>
              <p className="text-white/70 text-sm tracking-widest uppercase mt-2">{project.year}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-20 text-center">
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
