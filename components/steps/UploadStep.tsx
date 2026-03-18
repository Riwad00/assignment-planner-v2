'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { UploadData } from '@/lib/types'

interface Props {
  onBack: () => void
  onSubmit: (data: UploadData) => void
  loading: boolean
}

const OVERWHELM_OPTIONS = ['Meh', 'A bit', 'Quite a lot', 'Send help']

export function UploadStep({ onBack, onSubmit, loading }: Props) {
  const [pdfText, setPdfText] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfParsing, setPdfParsing] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [hours, setHours] = useState(2)
  const [overwhelm, setOverwhelm] = useState('Quite a lot')
  const [contextNote, setContextNote] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(file: File | null) {
    if (!file) return
    setPdfParsing(true)
    setPdfError('')
    setPdfText('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) {
        setPdfError(data.error)
      } else {
        setPdfText(data.text)
        setPdfName(file.name)
      }
    } catch {
      setPdfError('Failed to parse PDF')
    } finally {
      setPdfParsing(false)
    }
  }

  const hasInput = pdfText.trim() || taskInput.trim()

  return (
    <div className="space-y-8 fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Tell us about your assignment</h2>
        <p className="text-sm text-zinc-400">Upload a PDF or describe it in a line.</p>
      </div>

      {/* PDF Drop Zone */}
      <div
        onClick={() => { if (!pdfParsing) inputRef.current?.click() }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!pdfParsing) handleFileChange(e.dataTransfer.files[0] ?? null) }}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group backdrop-blur-sm ${
          pdfText
            ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
            : 'border-zinc-700/60 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          disabled={pdfParsing}
          onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {pdfParsing ? (
          <p className="text-zinc-400 text-sm phase-pulse">Parsing PDF…</p>
        ) : pdfText ? (
          <div className="space-y-1.5">
            <p className="text-emerald-400 font-medium">✓ {pdfName}</p>
            <p className="text-zinc-500 text-xs">{pdfText.length.toLocaleString()} characters extracted · click to replace</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-300 font-medium group-hover:text-zinc-100 transition-colors">Drop your assignment PDF here</p>
              <p className="text-zinc-600 text-xs mt-1">or click to browse</p>
            </div>
          </div>
        )}
        {pdfError && <p className="text-red-400 text-xs mt-3">{pdfError}</p>}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/60" /></div>
        <div className="relative flex justify-center"><span className="px-3 text-xs text-zinc-600 bg-zinc-950">or describe it in a line</span></div>
      </div>

      <Input
        value={taskInput}
        onChange={e => setTaskInput(e.target.value)}
        placeholder="e.g. Write a 10-page report on climate change with bibliography"
        className="bg-zinc-900/60 border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 h-11"
      />

      {/* Controls */}
      <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm p-5 space-y-6">
        {/* Hours slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-300 font-medium">Time available</span>
            <Badge variant="outline" className="font-mono text-blue-300 border-blue-500/30 bg-blue-500/8">
              {hours}h
            </Badge>
          </div>
          <input
            type="range" min={0.5} max={8} step={0.5} value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full accent-blue-500"
            aria-label="Time available in hours"
          />
        </div>

        {/* Overwhelm selector */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 font-medium">How overwhelming does this feel?</p>
          <div className="flex gap-2 flex-wrap">
            {OVERWHELM_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setOverwhelm(opt)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  overwhelm === opt
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Context note */}
        <div className="space-y-2">
          <p className="text-sm text-zinc-300 font-medium">Any context? <span className="text-zinc-600 font-normal">(optional)</span></p>
          <Input
            value={contextNote}
            onChange={e => setContextNote(e.target.value)}
            placeholder="e.g. Due tomorrow, first time doing this type of assignment"
            className="bg-zinc-800/60 border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600">
          ← Back
        </Button>
        <Button
          onClick={() => onSubmit({ pdfText, taskInput, availableHours: hours, overwhelm, contextNote })}
          disabled={!hasInput || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 h-12 text-base"
          size="lg"
        >
          {loading ? 'Analysing…' : 'Generate Plan →'}
        </Button>
      </div>
    </div>
  )
}
