import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { motion } from "motion/react";
import { Project, Category } from "../types";
import { Plus, Trash2, Edit2, X, Save, Upload, Image as ImageIcon } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "about" | "contact">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [contactContent, setContactContent] = useState<any>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === "2324") {
      setIsAuthorized(true);
      fetchProjects();
      fetchSettings();
    } else {
      setError("Invalid password");
    }
  };

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  };

  const fetchSettings = () => {
    fetch("/api/settings/about_content")
      .then(res => res.json())
      .then(data => setAboutContent(data))
      .catch(err => console.error("Failed to fetch about settings", err));
    
    fetch("/api/settings/contact_content")
      .then(res => res.json())
      .then(data => setContactContent(data))
      .catch(err => console.error("Failed to fetch contact settings", err));
  };

  const handleSaveSettings = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, value }),
      });
      if (res.ok) {
        alert("Settings saved successfully");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Failed to save settings"}`);
      }
    } catch (err) {
      alert("Failed to save settings. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, field: keyof Project | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        setEditingProject(prev => {
          if (!prev) return prev;
          if (field === "gallery") {
            const currentGallery = prev.gallery || [];
            return { ...prev, gallery: [...currentGallery, data.url] };
          } else {
            return { ...prev, [field]: data.url };
          }
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFromGallery = (index: number) => {
    if (!editingProject?.gallery) return;
    const newGallery = [...editingProject.gallery];
    newGallery.splice(index, 1);
    setEditingProject({ ...editingProject, gallery: newGallery });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) fetchProjects();
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSaving(true);
    try {
      const method = editingProject.id ? "PUT" : "POST";
      const url = editingProject.id 
        ? `/api/admin/projects/${editingProject.id}` 
        : "/api/admin/projects";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, project: editingProject }),
      });

      if (res.ok) {
        alert("Project saved successfully");
        setEditingProject(null);
        fetchProjects();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Failed to save project"}`);
      }
    } catch (err) {
      alert("Failed to save project. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-light tracking-tight text-center">Admin Access</h1>
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-3 border border-black/10 focus:border-black outline-none transition-colors text-sm"
            />
            {error && <p className="text-red-500 text-[10px] uppercase tracking-widest">{error}</p>}
          </div>
          <button type="submit" className="w-full bg-black text-white py-3 text-xs uppercase tracking-widest hover:bg-accent-dark hover:text-black transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
        <h1 className="text-3xl font-light tracking-tight">Management</h1>
        <div className="flex space-x-8 border-b border-black/5 pb-2">
          {(["projects", "about", "contact"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] uppercase tracking-[0.2em] transition-colors relative py-1 ${
                activeTab === tab ? "text-black font-bold" : "text-black/30 hover:text-black"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="admin-tab-underline"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-dark"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "projects" && (
        <>
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setEditingProject({ category: "Textile", gallery: [] })}
              className="flex items-center space-x-2 bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-accent-dark hover:text-black transition-colors"
            >
              <Plus size={16} />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-6 border border-black/5 hover:border-black/20 transition-colors bg-white/50">
                <div className="flex items-center space-x-6">
                  <img src={project.mainImage} className="w-16 h-16 object-cover bg-neutral-100" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-sm font-medium">{project.title}</h3>
                    <p className="text-[10px] text-black/40 uppercase tracking-widest">{project.year} — {project.category}</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setEditingProject(project)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "about" && aboutContent && (
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Profile Image</label>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-40 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden">
                {aboutContent.image ? <img src={aboutContent.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={24} className="text-black/20" />}
              </div>
              <label className="cursor-pointer flex items-center space-x-2 bg-black text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors">
                <Upload size={14} />
                <span>{isUploading ? "Uploading..." : "Change Image"}</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("image", file);
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.url) setAboutContent({ ...aboutContent, image: data.url });
                    } finally {
                      setIsUploading(false);
                    }
                  }} 
                  accept="image/*" 
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Name</label>
            <input 
              value={aboutContent.name || ""} 
              onChange={e => setAboutContent({...aboutContent, name: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Role</label>
            <input 
              value={aboutContent.role || ""} 
              onChange={e => setAboutContent({...aboutContent, role: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Bio</label>
            <textarea 
              rows={6}
              value={aboutContent.bio || ""} 
              onChange={e => setAboutContent({...aboutContent, bio: e.target.value})}
              className="w-full border border-black/10 p-4 outline-none focus:border-black transition-colors text-sm bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Interests (Comma separated)</label>
            <input 
              value={aboutContent.interests?.join(", ") || ""} 
              onChange={e => setAboutContent({...aboutContent, interests: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "")})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Location / Footer Text</label>
            <input 
              value={aboutContent.location || ""} 
              onChange={e => setAboutContent({...aboutContent, location: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <button 
            onClick={() => handleSaveSettings("about_content", aboutContent)}
            disabled={isSaving}
            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-black/80 transition-colors disabled:bg-black/40"
          >
            {isSaving ? "Saving..." : "Save About Content"}
          </button>
        </div>
      )}

      {activeTab === "contact" && contactContent && (
        <div className="max-w-2xl space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Email</label>
            <input 
              value={contactContent.email || ""} 
              onChange={e => setContactContent({...contactContent, email: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Instagram</label>
            <input 
              value={contactContent.instagram || ""} 
              onChange={e => setContactContent({...contactContent, instagram: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-black/40">Location</label>
            <input 
              value={contactContent.location || ""} 
              onChange={e => setContactContent({...contactContent, location: e.target.value})}
              className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
          <button 
            onClick={() => handleSaveSettings("contact_content", contactContent)}
            disabled={isSaving}
            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-black/80 transition-colors disabled:bg-black/40"
          >
            {isSaving ? "Saving..." : "Save Contact Content"}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFDF0] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-light tracking-tight">{editingProject.id ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setEditingProject(null)}><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Column 1: Basic Info */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest font-bold border-b border-black/10 pb-2">Basic Information</h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Title</label>
                  <input 
                    required
                    value={editingProject.title || ""} 
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Year</label>
                    <input 
                      required
                      value={editingProject.year || ""} 
                      onChange={e => setEditingProject({...editingProject, year: e.target.value})}
                      className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Category</label>
                    <select 
                      value={editingProject.category || "Textile"} 
                      onChange={e => setEditingProject({...editingProject, category: e.target.value as Category})}
                      className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
                    >
                      <option value="Textile">Textile</option>
                      <option value="Drawing">Drawing</option>
                      <option value="Photography">Photography</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Material</label>
                  <input 
                    value={editingProject.material || ""} 
                    onChange={e => setEditingProject({...editingProject, material: e.target.value})}
                    className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Technique</label>
                  <input 
                    value={editingProject.technique || ""} 
                    onChange={e => setEditingProject({...editingProject, technique: e.target.value})}
                    className="w-full border-b border-black/10 py-2 outline-none focus:border-black transition-colors bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Concept Description</label>
                  <textarea 
                    rows={4}
                    value={editingProject.concept || ""} 
                    onChange={e => setEditingProject({...editingProject, concept: e.target.value})}
                    className="w-full border border-black/10 p-3 outline-none focus:border-black transition-colors text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Column 2: Main Images & Text */}
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-widest font-bold border-b border-black/10 pb-2">Project Images</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Main Image */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Main Image</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.mainImage ? <img src={editingProject.mainImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "mainImage")} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  {/* Result Image */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Result Image</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.resultImage ? <img src={editingProject.resultImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "resultImage")} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  {/* Concept Image */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Concept Image</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.conceptImage ? <img src={editingProject.conceptImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "conceptImage")} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Research Images */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Research Img 1</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.researchImage1 ? <img src={editingProject.researchImage1} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "researchImage1")} accept="image/*" />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Research Img 2</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.researchImage2 ? <img src={editingProject.researchImage2} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "researchImage2")} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Process Images */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Process Img 1</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.processImage1 ? <img src={editingProject.processImage1} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "processImage1")} accept="image/*" />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-black/40">Process Img 2</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-100 border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                        {editingProject.processImage2 ? <img src={editingProject.processImage2} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={16} className="text-black/20" />}
                      </div>
                      <label className="cursor-pointer flex items-center space-x-1 bg-black/5 px-3 py-1.5 text-[9px] uppercase tracking-widest hover:bg-black/10 transition-colors">
                        <Upload size={10} />
                        <span>{isUploading ? "..." : "Upload"}</span>
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, "processImage2")} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Research Text</label>
                  <textarea 
                    rows={2}
                    value={editingProject.researchText || ""} 
                    onChange={e => setEditingProject({...editingProject, researchText: e.target.value})}
                    className="w-full border border-black/10 p-3 outline-none focus:border-black transition-colors text-sm bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-black/40">Process Text</label>
                  <textarea 
                    rows={2}
                    value={editingProject.processText || ""} 
                    onChange={e => setEditingProject({...editingProject, processText: e.target.value})}
                    className="w-full border border-black/10 p-3 outline-none focus:border-black transition-colors text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Column 3: Gallery (Multiple Images) */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold">Gallery (Multiple)</h3>
                  <label className="cursor-pointer flex items-center space-x-2 bg-black text-white px-3 py-1 text-[10px] uppercase tracking-widest hover:bg-black/80 transition-colors">
                    <Plus size={12} />
                    <span>Add</span>
                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, "gallery")} accept="image/*" />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {editingProject.gallery?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square group bg-neutral-100 border border-black/5">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        type="button"
                        onClick={() => removeFromGallery(idx)}
                        className="absolute top-1 right-1 bg-black text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {(!editingProject.gallery || editingProject.gallery.length === 0) && (
                    <div className="col-span-3 py-12 text-center border border-dashed border-black/10 text-[10px] uppercase tracking-widest text-black/20">
                      No gallery images
                    </div>
                  )}
                </div>

                <div className="pt-8">
                  <button 
                    type="submit" 
                    disabled={isSaving || isUploading}
                    className="w-full bg-black text-white py-4 text-xs uppercase tracking-widest hover:bg-accent-dark hover:text-black transition-colors flex items-center justify-center space-x-2 disabled:bg-black/40"
                  >
                    <Save size={16} />
                    <span>{isSaving ? "Saving..." : isUploading ? "Uploading..." : "Save Project"}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
