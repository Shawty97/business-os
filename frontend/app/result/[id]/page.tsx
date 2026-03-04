'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Result = { brand_name: string; tagline: string; files: string[]; zip_url: string }

const FILE_META: Record<string, { icon: string; label: string; desc: string }> = {
  'BRAND.json':        { icon: '🎨', label: 'Brand',          desc: 'Name, Farben, UVP, Positioning' },
  'MARKETING_PLAN.md': { icon: '📢', label: 'Marketing-Plan', desc: '90-Tage Strategie' },
  'SALES.json':        { icon: '💰', label: 'Sales',          desc: 'Pricing, Pitch, Einwände' },
  'TECH_STACK.json':   { icon: '⚙️', label: 'Tech Stack',     desc: 'Architektur, Timeline' },
  'AI_AGENTS.json':    { icon: '🤖', label: 'AI Agents',      desc: '8 Agents mit ROI' },
  'REVENUE_MODEL.md':  { icon: '📊', label: 'Revenue',        desc: 'Break-Even, Projektionen' },
  'SOUL.md':           { icon: '🧠', label: 'AI Operator',    desc: 'SOUL.md für deinen Agent' },
  'QUICK_START.md':    { icon: '🚀', label: 'Quick Start',    desc: '7-Tage Aktionsplan' },
  'SALES_DECK.html':   { icon: '📑', label: 'Sales Deck',     desc: 'Fertige Präsentation' },
}

export default function ResultPage() {
  const { id } = useParams()
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/jobs/${id}/result`)
      .then(r => r.json())
      .then(setResult)
      .catch(() => setError('Ergebnis nicht gefunden.'))
  }, [id])

  if (error) return <main className="min-h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></main>
  if (!result) return <main className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></main>

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-4xl font-black mb-2">{result.brand_name}</h1>
          <p className="text-xl text-zinc-400 italic mb-8">"{result.tagline}"</p>

          <a
            href={`${API}${result.zip_url}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            📦 Business-Paket herunterladen (ZIP)
          </a>
        </div>

        <h2 className="text-xl font-bold mb-4 text-zinc-300">Was enthalten ist:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.files.map(file => {
            const meta = FILE_META[file] || { icon: '📄', label: file, desc: '' }
            return (
              <div key={file} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3">
                <span className="text-2xl">{meta.icon}</span>
                <div>
                  <div className="font-semibold text-white">{meta.label}</div>
                  <div className="text-sm text-zinc-500">{meta.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <a href="/build" className="text-indigo-400 hover:text-indigo-300 text-sm">
            + Nächstes Business bauen
          </a>
        </div>
      </div>
    </main>
  )
}
