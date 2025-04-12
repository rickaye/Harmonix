/**
 * AI Service - A unified interface for AI capabilities across multiple providers
 * 
 * This service orchestrates across OpenAI, Anthropic, and local Transformers models to provide
 * the best AI capabilities for different aspects of music creation, leveraging the strengths of each.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import openaiService from './openai';
import anthropicService from './anthropic';
import transformersService from './transformers';

// Convert callbacks to promises
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Ensures the uploads directory exists
 */
async function ensureUploadsDir(subdir: string = ""): Promise<string> {
  const uploadDir = path.join(process.cwd(), "uploads", subdir);
  
  if (!(await existsAsync(uploadDir))) {
    await mkdirAsync(uploadDir, { recursive: true });
  }
  
  return uploadDir;
}

/**
 * Music Description Service
 * 
 * Creates detailed music descriptions from prompts, using the best AI model for the task
 */
export class MusicDescriptionService {
  /**
   * Generate a detailed music description from a prompt
   * Uses Anthropic Claude for its creative abilities with music
   */
  async generateDescription(prompt: string): Promise<string> {
    try {
      return await anthropicService.generateMusicDescription(prompt);
    } catch (error) {
      console.warn("Anthropic service failed, falling back to OpenAI:", error);
      return await openaiService.generateMusicDescription(prompt);
    }
  }

  /**
   * Analyze a description to extract musical properties
   * Uses a combination of services for comprehensive analysis
   */
  async analyzeDescription(description: string): Promise<any> {
    try {
      // Detect genre and mood using Transformers for efficient local processing
      const [genreResult, moodResult] = await Promise.all([
        transformersService.zeroShotClassifier.detectGenre(description),
        transformersService.zeroShotClassifier.detectMood(description)
      ]);
      
      // Get detailed musical analysis from Anthropic
      const detailedAnalysis = await anthropicService.analyzeAudioCharacteristics(description);
      
      // Combine the results
      return {
        genre: {
          primary: genreResult.labels[0],
          scores: genreResult.scores.slice(0, 3).map((score: number, index: number) => ({
            genre: genreResult.labels[index],
            score
          }))
        },
        mood: {
          primary: moodResult.labels[0],
          scores: moodResult.scores.slice(0, 3).map((score: number, index: number) => ({
            mood: moodResult.labels[index],
            score
          }))
        },
        instruments: detailedAnalysis.instruments || [],
        tempo: detailedAnalysis.tempo,
        keySignature: detailedAnalysis.keySignature,
        structure: detailedAnalysis.structure
      };
    } catch (error) {
      console.error("Error analyzing music description:", error);
      throw error;
    }
  }
}

/**
 * Lyrics Generation Service
 * 
 * Creates lyrics for songs based on prompts and descriptions
 */
export class LyricsGenerationService {
  /**
   * Generate lyric suggestions
   * Uses Anthropic Claude for its creative writing abilities
   */
  async generateLyricSuggestions(prompt: string, genre: string = ""): Promise<string[]> {
    try {
      return await anthropicService.generateLyricSuggestions(prompt, genre);
    } catch (error) {
      console.warn("Anthropic service failed, falling back to text generator:", error);
      
      // Attempt to use local Transformers
      try {
        const generatedText = await transformersService.textGenerator.generateText(
          `Write lyrics for a ${genre} song about ${prompt}:`, 
          { max_new_tokens: 200 }
        );
        
        // Parse the generated text into lines
        const lines = generatedText.split('\n').filter(line => line.trim());
        return [generatedText];
      } catch (fallbackError) {
        console.error("All lyric generation methods failed:", fallbackError);
        throw error; // Throw the original error
      }
    }
  }

  /**
   * Generate music theory ideas for composing
   */
  async generateMusicTheory(prompt: string): Promise<any> {
    try {
      return await anthropicService.generateMusicTheoryIdeas(prompt);
    } catch (error) {
      console.error("Error generating music theory ideas:", error);
      throw error;
    }
  }
}

/**
 * Voice Analysis Service
 * 
 * Analyzes voice characteristics from audio samples
 */
export class VoiceAnalysisService {
  /**
   * Analyze a voice sample
   * Combines OpenAI's Whisper for transcription with Anthropic for analysis
   */
  async analyzeVoiceSample(audioFilePath: string): Promise<any> {
    try {
      // First, transcribe the audio using OpenAI's Whisper
      const fileStream = fs.createReadStream(audioFilePath);
      const openai = require('openai');
      const openaiClient = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const transcription = await openaiClient.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
      });
      
      // Then, analyze the transcription using Anthropic
      const analysis = await anthropicService.analyzeVoiceSample(audioFilePath, transcription.text);
      
      return {
        transcription: transcription.text,
        analysis
      };
    } catch (error) {
      console.error("Error analyzing voice sample:", error);
      throw error;
    }
  }
}

/**
 * Audio Classification Service
 * 
 * Classifies audio content and detects musical elements
 */
export class AudioClassificationService {
  /**
   * Classify an audio file
   * Uses local Transformers models for efficiency
   */
  async classifyAudioFile(audioFilePath: string): Promise<any> {
    try {
      return await transformersService.audioClassifier.classifyAudio(audioFilePath);
    } catch (error) {
      console.error("Error classifying audio file:", error);
      throw error;
    }
  }
}

/**
 * Visualization Service
 * 
 * Creates visualizations for music
 */
export class VisualizationService {
  /**
   * Generate a visualization for music
   * Uses Anthropic for creative description and OpenAI for image generation
   */
  async generateVisualization(description: string): Promise<string> {
    try {
      // Generate a detailed visualization description with Anthropic
      const visualizationPrompt = await anthropicService.generateVisualizationDescription(description);
      
      // Generate the actual image using OpenAI DALL-E
      return await openaiService.generateMusicVisualization(visualizationPrompt);
    } catch (error) {
      console.error("Error generating visualization:", error);
      throw error;
    }
  }
}

/**
 * Stem Separation Service
 * 
 * Provides instructions and analysis for stem separation
 */
export class StemSeparationService {
  /**
   * Get instructions for stem separation
   * Compares results from both Anthropic and OpenAI for comprehensive instructions
   */
  async getStemSeparationInstructions(description: string): Promise<any> {
    try {
      // Get instructions from both providers for more comprehensive analysis
      const [anthropicInstructions, openaiInstructions] = await Promise.all([
        anthropicService.getStemSeparationInstructions(description),
        openaiService.getStemSeparationInstructions(description)
      ]);
      
      // Combine the results, taking the best elements from each
      const combinedStems = new Map();
      
      // Add Anthropic stems
      if (anthropicInstructions.stems) {
        for (const stem of anthropicInstructions.stems) {
          combinedStems.set(stem.name, stem);
        }
      }
      
      // Add or enhance with OpenAI stems
      if (openaiInstructions.stems) {
        for (const stem of openaiInstructions.stems) {
          if (combinedStems.has(stem.name)) {
            // Enhance existing stem with additional information
            const existingStem = combinedStems.get(stem.name);
            combinedStems.set(stem.name, {
              ...existingStem,
              frequencies: stem.frequencies || existingStem.frequencies,
              characteristics: [existingStem.characteristics, stem.characteristics]
                .filter(Boolean)
                .join('. ')
            });
          } else {
            // Add new stem
            combinedStems.set(stem.name, stem);
          }
        }
      }
      
      return {
        stems: Array.from(combinedStems.values())
      };
    } catch (error) {
      console.error("Error getting stem separation instructions:", error);
      
      // Fall back to a single provider if one fails
      try {
        return await anthropicService.getStemSeparationInstructions(description);
      } catch (fallbackError) {
        try {
          return await openaiService.getStemSeparationInstructions(description);
        } catch (finalError) {
          throw error; // Throw the original error
        }
      }
    }
  }
}

// Create service instances
export const musicDescriptionService = new MusicDescriptionService();
export const lyricsGenerationService = new LyricsGenerationService();
export const voiceAnalysisService = new VoiceAnalysisService();
export const audioClassificationService = new AudioClassificationService();
export const visualizationService = new VisualizationService();
export const stemSeparationService = new StemSeparationService();

export default {
  musicDescriptionService,
  lyricsGenerationService,
  voiceAnalysisService,
  audioClassificationService,
  visualizationService,
  stemSeparationService
};