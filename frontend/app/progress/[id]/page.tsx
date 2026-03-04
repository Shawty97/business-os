'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const STEPS = [
  'Generiere Brand...',
  'Erstelle Marketing-Plan...',
  'Baue Sales-Materialien...',
  'Analysiere Tech Stack...',
  'Konfiguriere AI Agents...',
  'Berechne Revenue Modell...',
  'Erstelle ZIP-Archiv...',
  'Fertig! ✅',
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
        <p className="text-zinc-400 mb-8">Das dauert ca. 15-20 Minuten. Du kannst diese Seite offen lassen.</p>

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

        <div className="grid grid-cols-2 gap-2">
          {STEPS.map((step, i) => {
            const done = status.progress > (i + 1) * (100 / STEPS.length)
            const active = status.current_step === step
            return (
              <div key={step} className={`text-left text-xs px-3 py-2 rounded-lg ${done ? 'bg-green-500/10 text-green-400' : active ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-600'}`}>
                {done ? '✓ ' : active ? '⟳ ' : '○ '}{step}
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
