/**
 * Voice to Song Service
 * 
 * A specialized service for creating songs using voice cloning to generate vocals
 */

import { promises as fs } from 'fs';
import path from 'path';
import { openai } from './openai';
import { anthropic } from './anthropic';
import voiceCloning from './voiceCloning';
import { songGenerator } from './songGenerator';
import { storage } from '../storage';
import * as uuid from 'crypto';

// Ensure the uploads directory exists
async function ensureUploadsDir(subdir: string = ""): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', subdir);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

interface VoiceToSongRequest {
  projectId: number;
  voiceSamplePath: string;
  genre: string;
  lyricsTopic: string;
  mood?: string;
  instruments?: string[];
  tempo?: number;
  duration?: number;
}

interface VoiceToSongResult {
  id: string;
  projectId: number;
  title: string;
  genre: string;
  lyrics: string;
  instrumentalPath?: string;
  vocalPath?: string;
  fullMixPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class VoiceToSongService {
  /**
   * Generate a complete song using voice cloning
   */
  async generateSongWithClonedVoice(request: VoiceToSongRequest): Promise<VoiceToSongResult> {
    // Create a unique ID for this song generation
    const songId = uuid.randomUUID().substring(0, 8);
    
    // Create initial result object
    const result: VoiceToSongResult = {
      id: songId,
      projectId: request.projectId,
      title: `${request.genre} song about ${request.lyricsTopic}`,
      genre: request.genre,
      lyrics: '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Step 1: Generate the song structure and lyrics
      const songDescription = await this.generateSongDescription(
        request.genre, 
        request.lyricsTopic, 
        request.mood || 'energetic'
      );
      
      // Generate song with lyrics using the song generator service
      const generatedSong = await songGenerator.generateCompleteSong({
        genre: request.genre,
        instruments: request.instruments,
        description: songDescription,
        lyricsTopic: request.lyricsTopic,
        mood: request.mood,
        tempo: request.tempo,
        duration: request.duration,
        voiceSamplePath: request.voiceSamplePath
      });
      
      // Update the result with the generated song info
      result.title = generatedSong.title;
      if (generatedSong.lyrics) {
        result.lyrics = generatedSong.lyrics.lyrics;
      }
      
      // Step 2: Start the voice cloning process (in a real implementation)
      // This would create vocal tracks from the lyrics using the voice sample
      
      // For now, we just update the status
      result.status = 'processing';
      result.updatedAt = new Date();
      
      return result;
    } catch (error) {
      console.error("Error generating song with cloned voice:", error);
      
      result.status = 'failed';
      result.error = "Failed to generate song";
      result.updatedAt = new Date();
      
      return result;
    }
  }
  
  /**
   * Generate a compelling description for the song
   */
  private async generateSongDescription(
    genre: string, 
    topic: string,
    mood: string
  ): Promise<string> {
    try {
      const prompt = `Write a brief but detailed description (2-3 sentences) for a ${mood} ${genre} song about "${topic}". Focus on the sound, feel, and style.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.choices[0].message.content?.trim() || 
        `A ${mood} ${genre} song about ${topic} with commercial appeal and professional production.`;
    } catch (error) {
      console.error("Error generating song description:", error);
      
      // Fallback to a generic description
      return `A ${mood} ${genre} song about ${topic} with commercial appeal and professional production.`;
    }
  }
  
  /**
   * Create vocal parts from lyrics using voice cloning
   * This would connect to the voice cloning service
   */
  private async generateVocalsFromLyrics(
    voiceSamplePath: string,
    lyrics: string,
    song: any
  ): Promise<string> {
    // This is a placeholder for the actual voice cloning implementation
    const vocalsDir = await ensureUploadsDir(`songs/${song.id}/vocals`);
    const outputPath = path.join(vocalsDir, 'vocals.wav');
    
    // In a real implementation, this would call the voice cloning service
    // to generate vocals based on the lyrics and voice sample
    
    return outputPath;
  }
}

export const voiceToSongService = new VoiceToSongService();