'use client'

// components/pipeline/PipelineProgress.tsx
import { motion } from 'framer-motion'
import { CritiqueCard } from './CritiqueCard'
import type { PipelinePhase, CritiqueOutput } from '@/lib/types'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

const PHASE_META: Record<string, string> = {
  analyze: 'Generate',
  critique: 'Review',
  refine: 'Refine',
}

const STATUS_CFG = {
  pending:  { outerGlow: 'rgba(255,255,255,0.02)', bottomGlow: 'transparent', borderGlow: undefined, textColor: '#3f3f46', icon: '○', pulse: false },
  loading:  { outerGlow: 'rgba(99,102,241,0.28)',  bottomGlow: 'radial-gradient(ellipse at bottom center, rgba(99,102,241,0.5), transparent 70%)', borderGlow: '0 0 18px 3px rgba(99,102,241,0.7), 0 0 36px 5px rgba(99,102,241,0.3)', textColor: '#818cf8', icon: '…', pulse: true },
  done:     { outerGlow: 'rgba(52,211,153,0.18)',  bottomGlow: 'radial-gradient(ellipse at bottom center, rgba(52,211,153,0.38), transparent 70%)', borderGlow: '0 0 14px 2px rgba(52,211,153,0.6), 0 0 28px 4px rgba(52,211,153,0.28)', textColor: '#34d399', icon: '✓', pulse: false },
  error:    { outerGlow: 'rgba(239,68,68,0.18)',   bottomGlow: 'radial-gradient(ellipse at bottom center, rgba(239,68,68,0.38), transparent 70%)', borderGlow: '0 0 14px 2px rgba(239,68,68,0.6), 0 0 28px 4px rgba(239,68,68,0.28)', textColor: '#f87171', icon: '✗', pulse: false },
  skipped:  { outerGlow: 'rgba(255,255,255,0.03)', bottomGlow: 'transparent', borderGlow: undefined, textColor: '#52525b', icon: '–', pulse: false },
} as const

interface Props {
  phases: PipelinePhase[]
  critique?: CritiqueOutput | null
}

export function PipelineProgress({ phases, critique }: Props) {
  const allDone = phases.every(p => p.status === 'done' || p.status === 'skipped' || p.status === 'error')

  return (
    <div className={allDone ? 'mb-6' : 'mb-10'}>
      {!allDone && (
        <p className="text-xs text-zinc-700 mb-4 tracking-wide">
          Usually 30–60 s · 3-phase AI pipeline
        </p>
      )}
      <div className="flex gap-2.5">
        {phases.map((phase, idx) => {
          const cfg = STATUS_CFG[phase.status] ?? STATUS_CFG.pending
          return (
            <div key={phase.id} className="flex items-center gap-2.5 flex-1">
              <motion.div
                className="flex-1 relative rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#0b1018',
                  boxShadow: `0 -4px 28px 3px ${cfg.outerGlow}, 0 4px 14px rgba(0,0,0,0.5)`,
                }}
                animate={{ scale: phase.status === 'loading' ? 1.012 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* noise */}
                <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_SVG }} />
                {/* bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none" style={{ background: cfg.bottomGlow, filter: 'blur(14px)', zIndex: 1 }} />
                {/* glass reflection */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 55%)', zIndex: 2 }} />
                {/* bottom border glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45) 50%, transparent)', boxShadow: cfg.borderGlow, zIndex: 3 }} />
                {/* corner edges */}
                <div className="absolute bottom-0 left-0 w-[1px] h-8 pointer-events-none" style={{ zIndex: 3, background: 'linear-gradient(to top, rgba(255,255,255,0.35), transparent)' }} />
                <div className="absolute bottom-0 right-0 w-[1px] h-8 pointer-events-none" style={{ zIndex: 3, background: 'linear-gradient(to top, rgba(255,255,255,0.35), transparent)' }} />

                {/* content */}
                <div className="relative p-4 pb-3.5" style={{ zIndex: 10 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-700">
                      {PHASE_META[phase.id] ?? phase.id}
                    </span>
                    <span className={`text-xs font-semibold ${cfg.pulse ? 'phase-pulse' : ''}`} style={{ color: cfg.textColor }}>
                      {cfg.icon}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: cfg.textColor, opacity: phase.status === 'pending' ? 0.3 : 0.9 }}>
                    {phase.label}
                  </p>
                  {phase.errorMsg && <p className="text-[10px] text-red-400/60 mt-1">{phase.errorMsg}</p>}
                </div>
              </motion.div>

              {idx < phases.length - 1 && (
                <div className="shrink-0 text-zinc-800 text-sm">›</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Critique lives here — part of the AI thinking process */}
      {allDone && critique && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4"
        >
          <CritiqueCard critique={critique} />
        </motion.div>
      )}
    </div>
  )
}
