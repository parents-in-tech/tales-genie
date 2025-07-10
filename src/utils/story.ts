import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

interface StorySegment {
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
}

export async function generateStory(prompt: string): Promise<StorySegment[]> {
  const provider = createGoogleGenerativeAI({
    apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY
  });

  const model = provider('gemini-2.0-flash-exp');

  const result = await generateText({
    model,
    prompt: `Write a short story based on this prompt: "${prompt}". 
    For each major scene or moment in the story, suggest an image prompt that could illustrate that moment. 
    Return the response in JSON format with an array of segments, where each segment has 
    a "text" field for the story text and an "imagePrompt" field for the image description. 
    Do not include any markdown formatting or code blocks. Only return the raw JSON object.`
  });

  try {
    const cleanJson = result.text.trim().replace(/^```json\s*|\s*```$/g, '');
    const response = JSON.parse(cleanJson);
    return response.segments || [];
  } catch (e) {
    console.error('Failed to parse JSON:', result.text);
    throw new Error('Failed to generate story: Invalid response format');
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const provider = createGoogleGenerativeAI({
    apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY
  });

  const model = provider('gemini-2.0-flash-exp');

  const result = await generateText({
    model,
    prompt,
    providerOptions: {
      google: { responseModalities: ['TEXT', 'IMAGE'] }
    }
  });

  const imageFile = result.files?.[0];
  return imageFile ? `data:${imageFile.mimeType};base64,${imageFile.base64}` : `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
} 