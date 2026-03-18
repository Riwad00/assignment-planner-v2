import { z } from 'zod'

export type Provider = 'openai' | 'anthropic' | 'cohere' | 'gemini'

export interface LLMContext {
  provider: Provider
  apiKey: string
  model: string
}

export interface AnalyzeRequest extends LLMContext {
  pdfText: string
  taskInput: string
  availableHours: number
  overwhelm: string
  contextNote: string
}

export interface CritiqueRequest extends LLMContext {
  plan: PlanOutput
  pdfText?: string
  taskInput?: string
}

export interface RefineRequest extends LLMContext {
  plan: PlanOutput
  critique: CritiqueOutput
}

export interface ResourcesRequest extends LLMContext {
  stepTitle: string
  whatToDo: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatStepRequest extends LLMContext {
  plan: PlanOutput
  stepNumber: number
  messages: ChatMessage[]
}

const AssignmentSnapshotSchema = z.object({
  title: z.string(),
  core_goal: z.string(),
  hard_requirements: z.array(z.string()),
  submission_format: z.string().nullable(),
  deadline_note: z.string().nullable(),
  grading_weights: z.array(z.string()),
})

const StepSchema = z.object({
  step: z.number(),
  title: z.string(),
  what_to_do: z.string(),
  why_it_matters: z.string(),
  specific_notes: z.string(),
  time_minutes: z.number(),
  procrastination_risk: z.boolean(),
  procrastination_reason: z.string().optional(),
})

export const PlanOutputSchema = z.object({
  assignment_snapshot: AssignmentSnapshotSchema,
  complexity_verdict: z.string(),
  complexity_reason: z.string(),
  calm_intro: z.string(),
  steps: z.array(StepSchema).min(1),
  total_time_minutes: z.number(),
  what_to_cut: z.string(),
  first_move: z.string(),
})

export const CritiqueOutputSchema = z.object({
  overall_quality: z.enum(['good', 'needs_work', 'poor']),
  vague_steps: z.array(z.object({
    step: z.number(),
    issue: z.string(),
    suggestion: z.string(),
  })),
  time_issues: z.array(z.object({
    step: z.number(),
    current: z.number(),
    suggested: z.number(),
    reason: z.string(),
  })),
  missing_steps: z.array(z.object({
    after_step: z.number(),
    title: z.string(),
    rationale: z.string(),
  })),
  summary: z.string(),
})

export const ResourceCardSchema = z.object({
  title: z.string(),
  url: z.string(),
  source: z.string(),
  summary: z.string(),
  relevance: z.string(),
})

export const ResourcesOutputSchema = z.object({
  resources: z.array(ResourceCardSchema),
})

export type PlanOutput = z.infer<typeof PlanOutputSchema>
export type CritiqueOutput = z.infer<typeof CritiqueOutputSchema>
export type ResourceCard = z.infer<typeof ResourceCardSchema>
export type PlanStep = z.infer<typeof StepSchema>

export interface UploadData {
  pdfText: string
  taskInput: string
  availableHours: number
  overwhelm: string
  contextNote: string
}

export type PhaseStatus = 'pending' | 'loading' | 'done' | 'error' | 'skipped'

export interface PipelinePhase {
  id: string
  label: string
  status: PhaseStatus
  errorMsg?: string
}
