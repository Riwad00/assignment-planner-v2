# Assignment Planner V2

AI-powered assignment planner that breaks down complex assignments into actionable step-by-step plans.

**Live demo:** [assignment-planner-v2.vercel.app](https://assignment-planner-v2.vercel.app)

## The Problem

Students stare at a complex assignment brief and don't know where to start. The document is long, the requirements are scattered, and the overwhelm leads to procrastination. Pasting it into ChatGPT helps, but as the conversation grows, the model loses track of what you were working on.

## The Solution

Upload an assignment PDF (or paste the brief), and the app turns it into a clear, structured plan. Each step tells you exactly what to do, how long it should take, and why it matters. Unlike a generic chatbot, every step has its own AI assistant that never loses context because each conversation is scoped to that specific step by design.

## Key Features

- **3-Phase AI Pipeline** - The plan goes through analyse, critique, and refine. A second AI reviews the plan for gaps and vague steps, then a third call fixes every issue found.
- **Per-Step AI Chat** - Click any step and chat with an AI tutor that knows the full assignment, the full plan, and the specific details of that step. Full conversation history is maintained.
- **Learning Resources** - Each step can fetch curated resources from the web (via OpenAI search) or from the LLM's training knowledge.
- **4 LLM Providers** - OpenAI, Anthropic (Claude), Google Gemini, and Cohere. Users bring their own API key.
- **Demo Mode** - Explore the full interface with pre-baked data, no API key needed.
- **PDF Parsing** - Upload assignment PDFs directly; the app extracts and processes the text.

## How the AI Pipeline Works

1. **Analyse** - Reads the assignment and generates a structured JSON plan with actionable steps, time estimates, and procrastination warnings
2. **Critique** - A "demanding academic plan critic" reviews the plan, checking for missing coverage, vague steps, and unrealistic time estimates
3. **Refine** - Takes the original plan + the critique and produces a corrected version that addresses every flagged issue

All LLM output is validated with Zod schemas and automatically retried on failure, so the pipeline works reliably across all four providers.

## Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o-mini |
| Anthropic | Claude Sonnet, Claude Haiku |
| Google | Gemini 2.0 Flash, Gemini 1.5 Pro |
| Cohere | Command R+, Command R |

## Built With

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zod, unpdf
