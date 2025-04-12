import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';
const CLAUDE_VISION_MODEL = 'claude-3-7-sonnet-20250219';

// Create Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
 * Generate a text description for music based on a given prompt
 */
export async function generateMusicDescription(prompt: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `As a music expert, create a detailed musical description based on this prompt: "${prompt}". 
          Include specific information about genre, tempo, instruments, mood, structure, and any other 
          relevant musical elements. Be creative but precise in your description.`
        }
      ],
    });

    return response.content[0].text || "Unable to generate music description";
  } catch (error: any) {
    console.error("Error generating music description with Anthropic:", error);
    throw new Error(`Failed to generate music description: ${error.message}`);
  }
}

/**
 * Analyze an audio file for voice characteristics
 * This will be used in the voice cloning process
 */
export async function analyzeVoiceSample(audioFilePath: string, transcription: string): Promise<any> {
  try {
    // Since Anthropic can't directly process audio files, we need the transcription
    // provided from another service (like OpenAI's Whisper)
    
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: `You are a voice analysis expert. Analyze the following voice recording transcription and 
      provide detailed characteristics about the voice such as pitch, tone, accent, speaking style, 
      unique patterns, and any other notable features. Format your analysis as JSON.`,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Here's the transcription: "${transcription}"`
        }
      ],
    });

    // Parse the JSON from the response
    const responseText = response.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      // If the response isn't valid JSON, still return the text
      console.warn("Could not parse Anthropic response as JSON:", jsonError);
      return { analysis: responseText };
    }
  } catch (error: any) {
    console.error("Error analyzing voice sample with Anthropic:", error);
    throw new Error(`Failed to analyze voice sample: ${error.message}`);
  }
}

/**
 * Generate a visualization description for a music track
 */
export async function generateVisualizationDescription(description: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are an expert in music visualization design. Create a vivid and detailed 
          description of a visualization that would match the music described as: "${description}". 
          Focus on colors, shapes, movements, and overall aesthetic. The description should be 
          suitable for generating an image.`
        }
      ],
    });

    return response.content[0].text || "Unable to generate visualization description";
  } catch (error: any) {
    console.error("Error generating visualization description with Anthropic:", error);
    throw new Error(`Failed to generate visualization description: ${error.message}`);
  }
}

/**
 * Analyze audio characteristics from a description (for simulating audio analysis)
 */
export async function analyzeAudioCharacteristics(description: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: `You are an audio analysis expert. Assuming this is a music track description, provide 
      detailed information about potential musical elements, instruments, tempo, mood, and structure. 
      Format your analysis as JSON with keys for 'instruments', 'tempo', 'mood', 'structure', 
      'genre', and 'keySignature'.`,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on this description, what can you tell me about the audio: "${description}"`
        }
      ],
    });

    // Parse the JSON from the response
    const responseText = response.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      // If the response isn't valid JSON, still return the text
      console.warn("Could not parse Anthropic response as JSON:", jsonError);
      return { analysis: responseText };
    }
  } catch (error: any) {
    console.error("Error analyzing audio characteristics with Anthropic:", error);
    throw new Error(`Failed to analyze audio characteristics: ${error.message}`);
  }
}

/**
 * Generate stem separation instructions for an audio file
 */
export async function getStemSeparationInstructions(description: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: `You are an audio engineering expert. Create detailed instructions for separating 
      the stems of a music track based on its description. Include which elements to isolate, 
      frequency ranges to focus on, and any special processing needed. Format the response as JSON 
      with a 'stems' array containing objects with 'name', 'frequencies', and 'characteristics' properties.`,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Generate stem separation instructions for this track: "${description}"`
        }
      ],
    });

    // Parse the JSON from the response
    const responseText = response.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      // If the response isn't valid JSON, still return the text
      console.warn("Could not parse Anthropic response as JSON:", jsonError);
      return { 
        stems: [
          {
            name: "vocals",
            frequencies: "300Hz-3.5kHz",
            characteristics: "Primarily contains the human voice"
          },
          {
            name: "drums",
            frequencies: "60Hz-12kHz",
            characteristics: "Contains percussion and rhythmic elements"
          },
          {
            name: "bass",
            frequencies: "40Hz-250Hz",
            characteristics: "Contains low frequency bass instruments"
          },
          {
            name: "other",
            frequencies: "Full spectrum",
            characteristics: "Contains all other musical elements"
          }
        ]
      };
    }
  } catch (error: any) {
    console.error("Error generating stem separation instructions with Anthropic:", error);
    throw new Error(`Failed to generate stem separation instructions: ${error.message}`);
  }
}

/**
 * Generate creative lyric suggestions based on a prompt
 */
export async function generateLyricSuggestions(prompt: string, genre: string = ""): Promise<string[]> {
  try {
    const genreContext = genre ? ` in the ${genre} genre` : "";
    
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `As a songwriting expert, create 3-5 different lyric ideas${genreContext} based on this concept: "${prompt}". 
          For each suggestion, provide a title and 2-4 lines of lyrics that capture the essence of the concept. 
          Make each suggestion distinct in style and tone. Format your response as JSON with an array of objects, 
          each containing a 'title' and 'lyrics' property.`
        }
      ],
    });

    const responseText = response.content[0].text;
    try {
      const parsed = JSON.parse(responseText);
      return parsed.map((item: any) => `${item.title}\n${item.lyrics}`);
    } catch (jsonError) {
      // If not valid JSON, extract suggestions by parsing the text
      console.warn("Could not parse Anthropic lyric suggestions as JSON:", jsonError);
      const lines = responseText.split('\n').filter(line => line.trim().length > 0);
      const suggestions: string[] = [];
      let currentSuggestion = '';
      
      for (const line of lines) {
        if (line.match(/^\d+\.\s/) || line.match(/^Title:/i)) {
          if (currentSuggestion) suggestions.push(currentSuggestion.trim());
          currentSuggestion = line;
        } else {
          currentSuggestion += '\n' + line;
        }
      }
      
      if (currentSuggestion) suggestions.push(currentSuggestion.trim());
      return suggestions.length ? suggestions : [responseText];
    }
  } catch (error: any) {
    console.error("Error generating lyric suggestions with Anthropic:", error);
    throw new Error(`Failed to generate lyric suggestions: ${error.message}`);
  }
}

/**
 * Generate creative melody and chord progression ideas
 */
export async function generateMusicTheoryIdeas(prompt: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: `You are a music theory expert. When asked about melody or chord ideas, provide creative 
      and technically sound music theory suggestions. Include chord progressions, scale suggestions, 
      melodic motifs, and rhythm patterns that would work for the given prompt. Format your response 
      as JSON with 'chords', 'melody', 'rhythm', and 'additional_suggestions' properties.`,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `I need music theory ideas for a piece with this description: "${prompt}". 
          Provide chord progressions, melody ideas, and rhythm patterns that would work well.`
        }
      ],
    });

    // Parse the JSON from the response
    const responseText = response.content[0].text;
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      // If the response isn't valid JSON, still return the text
      console.warn("Could not parse Anthropic music theory response as JSON:", jsonError);
      return { suggestions: responseText };
    }
  } catch (error: any) {
    console.error("Error generating music theory ideas with Anthropic:", error);
    throw new Error(`Failed to generate music theory ideas: ${error.message}`);
  }
}

export default {
  generateMusicDescription,
  analyzeVoiceSample,
  generateVisualizationDescription,
  analyzeAudioCharacteristics,
  getStemSeparationInstructions,
  generateLyricSuggestions,
  generateMusicTheoryIdeas
};