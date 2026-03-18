// components/StepIndicator.tsx
const STEPS = [
  { number: 1, label: 'Setup' },
  { number: 2, label: 'Upload' },
  { number: 3, label: 'Results' },
]

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center py-6">
      {STEPS.map((step, idx) => {
        const status =
          step.number < currentStep ? 'done' :
          step.number === currentStep ? 'active' : 'pending'

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 backdrop-blur-sm ${
                  status === 'done'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : status === 'active'
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/50 shadow-[0_0_16px_rgba(59,130,246,0.25)]'
                    : 'bg-zinc-800/60 text-zinc-600 border border-zinc-700/60'
                }`}
              >
                {status === 'done' ? '✓' : step.number}
              </div>
              <span
                className={`text-xs font-medium tracking-wide ${
                  status === 'done' ? 'text-emerald-400' :
                  status === 'active' ? 'text-zinc-200' : 'text-zinc-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-20 h-px mx-3 mb-7 rounded-full transition-all duration-500 ${
                  step.number < currentStep ? 'bg-emerald-500/40' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
