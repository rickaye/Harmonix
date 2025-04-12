import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";
const OPENAI_IMAGE_MODEL = "dall-e-3";
const OPENAI_AUDIO_MODEL = "whisper-1";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Convert callbacks to promises
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

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
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a music expert that can translate user descriptions into detailed musical descriptions. 
          Include information about genre, tempo, instruments, mood, structure, and any other relevant details.
          Be specific and creative.`
        },
        {
          role: "user",
          content: `Create a detailed musical description for: "${prompt}"`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate music description";
  } catch (error) {
    console.error("Error generating music description:", error);
    throw new Error(`Failed to generate music description: ${error.message}`);
  }
}

/**
 * Analyze an audio file for voice characteristics
 * This will be used in the voice cloning process
 */
export async function analyzeVoiceSample(audioFilePath: string): Promise<any> {
  try {
    const fileStream = fs.createReadStream(audioFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: OPENAI_AUDIO_MODEL,
    });

    // Get detailed voice characteristics
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a voice analysis expert. Analyze the following voice recording transcription and 
          provide detailed characteristics about the voice such as pitch, tone, accent, speaking style, 
          unique patterns, and any other notable features. Format your analysis as JSON.`
        },
        {
          role: "user",
          content: `Here's the transcription: "${transcription.text}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing voice sample:", error);
    throw new Error(`Failed to analyze voice sample: ${error.message}`);
  }
}

/**
 * Generate a visualization for a music track
 */
export async function generateMusicVisualization(description: string): Promise<string> {
  try {
    // First, get a detailed description for the visualization
    const promptResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert in music visualization design. Create a vivid and detailed 
          description of a visualization that would match the music described. Focus on colors, 
          shapes, movements, and overall aesthetic. The description should be suitable for DALL-E to create an image.`
        },
        {
          role: "user", 
          content: `Create a visualization description for music described as: "${description}"`
        }
      ]
    });
    
    const visualizationPrompt = promptResponse.choices[0].message.content;
    
    // Now generate the actual image
    const imageResponse = await openai.images.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: visualizationPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json"
    });
    
    // Save the image to file
    const uploadDir = await ensureUploadsDir("visualizations");
    const filename = `visualization_${Date.now()}.png`;
    const filePath = path.join(uploadDir, filename);
    
    // The image data is base64 encoded
    const imageData = imageResponse.data[0].b64_json;
    await writeFileAsync(filePath, Buffer.from(imageData, 'base64'));
    
    return `/uploads/visualizations/${filename}`;
  } catch (error) {
    console.error("Error generating music visualization:", error);
    throw new Error(`Failed to generate music visualization: ${error.message}`);
  }
}

/**
 * Analyze audio characteristics from a file
 */
export async function analyzeAudioFile(audioFilePath: string): Promise<any> {
  try {
    // This would be enhanced with actual audio processing libraries
    // For now, we'll use OpenAI to do text-based analysis based on a transcription
    
    const fileStream = fs.createReadStream(audioFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: OPENAI_AUDIO_MODEL,
    });
    
    // Get detailed audio analysis
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an audio analysis expert. Assuming this is a music track, analyze the following 
          transcription and provide detailed information about potential musical elements, instruments, tempo, 
          mood, and structure. Format your analysis as JSON.`
        },
        {
          role: "user",
          content: `Based on this transcription, what can you tell me about the audio: "${transcription.text}"`
        }
      ],
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing audio file:", error);
    throw new Error(`Failed to analyze audio file: ${error.message}`);
  }
}

/**
 * Generate stem separation instructions for an audio file
 */
export async function getStemSeparationInstructions(description: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an audio engineering expert. Create detailed instructions for separating 
          the stems of a music track based on its description. Include which elements to isolate, 
          frequency ranges to focus on, and any special processing needed. Format the response as JSON 
          with a 'stems' array containing objects with 'name', 'frequencies', and 'characteristics' properties.`
        },
        {
          role: "user",
          content: `Generate stem separation instructions for this track: "${description}"`
        }
      ],
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating stem separation instructions:", error);
    throw new Error(`Failed to generate stem separation instructions: ${error.message}`);
  }
}

export default {
  generateMusicDescription,
  analyzeVoiceSample,
  generateMusicVisualization,
  analyzeAudioFile,
  getStemSeparationInstructions,
};