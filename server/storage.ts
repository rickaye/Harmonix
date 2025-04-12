import {
  User, InsertUser, users,
  Project, InsertProject, projects,
  Track, InsertTrack, tracks,
  AudioClip, InsertAudioClip, audioClips,
  Effect, InsertEffect, effects,
  StemSeparationJob, InsertStemSeparationJob, stemSeparationJobs,
  VoiceCloningJob, InsertVoiceCloningJob, voiceCloningJobs,
  MusicGenerationJob, InsertMusicGenerationJob, musicGenerationJobs,
  MoodTag, InsertMoodTag, moodTags,
  AudioClipMoodTag, InsertAudioClipMoodTag, audioClipMoodTags
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;

  // Track operations
  getTrack(id: number): Promise<Track | undefined>;
  getTracksByProjectId(projectId: number): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, track: Partial<Track>): Promise<Track>;
  deleteTrack(id: number): Promise<boolean>;

  // AudioClip operations
  getAudioClip(id: number): Promise<AudioClip | undefined>;
  getAudioClipsByTrackId(trackId: number): Promise<AudioClip[]>;
  createAudioClip(audioClip: InsertAudioClip): Promise<AudioClip>;
  updateAudioClip(id: number, audioClip: Partial<AudioClip>): Promise<AudioClip>;
  deleteAudioClip(id: number): Promise<boolean>;

  // Effect operations
  getEffect(id: number): Promise<Effect | undefined>;
  getEffectsByTrackId(trackId: number): Promise<Effect[]>;
  createEffect(effect: InsertEffect): Promise<Effect>;
  updateEffect(id: number, effect: Partial<Effect>): Promise<Effect>;
  deleteEffect(id: number): Promise<boolean>;

  // Stem separation operations
  getStemSeparationJob(id: number): Promise<StemSeparationJob | undefined>;
  getStemSeparationJobsByProjectId(projectId: number): Promise<StemSeparationJob[]>;
  createStemSeparationJob(job: InsertStemSeparationJob): Promise<StemSeparationJob>;
  updateStemSeparationJob(id: number, job: Partial<StemSeparationJob>): Promise<StemSeparationJob>;

  // Voice cloning operations
  getVoiceCloningJob(id: number): Promise<VoiceCloningJob | undefined>;
  getVoiceCloningJobsByProjectId(projectId: number): Promise<VoiceCloningJob[]>;
  createVoiceCloningJob(job: InsertVoiceCloningJob): Promise<VoiceCloningJob>;
  updateVoiceCloningJob(id: number, job: Partial<VoiceCloningJob>): Promise<VoiceCloningJob>;

  // Music generation operations
  getMusicGenerationJob(id: number): Promise<MusicGenerationJob | undefined>;
  getMusicGenerationJobsByProjectId(projectId: number): Promise<MusicGenerationJob[]>;
  createMusicGenerationJob(job: InsertMusicGenerationJob): Promise<MusicGenerationJob>;
  updateMusicGenerationJob(id: number, job: Partial<MusicGenerationJob>): Promise<MusicGenerationJob>;
  
  // Mood tag operations
  getMoodTag(id: number): Promise<MoodTag | undefined>;
  getMoodTagByName(name: string): Promise<MoodTag | undefined>;
  getAllMoodTags(): Promise<MoodTag[]>;
  createMoodTag(moodTag: InsertMoodTag): Promise<MoodTag>;
  updateMoodTag(id: number, moodTag: Partial<MoodTag>): Promise<MoodTag>;
  deleteMoodTag(id: number): Promise<boolean>;
  
  // AudioClip mood tag operations
  getAudioClipMoodTags(audioClipId: number): Promise<(AudioClipMoodTag & { moodTag: MoodTag })[]>;
  addMoodTagToAudioClip(audioClipMoodTag: InsertAudioClipMoodTag): Promise<AudioClipMoodTag>;
  updateAudioClipMoodTagWeight(audioClipId: number, moodTagId: number, weight: number): Promise<AudioClipMoodTag>;
  removeMoodTagFromAudioClip(audioClipId: number, moodTagId: number): Promise<boolean>;
  getAudioClipsByMoodTagId(moodTagId: number): Promise<AudioClip[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tracks: Map<number, Track>;
  private audioClips: Map<number, AudioClip>;
  private effects: Map<number, Effect>;
  private stemSeparationJobs: Map<number, StemSeparationJob>;
  private voiceCloningJobs: Map<number, VoiceCloningJob>;
  private musicGenerationJobs: Map<number, MusicGenerationJob>;

  private nextIds: {
    users: number;
    projects: number;
    tracks: number;
    audioClips: number;
    effects: number;
    stemSeparationJobs: number;
    voiceCloningJobs: number;
    musicGenerationJobs: number;
  };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tracks = new Map();
    this.audioClips = new Map();
    this.effects = new Map();
    this.stemSeparationJobs = new Map();
    this.voiceCloningJobs = new Map();
    this.musicGenerationJobs = new Map();

    this.nextIds = {
      users: 1,
      projects: 1,
      tracks: 1,
      audioClips: 1,
      effects: 1,
      stemSeparationJobs: 1,
      voiceCloningJobs: 1,
      musicGenerationJobs: 1,
    };

    // Create demo data
    this.setupDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextIds.users++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.nextIds.projects++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updatedProject = { 
      ...project, 
      ...projectUpdate,
      updatedAt: new Date()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Track operations
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getTracksByProjectId(projectId: number): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(
      (track) => track.projectId === projectId,
    );
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = this.nextIds.tracks++;
    const track: Track = { 
      ...insertTrack, 
      id,
      createdAt: new Date()
    };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(id: number, trackUpdate: Partial<Track>): Promise<Track> {
    const track = await this.getTrack(id);
    if (!track) {
      throw new Error(`Track with id ${id} not found`);
    }
    const updatedTrack = { ...track, ...trackUpdate };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<boolean> {
    return this.tracks.delete(id);
  }

  // AudioClip operations
  async getAudioClip(id: number): Promise<AudioClip | undefined> {
    return this.audioClips.get(id);
  }

  async getAudioClipsByTrackId(trackId: number): Promise<AudioClip[]> {
    return Array.from(this.audioClips.values()).filter(
      (clip) => clip.trackId === trackId,
    );
  }

  async createAudioClip(insertAudioClip: InsertAudioClip): Promise<AudioClip> {
    const id = this.nextIds.audioClips++;
    const audioClip: AudioClip = { 
      ...insertAudioClip, 
      id,
      createdAt: new Date()
    };
    this.audioClips.set(id, audioClip);
    return audioClip;
  }

  async updateAudioClip(id: number, audioClipUpdate: Partial<AudioClip>): Promise<AudioClip> {
    const audioClip = await this.getAudioClip(id);
    if (!audioClip) {
      throw new Error(`AudioClip with id ${id} not found`);
    }
    const updatedAudioClip = { ...audioClip, ...audioClipUpdate };
    this.audioClips.set(id, updatedAudioClip);
    return updatedAudioClip;
  }

  async deleteAudioClip(id: number): Promise<boolean> {
    return this.audioClips.delete(id);
  }

  // Effect operations
  async getEffect(id: number): Promise<Effect | undefined> {
    return this.effects.get(id);
  }

  async getEffectsByTrackId(trackId: number): Promise<Effect[]> {
    return Array.from(this.effects.values()).filter(
      (effect) => effect.trackId === trackId,
    );
  }

  async createEffect(insertEffect: InsertEffect): Promise<Effect> {
    const id = this.nextIds.effects++;
    const effect: Effect = { 
      ...insertEffect, 
      id,
      createdAt: new Date()
    };
    this.effects.set(id, effect);
    return effect;
  }

  async updateEffect(id: number, effectUpdate: Partial<Effect>): Promise<Effect> {
    const effect = await this.getEffect(id);
    if (!effect) {
      throw new Error(`Effect with id ${id} not found`);
    }
    const updatedEffect = { ...effect, ...effectUpdate };
    this.effects.set(id, updatedEffect);
    return updatedEffect;
  }

  async deleteEffect(id: number): Promise<boolean> {
    return this.effects.delete(id);
  }

  // Stem separation operations
  async getStemSeparationJob(id: number): Promise<StemSeparationJob | undefined> {
    return this.stemSeparationJobs.get(id);
  }

  async getStemSeparationJobsByProjectId(projectId: number): Promise<StemSeparationJob[]> {
    return Array.from(this.stemSeparationJobs.values()).filter(
      (job) => job.projectId === projectId,
    );
  }

  async createStemSeparationJob(insertJob: InsertStemSeparationJob): Promise<StemSeparationJob> {
    const id = this.nextIds.stemSeparationJobs++;
    const job: StemSeparationJob = { 
      ...insertJob, 
      id, 
      status: "pending",
      outputPaths: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.stemSeparationJobs.set(id, job);
    return job;
  }

  async updateStemSeparationJob(id: number, jobUpdate: Partial<StemSeparationJob>): Promise<StemSeparationJob> {
    const job = await this.getStemSeparationJob(id);
    if (!job) {
      throw new Error(`StemSeparationJob with id ${id} not found`);
    }
    const updatedJob = { 
      ...job, 
      ...jobUpdate,
      updatedAt: new Date()
    };
    this.stemSeparationJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Voice cloning operations
  async getVoiceCloningJob(id: number): Promise<VoiceCloningJob | undefined> {
    return this.voiceCloningJobs.get(id);
  }

  async getVoiceCloningJobsByProjectId(projectId: number): Promise<VoiceCloningJob[]> {
    return Array.from(this.voiceCloningJobs.values()).filter(
      (job) => job.projectId === projectId,
    );
  }

  async createVoiceCloningJob(insertJob: InsertVoiceCloningJob): Promise<VoiceCloningJob> {
    const id = this.nextIds.voiceCloningJobs++;
    const job: VoiceCloningJob = { 
      ...insertJob, 
      id, 
      status: "pending",
      outputPath: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.voiceCloningJobs.set(id, job);
    return job;
  }

  async updateVoiceCloningJob(id: number, jobUpdate: Partial<VoiceCloningJob>): Promise<VoiceCloningJob> {
    const job = await this.getVoiceCloningJob(id);
    if (!job) {
      throw new Error(`VoiceCloningJob with id ${id} not found`);
    }
    const updatedJob = { 
      ...job, 
      ...jobUpdate,
      updatedAt: new Date() 
    };
    this.voiceCloningJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Music generation operations
  async getMusicGenerationJob(id: number): Promise<MusicGenerationJob | undefined> {
    return this.musicGenerationJobs.get(id);
  }

  async getMusicGenerationJobsByProjectId(projectId: number): Promise<MusicGenerationJob[]> {
    return Array.from(this.musicGenerationJobs.values()).filter(
      (job) => job.projectId === projectId,
    );
  }

  async createMusicGenerationJob(insertJob: InsertMusicGenerationJob): Promise<MusicGenerationJob> {
    const id = this.nextIds.musicGenerationJobs++;
    const job: MusicGenerationJob = { 
      ...insertJob, 
      id, 
      status: "pending",
      outputPath: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.musicGenerationJobs.set(id, job);
    return job;
  }

  async updateMusicGenerationJob(id: number, jobUpdate: Partial<MusicGenerationJob>): Promise<MusicGenerationJob> {
    const job = await this.getMusicGenerationJob(id);
    if (!job) {
      throw new Error(`MusicGenerationJob with id ${id} not found`);
    }
    const updatedJob = { 
      ...job, 
      ...jobUpdate,
      updatedAt: new Date()
    };
    this.musicGenerationJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Set up demo data for the application
  private setupDemoData() {
    // Create a demo user
    const user: User = {
      id: this.nextIds.users++,
      username: 'demo',
      password: 'password',
      createdAt: new Date()
    };
    this.users.set(user.id, user);

    // Create a demo project
    const project: Project = {
      id: this.nextIds.projects++,
      name: 'Demo Project',
      userId: user.id,
      bpm: 120,
      timeSignature: '4/4',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(project.id, project);

    // Create tracks
    const trackTypes = [
      { name: 'Vocals', type: 'vocals', color: '#4ade80' },
      { name: 'Drums', type: 'drums', color: '#60a5fa' },
      { name: 'Bass', type: 'bass', color: '#c084fc' },
      { name: 'Synth', type: 'synth', color: '#fb923c' },
      { name: 'AI Harmony', type: 'ai-generated', color: '#7C4DFF' }
    ];

    const tracks = trackTypes.map((t, index) => {
      const track: Track = {
        id: this.nextIds.tracks++,
        name: t.name,
        type: t.type,
        projectId: project.id,
        color: t.color,
        muted: false,
        solo: false,
        volume: 75,
        createdAt: new Date()
      };
      this.tracks.set(track.id, track);
      return track;
    });

    // Create audio clips for each track
    // Vocals track
    this.createAudioClip({
      name: 'vocals_main.wav',
      trackId: tracks[0].id,
      path: '/samples/vocals_main.wav',
      startTime: 3600, // 180px * 20ms
      duration: 6400, // 320px * 20ms
      isAIGenerated: false
    });

    this.createAudioClip({
      name: 'cloned_vocals.wav',
      trackId: tracks[0].id,
      path: '/samples/cloned_vocals.wav',
      startTime: 10400, // 520px * 20ms
      duration: 4800, // 240px * 20ms
      isAIGenerated: true
    });

    // Drums track
    this.createAudioClip({
      name: 'drums_main.wav',
      trackId: tracks[1].id,
      path: '/samples/drums_main.wav',
      startTime: 2000, // 100px * 20ms
      duration: 13200, // 660px * 20ms
      isAIGenerated: false
    });

    // Bass track
    this.createAudioClip({
      name: 'bass_main.wav',
      trackId: tracks[2].id,
      path: '/samples/bass_main.wav',
      startTime: 2000, // 100px * 20ms
      duration: 8800, // 440px * 20ms
      isAIGenerated: false
    });

    // Synth track
    this.createAudioClip({
      name: 'synth_intro.wav',
      trackId: tracks[3].id,
      path: '/samples/synth_intro.wav',
      startTime: 3600, // 180px * 20ms
      duration: 3200, // 160px * 20ms
      isAIGenerated: false
    });

    this.createAudioClip({
      name: 'synth_verse.wav',
      trackId: tracks[3].id,
      path: '/samples/synth_verse.wav',
      startTime: 7200, // 360px * 20ms
      duration: 4800, // 240px * 20ms
      isAIGenerated: false
    });

    this.createAudioClip({
      name: 'synth_outro.wav',
      trackId: tracks[3].id,
      path: '/samples/synth_outro.wav',
      startTime: 12400, // 620px * 20ms
      duration: 3600, // 180px * 20ms
      isAIGenerated: false
    });

    // AI Harmony track
    this.createAudioClip({
      name: 'ai_generated_melody.wav',
      trackId: tracks[4].id,
      path: '/samples/ai_generated_melody.wav',
      startTime: 7200, // 360px * 20ms
      duration: 8800, // 440px * 20ms
      isAIGenerated: true
    });

    // Create effects for vocals track
    this.createEffect({
      name: 'Equalizer',
      type: 'eq',
      trackId: tracks[0].id,
      settings: {
        bands: [
          { frequency: 80, gain: 3 },
          { frequency: 240, gain: -2 },
          { frequency: 2500, gain: 5 },
          { frequency: 10000, gain: 0 }
        ]
      },
      enabled: true
    });

    this.createEffect({
      name: 'Reverb',
      type: 'reverb',
      trackId: tracks[0].id,
      settings: {
        roomSize: 72,
        dampening: 40,
        width: 85,
        wetDry: 30,
        preset: 'Medium Hall'
      },
      enabled: true
    });

    this.createEffect({
      name: 'Compressor',
      type: 'compressor',
      trackId: tracks[0].id,
      settings: {
        threshold: -24,
        ratio: 4,
        attack: 0.003,
        release: 0.25,
        knee: 30,
        makeupGain: 1
      },
      enabled: true
    });
  }
}

import { db } from './db';
import { eq, and } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: now
    }).returning();
    return user;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const now = new Date();
    const [project] = await db.insert(projects).values({
      ...insertProject,
      createdAt: now,
      updatedAt: now
    }).returning();
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({
        ...projectUpdate,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Track operations
  async getTrack(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

  async getTracksByProjectId(projectId: number): Promise<Track[]> {
    return await db.select().from(tracks).where(eq(tracks.projectId, projectId));
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const now = new Date();
    const [track] = await db.insert(tracks).values({
      ...insertTrack,
      createdAt: now
    }).returning();
    return track;
  }

  async updateTrack(id: number, trackUpdate: Partial<Track>): Promise<Track> {
    const [track] = await db
      .update(tracks)
      .set(trackUpdate)
      .where(eq(tracks.id, id))
      .returning();
    
    if (!track) {
      throw new Error(`Track with id ${id} not found`);
    }
    
    return track;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const result = await db.delete(tracks).where(eq(tracks.id, id));
    return result.rowCount > 0;
  }

  // AudioClip operations
  async getAudioClip(id: number): Promise<AudioClip | undefined> {
    const [clip] = await db.select().from(audioClips).where(eq(audioClips.id, id));
    return clip;
  }

  async getAudioClipsByTrackId(trackId: number): Promise<AudioClip[]> {
    return await db.select().from(audioClips).where(eq(audioClips.trackId, trackId));
  }

  async createAudioClip(insertAudioClip: InsertAudioClip): Promise<AudioClip> {
    const now = new Date();
    const [clip] = await db.insert(audioClips).values({
      ...insertAudioClip,
      createdAt: now
    }).returning();
    return clip;
  }

  async updateAudioClip(id: number, audioClipUpdate: Partial<AudioClip>): Promise<AudioClip> {
    const [clip] = await db
      .update(audioClips)
      .set(audioClipUpdate)
      .where(eq(audioClips.id, id))
      .returning();
    
    if (!clip) {
      throw new Error(`AudioClip with id ${id} not found`);
    }
    
    return clip;
  }

  async deleteAudioClip(id: number): Promise<boolean> {
    const result = await db.delete(audioClips).where(eq(audioClips.id, id));
    return result.rowCount > 0;
  }

  // Effect operations
  async getEffect(id: number): Promise<Effect | undefined> {
    const [effect] = await db.select().from(effects).where(eq(effects.id, id));
    return effect;
  }

  async getEffectsByTrackId(trackId: number): Promise<Effect[]> {
    return await db.select().from(effects).where(eq(effects.trackId, trackId));
  }

  async createEffect(insertEffect: InsertEffect): Promise<Effect> {
    const now = new Date();
    const [effect] = await db.insert(effects).values({
      ...insertEffect,
      createdAt: now
    }).returning();
    return effect;
  }

  async updateEffect(id: number, effectUpdate: Partial<Effect>): Promise<Effect> {
    const [effect] = await db
      .update(effects)
      .set(effectUpdate)
      .where(eq(effects.id, id))
      .returning();
    
    if (!effect) {
      throw new Error(`Effect with id ${id} not found`);
    }
    
    return effect;
  }

  async deleteEffect(id: number): Promise<boolean> {
    const result = await db.delete(effects).where(eq(effects.id, id));
    return result.rowCount > 0;
  }

  // Stem separation operations
  async getStemSeparationJob(id: number): Promise<StemSeparationJob | undefined> {
    const [job] = await db.select().from(stemSeparationJobs).where(eq(stemSeparationJobs.id, id));
    return job;
  }

  async getStemSeparationJobsByProjectId(projectId: number): Promise<StemSeparationJob[]> {
    return await db.select().from(stemSeparationJobs).where(eq(stemSeparationJobs.projectId, projectId));
  }

  async createStemSeparationJob(insertJob: InsertStemSeparationJob): Promise<StemSeparationJob> {
    const now = new Date();
    const [job] = await db
      .insert(stemSeparationJobs)
      .values({
        ...insertJob,
        status: "pending",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return job;
  }

  async updateStemSeparationJob(id: number, jobUpdate: Partial<StemSeparationJob>): Promise<StemSeparationJob> {
    const [job] = await db
      .update(stemSeparationJobs)
      .set({
        ...jobUpdate,
        updatedAt: new Date()
      })
      .where(eq(stemSeparationJobs.id, id))
      .returning();
    
    if (!job) {
      throw new Error(`StemSeparationJob with id ${id} not found`);
    }
    
    return job;
  }

  // Voice cloning operations
  async getVoiceCloningJob(id: number): Promise<VoiceCloningJob | undefined> {
    const [job] = await db.select().from(voiceCloningJobs).where(eq(voiceCloningJobs.id, id));
    return job;
  }

  async getVoiceCloningJobsByProjectId(projectId: number): Promise<VoiceCloningJob[]> {
    return await db.select().from(voiceCloningJobs).where(eq(voiceCloningJobs.projectId, projectId));
  }

  async createVoiceCloningJob(insertJob: InsertVoiceCloningJob): Promise<VoiceCloningJob> {
    const now = new Date();
    const [job] = await db
      .insert(voiceCloningJobs)
      .values({
        ...insertJob,
        status: "pending",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return job;
  }

  async updateVoiceCloningJob(id: number, jobUpdate: Partial<VoiceCloningJob>): Promise<VoiceCloningJob> {
    const [job] = await db
      .update(voiceCloningJobs)
      .set({
        ...jobUpdate,
        updatedAt: new Date()
      })
      .where(eq(voiceCloningJobs.id, id))
      .returning();
    
    if (!job) {
      throw new Error(`VoiceCloningJob with id ${id} not found`);
    }
    
    return job;
  }

  // Music generation operations
  async getMusicGenerationJob(id: number): Promise<MusicGenerationJob | undefined> {
    const [job] = await db.select().from(musicGenerationJobs).where(eq(musicGenerationJobs.id, id));
    return job;
  }

  async getMusicGenerationJobsByProjectId(projectId: number): Promise<MusicGenerationJob[]> {
    return await db.select().from(musicGenerationJobs).where(eq(musicGenerationJobs.projectId, projectId));
  }

  async createMusicGenerationJob(insertJob: InsertMusicGenerationJob): Promise<MusicGenerationJob> {
    const now = new Date();
    const [job] = await db
      .insert(musicGenerationJobs)
      .values({
        ...insertJob,
        status: "pending",
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return job;
  }

  async updateMusicGenerationJob(id: number, jobUpdate: Partial<MusicGenerationJob>): Promise<MusicGenerationJob> {
    const [job] = await db
      .update(musicGenerationJobs)
      .set({
        ...jobUpdate,
        updatedAt: new Date()
      })
      .where(eq(musicGenerationJobs.id, id))
      .returning();
    
    if (!job) {
      throw new Error(`MusicGenerationJob with id ${id} not found`);
    }
    
    return job;
  }

  // Setup initial data for database
  async setupDemoData() {
    try {
      // Check if users table has data
      const existingUsers = await db.select().from(users);
      if (existingUsers.length > 0) {
        console.log("Demo data already exists, skipping creation");
        return;
      }

      console.log("Creating demo data in database...");

      // Create a demo user
      const now = new Date();
      const [user] = await db.insert(users).values({
        username: 'demo',
        password: 'password',
        createdAt: now
      }).returning();

      // Create a demo project
      const [project] = await db.insert(projects).values({
        name: 'Demo Project',
        userId: user.id,
        bpm: 120,
        timeSignature: '4/4',
        createdAt: now,
        updatedAt: now
      }).returning();

      // Create tracks
      const trackTypes = [
        { name: 'Vocals', type: 'vocals', color: '#4ade80' },
        { name: 'Drums', type: 'drums', color: '#60a5fa' },
        { name: 'Bass', type: 'bass', color: '#c084fc' },
        { name: 'Synth', type: 'synth', color: '#fb923c' },
        { name: 'AI Harmony', type: 'ai-generated', color: '#7C4DFF' }
      ];

      const createdTracks = [];
      for (const t of trackTypes) {
        const [track] = await db.insert(tracks).values({
          name: t.name,
          type: t.type,
          projectId: project.id,
          color: t.color,
          muted: false,
          solo: false,
          volume: 75,
          createdAt: now
        }).returning();
        
        createdTracks.push(track);
      }

      // Create audio clips
      const audioClipsData = [
        {
          name: 'vocals_main.wav',
          trackId: createdTracks[0].id,
          path: '/samples/vocals_main.wav',
          startTime: 3600, // 180px * 20ms
          duration: 6400, // 320px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'cloned_vocals.wav',
          trackId: createdTracks[0].id,
          path: '/samples/cloned_vocals.wav',
          startTime: 10400, // 520px * 20ms
          duration: 4800, // 240px * 20ms
          isAIGenerated: true,
          createdAt: now
        },
        {
          name: 'drums_main.wav',
          trackId: createdTracks[1].id,
          path: '/samples/drums_main.wav',
          startTime: 2000, // 100px * 20ms
          duration: 13200, // 660px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'bass_main.wav',
          trackId: createdTracks[2].id,
          path: '/samples/bass_main.wav',
          startTime: 2000, // 100px * 20ms
          duration: 8800, // 440px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'synth_intro.wav',
          trackId: createdTracks[3].id,
          path: '/samples/synth_intro.wav',
          startTime: 3600, // 180px * 20ms
          duration: 3200, // 160px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'synth_verse.wav',
          trackId: createdTracks[3].id,
          path: '/samples/synth_verse.wav',
          startTime: 7200, // 360px * 20ms
          duration: 4800, // 240px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'synth_outro.wav',
          trackId: createdTracks[3].id,
          path: '/samples/synth_outro.wav',
          startTime: 12400, // 620px * 20ms
          duration: 3600, // 180px * 20ms
          isAIGenerated: false,
          createdAt: now
        },
        {
          name: 'ai_generated_melody.wav',
          trackId: createdTracks[4].id,
          path: '/samples/ai_generated_melody.wav',
          startTime: 7200, // 360px * 20ms
          duration: 8800, // 440px * 20ms
          isAIGenerated: true,
          createdAt: now
        }
      ];

      for (const clip of audioClipsData) {
        await db.insert(audioClips).values(clip);
      }

      // Create effects
      const effectsData = [
        {
          name: 'Equalizer',
          type: 'eq',
          trackId: createdTracks[0].id,
          settings: {
            bands: [
              { frequency: 80, gain: 3 },
              { frequency: 240, gain: -2 },
              { frequency: 2500, gain: 5 },
              { frequency: 10000, gain: 0 }
            ]
          },
          enabled: true,
          createdAt: now
        },
        {
          name: 'Reverb',
          type: 'reverb',
          trackId: createdTracks[0].id,
          settings: {
            roomSize: 72,
            dampening: 40,
            width: 85,
            wetDry: 30,
            preset: 'Medium Hall'
          },
          enabled: true,
          createdAt: now
        },
        {
          name: 'Compressor',
          type: 'compressor',
          trackId: createdTracks[0].id,
          settings: {
            threshold: -24,
            ratio: 4,
            attack: 0.003,
            release: 0.25,
            knee: 30,
            makeupGain: 1
          },
          enabled: true,
          createdAt: now
        }
      ];

      for (const effect of effectsData) {
        await db.insert(effects).values(effect);
      }

      console.log("✅ Demo data created successfully!");
    } catch (error) {
      console.error("❌ Error creating demo data:", error);
      throw error;
    }
  }
}

// Create a database connection for persisting data
// Fall back to in-memory storage if database connection fails
import { setupDatabase } from './db';

// Start with in-memory storage for immediate functionality
export const storage = new MemStorage();

// Try to connect to the database and switch to it if successful
setupDatabase().then(async (success) => {
  if (success) {
    try {
      // Create a database storage instance
      const dbStorage = new DatabaseStorage();
      
      // Initialize it with demo data if needed
      await dbStorage.setupDemoData();
      
      // Switch to database storage
      (global as any).storage = dbStorage;
      console.log('✅ Switched to database storage');
    } catch (error) {
      console.error('❌ Error setting up database storage:', error);
      console.log('⚠️ Falling back to in-memory storage');
    }
  } else {
    console.log('⚠️ Using in-memory storage due to database connection issues');
  }
});