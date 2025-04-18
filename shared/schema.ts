import { pgTable, text, serial, integer, json, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Projects model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bpm: integer("bpm").notNull().default(120),
  timeSignature: text("time_signature").notNull().default("4/4"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  tracks: many(tracks),
  stemSeparationJobs: many(stemSeparationJobs),
  voiceCloningJobs: many(voiceCloningJobs),
  musicGenerationJobs: many(musicGenerationJobs),
}));

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
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  color: text("color").notNull(),
  muted: boolean("muted").notNull().default(false),
  solo: boolean("solo").notNull().default(false),
  volume: integer("volume").notNull().default(75), // 0-100
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  project: one(projects, { fields: [tracks.projectId], references: [projects.id] }),
  audioClips: many(audioClips),
  effects: many(effects),
}));

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
  trackId: integer("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  path: text("path").notNull(), // path to audio file
  startTime: integer("start_time").notNull(), // in milliseconds
  duration: integer("duration").notNull(), // in milliseconds
  isAIGenerated: boolean("is_ai_generated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Will define the relation with mood tags later

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
  trackId: integer("track_id").notNull().references(() => tracks.id, { onDelete: "cascade" }),
  settings: json("settings").notNull(), // JSON settings for this effect
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const effectsRelations = relations(effects, ({ one }) => ({
  track: one(tracks, { fields: [effects.trackId], references: [tracks.id] }),
}));

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
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  outputPaths: json("output_paths"), // JSON object with paths to separated stems
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stemSeparationJobsRelations = relations(stemSeparationJobs, ({ one }) => ({
  project: one(projects, { fields: [stemSeparationJobs.projectId], references: [projects.id] }),
}));

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
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  outputPath: text("output_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const voiceCloningJobsRelations = relations(voiceCloningJobs, ({ one }) => ({
  project: one(projects, { fields: [voiceCloningJobs.projectId], references: [projects.id] }),
}));

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
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  outputPath: text("output_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const musicGenerationJobsRelations = relations(musicGenerationJobs, ({ one }) => ({
  project: one(projects, { fields: [musicGenerationJobs.projectId], references: [projects.id] }),
}));

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

// Mood tags model
export const moodTags = pgTable("mood_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(), // Color code in hex format
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const moodTagsRelations = relations(moodTags, ({ many }) => ({
  audioClipMoodTags: many(audioClipMoodTags),
}));

export const insertMoodTagSchema = createInsertSchema(moodTags).pick({
  name: true,
  description: true,
  color: true,
});

// Junction table for AudioClips and MoodTags (many-to-many)
export const audioClipMoodTags = pgTable("audio_clip_mood_tags", {
  audioClipId: integer("audio_clip_id").notNull().references(() => audioClips.id, { onDelete: "cascade" }),
  moodTagId: integer("mood_tag_id").notNull().references(() => moodTags.id, { onDelete: "cascade" }),
  weight: integer("weight").notNull().default(1), // How strongly this mood applies (1-10)
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.audioClipId, t.moodTagId] }),
}));

export const audioClipMoodTagsRelations = relations(audioClipMoodTags, ({ one }) => ({
  audioClip: one(audioClips, { fields: [audioClipMoodTags.audioClipId], references: [audioClips.id] }),
  moodTag: one(moodTags, { fields: [audioClipMoodTags.moodTagId], references: [moodTags.id] }),
}));

export const insertAudioClipMoodTagSchema = createInsertSchema(audioClipMoodTags).pick({
  audioClipId: true,
  moodTagId: true,
  weight: true,
});

export type InsertMoodTag = z.infer<typeof insertMoodTagSchema>;
export type MoodTag = typeof moodTags.$inferSelect;

export type InsertAudioClipMoodTag = z.infer<typeof insertAudioClipMoodTagSchema>;
export type AudioClipMoodTag = typeof audioClipMoodTags.$inferSelect;

// Now add relations for AudioClips to MoodTags
export const audioClipsRelations = relations(audioClips, ({ one, many }) => ({
  track: one(tracks, { fields: [audioClips.trackId], references: [tracks.id] }),
  moodTags: many(audioClipMoodTags),
}));
