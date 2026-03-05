'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Decision = {
  id: string
  title: string
  description: string
  options: string[]
  agent: string
  urgency: 'high' | 'medium' | 'low'
  created_at: string
}

type Briefing = { briefing?: string; result?: string }

const URGENCY_COLORS = {
  high: 'border-red-500/40 bg-red-500/5',
  medium: 'border-yellow-500/40 bg-yellow-500/5',
  low: 'border-zinc-700 bg-zinc-900',
}

const URGENCY_BADGE = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-zinc-700 text-zinc-400',
}

export default function CEODashboard() {
  const { id } = useParams()
  const businessId = id as string

  const [briefing, setBriefing] = useState<string>('')
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [resolvedCount, setResolvedCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [brandName, setBrandName] = useState<string>('')

  // Load decisions + brand on mount
  useEffect(() => {
    loadDecisions()
    loadRunnerStatus()
    // Try to get brand name from result
    fetch(`${API}/api/jobs/${businessId}/result`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.brand_name && setBrandName(d.brand_name))
      .catch(() => {})
  }, [businessId])

  const loadDecisions = async () => {
    try {
      const res = await fetch(`${API}/api/decisions/${businessId}`)
      if (res.ok) {
        const data = await res.json()
        setDecisions(data.decisions || [])
        setResolvedCount(data.resolved_count || 0)
      }
    } catch {}
  }

  const generateBriefing = async () => {
    setBriefingLoading(true)
    setBriefing('')
    try {
      const res = await fetch(`${API}/api/agents/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          task: 'Erstelle ein prägnantes CEO-Briefing für heute. Was sind die wichtigsten Prioritäten?',
          context: {
            business_name: brandName || 'Mein Business',
            period: 'heute',
            metrics: { revenue_today: 0, leads_active: 0, tickets_open: 0, agents_active: 6 }
          }
        })
      })
      const data: Briefing = await res.json()
      setBriefing(data.briefing || data.result || 'Kein Briefing erhalten.')
      setLastUpdated(new Date().toLocaleTimeString('de-DE'))
      // Reload decisions (analytics agent may have created some)
      await loadDecisions()
    } catch {
      setBriefing('Fehler beim Generieren. Backend erreichbar?')
    } finally {
      setBriefingLoading(false)
    }
  }

  const resolveDecision = async (decisionId: string, option: string) => {
    try {
      await fetch(`${API}/api/decisions/${businessId}/${decisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chosen_option: option })
      })
      await loadDecisions()
    } catch {}
  }

  const kpis = [
    { label: 'Umsatz heute', value: '€0', sub: 'Stripe verbinden', icon: '💰', color: 'text-green-400' },
    { label: 'Aktive Leads', value: '0', sub: 'Sales Agent', icon: '🎯', color: 'text-indigo-400' },
    { label: 'Offene Tickets', value: '0', sub: 'Support Agent', icon: '💬', color: 'text-blue-400' },
    { label: 'Agents aktiv', value: '4', sub: 'Alle operational', icon: '🤖', color: 'text-emerald-400' },
  ]

  const agents = [
    { name: 'Sales', icon: '🎯', status: 'active', endpoint: 'sales', task: 'Analysiere Leads und erstelle Top-3 Empfehlungen für heute' },
    { name: 'Marketing', icon: '📢', status: 'active', endpoint: 'marketing', task: 'Erstelle 3 LinkedIn Post Ideen für diese Woche' },
    { name: 'Support', icon: '💬', status: 'active', endpoint: 'support', task: 'Wie reagiere ich auf einen Kunden der sein Abo kündigen möchte?' },
    { name: 'Analytics', icon: '📊', status: 'active', endpoint: 'analytics', task: 'CEO Briefing für heute' },
    { name: 'Finance', icon: '💰', status: 'active', endpoint: 'finance', task: 'Erstelle einen Monats-Report mit Umsatzprognose' },
    { name: 'Ops', icon: '⚡', status: 'active', endpoint: 'ops', task: 'Welche Prozesse können diese Woche automatisiert werden?' },
  ]
  const [agentResult, setAgentResult] = useState<{name:string; result:string} | null>(null)
  const [agentLoading, setAgentLoading] = useState('')
  const [runnerStatus, setRunnerStatus] = useState<any>(null)
  const [runnerLoading, setRunnerLoading] = useState(false)
  const [aiCycleResults, setAiCycleResults] = useState<any[]>([])
  const [aiCycleLoading, setAiCycleLoading] = useState(false)

  const loadRunnerStatus = async () => {
    try {
      const res = await fetch(`${API}/api/v3/runner/status/${businessId}`)
      if (res.ok) setRunnerStatus(await res.json())
    } catch {}
  }

  const startRunner = async () => {
    setRunnerLoading(true)
    try {
      const res = await fetch(`${API}/api/v3/runner/start/${businessId}`, { method: 'POST' })
      const data = await res.json()
      setRunnerStatus(data.status)
    } catch {} finally { setRunnerLoading(false) }
  }

  const runAiCycle = async () => {
    setAiCycleLoading(true)
    setAiCycleResults([])
    try {
      const res = await fetch(`${API}/api/v3/runner/ai-cycle/${businessId}`, { method: 'POST' })
      const data = await res.json()
      setAiCycleResults(data.results || [])
      setRunnerStatus(data.status)
    } catch {} finally { setAiCycleLoading(false) }
  }

  const testAgent = async (agent: typeof agents[0]) => {
    setAgentLoading(agent.name)
    setAgentResult(null)
    try {
      const res = await fetch(`${API}/api/agents/${agent.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, task: agent.task, context: { business_name: brandName || 'Mein Business' } })
      })
      const data = await res.json()
      const result = data.briefing || data.response || data.plan || data.strategy || data.report || JSON.stringify(data).slice(0, 500)
      setAgentResult({ name: agent.name, result })
    } catch { setAgentResult({ name: agent.name, result: 'Fehler beim Aufrufen des Agents.' }) }
    finally { setAgentLoading('') }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-zinc-500 text-sm mb-1">⚡ CEO Dashboard {brandName ? `— ${brandName}` : ''}</div>
          <h1 className="text-3xl font-black text-white">{brandName || 'Mein Business'}</h1>
          {lastUpdated && <div className="text-xs text-zinc-500 mt-1">Briefing: {lastUpdated}</div>}
        </div>
        <button
          onClick={generateBriefing}
          disabled={briefingLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          {briefingLoading ? (
            <><span className="animate-spin">⟳</span> Generiere...</>
          ) : (
            <>📊 CEO Briefing generieren</>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl mb-2">{kpi.icon}</div>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-white font-semibold text-sm mt-1">{kpi.label}</div>
            <div className="text-zinc-500 text-xs">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* CEO Briefing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            📋 <span>Tägliches Briefing</span>
          </h2>
          {briefing ? (
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {briefing}
            </div>
          ) : (
            <div className="text-zinc-500 text-sm">
              Klicke oben auf "CEO Briefing generieren" um dein tägliches Update von deinen AI-Agents zu erhalten.
            </div>
          )}
        </div>

        {/* Agent Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2">
            🤖 <span>Agents — klicken zum Testen</span>
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {agents.map(agent => (
              <button
                key={agent.name}
                onClick={() => testAgent(agent)}
                disabled={agentLoading === agent.name}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 text-left transition-colors group"
              >
                <span>{agent.icon}</span>
                <span className="text-white text-sm font-medium flex-1">{agent.name}</span>
                {agentLoading === agent.name
                  ? <span className="animate-spin text-indigo-400">⟳</span>
                  : <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-indigo-400 transition-colors"></span>
                }
              </button>
            ))}
          </div>
          {agentResult && (
            <div className="mt-4 bg-zinc-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-indigo-400 mb-2">{agentResult.name} Agent →</div>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {agentResult.result}
              </div>
              <button onClick={() => setAgentResult(null)} className="text-xs text-zinc-600 hover:text-white mt-2">
                ✕ Schließen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Agent Runner — BOS v3 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            🚀 <span>Agent Runner</span>
            {runnerStatus?.running && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                AKTIV
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            {!runnerStatus?.running ? (
              <button onClick={startRunner} disabled={runnerLoading}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold">
                {runnerLoading ? '⟳ Starte...' : '▶ Runner starten'}
              </button>
            ) : (
              <button onClick={runAiCycle} disabled={aiCycleLoading}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold">
                {aiCycleLoading ? '⟳ Agents arbeiten...' : '🧠 AI-Zyklus starten'}
              </button>
            )}
          </div>
        </div>

        {runnerStatus && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{runnerStatus.total_actions}</div>
              <div className="text-xs text-zinc-500">Aktionen</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{runnerStatus.uptime || '0m'}</div>
              <div className="text-xs text-zinc-500">Uptime</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{runnerStatus.agents_active?.length || 0}</div>
              <div className="text-xs text-zinc-500">Agents</div>
            </div>
          </div>
        )}

        {aiCycleLoading && (
          <div className="text-center py-8">
            <div className="text-4xl animate-bounce mb-3">🧠</div>
            <div className="text-indigo-400 font-semibold animate-pulse">6 AI-Agents arbeiten mit GPT-4o...</div>
            <div className="text-xs text-zinc-500 mt-1">Marketing · Sales · Analytics · Support · Finance · Ops</div>
          </div>
        )}

        {aiCycleResults.length > 0 && (
          <div className="space-y-3 mt-4">
            {aiCycleResults.map((r, i) => (
              <details key={i} className="bg-zinc-800 rounded-xl border border-zinc-700">
                <summary className="px-4 py-3 cursor-pointer flex items-center gap-2 text-sm font-semibold text-white hover:text-indigo-400">
                  <span>{{'marketing':'📢','sales':'🎯','analytics':'📊','support':'💬','finance':'💰','ops':'⚡'}[r.agent] || '🤖'}</span>
                  <span className="capitalize">{r.agent}</span>
                  <span className="text-xs text-zinc-500 ml-auto">{r.action}</span>
                </summary>
                <div className="px-4 pb-4 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {r.result}
                </div>
              </details>
            ))}
          </div>
        )}

        {!runnerStatus && (
          <div className="text-zinc-500 text-sm text-center py-4">
            Agent Runner noch nicht gestartet. Klicke "Runner starten" um dein Business autonom zu betreiben.
          </div>
        )}
      </div>

      {/* Decision Queue — THE UNIQUE FEATURE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            ⚡ <span>Decision Queue</span>
            {decisions.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {decisions.length} offen
              </span>
            )}
          </h2>
          <span className="text-xs text-zinc-500">{resolvedCount} gelöst</span>
        </div>

        {decisions.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-6">
            ✅ Keine offenen Entscheidungen — Agents laufen autonom
            <div className="text-xs mt-1">Generiere ein CEO Briefing um neue Tasks zu sehen</div>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map(decision => (
              <div key={decision.id} className={`border rounded-xl p-4 ${URGENCY_COLORS[decision.urgency]}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-semibold text-white text-sm">{decision.title}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">{decision.description}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCY_BADGE[decision.urgency]}`}>
                      {decision.urgency}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                      {decision.agent}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {decision.options.map(option => (
                    <button
                      key={option}
                      onClick={() => resolveDecision(decision.id, option)}
                      className="text-sm bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-zinc-700 hover:border-indigo-500"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h2 className="font-bold text-white mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href={`/deploy/${businessId}`}
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-indigo-900/30 hover:border-indigo-500/30 border border-zinc-700 rounded-xl p-4 transition-all text-center"
          >
            <span className="text-2xl">🚀</span>
            <span className="text-xs font-semibold text-white">Landing Page deployen</span>
          </a>
          <a
            href={`/result/${businessId}`}
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-4 transition-all text-center"
          >
            <span className="text-2xl">📄</span>
            <span className="text-xs font-semibold text-white">Dokumente ansehen</span>
          </a>
          <a
            href={`${API}/deck/${businessId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-4 transition-all text-center"
          >
            <span className="text-2xl">📑</span>
            <span className="text-xs font-semibold text-white">Sales Deck</span>
          </a>
          <a
            href="https://cal.com/a-impact/strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-4 transition-all text-center"
          >
            <span className="text-2xl">📅</span>
            <span className="text-xs font-semibold text-white">Strategy Call buchen</span>
          </a>
          <a
            href="/build"
            className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl p-4 transition-all text-center"
          >
            <span className="text-2xl">➕</span>
            <span className="text-xs font-semibold text-white">Neues Business starten</span>
          </a>
        </div>
      </div>

      <div className="text-center text-zinc-600 text-xs">
        Business OS CEO Dashboard · A-Impact
      </div>
    </main>
  )
}
