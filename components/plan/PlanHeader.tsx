// components/plan/PlanHeader.tsx — compact summary strip
import type { PlanOutput } from '@/lib/types'

export function PlanHeader({ plan }: { plan: PlanOutput }) {
  const snap      = plan.assignment_snapshot
  const totalMin  = plan.total_time_minutes
  const procCount = plan.steps.filter(s => s.procrastination_risk).length

  return (
    <div className="mb-5 space-y-3">
      {/* Title + inline metrics */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-snug">
          {snap.title}
        </h1>

        {/* Metric chips */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span
            className="text-sm font-mono text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            {totalMin} min
          </span>
          <span
            className="text-sm font-mono text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            {plan.steps.length} steps
          </span>
          {procCount > 0 && (
            <span
              className="text-sm font-mono text-amber-400 border border-amber-500/25 px-3 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.06)' }}
            >
              {procCount} stall {procCount === 1 ? 'risk' : 'risks'}
            </span>
          )}
        </div>
      </div>

      {/* Core goal — single line */}
      <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">{snap.core_goal}</p>

      {/* First move — actionable one-liner */}
      <div className="flex items-start gap-2 pt-1">
        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase shrink-0 mt-0.5">
          Start →
        </span>
        <p className="text-sm text-zinc-400 leading-relaxed">{plan.first_move}</p>
      </div>
    </div>
  )
}
