import { defineCollection, z } from 'astro:content';

const storiesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

export const collections = {
  'stories': storiesCollection,
};
