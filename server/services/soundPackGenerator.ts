/**
 * Sound Pack Generator Service
 * 
 * Generates sound packs using AI capabilities
 */

import { promises as fs } from 'fs';
import path from 'path';
import { openai } from './openai';
import { anthropic } from './anthropic';
import * as uuid from 'crypto';

// Ensure the uploads directory exists
async function ensureUploadsDir(subdir: string = ""): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', subdir);
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

interface SoundPackConfig {
  name: string;
  category: 'drums' | 'bass' | 'synth' | 'fx' | 'vocals' | 'atmospheric';
  style: string;
  description: string;
  numberOfSamples: number;
  tempo?: number;
  key?: string;
  duration?: number; // in seconds
  includeVariations?: boolean;
}

interface SoundSample {
  name: string;
  description: string;
  path: string;
  duration: number;
  isAIGenerated: boolean;
  category: string;
  tags: string[];
}

export class SoundPackGenerator {
  /**
   * Generates a unique sound pack based on user configuration
   */
  async generateSoundPack(config: SoundPackConfig): Promise<SoundSample[]> {
    // Create a directory for this sound pack
    const packId = uuid.randomUUID().substring(0, 8);
    const packName = config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const packDir = await ensureUploadsDir(`packs/${packName}_${packId}`);
    
    // Generate sound descriptions first using Anthropic Claude
    const descriptions = await this.generateSoundDescriptions(config);
    
    // Process each description to create a sound
    const samples: SoundSample[] = [];
    
    for (let i = 0; i < descriptions.length; i++) {
      const desc = descriptions[i];
      
      try {
        // Generate unique sample name
        const sampleIndex = (i + 1).toString().padStart(2, '0');
        const sampleName = `${config.category}_${sampleIndex}`;
        const fileName = `${sampleName}_${packId}.wav`;
        const filePath = path.join(packDir, fileName);
        
        // For now, this is a placeholder since we're not generating actual audio yet
        // We'll return the descriptions to use with other audio generation tools
        const sample: SoundSample = {
          name: sampleName,
          description: desc,
          path: `/uploads/packs/${packName}_${packId}/${fileName}`,
          duration: config.duration || 2,
          isAIGenerated: true,
          category: config.category,
          tags: [config.style, config.category, 'ai-generated']
        };
        
        samples.push(sample);
      } catch (error) {
        console.error(`Error generating sample ${i + 1}:`, error);
      }
    }
    
    return samples;
  }
  
  /**
   * Generate descriptive prompts for each sound in the pack
   * Uses Anthropic Claude for creative and musical descriptions
   */
  private async generateSoundDescriptions(config: SoundPackConfig): Promise<string[]> {
    try {
      // Create a detailed prompt for Claude to generate sound descriptions
      const prompt = `Generate ${config.numberOfSamples} creative and detailed descriptions for ${config.category} samples in the style of "${config.style}". 
      
Overview: ${config.description}

Each description should be very specific and precise, focusing on the sonic characteristics, including:
- Specific synthesizer or instrument type
- Exact effects and processing
- Sound design parameters (attack, decay, sustain, release)
- Emotional qualities
- Technical specifications (frequency range, stereo width, etc.)

Make each description unique and highly detailed for professional music production.
${config.tempo ? `Tempo: ${config.tempo} BPM` : ''}
${config.key ? `Key: ${config.key}` : ''}

Format as a numbered list with each description being 1-2 sentences.`;

      // Get the response from Anthropic
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        system: "You are a professional sound designer and audio engineer with expertise in creating detailed, technically accurate descriptions of sounds for music production.",
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      // Parse the response to extract individual descriptions
      const content = response.content[0].text;
      if (!content) {
        throw new Error("Failed to generate sound descriptions");
      }
      
      // Extract numbered lines as individual descriptions
      const descriptionLines = content.split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => {
          // Remove the number and period
          return line.replace(/^\d+\.\s*/, '').trim();
        });
      
      // If we didn't get enough descriptions, pad with generic ones
      const results = [...descriptionLines];
      while (results.length < config.numberOfSamples) {
        results.push(`${config.category} sample in ${config.style} style with unique character and texture.`);
      }
      
      // Return only the requested number
      return results.slice(0, config.numberOfSamples);
    } catch (error) {
      console.error("Error generating sound descriptions:", error);
      
      // Fallback to basic descriptions
      return Array(config.numberOfSamples).fill('')
        .map((_, i) => `${config.category} sample ${i + 1} in ${config.style} style.`);
    }
  }
  
  /**
   * Generate beat patterns for drum packs
   */
  async generateBeatPatterns(style: string, beatsCount: number = 4): Promise<any[]> {
    try {
      const prompt = `Generate ${beatsCount} unique drum patterns for ${style} music.
Each pattern should include:
1. Time signature
2. Tempo range
3. Kick pattern (where 'x' marks a hit and '.' marks a rest)
4. Snare pattern
5. Hi-hat pattern
6. Any additional percussion elements
7. Brief description of the groove

Format the response as properly formatted JSON that can be parsed with JSON.parse().`;

      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "You are a professional drummer and beat programmer with expertise in all music genres."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to generate beat patterns");
      }
      
      try {
        const patterns = JSON.parse(content);
        return Array.isArray(patterns.patterns) ? patterns.patterns : [];
      } catch (jsonError) {
        console.error("Error parsing beat patterns JSON:", jsonError);
        return [];
      }
    } catch (error) {
      console.error("Error generating beat patterns:", error);
      return [];
    }
  }
  
  /**
   * Generate chord progressions for melody or bass packs
   */
  async generateChordProgressions(style: string, key: string, count: number = 4): Promise<any[]> {
    try {
      const prompt = `Generate ${count} unique chord progressions in the key of ${key} for ${style} music.
Each progression should include:
1. The roman numeral analysis
2. The actual chord names
3. A suggested bassline pattern
4. Emotional quality or usage suggestion
5. Any distinctive harmonic features

Format the response as properly formatted JSON that can be parsed with JSON.parse().`;

      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "You are a professional music theorist and composer with expertise in all music genres and harmony."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Failed to generate chord progressions");
      }
      
      try {
        const progressions = JSON.parse(content);
        return Array.isArray(progressions.progressions) ? progressions.progressions : [];
      } catch (jsonError) {
        console.error("Error parsing chord progressions JSON:", jsonError);
        return [];
      }
    } catch (error) {
      console.error("Error generating chord progressions:", error);
      return [];
    }
  }
}

export const soundPackGenerator = new SoundPackGenerator();