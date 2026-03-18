'use client'

// components/plan/StepChat.tsx — full-column, no box, markdown-rendered responses
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, ArrowUp } from 'lucide-react'
import type { LLMContext, PlanOutput, ChatMessage } from '@/lib/types'

interface Props {
  stepNumber: number
  stepTitle: string
  ctx: LLMContext
  plan: PlanOutput
}

export function StepChat({ stepNumber, stepTitle, ctx, plan }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctx, plan, stepNumber, messages: nextMessages }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? `Request failed (${res.status})`)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setError('Failed to reach the AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header — no box, just a label */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-zinc-500 tracking-wide">
          Step {stepNumber} assistant
        </span>
        {loading && (
          <span className="flex h-1.5 w-1.5 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
          </span>
        )}
      </div>

      {/* Empty state — hint text before first message */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col justify-center space-y-3 pb-6">
          <p className="text-sm text-zinc-600 leading-relaxed">
            Ask anything about this step — how to approach it, what to prioritise, how long it really takes, or how it connects to the rest of the assignment.
          </p>
          <div className="space-y-1.5">
            {[
              `How should I structure step ${stepNumber}?`,
              "What's the biggest mistake to avoid here?",
              'Give me a quick start to get unstuck.',
            ].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); inputRef.current?.focus() }}
                className="block w-full text-left text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1 border-l border-zinc-800 pl-3 hover:border-indigo-500/40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message history */}
      {messages.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 mb-4">
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm text-zinc-200 leading-relaxed"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400/50 tracking-widest uppercase">AI</span>
                  <div className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed
                    [&>p]:mb-3 [&>p]:text-sm [&>p]:text-zinc-300 [&>p]:leading-relaxed
                    [&>ul]:space-y-1 [&>ul]:mb-3 [&>ul>li]:text-sm [&>ul>li]:text-zinc-300 [&>ul>li]:list-disc [&>ul>li]:ml-4
                    [&>ol]:space-y-1 [&>ol]:mb-3 [&>ol>li]:text-sm [&>ol>li]:text-zinc-300 [&>ol>li]:list-decimal [&>ol>li]:ml-4
                    [&>h1]:text-base [&>h1]:font-bold [&>h1]:text-zinc-100 [&>h1]:mb-2
                    [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-zinc-100 [&>h2]:mb-2
                    [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:text-zinc-200 [&>h3]:mb-1.5
                    [&>strong]:text-zinc-100 [&>strong]:font-semibold
                    [&>code]:text-indigo-300 [&>code]:bg-indigo-950/50 [&>code]:px-1 [&>code]:rounded
                    [&>pre]:bg-zinc-900 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:overflow-x-auto [&>pre]:mb-3
                    [&>blockquote]:border-l-2 [&>blockquote]:border-indigo-500/40 [&>blockquote]:pl-3 [&>blockquote]:text-zinc-400 [&>blockquote]:italic">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '120ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '240ms' }} />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Loading dots when no messages yet */}
      {loading && messages.length === 0 && (
        <div className="flex-1 flex items-start pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      )}

      {/* Input — pinned at bottom */}
      <div
        className="flex items-center gap-2 pt-3 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about "${stepTitle}"…`}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-700 outline-none border-none min-w-0"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-25"
          style={{
            background: input.trim() && !loading ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ArrowUp className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      <p className="text-[10px] text-zinc-800 mt-1.5 shrink-0">
        Enter to send · Focused on step {stepNumber}
      </p>
    </div>
  )
}
