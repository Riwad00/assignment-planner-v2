'use client'

// components/steps/ResultsStep.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PipelineProgress } from '@/components/pipeline/PipelineProgress'
import { PlanHeader } from '@/components/plan/PlanHeader'
import { StepNavigator } from '@/components/plan/StepNavigator'
import { StepDetail } from '@/components/plan/StepDetail'
import { StepChat } from '@/components/plan/StepChat'
import type {
  LLMContext, PlanOutput, CritiqueOutput,
  PipelinePhase, ResourceCard, UploadData
} from '@/lib/types'

interface Props {
  ctx: LLMContext
  uploadData: UploadData
  onStartOver: () => void
  demoData?: { plan: PlanOutput; critique: CritiqueOutput }
}

export function ResultsStep({ ctx, uploadData, onStartOver, demoData }: Props) {
  const [phases, setPhases] = useState<PipelinePhase[]>([
    { id: 'analyze',  label: 'Generating your plan…',         status: 'pending' },
    { id: 'critique', label: 'AI Critic reviewing the plan…', status: 'pending' },
    { id: 'refine',   label: 'Refining based on feedback…',   status: 'pending' },
  ])

  const [rawPlan,   setRawPlan]   = useState<PlanOutput | null>(null)
  const [critique,  setCritique]  = useState<CritiqueOutput | null>(null)
  const [finalPlan, setFinalPlan] = useState<PlanOutput | null>(null)
  const [resourcesCache, setResourcesCache] = useState<Record<number, ResourceCard[]>>({})
  const [fatalError, setFatalError] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const pipelineStarted = useRef(false)

  function setPhaseStatus(id: string, status: PipelinePhase['status'], errorMsg?: string) {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, status, errorMsg } : p))
  }
  function updatePhaseLabel(id: string, label: string) {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, label } : p))
  }

  useEffect(() => {
    if (pipelineStarted.current) return
    pipelineStarted.current = true

    runPipeline()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runPipeline() {
    if (demoData) {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
      setPhaseStatus('analyze', 'loading')
      await delay(1600)
      setRawPlan(demoData.plan)
      setPhaseStatus('analyze', 'done')
      updatePhaseLabel('analyze', 'Plan generated ✓')

      setPhaseStatus('critique', 'loading')
      await delay(1200)
      setCritique(demoData.critique)
      setPhaseStatus('critique', 'done')
      updatePhaseLabel('critique', 'Critique complete ✓')

      setPhaseStatus('refine', 'loading')
      await delay(1000)
      setFinalPlan(demoData.plan)
      setPhaseStatus('refine', 'done')
      updatePhaseLabel('refine', 'Plan refined ✓')
      return
    }

    setPhaseStatus('analyze', 'loading')
    let plan: PlanOutput | null = null
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ctx, ...uploadData }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      plan = data.plan as PlanOutput
      setRawPlan(plan)
      setPhaseStatus('analyze', 'done')
      updatePhaseLabel('analyze', 'Plan generated ✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setPhaseStatus('analyze', 'error', msg)
      setFatalError(`Plan generation failed: ${msg}`)
      return
    }

    setPhaseStatus('critique', 'loading')
    let critiqueData: CritiqueOutput | null = null
    try {
      const res = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ctx, plan,
          pdfText: uploadData.pdfText,
          taskInput: uploadData.taskInput,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      critiqueData = data.critique as CritiqueOutput
      setCritique(critiqueData)
      setPhaseStatus('critique', 'done')
      updatePhaseLabel('critique', 'Critique complete ✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setPhaseStatus('critique', 'skipped', `Critique unavailable: ${msg}`)
      updatePhaseLabel('critique', 'Critique unavailable (skipped)')
    }

    setPhaseStatus('refine', 'loading')
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ctx, plan,
          critique: critiqueData ?? {
            overall_quality: 'good' as const,
            vague_steps: [], time_issues: [], missing_steps: [],
            summary: 'No critique available.',
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFinalPlan(data.plan as PlanOutput)
      setPhaseStatus('refine', 'done')
      updatePhaseLabel('refine', 'Plan refined ✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setPhaseStatus('refine', 'error', msg)
      updatePhaseLabel('refine', 'Refinement unavailable (showing original)')
      setFinalPlan(plan)
    }
  }

  function handleResourcesCached(stepNum: number, resources: ResourceCard[]) {
    setResourcesCache(prev => ({ ...prev, [stepNum]: resources }))
  }

  const pipelineComplete = phases.every(p => p.status === 'done' || p.status === 'skipped' || p.status === 'error') && finalPlan !== null

  if (fatalError) {
    return (
      <div className="text-center space-y-4 pt-8">
        <p className="text-red-400 text-sm">{fatalError}</p>
        <button onClick={onStartOver} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="pt-2">
      {/* Demo mode banner */}
      {demoData && (
        <div
          className="rounded-xl px-5 py-3 flex items-center justify-between mb-6"
          style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}
        >
          <p className="text-xs text-indigo-300">
            <span className="font-semibold">Demo mode</span> — pre-built example plan. Add your own API key to analyse a real assignment.
          </p>
          <button onClick={onStartOver} className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors shrink-0 ml-4">
            Get started →
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!pipelineComplete ? (
          /* ── LOADING VIEW: pipeline + progressive content ── */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Pipeline phase cards */}
            <PipelineProgress phases={phases} critique={null} />

            {/* Progressive content */}
            <div className="space-y-6 mt-6">

              {/* Draft plan — appears as soon as rawPlan arrives */}
              <AnimatePresence>
                {rawPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    {/* Section label */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07))' }} />
                      <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase shrink-0">Draft plan</span>
                      <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.07))' }} />
                    </div>

                    {/* Step list — annotated once critique arrives */}
                    <div className="space-y-1">
                      {rawPlan.steps.map((s, i) => {
                        const vagueFlag   = critique?.vague_steps.find(v => v.step === s.step)
                        const timeFlag    = critique?.time_issues.find(t => t.step === s.step)
                        const isFlagged   = !!(vagueFlag || timeFlag)
                        const refinePhase = phases.find(p => p.id === 'refine')
                        const isRefining  = isFlagged && (refinePhase?.status === 'loading' || refinePhase?.status === 'done')

                        return (
                          <motion.div
                            key={s.step}
                            layout
                            className="flex items-center gap-3 py-0.5"
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.035 }}
                          >
                            {/* Step number */}
                            <span
                              className="text-sm font-black font-mono shrink-0 w-5 text-right tabular-nums"
                              style={{
                                backgroundImage: isFlagged
                                  ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                                  : s.procrastination_risk
                                    ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                                    : 'linear-gradient(135deg,#a5b4fc,#6366f1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                            >
                              {s.step}
                            </span>

                            {/* Title */}
                            <span className={`text-sm flex-1 min-w-0 truncate transition-colors duration-300 ${isFlagged ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {s.title}
                            </span>

                            {/* Annotation badge — appears when critique arrives */}
                            <AnimatePresence>
                              {vagueFlag && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.85 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded ${isRefining ? 'phase-pulse' : ''}`}
                                  style={{
                                    color: '#f59e0b',
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                  }}
                                >
                                  {isRefining ? 'fixing…' : 'too vague'}
                                </motion.span>
                              )}
                              {timeFlag && !vagueFlag && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.85 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded ${isRefining ? 'phase-pulse' : ''}`}
                                  style={{
                                    color: '#818cf8',
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                  }}
                                >
                                  {isRefining ? 'fixing…' : 'timing off'}
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {/* Time */}
                            <span className="text-xs font-mono text-zinc-700 shrink-0">{s.time_minutes}m</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Critique summary — appears after review phase */}
              <AnimatePresence>
                {critique && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CritiqueCardInline critique={critique} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        ) : (
          /* ── RESULTS VIEW: 3-column explorer, no pipeline section ── */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {finalPlan && (
              <>
                {/* Compact plan summary */}
                <PlanHeader plan={finalPlan} />

                {/* ── 3-column step explorer ── */}
                <div className="flex gap-6 items-start">

                  {/* LEFT — step navigator */}
                  <div className="shrink-0 w-52 max-h-[600px] overflow-y-auto">
                    <StepNavigator
                      steps={finalPlan.steps}
                      selectedIndex={selectedIndex}
                      onSelect={setSelectedIndex}
                    />
                  </div>

                  {/* Vertical separator */}
                  <div
                    className="shrink-0 w-px self-stretch"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)' }}
                  />

                  {/* MIDDLE — step detail, animated on step change */}
                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`detail-${selectedIndex}`}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <StepDetail
                          step={finalPlan.steps[selectedIndex]}
                          ctx={ctx}
                          cachedResources={resourcesCache[finalPlan.steps[selectedIndex].step]}
                          onResourcesCached={handleResourcesCached}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Vertical separator */}
                  <div
                    className="shrink-0 w-px self-stretch"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)' }}
                  />

                  {/* RIGHT — AI chat */}
                  <div className="shrink-0 w-80 h-[600px] flex flex-col overflow-hidden">
                    {/* Label — static, outside animation so it doesn't affect height */}
                    <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase mb-4 shrink-0">
                      AI assistant
                    </p>
                    {/* Chat area — fills remaining height, scrolls internally */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`chat-${selectedIndex}`}
                        className="flex-1 min-h-0"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <StepChat
                          stepNumber={finalPlan.steps[selectedIndex].step}
                          stepTitle={finalPlan.steps[selectedIndex].title}
                          ctx={ctx}
                          plan={finalPlan}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>

                {/* What to cut */}
                {finalPlan.what_to_cut && (
                  <div className="mt-16 space-y-3">
                    <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">What you can skip</p>
                    <p className="text-base text-zinc-400 leading-relaxed">{finalPlan.what_to_cut}</p>
                  </div>
                )}

                {/* Start over */}
                <div className="mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={onStartOver}
                    className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    ← Start over with a new assignment
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Inline critique display for the loading view
function CritiqueCardInline({ critique }: { critique: CritiqueOutput }) {
  const QUALITY_CFG = {
    good:       { label: 'Good',              color: '#34d399', badgeBg: 'rgba(52,211,153,0.08)',  borderColor: 'rgba(52,211,153,0.2)'  },
    needs_work: { label: 'Needs Work',        color: '#fbbf24', badgeBg: 'rgba(251,191,36,0.08)',  borderColor: 'rgba(251,191,36,0.2)'  },
    poor:       { label: 'Needs Improvement', color: '#f87171', badgeBg: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' },
  } as const

  const cfg = QUALITY_CFG[critique.overall_quality]
  const totalIssues = critique.vague_steps.length + critique.time_issues.length + critique.missing_steps.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cfg.color }}>
            AI Critique
          </span>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
          style={{ color: cfg.color, background: cfg.badgeBg, borderColor: cfg.borderColor }}
        >
          {cfg.label}
        </span>
        {totalIssues > 0 && (
          <span className="text-[11px] text-zinc-600">
            {totalIssues} issue{totalIssues !== 1 ? 's' : ''} — being refined
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed pl-11">{critique.summary}</p>
    </div>
  )
}
