# Contributing to Tales Genie

Thanks for helping make bedtime stories better! Contributions of all kinds are welcome: bug reports, translations, docs, and code.

## Getting started

```sh
pnpm install
pnpm dev
```

That's it — with no Cloudflare credentials and no Gemini key, the API serves a **mock story**, so the full UI flow works offline. To exercise the real AI pipeline, run `npx wrangler dev` with a Cloudflare account (see the README).

## Before you open a PR

- Run the same checks CI runs:
  ```sh
  pnpm lint
  pnpm build   # runs astro check + tsc, then builds
  ```
- For anything bigger than a small fix, please open an issue first so we can agree on the approach.
- Keep PRs focused — one change per PR.

## Ground rules for story content

Tales Genie is for kids aged 3–8. Any change to prompts, models, or generation logic must preserve the kid-safety guarantees:

- Stories stay gentle, positive, and age-appropriate.
- Inappropriate prompts are redirected to wholesome themes, never refused harshly or echoed back.
- Abuse protections (rate limiting, prompt length caps) stay intact.

## Adding a language

Translations live in `src/locales/*.json`. To add a language:

1. Copy `src/locales/en.json` to a new file named after the [BCP 47 language code](https://en.wikipedia.org/wiki/IETF_language_tag) (e.g. `fr.json`).
2. Translate every string.
3. Register the language in three places:
   - the `translations` map (and `Language` type) in `src/utils/i18n.ts`
   - `supportedLanguages` in `src/components/StoryGenerator.astro`
   - `LANGUAGE_NAMES` in `src/pages/api/generate.ts` (the name the model is told to write in)
4. Check that story generation and the read-aloud voice work for the new language.

## Code of conduct

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).
