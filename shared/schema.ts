import { pgTable, text, serial, integer, json, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Projects model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  bpm: integer("bpm").notNull().default(120),
  timeSignature: text("time_signature").notNull().default("4/4"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  userId: true,
  bpm: true,
  timeSignature: true,
});

// Tracks model
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // vocals, drums, bass, other, ai-generated
  projectId: integer("project_id").notNull(),
  color: text("color").notNull(),
  muted: boolean("muted").notNull().default(false),
  solo: boolean("solo").notNull().default(false),
  volume: integer("volume").notNull().default(75), // 0-100
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  name: true,
  type: true,
  projectId: true,
  color: true,
  muted: true,
  solo: true,
  volume: true,
});

// AudioClips model
export const audioClips = pgTable("audio_clips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trackId: integer("track_id").notNull(),
  path: text("path").notNull(), // path to audio file
  startTime: integer("start_time").notNull(), // in milliseconds
  duration: integer("duration").notNull(), // in milliseconds
  isAIGenerated: boolean("is_ai_generated").notNull().default(false),
});

export const insertAudioClipSchema = createInsertSchema(audioClips).pick({
  name: true,
  trackId: true,
  path: true,
  startTime: true,
  duration: true,
  isAIGenerated: true,
});

// Effects model
export const effects = pgTable("effects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // eq, reverb, compressor, etc.
  trackId: integer("track_id").notNull(),
  settings: json("settings").notNull(), // JSON settings for this effect
  enabled: boolean("enabled").notNull().default(true),
});

export const insertEffectSchema = createInsertSchema(effects).pick({
  name: true,
  type: true,
  trackId: true,
  settings: true,
  enabled: true,
});

// Stem separation requests
export const stemSeparationJobs = pgTable("stem_separation_jobs", {
  id: serial("id").primaryKey(),
  originalPath: text("original_path").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  error: text("error"),
  projectId: integer("project_id").notNull(),
  outputPaths: json("output_paths"), // JSON object with paths to separated stems
});

export const insertStemSeparationJobSchema = createInsertSchema(stemSeparationJobs).pick({
  originalPath: true,
  projectId: true,
});

// Voice cloning requests
export const voiceCloningJobs = pgTable("voice_cloning_jobs", {
  id: serial("id").primaryKey(),
  samplePath: text("sample_path").notNull(),
  text: text("text").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  error: text("error"),
  projectId: integer("project_id").notNull(),
  outputPath: text("output_path"),
});

export const insertVoiceCloningJobSchema = createInsertSchema(voiceCloningJobs).pick({
  samplePath: true,
  text: true,
  projectId: true,
});

// Music generation requests
export const musicGenerationJobs = pgTable("music_generation_jobs", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  error: text("error"),
  projectId: integer("project_id").notNull(),
  outputPath: text("output_path"),
});

export const insertMusicGenerationJobSchema = createInsertSchema(musicGenerationJobs).pick({
  prompt: true,
  projectId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

export type InsertAudioClip = z.infer<typeof insertAudioClipSchema>;
export type AudioClip = typeof audioClips.$inferSelect;

export type InsertEffect = z.infer<typeof insertEffectSchema>;
export type Effect = typeof effects.$inferSelect;

export type InsertStemSeparationJob = z.infer<typeof insertStemSeparationJobSchema>;
export type StemSeparationJob = typeof stemSeparationJobs.$inferSelect;

export type InsertVoiceCloningJob = z.infer<typeof insertVoiceCloningJobSchema>;
export type VoiceCloningJob = typeof voiceCloningJobs.$inferSelect;

export type InsertMusicGenerationJob = z.infer<typeof insertMusicGenerationJobSchema>;
export type MusicGenerationJob = typeof musicGenerationJobs.$inferSelect;
