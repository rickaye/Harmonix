/**
 * Anthropic service
 * 
 * Provides access to Anthropic's Claude models and APIs
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export { anthropic };

/**
 * Generate a text response using Anthropic's Claude models
 */
export async function generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    // Extract text content from response
    if (response.content.length === 0) {
      throw new Error("Empty response from Anthropic");
    }
    
    return response.content[0].text || "";
  } catch (error) {
    console.error("Error generating text with Anthropic:", error);
    throw new Error("Failed to generate text with Anthropic");
  }
}

/**
 * Generate structured data using Anthropic's Claude models
 */
export async function generateJSON<T>(
  prompt: string, 
  systemPrompt: string = "You are a helpful assistant."
): Promise<T> {
  try {
    const jsonPrompt = `${prompt}\n\nProvide your response in valid JSON format that can be parsed with JSON.parse().`;
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: "user", content: jsonPrompt }
      ],
    });

    // Extract text content from response
    if (response.content.length === 0) {
      throw new Error("Empty response from Anthropic");
    }
    
    const content = response.content[0].text || "";
    
    // Try to extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                     content.match(/({[\s\S]*})/);
                     
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonContent) as T;
  } catch (error) {
    console.error("Error generating JSON with Anthropic:", error);
    throw new Error("Failed to generate JSON with Anthropic");
  }
}

/**
 * Generate creative writing using Anthropic's Claude models
 */
export async function generateCreativeWriting(
  prompt: string, 
  style: string = "professional", 
  maxTokens: number = 2000
): Promise<string> {
  try {
    const creativePrompt = `Write the following in a ${style} style:\n\n${prompt}`;
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: maxTokens,
      system: "You are a professional creative writer with expertise in various writing styles. Your task is to create engaging and high-quality content that matches the requested style.",
      messages: [
        { role: "user", content: creativePrompt }
      ],
    });

    // Extract text content from response
    if (response.content.length === 0) {
      throw new Error("Empty response from Anthropic");
    }
    
    return response.content[0].text || "";
  } catch (error) {
    console.error("Error generating creative writing with Anthropic:", error);
    throw new Error("Failed to generate creative writing with Anthropic");
  }
}

/**
 * Process an image with Claude Vision
 */
export async function analyzeImage(
  base64Image: string,
  prompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
    });

    // Extract text content from response
    if (response.content.length === 0) {
      throw new Error("Empty response from Anthropic");
    }
    
    return response.content[0].text || "";
  } catch (error) {
    console.error("Error analyzing image with Anthropic:", error);
    throw new Error("Failed to analyze image with Anthropic");
  }
}

/**
 * Parse multiline response into structured data
 */
export function parseMultilineResponse(response: string, itemPrefix: string = ''): string[] {
  // Split by newlines and filter out empty lines
  const lines = response.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If a prefix is specified, filter for lines that start with it and remove the prefix
  if (itemPrefix) {
    return lines
      .filter(line => line.startsWith(itemPrefix))
      .map(line => line.substring(itemPrefix.length).trim());
  }
  
  return lines;
}