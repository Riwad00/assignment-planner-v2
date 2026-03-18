'use client'

// components/plan/StepDetail.tsx — middle column: step content without chat
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ResourceList } from './ResourceList'
import type { PlanStep, ResourceCard, LLMContext } from '@/lib/types'

interface Props {
  step: PlanStep
  ctx: LLMContext
  cachedResources?: ResourceCard[]
  onResourcesCached: (stepNum: number, resources: ResourceCard[]) => void
}

export function StepDetail({ step, ctx, cachedResources, onResourcesCached }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [resourceError, setResourceError] = useState('')

  const isRisky = !!step.procrastination_risk

  const numGradient = isRisky
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)'

  async function fetchResources() {
    if (cachedResources) return
    setLoadingResources(true)
    setResourceError('')
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctx, stepTitle: step.title, whatToDo: step.what_to_do }),
      })
      const data = await res.json()
      if (!res.ok || data.error) setResourceError(data.error ?? `Request failed (${res.status})`)
      else onResourcesCached(step.step, data.resources)
    } catch {
      setResourceError('Failed to fetch resources')
    } finally {
      setLoadingResources(false)
    }
  }

  return (
    <div className="space-y-7">

      {/* Header: big number + title */}
      <div className="flex items-start gap-5">
        {/* Gradient number */}
        <div
          className="relative shrink-0 pt-1"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        >
          <div
            className="absolute blur-2xl opacity-55 pointer-events-none"
            style={{
              inset: '-10px -14px',
              background: isRisky ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.4)',
            }}
          />
          <span
            className="relative text-6xl font-black leading-none select-none block"
            style={{
              backgroundImage: numGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.04em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {step.step}
          </span>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h2 className="text-2xl font-bold text-zinc-100 leading-snug">{step.title}</h2>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span
              className="text-sm font-mono text-zinc-500 border border-zinc-800 px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {step.time_minutes} min
            </span>
            {isRisky && (
              <span
                className="text-sm text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.06)' }}
              >
                stall risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div
        className="h-px"
        style={{
          background: isRisky
            ? 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)'
            : 'linear-gradient(90deg, rgba(99,102,241,0.25), transparent)',
        }}
      />

      {/* What to do */}
      <p className="text-base text-zinc-300 leading-relaxed">{step.what_to_do}</p>

      {/* Procrastination warning */}
      {isRisky && step.procrastination_reason && (
        <div className="pl-4 border-l-2 border-amber-500/40 space-y-1.5">
          <p className="text-sm font-semibold text-amber-400">Watch out</p>
          <p className="text-sm text-amber-200/60 leading-relaxed">{step.procrastination_reason}</p>
        </div>
      )}

      {/* Resources */}
      <div className="space-y-2">
        {!cachedResources && !loadingResources && (
          <button
            onClick={fetchResources}
            className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2 decoration-zinc-700"
          >
            Find web resources for this step
          </button>
        )}
        <ResourceList
          resources={cachedResources ?? []}
          loading={loadingResources}
          error={resourceError}
        />
      </div>

      {/* Collapsible details */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
          {detailsOpen
            ? <><ChevronUp className="w-3.5 h-3.5" /> Hide details</>
            : <><ChevronDown className="w-3.5 h-3.5" /> More detail</>
          }
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-5 space-y-5">
          {step.why_it_matters && (
            <div className="pl-4 border-l border-zinc-800 space-y-1.5">
              <p className="text-sm font-semibold text-zinc-500">Why it matters</p>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.why_it_matters}</p>
            </div>
          )}
          {step.specific_notes && (
            <div className="pl-4 border-l border-blue-500/20 space-y-1.5">
              <p className="text-sm font-semibold text-blue-400/60">Tutor note</p>
              <p className="text-sm text-blue-200/50 leading-relaxed">{step.specific_notes}</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
