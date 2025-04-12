// Track types and interfaces
export interface TrackData {
  id: number;
  name: string;
  type: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
}

export interface AudioClipData {
  id: number;
  name: string;
  trackId: number;
  path: string;
  startTime: number;
  duration: number;
  isAIGenerated: boolean;
}

export interface EffectData {
  id: number;
  name: string;
  type: string;
  trackId: number;
  settings: Record<string, any>;
  enabled: boolean;
}

export interface EQBand {
  frequency: number;
  gain: number;
}

export interface ReverbSettings {
  roomSize: number;
  dampening: number;
  width: number;
  wetDry: number;
  preset: string;
}

export interface CompressorSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
  makeupGain: number;
}

// Job interfaces
export interface StemSeparationJob {
  id: number;
  originalPath: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  projectId: number;
  outputPaths?: Record<string, string>;
}

export interface VoiceCloningJob {
  id: number;
  samplePath: string;
  text: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  projectId: number;
  outputPath?: string;
}

export interface MusicGenerationJob {
  id: number;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  projectId: number;
  outputPath?: string;
}
