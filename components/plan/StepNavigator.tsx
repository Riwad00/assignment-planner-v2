'use client'

// components/plan/StepNavigator.tsx — left column: clickable step list
import { motion } from 'framer-motion'
import type { PlanStep } from '@/lib/types'

interface Props {
  steps: PlanStep[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function StepNavigator({ steps, selectedIndex, onSelect }: Props) {
  return (
    <nav className="space-y-0.5">
      <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase mb-5 px-3">
        {steps.length} steps
      </p>

      {steps.map((step, i) => {
        const isActive = i === selectedIndex
        const isRisky  = !!step.procrastination_risk

        return (
          <motion.button
            key={step.step}
            onClick={() => onSelect(i)}
            className="w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150 relative group"
            initial={false}
            animate={{
              backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
            }}
            transition={{ duration: 0.15 }}
            style={{
              borderLeft: isActive
                ? '2px solid rgba(99,102,241,0.6)'
                : '2px solid transparent',
            }}
            whileHover={!isActive ? { backgroundColor: 'rgba(255,255,255,0.03)' } : {}}
          >
            {/* Number + title */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-sm font-black font-mono shrink-0 tabular-nums"
                style={{
                  backgroundImage: isRisky
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {step.step}
              </span>
              <span
                className={`text-xs leading-snug truncate transition-colors duration-150 ${
                  isActive
                    ? 'text-zinc-200'
                    : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Time + stall-risk dot */}
            <div className="flex items-center gap-1.5 mt-0.5 ml-5">
              <span className="text-[10px] font-mono text-zinc-700">
                {step.time_minutes}m
              </span>
              {isRisky && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'rgba(245,158,11,0.7)' }}
                />
              )}
            </div>
          </motion.button>
        )
      })}
    </nav>
  )
}
