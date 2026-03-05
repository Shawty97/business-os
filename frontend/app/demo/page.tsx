'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

const DEMO_BUSINESSES = [
  {
    description: "KI-gestützte Marketing-Automatisierung für Zahnarztpraxen in Deutschland. Automatisiert Patienten-Kommunikation, Google Reviews und Social Media.",
    niche: "Dental Marketing",
    target_market: "Zahnarztpraxen 3-15 Mitarbeiter, DACH-Region",
    business_model: "Monthly Retainer",
    founder_name: "Demo Nutzer",
  },
  {
    description: "Voice AI Agent für Versicherungsmakler. Beantwortet Kundenanrufe 24/7, qualifiziert Leads und trägt Daten ins CRM ein.",
    niche: "Insurance AI",
    target_market: "Versicherungsmakler und Generalagenturen, Deutschland",
    business_model: "Monthly Retainer",
    founder_name: "Demo Nutzer",
  },
  {
    description: "Automatisierte Buchführung und Steuer-Compliance für Freelancer und kleine Unternehmen in Europa.",
    niche: "FinTech / Accounting",
    target_market: "Selbstständige und GmbHs bis 500K EUR Umsatz",
    business_model: "Monthly Retainer",
    founder_name: "Demo Nutzer",
  },
]

export default function DemoPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'selecting' | 'building' | 'ready'>('selecting')
  const [selected, setSelected] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')

  const startDemo = async (idx: number) => {
    setSelected(idx)
    setStatus('building')
    const demo = DEMO_BUSINESSES[idx]

    try {
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demo),
      })
      const { job_id } = await res.json()

      // Poll for completion
      const poll = setInterval(async () => {
        const statusRes = await fetch(`${API}/api/jobs/${job_id}/status`)
        const data = await statusRes.json()
        setProgress(data.progress || 0)
        setStep(data.current_step || '')

        if (data.status === 'done') {
          clearInterval(poll)
          setStatus('ready')
          setTimeout(() => router.push(`/dashboard/${job_id}`), 1500)
        }
        if (data.status === 'failed') {
          clearInterval(poll)
          setStatus('selecting')
        }
      }, 2000)
    } catch {
      setStatus('selecting')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">

        {status === 'selecting' && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black mb-3">⚡ Live Demo</h1>
              <p className="text-zinc-400">Wähle ein Business — wir bauen es in 90 Sekunden für dich.</p>
            </div>

            <div className="space-y-4">
              {DEMO_BUSINESSES.map((b, i) => (
                <button
                  key={i}
                  onClick={() => startDemo(i)}
                  className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500/50 rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-block bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded mb-2">{b.niche}</div>
                      <p className="text-white text-sm leading-relaxed">{b.description}</p>
                      <p className="text-zinc-500 text-xs mt-2">Zielmarkt: {b.target_market}</p>
                    </div>
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors ml-4 text-lg">→</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-zinc-600 text-xs mt-6">
              Oder <a href="/build" className="text-indigo-400 hover:underline">eigenes Business eingeben →</a>
            </p>
          </>
        )}

        {status === 'building' && (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🚀</div>
            <h2 className="text-3xl font-bold mb-2">Dein Business wird gebaut...</h2>
            <p className="text-zinc-400 mb-8 text-sm">{step || 'Initialisiere...'}</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
              <div className="flex justify-between text-sm text-zinc-400 mb-2">
                <span>Fortschritt</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              {['Brand + Positioning', 'Marketing-Plan', 'Sales Deck', 'AI Agent Config', 'Revenue-Modell', 'CEO Dashboard'].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 text-sm ${progress > (i + 1) * 14 ? 'text-green-400' : 'text-zinc-600'}`}
                >
                  <span>{progress > (i + 1) * 14 ? '✓' : '○'}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-3">Fertig! Öffne CEO Dashboard...</h2>
            <p className="text-zinc-400">Du wirst weitergeleitet.</p>
          </div>
        )}

      </div>
    </main>
  )
}
