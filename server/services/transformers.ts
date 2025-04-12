import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from '@xenova/transformers';

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
 * Class for audio classification using the Transformers.js library
 */
export class AudioClassifier {
  private classifier: any = null;
  private ready: boolean = false;
  private loading: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the audio classifier
   */
  private async initialize() {
    if (this.loading) return this.loading;

    this.loading = (async () => {
      try {
        console.log('Initializing audio classifier...');
        // Initialize the audio classification pipeline with a suitable model
        // For music tasks, we're using a model fine-tuned for audio classification
        this.classifier = await pipeline('audio-classification', 'Xenova/yamnet');
        this.ready = true;
        console.log('Audio classifier initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize audio classifier:', error);
        this.ready = false;
      }
    })();

    return this.loading;
  }

  /**
   * Classify an audio file to detect instruments, genres, and other audio characteristics
   */
  async classifyAudio(audioFilePath: string): Promise<any> {
    if (!this.ready) {
      await this.initialize();
    }

    try {
      // Read the audio file
      const audioBuffer = await readFileAsync(audioFilePath);
      
      // Classify the audio
      const result = await this.classifier(audioBuffer, {
        topk: 10 // Return top 10 predictions
      });
      
      return {
        classifications: result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error classifying audio:', error);
      throw new Error(`Failed to classify audio: ${error.message}`);
    }
  }
}

/**
 * Class for text generation using the Transformers.js library
 */
export class TextGenerator {
  private generator: any = null;
  private ready: boolean = false;
  private loading: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the text generator
   */
  private async initialize() {
    if (this.loading) return this.loading;

    this.loading = (async () => {
      try {
        console.log('Initializing text generator...');
        // Initialize the text generation pipeline with a suitable model
        this.generator = await pipeline('text-generation', 'Xenova/distilgpt2');
        this.ready = true;
        console.log('Text generator initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize text generator:', error);
        this.ready = false;
      }
    })();

    return this.loading;
  }

  /**
   * Generate lyrics or text based on a prompt
   */
  async generateText(prompt: string, options: any = {}): Promise<string> {
    if (!this.ready) {
      await this.initialize();
    }

    try {
      const defaultOptions = {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.2
      };
      
      const generationOptions = { ...defaultOptions, ...options };
      const result = await this.generator(prompt, generationOptions);
      
      return result[0].generated_text;
    } catch (error: any) {
      console.error('Error generating text:', error);
      throw new Error(`Failed to generate text: ${error.message}`);
    }
  }
}

/**
 * Class for zero-shot classification using the Transformers.js library
 */
export class ZeroShotClassifier {
  private classifier: any = null;
  private ready: boolean = false;
  private loading: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the zero-shot classifier
   */
  private async initialize() {
    if (this.loading) return this.loading;

    this.loading = (async () => {
      try {
        console.log('Initializing zero-shot classifier...');
        // Initialize the zero-shot classification pipeline with a suitable model
        this.classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
        this.ready = true;
        console.log('Zero-shot classifier initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize zero-shot classifier:', error);
        this.ready = false;
      }
    })();

    return this.loading;
  }

  /**
   * Classify text into music genres, moods, or other categories
   */
  async classifyText(text: string, labels: string[]): Promise<any> {
    if (!this.ready) {
      await this.initialize();
    }

    try {
      const result = await this.classifier(text, labels);
      return result;
    } catch (error: any) {
      console.error('Error classifying text:', error);
      throw new Error(`Failed to classify text: ${error.message}`);
    }
  }

  /**
   * Detect genre from a music description
   */
  async detectGenre(description: string): Promise<any> {
    const genres = [
      'rock', 'pop', 'hip hop', 'rap', 'jazz', 'blues', 'classical', 
      'electronic', 'dance', 'r&b', 'country', 'folk', 'metal',
      'punk', 'indie', 'ambient', 'lo-fi', 'trap', 'techno',
      'house', 'dubstep', 'funk', 'soul', 'reggae', 'disco'
    ];
    
    return await this.classifyText(description, genres);
  }

  /**
   * Detect mood from a music description
   */
  async detectMood(description: string): Promise<any> {
    const moods = [
      'happy', 'sad', 'energetic', 'calm', 'relaxed', 'aggressive',
      'melancholic', 'uplifting', 'romantic', 'nostalgic', 'dreamy',
      'tense', 'dramatic', 'peaceful', 'mysterious', 'playful',
      'dark', 'ethereal', 'sentimental', 'triumphant', 'ominous'
    ];
    
    return await this.classifyText(description, moods);
  }
}

// Create singletons
const audioClassifier = new AudioClassifier();
const textGenerator = new TextGenerator();
const zeroShotClassifier = new ZeroShotClassifier();

export default {
  audioClassifier,
  textGenerator,
  zeroShotClassifier
};