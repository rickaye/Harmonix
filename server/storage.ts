import {
  User, InsertUser, users,
  Project, InsertProject, projects,
  Track, InsertTrack, tracks,
  AudioClip, InsertAudioClip, audioClips,
  Effect, InsertEffect, effects,
  StemSeparationJob, InsertStemSeparationJob, stemSeparationJobs,
  VoiceCloningJob, InsertVoiceCloningJob, voiceCloningJobs,
  MusicGenerationJob, InsertMusicGenerationJob, musicGenerationJobs
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
    const user: User = { ...insertUser, id };
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
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updatedProject = { ...project, ...projectUpdate };
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
    const track: Track = { ...insertTrack, id };
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
    const audioClip: AudioClip = { ...insertAudioClip, id };
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
    const effect: Effect = { ...insertEffect, id };
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
      error: null
    };
    this.stemSeparationJobs.set(id, job);
    return job;
  }

  async updateStemSeparationJob(id: number, jobUpdate: Partial<StemSeparationJob>): Promise<StemSeparationJob> {
    const job = await this.getStemSeparationJob(id);
    if (!job) {
      throw new Error(`StemSeparationJob with id ${id} not found`);
    }
    const updatedJob = { ...job, ...jobUpdate };
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
      error: null 
    };
    this.voiceCloningJobs.set(id, job);
    return job;
  }

  async updateVoiceCloningJob(id: number, jobUpdate: Partial<VoiceCloningJob>): Promise<VoiceCloningJob> {
    const job = await this.getVoiceCloningJob(id);
    if (!job) {
      throw new Error(`VoiceCloningJob with id ${id} not found`);
    }
    const updatedJob = { ...job, ...jobUpdate };
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
      error: null 
    };
    this.musicGenerationJobs.set(id, job);
    return job;
  }

  async updateMusicGenerationJob(id: number, jobUpdate: Partial<MusicGenerationJob>): Promise<MusicGenerationJob> {
    const job = await this.getMusicGenerationJob(id);
    if (!job) {
      throw new Error(`MusicGenerationJob with id ${id} not found`);
    }
    const updatedJob = { ...job, ...jobUpdate };
    this.musicGenerationJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Set up demo data for the application
  private setupDemoData() {
    // Create a demo user
    const user: User = {
      id: this.nextIds.users++,
      username: 'demo',
      password: 'password'
    };
    this.users.set(user.id, user);

    // Create a demo project
    const project: Project = {
      id: this.nextIds.projects++,
      name: 'Demo Project',
      userId: user.id,
      bpm: 120,
      timeSignature: '4/4',
      createdAt: new Date()
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
        volume: 75
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

export const storage = new MemStorage();
