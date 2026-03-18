// app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { callLLM, extractJSON } from '@/lib/llm'
import { RESOURCE_SYNTHESIS_SYSTEM, buildResourceSynthesisFromKnowledgeMessage } from '@/lib/prompts'
import { ResourcesOutputSchema } from '@/lib/types'
import type { ResourcesRequest } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResourcesRequest
    const { provider, apiKey, model, stepTitle, whatToDo } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ error: 'provider, apiKey, model required' }, { status: 400 })
    }
    if (!stepTitle || !whatToDo) {
      return NextResponse.json({ error: 'stepTitle, whatToDo required' }, { status: 400 })
    }

    // ── OpenAI: gpt-4o-mini-search-preview has native web search ────────────
    if (provider === 'openai') {
      const client = new OpenAI({ apiKey })
      const searchPrompt = `Find the 3 most useful online learning resources for a student working on this step.

Step: ${stepTitle}
What it involves: ${whatToDo}

Return ONLY valid JSON with real URLs from your web search:
{
  "resources": [
    {
      "title": "exact resource title",
      "url": "https://real-url.com/path",
      "source": "domain name e.g. khanacademy.org",
      "summary": "one sentence: what this resource covers",
      "relevance": "one sentence: how this helps with the step"
    }
  ]
}`

      const res = await client.chat.completions.create({
        model: 'gpt-4o-mini-search-preview',
        messages: [{ role: 'user', content: searchPrompt }],
      })

      const raw = res.choices[0].message.content ?? ''
      const parsed = extractJSON(raw)
      const validated = ResourcesOutputSchema.safeParse(parsed)
      if (validated.success) {
        return NextResponse.json({ resources: validated.data.resources })
      }
      return NextResponse.json({ resources: [], warning: 'Could not parse search results' })
    }

    // ── Other providers: LLM training knowledge ──────────────────────────────
    const raw = await callLLM(
      { provider, apiKey, model },
      RESOURCE_SYNTHESIS_SYSTEM,
      buildResourceSynthesisFromKnowledgeMessage(stepTitle, whatToDo, []),
      800
    )
    const parsed = extractJSON(raw)
    const validated = ResourcesOutputSchema.safeParse(parsed)
    if (!validated.success) {
      return NextResponse.json({ resources: [], warning: 'Could not parse resource cards' })
    }
    return NextResponse.json({ resources: validated.data.resources })

  } catch (err) {
    console.error('[resources]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
