
import type { APIRoute } from 'astro';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const provider = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const model = provider('gemini-2.0-flash-exp');

interface StorySegment {
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
}

async function generateStory(prompt: string, lang: string): Promise<StorySegment[]> {
  const result = await generateText({
    model,
    prompt: `Write a short story in ${lang} based on this prompt: "${prompt}". 
    For each major scene or moment in the story, suggest an image prompt that could illustrate that moment. 
    Return the response in JSON format with an array of segments, where each segment has 
    a "text" field for the story text and an "imagePrompt" field for the image description. 
    Do not include any markdown formatting or code blocks. Only return the raw JSON object.`
  });

  try {
    // Clean the response text to ensure we only have JSON
    const cleanJson = result.text.trim().replace(/^```json\s*|\s*```$/g, '');
    const response = JSON.parse(cleanJson);
    return response.segments || [];
  } catch (e) {
    console.error('Failed to parse JSON:', result.text);
    throw new Error('Failed to generate story: Invalid response format');
  }
}

async function generateImage(prompt: string): Promise<string> {
  const result = await generateText({
    model,
    prompt,
    providerOptions: {
      google: { responseModalities: ['TEXT', 'IMAGE'] }
    }
  });

  // Get the first image file from the response
  const imageFile = result.files?.[0];
  return imageFile ? `data:${imageFile.mimeType};base64,${imageFile.base64}` : `https://placehold.co/600x400?text=${encodeURIComponent(prompt)}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prompt, lang } = body;

    if (!prompt || !lang) {
      return new Response(JSON.stringify({ error: 'Prompt and language are required' }), { status: 400 });
    }

    const story = await generateStory(prompt, lang);

    for (const segment of story) {
      if (segment.imagePrompt) {
        segment.imageUrl = await generateImage(segment.imagePrompt);
      }
    }

    return new Response(JSON.stringify({ story }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An error occurred';
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
};
