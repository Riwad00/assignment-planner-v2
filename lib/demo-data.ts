// lib/demo-data.ts
// Pre-baked plan + critique for demo mode — no API key required.
// Scenario: ESADE-style strategy report on digital transformation.

import type { PlanOutput, CritiqueOutput } from '@/lib/types'

export const DEMO_UPLOAD_DATA = {
  pdfText: '',
  taskInput: 'Write a 2,000-word strategy report on how a traditional European retailer should adapt its business model for the digital age. Must include a competitive analysis, three strategic recommendations, and an implementation roadmap. Due in 4 days, worth 25% of the module grade.',
  availableHours: 6,
  overwhelm: 'somewhat',
  contextNote: 'I have lectures tomorrow and a group project meeting on Thursday.',
}

export const DEMO_PLAN: PlanOutput = {
  assignment_snapshot: {
    title: 'Digital Transformation Strategy Report',
    core_goal: 'Analyse how a traditional European retailer should respond to digital disruption, with actionable recommendations and an implementation roadmap.',
    hard_requirements: [
      '2,000 words',
      'Competitive analysis section',
      'Three strategic recommendations',
      'Implementation roadmap',
    ],
    submission_format: 'PDF, submitted via the course portal',
    deadline_note: '4 days from now',
    grading_weights: [
      'Analysis quality (40%)',
      'Clarity of recommendations (35%)',
      'Presentation and structure (25%)',
    ],
  },
  complexity_verdict: 'Manageable',
  complexity_reason: 'Clear structure is given (analysis + recommendations + roadmap). The main effort is research and synthesis — nothing technically complex, but easy to over-write.',
  calm_intro: 'This report has a predictable shape: diagnose the situation, recommend three things, show how to do them. You are not being asked to invent anything — you are being asked to apply frameworks you already know (Porter, SWOT, value chain) to a specific context. Six hours spread across four days is plenty.',
  first_move: 'Open a blank doc and write the three section headings: Competitive Landscape, Strategic Recommendations, Implementation Roadmap. Then under each, write one bullet of what you already know. This takes 10 minutes and eliminates the blank-page problem entirely.',
  total_time_minutes: 340,
  what_to_cut: 'Skip a deep literature review — this is not a research paper. One or two citations per recommendation is enough. Also skip writing a formal executive summary until the report is done; students waste 40 minutes writing intros before they know what they are saying.',
  steps: [
    {
      step: 1,
      title: 'Map the competitive landscape (desk research)',
      what_to_do: 'Spend 45 minutes scanning three to four major European retailers (Zara, H&M, IKEA, Carrefour) and two digital-native competitors (Zalando, Amazon). Note their digital channels, loyalty programmes, and any recent tech investments. Use company investor reports and one industry summary (Statista, Euromonitor, or McKinsey retail report).',
      why_it_matters: 'The competitive analysis is 40% of your grade. Without concrete examples your report reads as generic — graders can tell immediately.',
      specific_notes: 'Do not try to be exhaustive. Two strong examples per point beat six shallow ones. Focus on what incumbents are doing badly, not just what digital players are doing well.',
      time_minutes: 45,
      procrastination_risk: false,
      procrastination_reason: undefined,
    },
    {
      step: 2,
      title: 'Write the Competitive Analysis section (600 words)',
      what_to_do: 'Draft the first major section using your research notes. Structure it as: (1) state the digital disruption pressure in 2–3 sentences, (2) show what digital-native competitors are doing, (3) show where incumbents are lagging. Use one framework — Porter\'s Five Forces or a simple 2×2 — to give the section visual structure.',
      why_it_matters: 'Writing this section first is strategic — it forces you to crystallise your thinking before you make recommendations. Recommendations written without a clear diagnosis always feel disconnected.',
      specific_notes: 'Aim for 600 words, not more. If you are hitting 800, cut the history. Graders read fast; clarity trumps comprehensiveness.',
      time_minutes: 60,
      procrastination_risk: true,
      procrastination_reason: 'This is the hardest section to start because it feels like you need to know everything before writing. You do not. Write with the 80% you have and fill gaps at the end.',
    },
    {
      step: 3,
      title: 'Define your three strategic recommendations',
      what_to_do: 'Before writing, decide on exactly three recommendations and write them as crisp one-sentence statements. Common strong options: (1) invest in unified online/offline inventory, (2) build a first-party data strategy via loyalty programme, (3) partner with last-mile logistics providers instead of building in-house. Choose ones you can defend with your research.',
      why_it_matters: 'The assignment explicitly asks for three recommendations worth 35% of the grade. Vague or overlapping recommendations are the most common reason for lost marks.',
      specific_notes: 'Each recommendation needs a "why now" rationale tied to your competitive analysis. If it does not connect back to Step 2, it will feel bolted on.',
      time_minutes: 20,
      procrastination_risk: false,
      procrastination_reason: undefined,
    },
    {
      step: 4,
      title: 'Write the Strategic Recommendations section (900 words)',
      what_to_do: 'Write 300 words per recommendation. Each mini-section should follow: (1) restate the recommendation clearly, (2) explain the strategic rationale with one piece of evidence from your research, (3) name one risk and how to mitigate it. This structure keeps you from rambling.',
      why_it_matters: 'This is the highest-value section. Concrete, well-structured recommendations with supporting evidence are what separates a B from an A.',
      specific_notes: 'Do not hedge with phrases like "the company could consider potentially exploring". Be direct. Professors assign low marks to cautious writing masquerading as nuance.',
      time_minutes: 75,
      procrastination_risk: true,
      procrastination_reason: 'Three recommendations feels like a lot to write at once. Break it into three separate 25-minute sprints — one per recommendation — with a 5-minute break between each.',
    },
    {
      step: 5,
      title: 'Build the Implementation Roadmap',
      what_to_do: 'Create a simple phased timeline: Phase 1 (0–6 months): quick wins — loyalty app relaunch, click-and-collect rollout. Phase 2 (6–18 months): data infrastructure, personalisation engine. Phase 3 (18–36 months): logistics partnerships, supply-chain integration. Present this as a table or a simple Gantt — much easier to read than prose.',
      why_it_matters: 'Without a roadmap the recommendations feel abstract. The roadmap shows you understand that strategy requires sequencing and resources.',
      specific_notes: 'Add one "key success metric" per phase (e.g. "30% of orders fulfilled via click-and-collect by month 6"). Metrics make the roadmap feel credible and give graders something concrete to evaluate.',
      time_minutes: 40,
      procrastination_risk: false,
      procrastination_reason: undefined,
    },
    {
      step: 6,
      title: 'Write introduction and conclusion (last)',
      what_to_do: 'Now that the body is done, write a 150-word introduction that previews the three recommendations, and a 150-word conclusion that restates the core argument and ends with one forward-looking sentence. Copy the first sentence of each section into the intro as signposts.',
      why_it_matters: 'Graders read the intro and conclusion carefully. A strong opening frame and a clean close signal a confident writer.',
      specific_notes: 'Write these last, not first. Your intro will be much stronger once you know exactly what you said.',
      time_minutes: 25,
      procrastination_risk: false,
      procrastination_reason: undefined,
    },
    {
      step: 7,
      title: 'Edit for word count and clarity',
      what_to_do: 'Paste the full draft into a word counter. If over 2,000 words, cut the most recent additions first — they are usually the least necessary. Read each paragraph aloud. Any sentence you stumble on should be rewritten. Cut filler phrases: "It is important to note that…", "As previously mentioned…", "In today\'s world…".',
      why_it_matters: 'A 2,500-word submission when 2,000 was asked signals poor discipline, not thoroughness. Graders notice.',
      specific_notes: 'Do not edit while writing — it kills momentum. This step happens only after a complete draft exists.',
      time_minutes: 30,
      procrastination_risk: false,
      procrastination_reason: undefined,
    },
    {
      step: 8,
      title: 'Format, cite, and submit',
      what_to_do: 'Apply consistent heading styles (Heading 1 / Heading 2 in Word), add page numbers, check that your name and student ID are on the cover page. Add citations for any statistics or company data you used — Harvard or APA, whichever the course requires. Export to PDF. Submit via portal.',
      why_it_matters: 'Formatting accounts for 25% of the grade. A well-structured document communicates professionalism and makes arguments easier to follow.',
      specific_notes: 'Do this the day before the deadline, not the morning of. Submission portals go down and PDFs sometimes convert badly.',
      time_minutes: 25,
      procrastination_risk: true,
      procrastination_reason: 'Formatting feels trivial so it gets left to the last 20 minutes. It always takes longer than expected. Block 25 minutes for it the day before.',
    },
  ],
}

export const DEMO_CRITIQUE: CritiqueOutput = {
  overall_quality: 'needs_work',
  summary: 'Solid structure but two steps underestimate time, one step is too vague about sources, and the roadmap lacks a metric suggestion. All fixable.',
  vague_steps: [
    {
      step: 1,
      issue: '"Industry summary" is too vague — students will waste time searching randomly.',
      suggestion: 'Name specific sources: McKinsey Global Retail Report 2023, Euromonitor Passport, or Statista Digital Commerce Europe. Saves 15 minutes of confused searching.',
    },
    {
      step: 3,
      issue: '"Common strong options" implies any of these work — but the student needs to commit to ones grounded in their research.',
      suggestion: 'Reframe as: choose the three recommendations that appear most often in your Step 1 research gaps. Anchors the decision in evidence rather than guesswork.',
    },
  ],
  time_issues: [
    {
      step: 2,
      current: 60,
      suggested: 75,
      reason: 'First-draft writing always takes longer than expected when research is still being processed. 60 minutes creates time pressure that leads to shallow analysis.',
    },
    {
      step: 4,
      current: 75,
      suggested: 90,
      reason: 'Three 300-word sections with structured reasoning — the first one will take 40 minutes alone while the pattern is established. Budget 90 minutes total.',
    },
  ],
  missing_steps: [
    {
      after_step: 1,
      title: 'Outline before writing',
      rationale: 'Jumping from research directly to drafting produces disorganised first sections. A 15-minute outline (bullet per paragraph) cuts total writing time by 30 minutes and improves logical flow significantly.',
    },
  ],
}
