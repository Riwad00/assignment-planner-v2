// app/api/refine/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callLLM, extractJSON, LLMParseError } from '@/lib/llm'
import { REFINE_SYSTEM, buildRefineUserMessage } from '@/lib/prompts'
import { PlanOutputSchema } from '@/lib/types'
import type { RefineRequest } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RefineRequest
    const { provider, apiKey, model, plan, critique } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ error: 'provider, apiKey, model required' }, { status: 400 })
    }

    if (!plan || !critique) {
      return NextResponse.json({ error: 'plan and critique are required' }, { status: 400 })
    }

    const ctx = { provider, apiKey, model }
    const userMessage = buildRefineUserMessage(plan, critique)

    let raw = await callLLM(ctx, REFINE_SYSTEM, userMessage)
    let parsed: unknown

    try {
      parsed = extractJSON(raw)
    } catch {
      raw = await callLLM(
        ctx, REFINE_SYSTEM,
        userMessage + '\n\nReturn ONLY valid JSON matching the input plan schema.'
      )
      parsed = extractJSON(raw)
    }

    const result = PlanOutputSchema.safeParse(parsed)
    if (!result.success) {
      return NextResponse.json({ plan: parsed, warning: 'Schema validation failed, returning best-effort' })
    }

    return NextResponse.json({ plan: result.data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const status = err instanceof LLMParseError ? 422 : 500
    console.error('[refine]', err)
    return NextResponse.json({ error: message }, { status })
  }
}
