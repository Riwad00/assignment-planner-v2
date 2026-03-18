'use client'

// components/pipeline/CritiqueCard.tsx — section style, no card box
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { CritiqueOutput } from '@/lib/types'

const QUALITY_CFG = {
  good:       { label: 'Good',              color: '#34d399', badgeBg: 'rgba(52,211,153,0.08)',  borderColor: 'rgba(52,211,153,0.2)'  },
  needs_work: { label: 'Needs Work',        color: '#fbbf24', badgeBg: 'rgba(251,191,36,0.08)',  borderColor: 'rgba(251,191,36,0.2)'  },
  poor:       { label: 'Needed Improvement',color: '#f87171', badgeBg: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.2)' },
} as const

export function CritiqueCard({ critique }: { critique: CritiqueOutput }) {
  const [open, setOpen] = useState(false)
  const cfg = QUALITY_CFG[critique.overall_quality]
  const totalIssues = critique.vague_steps.length + critique.time_issues.length + critique.missing_steps.length

  return (
    <div className="mb-14 pb-14" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Header row — clickable */}
      <button onClick={() => setOpen(o => !o)} className="w-full text-left group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cfg.color }}>
                AI Critique
              </span>
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                style={{ color: cfg.color, background: cfg.badgeBg, borderColor: cfg.borderColor }}
              >
                {cfg.label}
              </span>
              {totalIssues > 0 && (
                <span className="text-[11px] text-zinc-600">
                  {totalIssues} issue{totalIssues !== 1 ? 's' : ''} addressed in refinement
                </span>
              )}
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">{critique.summary}</p>

            {!open && (
              <p className="text-xs text-zinc-600 italic">
                Plan refined based on this review · expand to see details
              </p>
            )}
          </div>

          <ChevronDown
            className="w-4 h-4 text-zinc-700 shrink-0 mt-1 transition-transform duration-200 group-hover:text-zinc-500"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {/* Expanded issues */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-8 space-y-6">
              <p className="text-xs text-zinc-600 italic">Plan refined based on this review</p>

              {critique.vague_steps.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Vague steps fixed</p>
                  {critique.vague_steps.map((v, i) => (
                    <div key={i} className="pl-4 border-l-2 border-amber-500/30 space-y-0.5">
                      <p className="text-xs text-zinc-300">Step {v.step}: {v.issue}</p>
                      <p className="text-xs text-emerald-400/70">→ {v.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {critique.time_issues.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Time adjustments</p>
                  {critique.time_issues.map((t, i) => (
                    <div key={i} className="pl-4 border-l-2 border-blue-500/30 space-y-0.5">
                      <p className="text-xs text-zinc-300">
                        Step {t.step}: <span className="font-mono">{t.current}m</span> → <span className="font-mono text-blue-300">{t.suggested}m</span>
                      </p>
                      <p className="text-xs text-zinc-500">{t.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {critique.missing_steps.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Missing steps added</p>
                  {critique.missing_steps.map((m, i) => (
                    <div key={i} className="pl-4 border-l-2 border-indigo-500/30 space-y-0.5">
                      <p className="text-xs text-zinc-300">{m.title}</p>
                      <p className="text-xs text-zinc-500">{m.rationale}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
