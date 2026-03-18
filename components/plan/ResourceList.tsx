// components/plan/ResourceList.tsx
import { Card, CardContent } from '@/components/ui/card'
import type { ResourceCard } from '@/lib/types'

interface Props {
  resources: ResourceCard[]
  loading: boolean
  error?: string
}

export function ResourceList({ resources, loading, error }: Props) {
  if (loading) {
    return (
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg bg-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="mt-3 text-xs text-red-400">{error}</p>
  }

  if (!resources.length) return null

  return (
    <div className="mt-3 space-y-2 fade-in-up">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Resources</p>
      {resources.map((r, i) => (
        <Card key={r.url || i} className="border-zinc-800 bg-zinc-900/60">
          <CardContent className="p-3">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline line-clamp-1"
            >
              {r.title}
            </a>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{r.source}</p>
            <p className="text-xs text-zinc-400 mt-1">{r.summary}</p>
            <p className="text-xs text-zinc-500 mt-0.5 italic">{r.relevance}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
