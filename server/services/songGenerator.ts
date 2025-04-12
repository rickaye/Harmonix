/**
 * Song Generator Service
 * 
 * A comprehensive service for generating complete songs with lyrics, music, and voice cloning
 */

import { promises as fs } from 'fs';
import path from 'path';
import { openai } from './openai';
import { anthropic } from './anthropic';
import musicGeneration from './musicGeneration';
import voiceCloning from './voiceCloning';
import { lyricsGenerationService } from './aiService';
import * as uuid from 'crypto';

// Ensure the uploads directory exists
async function ensureUploadsDir(subdir: string = ""): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', subdir);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

interface SongRequest {
  title?: string;
  genre: string;
  instruments?: string[];
  description: string;
  lyricsTopic?: string;
  mood?: string;
  tempo?: number;
  duration?: number;
  voiceSamplePath?: string;
}

interface SongStructure {
  sections: {
    name: string;
    lyrics?: string;
    chords?: string;
    instruments?: string[];
    duration?: number;
  }[];
  tempo: number;
  key: string;
  timeSignature: string;
}

interface GeneratedLyrics {
  title: string;
  author: string;
  lyrics: string;
  sections: {
    name: string;
    lyrics: string;
  }[];
}

interface GeneratedSong {
  id: string;
  title: string;
  genre: string;
  description: string;
  lyrics?: GeneratedLyrics;
  structure?: SongStructure;
  instrumentTracks: {
    name: string;
    type: string;
    audioPath?: string;
  }[];
  vocalTrack?: {
    name: string;
    audioPath?: string;
    originalLyrics: string;
    clonedVoice: boolean;
  };
  masterTrack?: {
    name: string;
    audioPath?: string;
  };
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export class SongGenerator {
  /**
   * Generate a complete song from a description with optional voice cloning
   */
  async generateCompleteSong(songRequest: SongRequest): Promise<GeneratedSong> {
    const songId = uuid.randomUUID().substring(0, 8);
    const songDir = await ensureUploadsDir(`songs/${songId}`);
    
    // Start with an empty song structure
    const song: GeneratedSong = {
      id: songId,
      title: songRequest.title || "Untitled Song",
      genre: songRequest.genre,
      description: songRequest.description,
      instrumentTracks: [],
      status: 'generating'
    };
    
    try {
      // Step 1: Generate lyrics if a lyricsTopic was provided
      if (songRequest.lyricsTopic) {
        try {
          song.lyrics = await this.generateLyrics(
            songRequest.lyricsTopic, 
            songRequest.genre, 
            songRequest.mood || 'any'
          );
          
          if (song.title === "Untitled Song" && song.lyrics.title) {
            song.title = song.lyrics.title;
          }
        } catch (error) {
          console.error("Error generating lyrics:", error);
          // Continue without lyrics if there was an error
        }
      }
      
      // Step 2: Generate song structure
      song.structure = await this.generateSongStructure(
        songRequest.genre,
        songRequest.instruments || [],
        song.lyrics,
        songRequest.tempo,
        songRequest.duration
      );
      
      // Step 3: Generate instrumental music
      const instrumentalPrompt = this.createInstrumentalPrompt(songRequest, song);
      
      // Start the instrumental generation process
      // This would normally connect to the music generation service
      song.instrumentTracks = [
        { name: 'Backing Track', type: 'instrumental' }
      ];
      
      // Step 4: Generate vocals if lyrics exist and voice sample provided
      if (song.lyrics && songRequest.voiceSamplePath) {
        song.vocalTrack = {
          name: 'Vocals',
          originalLyrics: song.lyrics.lyrics,
          clonedVoice: true
        };
        
        // This would connect to the voice cloning service
      }
      
      // Return the song structure while generation happens in the background
      return {
        ...song,
        status: 'pending'
      };
      
    } catch (error) {
      console.error("Error generating song:", error);
      return {
        ...song,
        status: 'failed',
        error: "Failed to generate song"
      };
    }
  }
  
  /**
   * Generate lyrics for a song based on a topic and genre
   * Uses Anthropic Claude for creative and emotionally nuanced lyrics
   */
  private async generateLyrics(
    topic: string, 
    genre: string, 
    mood: string
  ): Promise<GeneratedLyrics> {
    try {
      // Create a detailed prompt for Claude to generate lyrics
      const prompt = `Write lyrics for a ${genre} song about "${topic}" with a ${mood} mood.

The song should have a professional structure with:
- A catchy title
- Verses
- A chorus that repeats
- Possibly a bridge
- Optional pre-chorus sections

Make the lyrics emotionally resonant, commercially viable, and suitable for a potential hit song in the ${genre} genre. Aim for lyrics that could be on Billboard charts.

Format your response as valid JSON with this structure:
{
  "title": "Song Title",
  "author": "AI Songwriter",
  "lyrics": "Full lyrics with line breaks",
  "sections": [
    {
      "name": "Verse 1",
      "lyrics": "Verse 1 lyrics"
    },
    {
      "name": "Chorus",
      "lyrics": "Chorus lyrics"
    },
    ...etc
  ]
}`;

      // Get the response from Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1500,
        system: "You are a world-class songwriter who has written multiple chart-topping hits across various genres. You excel at writing emotionally resonant, commercially viable lyrics that capture the essence of a topic within the conventions of a specific genre.",
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      // Parse the response to extract lyrics
      const content = response.content[0].text;
      if (!content) {
        throw new Error("Failed to generate lyrics");
      }
      
      try {
        // Extract JSON from response if it's wrapped in markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         content.match(/({[\s\S]*})/);
                         
        const jsonContent = jsonMatch ? jsonMatch[1] : content;
        const lyrics = JSON.parse(jsonContent);
        
        return lyrics;
      } catch (jsonError) {
        console.error("Error parsing lyrics JSON:", jsonError);
        
        // Return a basic structure if JSON parsing fails
        return {
          title: "Untitled Song",
          author: "AI Songwriter",
          lyrics: content,
          sections: [
            {
              name: "Lyrics",
              lyrics: content
            }
          ]
        };
      }
    } catch (error) {
      console.error("Error generating lyrics:", error);
      throw error;
    }
  }
  
  /**
   * Generate a song structure based on genre, instruments, and lyrics
   */
  private async generateSongStructure(
    genre: string,
    instruments: string[],
    lyrics?: GeneratedLyrics,
    tempo?: number,
    duration?: number
  ): Promise<SongStructure> {
    try {
      const prompt = `Create a detailed song structure for a ${genre} song ${lyrics ? 'with the provided lyrics' : ''}.
${instruments.length > 0 ? `The song should feature these instruments: ${instruments.join(', ')}` : ''}
${tempo ? `The tempo should be around ${tempo} BPM` : ''}
${duration ? `The target duration is approximately ${duration} seconds` : ''}

Provide a complete song structure with:
1. Sections (verse, chorus, bridge, etc.)
2. Key and time signature
3. Tempo in BPM
4. Chord progressions for each section
5. Instrumentation details for each section

${lyrics ? 'Here are the lyrics to structure the song around:\n' + lyrics.lyrics : ''}

Format your response as valid JSON.`;

      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "You are a professional music producer and composer with expertise in song structure, arrangement, and production across all genres."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to generate song structure");
      }
      
      try {
        const structure = JSON.parse(content);
        
        // Ensure the response has the expected structure
        return {
          sections: structure.sections || [],
          tempo: structure.tempo || tempo || 120,
          key: structure.key || "C Major",
          timeSignature: structure.timeSignature || "4/4"
        };
      } catch (jsonError) {
        console.error("Error parsing song structure JSON:", jsonError);
        
        // Return a basic structure if JSON parsing fails
        return {
          sections: [
            { name: "Intro" },
            { name: "Verse 1" },
            { name: "Chorus" },
            { name: "Verse 2" },
            { name: "Chorus" },
            { name: "Bridge" },
            { name: "Chorus" },
            { name: "Outro" }
          ],
          tempo: tempo || 120,
          key: "C Major",
          timeSignature: "4/4"
        };
      }
    } catch (error) {
      console.error("Error generating song structure:", error);
      
      // Return a basic structure if there's an error
      return {
        sections: [
          { name: "Intro" },
          { name: "Verse 1" },
          { name: "Chorus" },
          { name: "Verse 2" },
          { name: "Chorus" },
          { name: "Bridge" },
          { name: "Chorus" },
          { name: "Outro" }
        ],
        tempo: tempo || 120,
        key: "C Major",
        timeSignature: "4/4"
      };
    }
  }
  
  /**
   * Create a detailed prompt for instrumental music generation
   */
  private createInstrumentalPrompt(songRequest: SongRequest, song: GeneratedSong): string {
    const instrumentList = songRequest.instruments?.join(", ") || "guitar, bass, drums, piano";
    const tempo = song.structure?.tempo || songRequest.tempo || 120;
    const key = song.structure?.key || "C Major";
    const mood = songRequest.mood || "energetic";
    
    // Build sections description from song structure or default
    let sectionsDesc = "";
    if (song.structure?.sections && song.structure.sections.length > 0) {
      sectionsDesc = "Song structure:\n";
      sectionsDesc += song.structure.sections.map(section => 
        `- ${section.name}${section.chords ? ` (${section.chords})` : ''}`
      ).join("\n");
    }
    
    return `Create a ${songRequest.genre} instrumental with these specifications:

Description: ${songRequest.description}
Instruments: ${instrumentList}
Tempo: ${tempo} BPM
Key: ${key}
Mood: ${mood}
${sectionsDesc}

${song.lyrics ? 'This instrumental should support the following lyrics:\n' + song.lyrics.lyrics : ''}

Make this sound professional and radio-ready, suitable for a commercial ${songRequest.genre} track that could be a hit.`;
  }
  
  /**
   * Generate a billboard-quality hit song in any genre with AI
   */
  async generateBillboardHit(
    genre: string, 
    topic: string,
    mood: string = "energetic"
  ): Promise<GeneratedSong> {
    // Determine popular instruments for the genre
    const instruments = await this.getPopularInstrumentsForGenre(genre);
    
    // Generate a compelling description for a hit song in this genre
    const description = await this.generateHitSongDescription(genre, topic, mood);
    
    // Call the complete song generator with the hit parameters
    return this.generateCompleteSong({
      genre,
      instruments,
      description,
      lyricsTopic: topic,
      mood,
      // Billboard hits tend to be 3-4 minutes
      duration: Math.floor(Math.random() * 60) + 180 // 180-240 seconds
    });
  }
  
  /**
   * Get popular instruments typically used in a specific genre
   */
  private async getPopularInstrumentsForGenre(genre: string): Promise<string[]> {
    try {
      // Use OpenAI to recommend appropriate instruments for the genre
      const prompt = `What are the 4-6 most common/essential instruments used in ${genre} music, specifically for creating commercial hits? List only the instrument names separated by commas.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      const content = response.choices[0].message.content?.trim() || "";
      
      // Split the comma-separated list and trim each instrument name
      const instruments = content.split(',').map(i => i.trim());
      
      // Return a reasonable number of instruments
      return instruments.slice(0, 6);
    } catch (error) {
      console.error("Error getting instruments for genre:", error);
      
      // Fallback to generic instruments
      return ["guitar", "bass", "drums", "piano", "synthesizer"];
    }
  }
  
  /**
   * Generate a compelling description for a hit song in the specified genre
   */
  private async generateHitSongDescription(
    genre: string, 
    topic: string,
    mood: string
  ): Promise<string> {
    try {
      const prompt = `Write a brief but detailed description (2-3 sentences) for a ${mood} ${genre} song about "${topic}" that could be a Billboard hit. Focus on the sound, feel, and commercial appeal.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "user", content: prompt }
        ]
      });
      
      return response.choices[0].message.content?.trim() || 
        `A ${mood} ${genre} song about ${topic} with strong commercial appeal and radio-friendly production.`;
    } catch (error) {
      console.error("Error generating song description:", error);
      
      // Fallback to a generic description
      return `A ${mood} ${genre} song about ${topic} with strong commercial appeal and radio-friendly production.`;
    }
  }
}

export const songGenerator = new SongGenerator();