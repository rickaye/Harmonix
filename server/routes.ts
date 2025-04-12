import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProjectSchema, 
  insertTrackSchema, 
  insertAudioClipSchema, 
  insertEffectSchema,
  insertStemSeparationJobSchema,
  insertVoiceCloningJobSchema,
  insertMusicGenerationJobSchema
} from "@shared/schema";
import { handleStemSeparation } from "./services/stemSeparation";
import { handleVoiceCloning } from "./services/voiceCloning";
import { handleMusicGeneration } from "./services/musicGeneration";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    // Add necessary headers for audio files
    res.set({
      'Accept-Ranges': 'bytes',
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600'
    });
    next();
  }, express.static(uploadsDir));
  
  // Projects API
  app.get("/api/projects", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Valid userId is required" });
    }
    const projects = await storage.getProjectsByUserId(userId);
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const updatedProject = await storage.updateProject(id, req.body);
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Tracks API
  app.get("/api/projects/:projectId/tracks", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const tracks = await storage.getTracksByProjectId(projectId);
    res.json(tracks);
  });

  app.post("/api/tracks", async (req, res) => {
    try {
      const validatedData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(validatedData);
      res.status(201).json(track);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      const updatedTrack = await storage.updateTrack(id, req.body);
      res.json(updatedTrack);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrack(id);
      if (!success) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Audio Clips API
  // Get all clips across all tracks (must be defined BEFORE the parametrized route)
  app.get("/api/tracks/all/clips", async (req, res) => {
    try {
      // Get all tracks
      const projects = await storage.getProjectsByUserId(1); // Default to user 1 for demo
      if (!projects || projects.length === 0) {
        return res.json([]);
      }
      
      // Get all tracks across all projects
      const allTracks = await Promise.all(
        projects.map(project => storage.getTracksByProjectId(project.id))
      );
      
      // Flatten tracks array
      const tracks = allTracks.flat();
      if (tracks.length === 0) {
        return res.json([]);
      }
      
      // Get all clips for all tracks
      const allClipsPromises = tracks.map(track => storage.getAudioClipsByTrackId(track.id));
      const allClips = await Promise.all(allClipsPromises);
      
      // Flatten clips array and return
      const clips = allClips.flat();
      res.json(clips);
    } catch (error) {
      console.error("Error fetching all clips:", error);
      res.status(500).json({ message: "Error fetching all clips" });
    }
  });
  
  // Get clips for a specific track
  app.get("/api/tracks/:trackId/clips", async (req, res) => {
    const trackId = parseInt(req.params.trackId);
    const clips = await storage.getAudioClipsByTrackId(trackId);
    res.json(clips);
  });

  app.post("/api/clips", async (req, res) => {
    try {
      const validatedData = insertAudioClipSchema.parse(req.body);
      const clip = await storage.createAudioClip(validatedData);
      res.status(201).json(clip);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/clips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clip = await storage.getAudioClip(id);
      if (!clip) {
        return res.status(404).json({ message: "Audio clip not found" });
      }
      
      const updatedClip = await storage.updateAudioClip(id, req.body);
      res.json(updatedClip);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/clips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAudioClip(id);
      if (!success) {
        return res.status(404).json({ message: "Audio clip not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Effects API
  app.get("/api/tracks/:trackId/effects", async (req, res) => {
    const trackId = parseInt(req.params.trackId);
    const effects = await storage.getEffectsByTrackId(trackId);
    res.json(effects);
  });

  app.post("/api/effects", async (req, res) => {
    try {
      const validatedData = insertEffectSchema.parse(req.body);
      const effect = await storage.createEffect(validatedData);
      res.status(201).json(effect);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/effects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const effect = await storage.getEffect(id);
      if (!effect) {
        return res.status(404).json({ message: "Effect not found" });
      }
      
      const updatedEffect = await storage.updateEffect(id, req.body);
      res.json(updatedEffect);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/effects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEffect(id);
      if (!success) {
        return res.status(404).json({ message: "Effect not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stem Separation API
  app.post("/api/stem-separation", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }
      
      const filePath = req.file.path;
      const projectId = parseInt(req.body.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Valid projectId is required" });
      }
      
      const job = await storage.createStemSeparationJob({
        originalPath: filePath,
        projectId
      });
      
      // Process stem separation asynchronously
      handleStemSeparation(job, storage).catch(console.error);
      
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/stem-separation/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getStemSeparationJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Stem separation job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Voice Cloning API
  app.post("/api/voice-cloning", upload.single('sample'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Voice sample file is required" });
      }
      
      const samplePath = req.file.path;
      const { text, projectId } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      if (isNaN(parseInt(projectId))) {
        return res.status(400).json({ message: "Valid projectId is required" });
      }
      
      const job = await storage.createVoiceCloningJob({
        samplePath,
        text,
        projectId: parseInt(projectId)
      });
      
      // Process voice cloning asynchronously
      handleVoiceCloning(job, storage).catch(console.error);
      
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/voice-cloning/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getVoiceCloningJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Voice cloning job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Music Generation API
  app.post("/api/music-generation", async (req, res) => {
    try {
      const { prompt, projectId } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      if (isNaN(parseInt(projectId))) {
        return res.status(400).json({ message: "Valid projectId is required" });
      }
      
      const job = await storage.createMusicGenerationJob({
        prompt,
        projectId: parseInt(projectId)
      });
      
      // Process music generation asynchronously
      handleMusicGeneration(job, storage).catch(console.error);
      
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/music-generation/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getMusicGenerationJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Music generation job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}

import express from "express";
