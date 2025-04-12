import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { MusicGenerationJob, InsertMusicGenerationJob } from '@shared/schema';
import { IStorage } from '../storage';
import openaiService from './openai';

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
 * Simulates generating music based on the prompt
 * In a real implementation, this would use a music generation model or API
 */
async function generateMusicFile(prompt: string): Promise<string> {
  try {
    // In a production system, we would call an actual music generation API
    // For now, we'll use a sample file and generate a visualization
    
    // Get a detailed music description from the prompt
    const musicDescription = await openaiService.generateMusicDescription(prompt);
    
    // Generate a visualization for the music
    const visualizationPath = await openaiService.generateMusicVisualization(musicDescription);
    
    // For demo purposes, we'll "generate" music by copying a sample file
    // In a real implementation, this would be where we'd call a music generation model
    
    const uploadDir = await ensureUploadsDir("music");
    const outputFilename = `generated_music_${Date.now()}.wav`;
    const outputPath = path.join(uploadDir, outputFilename);
    
    // For now, we'll create a placeholder file
    // In a production system, this would be where the generated audio is saved
    await writeFileAsync(outputPath, 'Generated music placeholder');
    
    return `/uploads/music/${outputFilename}`;
  } catch (error) {
    console.error('Error generating music file:', error);
    throw error;
  }
}

/**
 * Process a music generation job
 */
export async function handleMusicGeneration(job: MusicGenerationJob, storage: IStorage): Promise<void> {
  try {
    // Update job status to processing
    await storage.updateMusicGenerationJob(job.id, {
      status: 'processing'
    });
    
    // Generate the music based on the prompt
    const outputPath = await generateMusicFile(job.prompt);
    
    // Update job with the output path
    await storage.updateMusicGenerationJob(job.id, {
      status: 'completed',
      outputPath
    });
    
    console.log(`Music generation job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Error processing music generation job ${job.id}:`, error);
    
    // Update job with error
    await storage.updateMusicGenerationJob(job.id, {
      status: 'failed',
      error: error.message
    });
  }
}

/**
 * Creates and processes a new music generation job
 */
export async function createAndProcessMusicGenerationJob(
  projectId: number,
  prompt: string,
  storage: IStorage
): Promise<MusicGenerationJob> {
  // Create a new job
  const insertJob: InsertMusicGenerationJob = {
    projectId,
    prompt,
    status: 'pending',
  };
  
  const job = await storage.createMusicGenerationJob(insertJob);
  
  // Process the job asynchronously
  handleMusicGeneration(job, storage).catch(err => {
    console.error('Error in music generation job:', err);
  });
  
  return job;
}

export default {
  handleMusicGeneration,
  createAndProcessMusicGenerationJob
};