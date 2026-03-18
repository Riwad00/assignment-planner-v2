// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callLLM, extractJSON, LLMParseError } from '@/lib/llm'
import { ANALYZE_SYSTEM, buildAnalyzeUserMessage } from '@/lib/prompts'
import { PlanOutputSchema } from '@/lib/types'
import type { AnalyzeRequest } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest
    const { provider, apiKey, model, pdfText, taskInput, availableHours, overwhelm, contextNote } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ error: 'provider, apiKey, model required' }, { status: 400 })
    }

    const userMessage = buildAnalyzeUserMessage(
      pdfText ?? '',
      taskInput ?? '',
      availableHours ?? 2,
      overwhelm ?? 'Quite a lot',
      contextNote ?? ''
    )

    const ctx = { provider, apiKey, model }

    // First attempt
    let raw = await callLLM(ctx, ANALYZE_SYSTEM, userMessage)
    let parsed: unknown

    try {
      parsed = extractJSON(raw)
    } catch {
      // Retry with stricter instruction
      raw = await callLLM(
        ctx,
        ANALYZE_SYSTEM,
        userMessage + '\n\nCRITICAL: Return ONLY valid JSON. No markdown fences. No explanation.'
      )
      parsed = extractJSON(raw)
    }

    const result = PlanOutputSchema.safeParse(parsed)
    if (!result.success) {
      console.error('[analyze] Zod validation failed:', result.error.message)
      // Return the raw parsed object even if validation fails — better than nothing
      return NextResponse.json({ plan: parsed, warning: 'Schema validation failed but returning best-effort result' })
    }

    return NextResponse.json({ plan: result.data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = err instanceof LLMParseError ? 422 : 500
    console.error('[analyze]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
