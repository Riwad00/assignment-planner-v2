'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Provider, LLMContext } from '@/lib/types'

const PROVIDERS: { value: Provider; label: string; models: string[] }[] = [
  {
    value: 'openai',
    label: 'OpenAI (GPT)',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  {
    value: 'anthropic',
    label: 'Anthropic (Claude)',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'],
  },
  {
    value: 'cohere',
    label: 'Cohere',
    models: ['command-r-08-2024', 'command-r-plus-08-2024', 'command-a-03-2025'],
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  },
]

const PROVIDER_INFO: Record<Provider, { hint: string; free: boolean; keyUrl: string }> = {
  openai: {
    hint: 'Also enables real web search when finding learning resources',
    free: false,
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    hint: 'Best for detailed, nuanced academic plans',
    free: false,
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
  cohere: {
    hint: 'Free tier available — great for trying the app',
    free: true,
    keyUrl: 'https://dashboard.cohere.com/api-keys',
  },
  gemini: {
    hint: 'Free tier available via Google AI Studio',
    free: true,
    keyUrl: 'https://aistudio.google.com/app/apikey',
  },
}

interface Props {
  onComplete: (ctx: LLMContext) => void
}

export function SetupStep({ onComplete }: Props) {
  const [provider, setProvider] = useState<Provider>('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [verified, setVerified] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; msg: string; latency?: number } | null>(null)

  const currentProvider = PROVIDERS.find(p => p.value === provider)!

  function handleProviderChange(val: Provider) {
    setProvider(val)
    setModel(PROVIDERS.find(p => p.value === val)!.models[0])
    setVerified(false)
    setVerifyResult(null)
  }

  async function handleTest() {
    if (!apiKey.trim()) return
    setTesting(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, model }),
      })
      const data = await res.json()
      if (data.ok) {
        setVerified(true)
        setVerifyResult({ ok: true, msg: `Connected · ${data.latencyMs}ms`, latency: data.latencyMs })
      } else {
        setVerified(false)
        setVerifyResult({ ok: false, msg: data.error ?? 'Connection failed' })
      }
    } catch {
      setVerifyResult({ ok: false, msg: 'Network error' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-8 fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Choose your AI provider</h2>
        <p className="text-sm text-zinc-400">Enter your API key — it stays in your browser session only.</p>
      </div>

      {/* Provider tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PROVIDERS.map(p => (
          <button
            key={p.value}
            onClick={() => handleProviderChange(p.value)}
            className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all backdrop-blur-sm ${
              provider === p.value
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                : 'border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm p-5 space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">{currentProvider.label} configuration</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500">{PROVIDER_INFO[provider].hint}</p>
              {PROVIDER_INFO[provider].free && (
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/8 shrink-0">
                  Free tier
                </Badge>
              )}
            </div>
          </div>
          <a
            href={PROVIDER_INFO[provider].keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0 mt-0.5"
          >
            Get API key ↗
          </a>
        </div>

        <Select value={model} onValueChange={(val) => { if (val) { setModel(val); setVerified(false); setVerifyResult(null) } }}>
          <SelectTrigger className="bg-zinc-800/60 border-zinc-700/60 text-zinc-200">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {currentProvider.models.map(m => (
              <SelectItem key={m} value={m} className="text-zinc-200">
                <span className="font-mono text-xs">{m}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setVerified(false); setVerifyResult(null) }}
            placeholder="Paste your API key…"
            className="bg-zinc-800/60 border-zinc-700/60 text-zinc-200 placeholder:text-zinc-500 font-mono text-sm"
          />
          <Button
            onClick={handleTest}
            disabled={!apiKey.trim() || testing}
            variant="outline"
            className="shrink-0 border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500"
          >
            {testing ? 'Testing…' : 'Test'}
          </Button>
        </div>

        {verifyResult && (
          <p className={`text-xs font-mono ${verifyResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
            {verifyResult.ok ? '✓' : '✗'} {verifyResult.msg}
          </p>
        )}
      </div>

      <Button
        onClick={() => onComplete({ provider, apiKey, model })}
        disabled={!verified}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 h-12 text-base"
        size="lg"
      >
        Continue to Upload →
      </Button>

      {!verified && apiKey && (
        <p className="text-center text-xs text-zinc-500">Test your API key to continue</p>
      )}
    </div>
  )
}
