# Tales Genie

**Live at [talesgenie.parentsintech.org](https://talesgenie.parentsintech.org)**

AI-powered illustrated bedtime stories for kids, in six languages (English, नेपाली, हिन्दी, বাংলা, తెలుగు, Español). Type an idea, and the genie writes a gentle 3–5 scene story with a watercolor illustration for every scene — plus read-aloud narration in the story's language.

Built by [Parents in Tech](https://parentsintech.org). Runs entirely on Cloudflare's free tier: **$0 to host**.

![Tales Genie home page](screenshots/home.png)

<p align="center">
  <img src="screenshots/story-scene-1.jpg" width="49%" alt="Story scene: a shy red panda watching the moon from a tree" />
  <img src="screenshots/story-scene-2.jpg" width="49%" alt="Story scene: the red panda holding a glowing lantern at the festival" />
</p>

## How it works

Everything runs in one Cloudflare Worker:

- **Story text** — Cloudflare Workers AI (`llama-3.3-70b-instruct-fp8-fast`) with an enforced JSON schema. If a `GOOGLE_GENERATIVE_AI_API_KEY` secret is set, Gemini is used instead (better multilingual prose) with Workers AI as fallback.
- **Illustrations** — Workers AI (`flux-1-schnell`), generated in parallel with per-image timeouts and placeholder fallbacks.
- **Kid safety** — the system prompt constrains stories to gentle, age-appropriate content (ages 3–8) and redirects inappropriate prompts to wholesome themes.
- **Abuse protection** — per-IP rate limiting (6 stories / 10 min) and a 300-character prompt cap.
- **Read aloud** — browser Web Speech API, follows the selected story language.

With no Cloudflare AI binding and no Gemini key (e.g. plain local dev without wrangler auth), the API returns a mock story so the full UI flow works offline.

## Development

```sh
pnpm install
pnpm dev          # local dev; uses mock stories unless wrangler is authenticated
pnpm type-check   # astro check + tsc
pnpm build        # production build (runs type checks first)
npx wrangler dev  # run the real Worker locally (uses your Cloudflare account for AI)
```

## Deployment

```sh
npx wrangler deploy
```

Deploys to the custom domain configured in `wrangler.toml` (`talesgenie.parentsintech.org`). Requirements:

- `wrangler login` with access to the Cloudflare account in `wrangler.toml`
- Optional: `npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY` for Gemini text generation ([free key](https://aistudio.google.com/apikey))

Pushes to `main` also auto-deploy via GitHub Actions (`.github/workflows/deploy.yml`), which needs a `CLOUDFLARE_API_TOKEN` repository secret.

### Deploy your own

Want to run your own genie? It stays within Cloudflare's free tier:

1. Fork/clone this repo and sign up for a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
2. In `wrangler.toml`, set `account_id` to yours (`npx wrangler whoami` prints it) and **delete the `routes` block** — your Worker will get a free `*.workers.dev` URL. (Keep a `routes` block only if you have your own domain on Cloudflare.)
3. `npx wrangler login`, then `pnpm install && npx wrangler deploy`.
4. Optional: `npx wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY` for nicer multilingual prose.
5. Optional: for auto-deploy on push, add a `CLOUDFLARE_API_TOKEN` secret (Workers Scripts: Edit permission) to your GitHub fork.

## Costs

| Piece | Free tier |
|---|---|
| Cloudflare Workers | 100k requests/day |
| Workers AI | 10k neurons/day (≈20–40 illustrated stories) |
| Gemini (optional) | generous free tier, no card required |

## Contributing

Contributions are welcome — bug reports, translations, and code. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started (local dev works offline with mock stories, no accounts needed). Security issues: see [SECURITY.md](SECURITY.md).

## License

MIT
