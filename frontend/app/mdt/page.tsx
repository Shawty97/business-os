'use client'
import { useEffect, useState } from 'react'

const MDT_API = 'http://187.124.4.166:8002'
const BOS_API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Agent = { name: string; squad: string; role: string; capabilities: string[] }
type TaskResult = { task_type: string; result: string; agent: string }

const SQUAD_COLORS: Record<string, string> = {
  content: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  email: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  seo: 'bg-green-500/15 text-green-400 border-green-500/20',
  ads: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  social: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  analytics: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  pr: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  growth: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const SQUAD_ICONS: Record<string, string> = {
  content: '📝', email: '📧', seo: '🔍', ads: '📣',
  social: '🌐', analytics: '📊', pr: '📰', growth: '🚀',
}

const QUICK_TASKS = [
  { label: 'LinkedIn Post', type: 'write_linkedin_post', icon: '💼', desc: 'Professioneller LinkedIn Post für dein Business' },
  { label: 'Cold Email', type: 'write_cold_email', icon: '📧', desc: 'Personalisierte Cold Email für Outreach' },
  { label: 'Content Kalender', type: 'plan_content_calendar', icon: '📅', desc: '30-Tage Content-Kalender mit Themen und Kanälen' },
]

export default function MDTPage() {
  const [health, setHealth] = useState<any>(null)
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null)
  const [taskLoading, setTaskLoading] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [customResult, setCustomResult] = useState('')
  const [customLoading, setCustomLoading] = useState(false)

  useEffect(() => {
    fetch(`${MDT_API}/health`)
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth({ status: 'error' }))
  }, [])

  const runTask = async (taskType: string) => {
    setTaskLoading(taskType)
    setTaskResult(null)
    try {
      const res = await fetch(`${MDT_API}/tasks/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'a-impact' },
        body: JSON.stringify({
          task_type: taskType,
          context: {
            company_name: 'A-Impact',
            industry: 'AI Operations',
            target_audience: 'DACH Mittelstand (10-500 Mitarbeiter)',
            tone: 'Professional, direkt, deutsch',
            product: 'AI Operations — Voice Agents, Business OS, Marketing Dream Team',
          }
        })
      })
      const data = await res.json()
      setTaskResult({
        task_type: taskType,
        result: data.result || data.content || data.output || JSON.stringify(data, null, 2),
        agent: data.agent || 'MDT'
      })
    } catch (e: any) {
      setTaskResult({ task_type: taskType, result: `Fehler: ${e.message}`, agent: 'error' })
    } finally {
      setTaskLoading('')
    }
  }

  const runCustom = async () => {
    if (!customPrompt.trim()) return
    setCustomLoading(true)
    setCustomResult('')
    try {
      const res = await fetch(`${MDT_API}/tasks/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'a-impact' },
        body: JSON.stringify({
          task_type: 'write_linkedin_post',
          context: {
            company_name: 'A-Impact',
            custom_prompt: customPrompt,
            tone: 'deutsch, direkt',
          }
        })
      })
      const data = await res.json()
      setCustomResult(data.result || data.content || JSON.stringify(data, null, 2))
    } catch (e: any) {
      setCustomResult(`Fehler: ${e.message}`)
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-zinc-500 text-sm mb-1">📢 Marketing Dream Team</div>
          <h1 className="text-3xl font-black text-white">MDT Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">40 AI-Agents · 8 Squads · 198 Task Types</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
          <span className="text-sm text-zinc-400">{health?.status === 'healthy' ? 'Operational' : 'Checking...'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-orange-400">40</div>
          <div className="text-xs text-zinc-500 mt-1">AI Agents</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-cyan-400">8</div>
          <div className="text-xs text-zinc-500 mt-1">Squads</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-purple-400">198</div>
          <div className="text-xs text-zinc-500 mt-1">Task Types</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">24/7</div>
          <div className="text-xs text-zinc-500 mt-1">Active</div>
        </div>
      </div>

      {/* Squad Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">🎯 Squads</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(SQUAD_ICONS).map(([squad, icon]) => (
            <div key={squad} className={`border rounded-xl p-4 ${SQUAD_COLORS[squad] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
              <div className="text-xl mb-2">{icon}</div>
              <div className="text-sm font-bold capitalize">{squad}</div>
              <div className="text-xs opacity-60 mt-1">5 Agents</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tasks */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">⚡ Quick Tasks — Sofort ausführen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_TASKS.map(task => (
            <button
              key={task.type}
              onClick={() => runTask(task.type)}
              disabled={taskLoading === task.type}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 text-left transition-all group"
            >
              <div className="text-2xl mb-2">{task.icon}</div>
              <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{task.label}</div>
              <div className="text-xs text-zinc-500 mt-1">{task.desc}</div>
              {taskLoading === task.type && (
                <div className="text-xs text-indigo-400 mt-3 animate-pulse">⟳ Agent arbeitet...</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task Result */}
      {taskResult && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
              {taskResult.task_type.replace(/_/g, ' ')} — {taskResult.agent}
            </div>
            <button onClick={() => setTaskResult(null)} className="text-xs text-zinc-600 hover:text-white">✕</button>
          </div>
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {taskResult.result}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(taskResult.result)}
            className="mt-3 text-xs text-zinc-500 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg"
          >
            📋 Kopieren
          </button>
        </div>
      )}

      {/* Custom Prompt */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-bold text-white mb-3">🧠 Custom Task</h2>
        <p className="text-zinc-500 text-sm mb-4">Gib den AI-Agents einen beliebigen Marketing-Auftrag.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runCustom()}
            placeholder="z.B. Erstelle 5 Headlines für eine Insurance Landing Page..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={runCustom}
            disabled={customLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl"
          >
            {customLoading ? '⟳' : '→'}
          </button>
        </div>
        {customResult && (
          <div className="mt-4 bg-zinc-800 rounded-xl p-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {customResult}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-6 text-center">
        <div className="text-2xl mb-2">📢</div>
        <h3 className="text-xl font-bold text-white mb-2">Marketing Dream Team als Service</h3>
        <p className="text-zinc-400 text-sm mb-4">Komplette Marketing-Abteilung für €2.000-4.000/Mo. 40 Agents, 198 Tasks, 24/7.</p>
        <a href="/pricing" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-xl inline-block transition-colors">
          Pricing ansehen →
        </a>
      </div>

      <div className="mt-8 text-center text-zinc-600 text-xs">
        Marketing Dream Team · A-Impact · 40 Agents · 8 Squads · 198 Task Types
      </div>
    </main>
  )
}
