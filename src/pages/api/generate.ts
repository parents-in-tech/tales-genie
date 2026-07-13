import type { APIRoute } from 'astro';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * $0 provider chain:
 *   text:   Gemini (if GOOGLE_GENERATIVE_AI_API_KEY set) -> Workers AI llama -> mock
 *   images: Workers AI flux-1-schnell (if AI binding)    -> placeholder
 * Everything degrades gracefully so the app always returns a story.
 */

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ne: 'Nepali',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  es: 'Spanish',
};

const MAX_PROMPT_CHARS = 300;
const MAX_SEGMENTS = 5;
const IMAGE_TIMEOUT_MS = 25_000;

// Per-isolate rate limit: good enough to stop casual abuse of the free quota.
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 6 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory guard
  return false;
}

const StorySchema = z.object({
  segments: z
    .array(
      z.object({
        text: z.string().describe('One scene of the story, 2-4 sentences'),
        imagePrompt: z
          .string()
          .describe('English description of an illustration for this scene'),
      })
    )
    .min(3)
    .max(MAX_SEGMENTS),
});

type Segment = { text: string; imagePrompt?: string; imageUrl?: string };

function systemPrompt(langName: string): string {
  return [
    'You are a gentle storyteller writing bedtime stories for children aged 3 to 8.',
    `Write the story text in ${langName}, using simple, warm language a young child understands.`,
    'The story must be kind and age-appropriate: no violence, cruelty, horror, death, romance, or frightening imagery. Conflicts are mild and always resolved with kindness. The ending is happy and reassuring.',
    'If the requested topic is inappropriate for young children, ignore the inappropriate parts and write a wholesome story loosely inspired by whatever safe elements remain.',
    `Structure the story as 3 to ${MAX_SEGMENTS} short scenes. For each scene provide an imagePrompt in English describing a soft, warm, storybook watercolor illustration of that scene (characters, setting, mood; no text in the image).`,
  ].join(' ');
}

// ---------- Text providers ----------

async function storyViaGemini(apiKey: string, prompt: string, langName: string) {
  const provider = createGoogleGenerativeAI({ apiKey });
  const { object } = await generateObject({
    model: provider('gemini-2.0-flash'),
    schema: StorySchema,
    system: systemPrompt(langName),
    prompt: `Write a story about: "${prompt}"`,
  });
  return object.segments;
}

async function storyViaWorkersAI(ai: any, prompt: string, langName: string) {
  const result = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: systemPrompt(langName) },
      { role: 'user', content: `Write a story about: "${prompt}"` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        type: 'object',
        properties: {
          segments: {
            type: 'array',
            minItems: 3,
            maxItems: MAX_SEGMENTS,
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                imagePrompt: { type: 'string' },
              },
              required: ['text', 'imagePrompt'],
            },
          },
        },
        required: ['segments'],
      },
    },
    max_tokens: 2048,
  });
  const parsed = typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
  const validated = StorySchema.parse(parsed);
  return validated.segments;
}

function mockStory(prompt: string, langName: string): Segment[] {
  const texts = [
    `Once upon a time, a curious child asked for a story about "${prompt}".`,
    'A brave little hero set off on an adventure, meeting kind friends along the way.',
    'Together they solved a tricky puzzle with patience and clever thinking.',
    `Everyone celebrated under the stars, and the tale (in ${langName}) ended with warm hugs and sweet dreams.`,
  ];
  return texts.map((text, i) => ({
    text,
    imagePrompt: `Storybook watercolor illustration, scene ${i + 1}`,
  }));
}

// ---------- Image provider ----------

async function imageViaWorkersAI(ai: any, prompt: string): Promise<string> {
  const result = await ai.run('@cf/black-forest-labs/flux-1-schnell', {
    prompt: `Soft warm children's storybook watercolor illustration, gentle colors, no text. ${prompt}`,
    steps: 6,
  });
  // flux-1-schnell returns { image: <base64 jpeg> }
  if (result?.image) return `data:image/jpeg;base64,${result.image}`;
  throw new Error('no image in response');
}

function placeholderImage(index: number): string {
  return `https://placehold.co/900x600/f3e8d3/7a6755?text=Scene+${index + 1}`;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

// ---------- Route ----------

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  let ip = 'unknown';
  try {
    ip = request.headers.get('cf-connecting-ip') || clientAddress || 'unknown';
  } catch {
    /* clientAddress throws on some dev setups */
  }
  if (rateLimited(ip)) {
    return json({ error: 'Too many stories at once — please try again in a few minutes.' }, 429);
  }

  let prompt: string;
  let lang: string;
  try {
    const body = await request.json();
    prompt = String(body.prompt ?? '').trim().slice(0, MAX_PROMPT_CHARS);
    lang = String(body.lang ?? 'en');
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  if (!prompt) return json({ error: 'Prompt is required' }, 400);
  const langName = LANGUAGE_NAMES[lang] ?? 'English';

  const env = (locals as any)?.runtime?.env ?? {};
  const geminiKey: string | undefined =
    env.GOOGLE_GENERATIVE_AI_API_KEY || import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || undefined;
  const ai = env.AI;

  // 1. Story text: try each available provider in order, ending with the mock.
  const textProviders: Array<[string, () => Promise<Segment[]>]> = [];
  if (geminiKey) textProviders.push(['gemini', () => storyViaGemini(geminiKey, prompt, langName)]);
  if (ai) textProviders.push(['workers-ai', () => storyViaWorkersAI(ai, prompt, langName)]);
  textProviders.push(['mock', async () => mockStory(prompt, langName)]);

  let segments: Segment[] = [];
  for (const [name, provider] of textProviders) {
    try {
      segments = await provider();
      break;
    } catch (e) {
      console.error(`text provider ${name} failed:`, e);
    }
  }
  if (segments.length === 0) {
    return json({ error: 'The genie could not write this story. Please try again.' }, 500);
  }

  // 2. Illustrations: all in parallel, individual failures fall back to placeholders
  const story: Segment[] = await Promise.all(
    segments.slice(0, MAX_SEGMENTS).map(async (segment, i) => {
      let imageUrl = placeholderImage(i);
      if (ai && segment.imagePrompt) {
        try {
          imageUrl = await withTimeout(imageViaWorkersAI(ai, segment.imagePrompt), IMAGE_TIMEOUT_MS);
        } catch (e) {
          console.error(`image ${i} failed:`, e);
        }
      }
      return { ...segment, imageUrl };
    })
  );

  return json({ story });
};
