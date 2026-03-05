'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

const STEPS = [
  { text: 'Generiere Brand & Positioning...', icon: '🎨', detail: 'AI analysiert deinen Markt und erstellt eine einzigartige Marke' },
  { text: 'Erstelle 90-Tage Marketing-Plan...', icon: '📢', detail: 'Woche für Woche, Task für Task — sofort umsetzbar' },
  { text: 'Baue Sales Deck & Outreach...', icon: '💰', detail: 'Pricing, Pitch, Einwandbehandlung, LinkedIn Templates' },
  { text: 'Analysiere optimalen Tech Stack...', icon: '⚙️', detail: 'Frontend, Backend, AI-Layer — alles konfiguriert' },
  { text: 'Trainiere 6 AI-Agenten...', icon: '🤖', detail: 'Sales, Marketing, Support, Finance, Analytics, Ops' },
  { text: 'Berechne Revenue-Modell...', icon: '📊', detail: 'Break-Even, Projektionen, KPIs — realistisch, nicht Fantasy' },
  { text: 'Erstelle Pitch & Business Card...', icon: '📑', detail: 'Fertig zum Teilen mit Investoren und Kunden' },
  { text: 'Dein Business ist fertig! ✅', icon: '🚀', detail: 'CEO Dashboard wird geladen...' },
]

export default function ProgressPage() {
  const { id } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState({ progress: 0, current_step: 'Starte...', status: 'pending' })

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${id}/status`)
        const data = await res.json()
        setStatus(data)
        if (data.status === 'done') {
          clearInterval(poll)
          setTimeout(() => router.push(`/result/${id}`), 1000)
        }
        if (data.status === 'failed') clearInterval(poll)
      } catch {}
    }, 2000)
    return () => clearInterval(poll)
  }, [id, router])

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="text-6xl mb-6 animate-pulse">🏗️</div>
        <h2 className="text-3xl font-bold mb-2">Dein Business wird gebaut</h2>
        <p className="text-zinc-400 mb-8">Das dauert ca. 90 Sekunden. AI generiert dein komplettes Business-Paket.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between text-sm text-zinc-400 mb-2">
            <span>{status.current_step || 'Starte...'}</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {STEPS.map((step, i) => {
            const threshold = (i + 1) * (100 / STEPS.length)
            const done = status.progress >= threshold
            const active = status.progress >= threshold - (100 / STEPS.length) && status.progress < threshold
            return (
              <div key={step.text} className={`text-left px-4 py-3 rounded-xl transition-all duration-500 ${done ? 'bg-emerald-500/10 border border-emerald-500/20' : active ? 'bg-indigo-500/10 border border-indigo-500/20 animate-pulse' : 'border border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${done ? '' : active ? 'animate-spin-slow' : 'opacity-30'}`}>
                    {done ? '✅' : step.icon}
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${done ? 'text-emerald-400' : active ? 'text-indigo-400' : 'text-zinc-600'}`}>
                      {step.text}
                    </div>
                    {(done || active) && (
                      <div className={`text-xs mt-0.5 ${done ? 'text-emerald-400/60' : 'text-indigo-400/60'}`}>
                        {step.detail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {status.status === 'failed' && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            ❌ Fehler aufgetreten. Bitte versuche es erneut.
          </div>
        )}
      </div>
    </main>
  )
}
