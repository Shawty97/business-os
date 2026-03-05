'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Result = { brand_name: string; tagline: string; files: string[]; zip_url: string }
type Preview = {
  brand_name: string; tagline: string
  brand: {
    colors?: Record<string,string>; positioning?: string; tone?: string
    names_alternatives?: string[]; tagline?: string
  }
  quick_start_bullets: string[]
  revenue_headline: string
  agents_preview?: { name: string; rolle: string; prioritaet: string }[]
}

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
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/jobs/${id}/result`)
      .then(r => r.json())
      .then(setResult)
      .catch(() => setError('Ergebnis nicht gefunden.'))
    fetch(`${API}/api/jobs/${id}/preview`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPreview(d))
      .catch(() => {})
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

        {/* Preview Cards */}
        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {preview.brand.positioning && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 col-span-full">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-2">🎨 Brand Positioning</div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-3">{preview.brand.positioning}</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {preview.brand.tone && (
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">Ton: {preview.brand.tone}</span>
                  )}
                  {preview.brand.colors && Object.entries(preview.brand.colors).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: v as string }} />
                      <span>{v as string}</span>
                    </div>
                  ))}
                  {preview.brand.names_alternatives && preview.brand.names_alternatives.length > 1 && (
                    <div className="text-xs text-zinc-500">Alt. Namen: {preview.brand.names_alternatives.slice(1).join(', ')}</div>
                  )}
                </div>
              </div>
            )}
            {preview.quick_start_bullets.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-3">🚀 Quick Start — Erste 7 Tage</div>
                <ul className="space-y-1.5">
                  {preview.quick_start_bullets.map((b, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex gap-2">
                      <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                      <span>{b.replace(/^\[[ x]\] /, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {preview.revenue_headline && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide mb-2">💰 Revenue Modell</div>
                <p className="text-zinc-300 text-sm leading-relaxed">{preview.revenue_headline}</p>
              </div>
            )}
            {preview.agents_preview && preview.agents_preview.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 col-span-full">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3">🤖 Deine Business-Agents</div>
                <div className="grid grid-cols-2 gap-2">
                  {preview.agents_preview.map((a, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${a.prioritaet === 'Hoch' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        {a.prioritaet}
                      </span>
                      <div>
                        <div className="text-white text-xs font-semibold">{a.name}</div>
                        <div className="text-zinc-500 text-xs">{a.rolle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* CTA Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={`/dashboard/${id}`}
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-4 rounded-xl transition-colors"
          >
            <span>⚡</span>
            <div className="text-left">
              <div className="font-bold">CEO Dashboard öffnen</div>
              <div className="text-indigo-200 text-xs">6 AI-Agents starten, Decision Queue</div>
            </div>
          </a>
          <a
            href={`/deploy/${id}`}
            className="flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-indigo-500/30 text-white font-bold px-6 py-4 rounded-xl transition-colors"
          >
            <span>🚀</span>
            <div className="text-left">
              <div className="font-bold">Operator Plan — Landing Page deployen</div>
              <div className="text-indigo-400 text-xs">Live URL in ~30 Sekunden · 6 Agents · CEO Dashboard</div>
            </div>
          </a>
        </div>

        <div className="mt-6 text-center">
          <a href="/build" className="text-indigo-400 hover:text-indigo-300 text-sm">
            + Nächstes Business bauen
          </a>
        </div>
      </div>
    </main>
  )
}
