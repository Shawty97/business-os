'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Runner = {
  job_id: string
  brand_name: string
  running: boolean
  total_actions: number
  last_action: { timestamp: string; agent: string; action: string; result: string } | null
}

export default function RunnersPage() {
  const [runners, setRunners] = useState<Runner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/v3/runners`)
      .then(r => r.json())
      .then(d => setRunners(d.runners || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-zinc-500 text-sm mb-1">🚀 Business OS v3</div>
        <h1 className="text-3xl font-black text-white">Active Runners</h1>
        <p className="text-zinc-400 text-sm mt-2">
          Businesses die autonom von AI-Agents betrieben werden.
        </p>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-center py-12 animate-pulse">Laden...</div>
      ) : runners.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-white font-bold mb-2">Noch keine aktiven Runner</div>
          <div className="text-zinc-500 text-sm mb-4">
            Erstelle ein Business über /demo und starte den Agent Runner im CEO Dashboard.
          </div>
          <a href="/demo" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold inline-block">
            Business erstellen
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {runners.map(runner => (
            <a
              key={runner.job_id}
              href={`/dashboard/${runner.job_id}`}
              className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${runner.running ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                  <h2 className="text-lg font-bold text-white">{runner.brand_name}</h2>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${runner.running ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                  {runner.running ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{runner.total_actions}</div>
                  <div className="text-xs text-zinc-500">Aktionen</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">6</div>
                  <div className="text-xs text-zinc-500">Agents</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {runner.last_action ? new Date(runner.last_action.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                  <div className="text-xs text-zinc-500">Letzte Aktion</div>
                </div>
              </div>
              {runner.last_action && (
                <div className="mt-3 text-xs text-zinc-500 truncate">
                  Letzte Aktion: <span className="text-zinc-400">{runner.last_action.agent}</span> → {runner.last_action.action}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-zinc-600 text-xs">
        Business OS v3 — Firma-Operator · A-Impact
      </div>
    </main>
  )
}
