import { PlanOutputSchema, CritiqueOutputSchema, ResourceCardSchema } from '@/lib/types'

test('PlanOutputSchema rejects empty object', () => {
  const result = PlanOutputSchema.safeParse({})
  expect(result.success).toBe(false)
})

test('PlanOutputSchema accepts minimal valid plan', () => {
  const result = PlanOutputSchema.safeParse({
    assignment_snapshot: {
      title: 'Test', core_goal: 'Test goal',
      hard_requirements: [], submission_format: null,
      deadline_note: null, grading_weights: []
    },
    complexity_verdict: 'right',
    complexity_reason: 'reason',
    calm_intro: 'intro',
    steps: [{
      step: 1, title: 'Step 1', what_to_do: 'do it',
      why_it_matters: 'matters', specific_notes: 'notes',
      time_minutes: 30, procrastination_risk: false
    }],
    total_time_minutes: 30,
    what_to_cut: 'nothing',
    first_move: 'start here'
  })
  expect(result.success).toBe(true)
})

test('CritiqueOutputSchema requires overall_quality', () => {
  const result = CritiqueOutputSchema.safeParse({ summary: 'ok' })
  expect(result.success).toBe(false)
})

test('ResourceCardSchema validates correctly', () => {
  const result = ResourceCardSchema.safeParse({
    title: 'Guide', url: 'https://example.com',
    source: 'example.com', summary: 'A guide',
    relevance: 'Relevant because'
  })
  expect(result.success).toBe(true)
})
