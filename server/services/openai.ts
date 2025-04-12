/**
 * OpenAI service
 * 
 * Provides access to OpenAI's models and APIs
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

/**
 * Generate a text response using OpenAI's GPT models
 */
export async function generateText(prompt: string, maxTokens: number = 500): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating text with OpenAI:", error);
    throw new Error("Failed to generate text with OpenAI");
  }
}

/**
 * Generate structured data using OpenAI's GPT models
 */
export async function generateJSON<T>(
  prompt: string, 
  systemPrompt: string = "You are a helpful assistant."
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(content) as T;
  } catch (error) {
    console.error("Error generating JSON with OpenAI:", error);
    throw new Error("Failed to generate JSON with OpenAI");
  }
}

/**
 * Transcribe audio using OpenAI's Whisper API
 */
export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at path: ${audioPath}`);
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio with OpenAI:", error);
    throw new Error("Failed to transcribe audio with OpenAI");
  }
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024",
  quality: "standard" | "hd" = "standard"
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality,
    });

    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating image with OpenAI:", error);
    throw new Error("Failed to generate image with OpenAI");
  }
}

/**
 * Process an image with GPT-4 Vision
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        }
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error("Failed to analyze image with OpenAI");
  }
}