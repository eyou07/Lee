import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("portfolio.db");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year TEXT NOT NULL,
    category TEXT NOT NULL,
    material TEXT,
    technique TEXT,
    concept TEXT,
    mainImage TEXT,
    conceptImage TEXT,
    researchImage1 TEXT,
    researchImage2 TEXT,
    processImage1 TEXT,
    processImage2 TEXT,
    resultImage TEXT,
    researchText TEXT,
    processText TEXT,
    gallery TEXT -- JSON array of image URLs
  )
`);

// Migration: Add gallery column if it doesn't exist
try {
  db.exec("ALTER TABLE projects ADD COLUMN gallery TEXT");
} catch (e) {
  // Column already exists
}

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO projects (title, year, category, material, technique, concept, mainImage, resultImage, gallery)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run("Woven Narratives", "2023", "Textile", "Cotton, Silk", "Hand weaving", "Exploring the intersection of memory and texture.", "https://picsum.photos/seed/textile1/1200/800", "https://picsum.photos/seed/textile1-res/1200/800", "[]");
  insert.run("Organic Forms", "2024", "Drawing", "Ink on Paper", "Stippling", "Capturing the fluid motion of natural elements.", "https://picsum.photos/seed/drawing1/1200/800", "https://picsum.photos/seed/drawing1-res/1200/800", "[]");
  insert.run("Urban Textures", "2023", "Photography", "Digital Photography", "Macro", "Finding beauty in the decay of city surfaces.", "https://picsum.photos/seed/photo1/1200/800", "https://picsum.photos/seed/photo1-res/1200/800", "[]");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY year DESC").all();
    res.json(projects.map((p: any) => ({ ...p, gallery: JSON.parse(p.gallery || "[]") })));
  });

  app.get("/api/projects/:id", (req, res) => {
    const project: any = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (project) {
      res.json({ ...project, gallery: JSON.parse(project.gallery || "[]") });
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });

  // Upload endpoint
  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Admin routes (Simple password check)
  const ADMIN_PASSWORD = "2324";

  app.post("/api/admin/projects", (req, res) => {
    const { password, project } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, year, category, material, technique, concept, mainImage, conceptImage, researchImage1, researchImage2, processImage1, processImage2, resultImage, researchText, processText, gallery } = project;
    
    const stmt = db.prepare(`
      INSERT INTO projects (title, year, category, material, technique, concept, mainImage, conceptImage, researchImage1, researchImage2, processImage1, processImage2, resultImage, researchText, processText, gallery)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(title, year, category, material, technique, concept, mainImage, conceptImage, researchImage1, researchImage2, processImage1, processImage2, resultImage, researchText, processText, JSON.stringify(gallery || []));
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/admin/projects/:id", (req, res) => {
    const { password, project } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, year, category, material, technique, concept, mainImage, conceptImage, researchImage1, researchImage2, processImage1, processImage2, resultImage, researchText, processText, gallery } = project;
    
    const stmt = db.prepare(`
      UPDATE projects SET 
        title = ?, year = ?, category = ?, material = ?, technique = ?, 
        concept = ?, mainImage = ?, conceptImage = ?, researchImage1 = ?, 
        researchImage2 = ?, processImage1 = ?, processImage2 = ?, 
        resultImage = ?, researchText = ?, processText = ?, gallery = ?
      WHERE id = ?
    `);
    
    stmt.run(title, year, category, material, technique, concept, mainImage, conceptImage, researchImage1, researchImage2, processImage1, processImage2, resultImage, researchText, processText, JSON.stringify(gallery || []), req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/projects/:id", (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
