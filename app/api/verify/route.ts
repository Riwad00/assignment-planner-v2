// app/api/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/llm'
import type { LLMContext } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LLMContext

    if (!body.provider || !body.apiKey || !body.model) {
      return NextResponse.json(
        { error: 'provider, apiKey, and model are required' },
        { status: 400 }
      )
    }

    const t0 = Date.now()
    const reply = await callLLM(
      body,
      'You are a test assistant.',
      'Reply with exactly: OK',
      8
    )
    const latencyMs = Date.now() - t0

    return NextResponse.json({ ok: true, reply: reply.trim(), latencyMs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 422 })
  }
}
