import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Project } from "../types";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-xs uppercase tracking-widest">Loading...</div>;
  if (!project) return <div className="h-screen flex items-center justify-center">Project not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-6 py-20"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-black/40 hover:text-black transition-colors mb-12 text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>

      {/* Main Image */}
      <div className="aspect-[16/9] bg-neutral-100 mb-20">
        <img src={project.mainImage} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-light tracking-tight mb-4">{project.title}</h1>
          <p className="text-black/40 text-xs uppercase tracking-[0.2em]">
            {project.year} / {project.material} / {project.technique}
          </p>
        </div>
      </div>

      {/* Concept */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">01 Concept</div>
          <div className="md:col-span-2">
            <p className="text-lg leading-relaxed text-black/80 font-light">
              {project.concept}
            </p>
          </div>
        </div>
        {project.conceptImage && (
          <div className="mt-16 aspect-video bg-neutral-100">
            <img src={project.conceptImage} alt="Concept" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </section>

      {/* Research */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">02 Research / Inspiration</div>
          <div className="md:col-span-2">
            <p className="text-sm leading-relaxed text-black/60 mb-12">
              {project.researchText}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {project.researchImage1 && <img src={project.researchImage1} alt="Research 1" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />}
              {project.researchImage2 && <img src={project.researchImage2} alt="Research 2" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">03 Process</div>
          <div className="md:col-span-2">
            <p className="text-sm leading-relaxed text-black/60 mb-12">
              {project.processText}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {project.processImage1 && <img src={project.processImage1} alt="Process 1" className="w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />}
              {project.processImage2 && <img src={project.processImage2} alt="Process 2" className="w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />}
            </div>
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">04 Result</div>
          <div className="md:col-span-2">
            <div className="aspect-[4/5] bg-neutral-100">
              <img src={project.resultImage} alt="Result" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">05 Gallery</div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-neutral-100 overflow-hidden">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
