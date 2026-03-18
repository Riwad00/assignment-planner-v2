import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { CohereClientV2 } from 'cohere-ai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { LLMContext, ChatMessage } from './types'

export class LLMParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LLMParseError'
  }
}

export function extractJSON(raw: string): unknown {
  if (!raw || !raw.trim()) throw new LLMParseError('Empty response from LLM')

  let cleaned = raw
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {}

  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {}
  }

  throw new LLMParseError(
    `Could not extract valid JSON. Response starts with: ${raw.slice(0, 150)}`
  )
}

export async function callLLM(
  ctx: LLMContext,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4000
): Promise<string> {
  const { provider, apiKey, model } = ctx

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey })
      const res = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      })
      return res.choices[0].message.content ?? ''
    }

    case 'anthropic': {
      const client = new Anthropic({ apiKey })
      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const block = res.content[0]
      return block.type === 'text' ? block.text : ''
    }

    case 'cohere': {
      const client = new CohereClientV2({ token: apiKey })
      const res = await client.chat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      })
      const msg = res.message
      if (msg?.content && msg.content.length > 0) {
        const block = msg.content[0]
        return block.type === 'text' ? block.text : ''
      }
      return ''
    }

    case 'gemini': {
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({ model })
      const res = await geminiModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
          },
        ],
        generationConfig: { maxOutputTokens: maxTokens },
      })
      return res.response.text()
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

// Multi-turn chat — passes full conversation history to each provider
export async function callLLMWithHistory(
  ctx: LLMContext,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<string> {
  const { provider, apiKey, model } = ctx

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey })
      const res = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      })
      return res.choices[0].message.content ?? ''
    }

    case 'anthropic': {
      const client = new Anthropic({ apiKey })
      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      })
      const block = res.content[0]
      return block.type === 'text' ? block.text : ''
    }

    case 'cohere': {
      const client = new CohereClientV2({ token: apiKey })
      const res = await client.chat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      })
      const msg = res.message
      if (msg?.content && msg.content.length > 0) {
        const block = msg.content[0]
        return block.type === 'text' ? block.text : ''
      }
      return ''
    }

    case 'gemini': {
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({
        model,
        systemInstruction: systemPrompt,
      })
      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const lastMessage = messages[messages.length - 1]
      const chat = geminiModel.startChat({ history })
      const res = await chat.sendMessage(lastMessage.content)
      return res.response.text()
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
