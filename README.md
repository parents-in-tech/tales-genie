# AI Story Generator

An AI-powered story generator built with Astro and Google's Gemini API. This application creates engaging stories with inline images generated along the plot line.

## Features

- AI-powered story generation using Google's Gemini model
- Automatic image generation for story segments
- Responsive design with Tailwind CSS
- Server-side rendering with Astro
- Contact form for user feedback
- About page with project information

## Tech Stack

- [Astro](https://astro.build/) - The web framework for content-driven websites
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Google Gemini AI](https://ai.google.dev/) - For story and image generation
- [Vercel](https://vercel.com/) - For deployment and hosting

## Getting Started

### Prerequisites

- Node.js 18.14.1 or later
- pnpm (recommended) or npm
- Google Gemini API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/story-generator.git
   cd story-generator
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:

   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:4321](http://localhost:4321) in your browser.

## Project Structure

```bash
story-generator/
├── public/              # Static assets
│   ├── img/            # Images
│   └── fonts/          # Fonts
├── src/
│   ├── components/     # React components
│   ├── data/          # Data files
│   ├── pages/         # Astro pages
│   ├── lib/           # Utility libraries
│   └── utils/         # Utility functions
├── astro.config.mjs   # Astro configuration
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for providing the AI capabilities
- Astro team for the amazing framework
- Vercel for hosting and deployment
