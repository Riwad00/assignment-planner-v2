// app/api/critique/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callLLM, extractJSON, LLMParseError } from '@/lib/llm'
import { CRITIQUE_SYSTEM, buildCritiqueUserMessage } from '@/lib/prompts'
import { CritiqueOutputSchema } from '@/lib/types'
import type { CritiqueRequest } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CritiqueRequest
    const { provider, apiKey, model, plan, pdfText, taskInput } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ error: 'provider, apiKey, model required' }, { status: 400 })
    }

    if (!plan) {
      return NextResponse.json({ error: 'plan is required' }, { status: 400 })
    }

    const ctx = { provider, apiKey, model }
    const userMessage = buildCritiqueUserMessage(plan, pdfText, taskInput)

    let raw = await callLLM(ctx, CRITIQUE_SYSTEM, userMessage)
    let parsed: unknown

    try {
      parsed = extractJSON(raw)
    } catch {
      raw = await callLLM(
        ctx, CRITIQUE_SYSTEM,
        userMessage + '\n\nReturn ONLY valid JSON. No markdown.'
      )
      parsed = extractJSON(raw)
    }

    const result = CritiqueOutputSchema.safeParse(parsed)
    if (!result.success) {
      // Return best-effort data rather than failing the whole pipeline
      return NextResponse.json({ critique: parsed, warning: 'Schema validation failed' })
    }

    return NextResponse.json({ critique: result.data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = err instanceof LLMParseError ? 422 : 500
    console.error('[critique]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
