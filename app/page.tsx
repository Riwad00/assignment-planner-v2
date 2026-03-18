'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StepIndicator } from '@/components/StepIndicator'
import { SetupStep } from '@/components/steps/SetupStep'
import { UploadStep } from '@/components/steps/UploadStep'
import { ResultsStep } from '@/components/steps/ResultsStep'
import { DEMO_PLAN, DEMO_CRITIQUE, DEMO_UPLOAD_DATA } from '@/lib/demo-data'
import type { LLMContext, UploadData } from '@/lib/types'

type WizardStep = 1 | 2 | 3

const spring = { type: 'spring' as const, bounce: 0.25, duration: 1.4 }

export default function Home() {
  const [step, setStep] = useState<WizardStep>(1)
  const [ctx, setCtx] = useState<LLMContext | null>(null)
  const [uploadData, setUploadData] = useState<UploadData | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSetupComplete(newCtx: LLMContext) {
    setCtx(newCtx)
    setStep(2)
  }

  function handleUploadSubmit(data: UploadData) {
    setUploadData(data)
    setUploadLoading(false)
    setStep(3)
  }

  function handleStartOver() {
    setStep(1)
    setCtx(null)
    setUploadData(null)
    setUploadLoading(false)
    setIsDemo(false)
  }

  function handleDemo() {
    setCtx({ provider: 'openai', apiKey: 'demo', model: 'demo' })
    setUploadData(DEMO_UPLOAD_DATA)
    setIsDemo(true)
    setStep(3)
  }

  // Step 3 uses full width; steps 1–2 stay centred
  const containerClass = step === 3
    ? 'mx-auto w-full max-w-7xl px-8'
    : 'mx-auto w-full max-w-2xl px-6'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-x-hidden">

      {/* Atmospheric background glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-60 -left-60 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,hsla(220,80%,60%,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsla(260,70%,55%,0.04)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsla(200,60%,50%,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Sticky header */}
      <header className="fixed top-0 z-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, duration: 1 }}
          className={`mx-auto mt-3 max-w-6xl px-6 transition-all duration-300 ${
            scrolled
              ? 'bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 rounded-2xl py-2.5'
              : 'py-3'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              Assignment Planner
            </span>
            {scrolled && (
              <span className="text-xs text-zinc-500 font-mono">Step {step} / 3</span>
            )}
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 pt-24 pb-20">

        {/* Hero title — only shown on steps 1 & 2 */}
        {step !== 3 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="text-center mb-10 px-6"
          >
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring },
              }}
              className="inline-block text-xs font-medium text-blue-400 border border-blue-500/25 bg-blue-500/8 rounded-full px-3 py-1 mb-5 tracking-wide uppercase"
            >
              AI-powered study planner
            </motion.p>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring },
              }}
              className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight leading-tight"
            >
              Overcomplicating an assignment?
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 12, filter: 'blur(8px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring },
              }}
              className="text-base text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed"
            >
              Upload it and let AI turn it into a clear, actionable plan — critiqued and refined by a second AI pass.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: spring },
              }}
              className="mt-6"
            >
              <button
                onClick={handleDemo}
                className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded-full px-4 py-1.5 transition-all duration-200"
              >
                See a demo first — no API key needed →
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.45 }}
          className="max-w-2xl mx-auto px-6"
        >
          <StepIndicator currentStep={step} />
        </motion.div>

        {/* Wizard content */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...spring, delay: 0.6 }}
          className={containerClass}
        >
          {step === 1 && (
            <SetupStep onComplete={handleSetupComplete} />
          )}
          {step === 2 && ctx && (
            <UploadStep
              onBack={() => setStep(1)}
              onSubmit={handleUploadSubmit}
              loading={uploadLoading}
            />
          )}
          {step === 3 && ctx && uploadData && (
            <ResultsStep
              ctx={ctx}
              uploadData={uploadData}
              onStartOver={handleStartOver}
              demoData={isDemo ? { plan: DEMO_PLAN, critique: DEMO_CRITIQUE } : undefined}
            />
          )}
        </motion.div>
      </main>
    </div>
  )
}
