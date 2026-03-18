// app/api/chat-step/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callLLMWithHistory } from '@/lib/llm'
import { buildStepChatSystemPrompt } from '@/lib/prompts'
import type { ChatStepRequest } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatStepRequest
    const { provider, apiKey, model, plan, stepNumber, messages } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ error: 'provider, apiKey, model required' }, { status: 400 })
    }
    if (!plan || !stepNumber || !messages?.length) {
      return NextResponse.json({ error: 'plan, stepNumber, messages required' }, { status: 400 })
    }

    const systemPrompt = buildStepChatSystemPrompt(plan, stepNumber)
    const reply = await callLLMWithHistory({ provider, apiKey, model }, systemPrompt, messages)

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat-step]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
