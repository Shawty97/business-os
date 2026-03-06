'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

const VERTICALS = ['Insurance', 'Automotive', 'Immobilien', 'Dental', 'Callcenter', 'Coaches', 'Orthopädie', 'SaaS', 'Forex', 'Tourism']
const COUNTRIES = ['DE', 'AT', 'CH', 'UK', 'US', 'CY', 'AE']

type Lead = {
  company: string
  country: string
  vertical: string
  city: string
  employees: string
  pain_point: string
  outreach_hook: string
  buyer_title: string
  linkedin_message?: string
  email_subject?: string
}

export default function OutreachPage() {
  const [vertical, setVertical] = useState('Insurance')
  const [country, setCountry] = useState('DE')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const search = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v3/outreach/leads?vertical=${vertical}&country=${country}&limit=20`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch { setLeads([]) }
    setLoading(false)
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-zinc-500 text-sm mb-1">🎯 Lead Pipeline</div>
        <h1 className="text-3xl font-black text-white">Outreach Engine</h1>
        <p className="text-zinc-400 text-sm mt-1">Finde Leads nach Branche und Land — mit personalisierten Outreach-Hooks.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select value={vertical} onChange={e => setVertical(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none">
          {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none">
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={search} disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          {loading ? '⟳ Suche...' : '🔍 Leads finden'}
        </button>
        <div className="flex items-center text-zinc-500 text-sm ml-auto">
          {leads.length > 0 && `${leads.length} Ergebnisse`}
        </div>
      </div>

      {/* Results */}
      {leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all">
              <button onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {{'DE':'🇩🇪','AT':'🇦🇹','CH':'🇨🇭','UK':'🇬🇧','US':'🇺🇸','CY':'🇨🇾','AE':'🇦🇪'}[lead.country] || '🌍'}
                  </div>
                  <div>
                    <div className="font-bold text-white">{lead.company}</div>
                    <div className="text-xs text-zinc-500">{lead.city} · {lead.employees} MA · {lead.buyer_title}</div>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  lead.vertical === 'Insurance' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' :
                  lead.vertical === 'Automotive' ? 'bg-orange-500/15 text-orange-400 border-orange-500/20' :
                  lead.vertical === 'Dental' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' :
                  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                }`}>{lead.vertical}</span>
              </button>
              {expanded === i && (
                <div className="border-t border-zinc-800 p-4 space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pain Point</div>
                    <div className="text-sm text-zinc-300">{lead.pain_point}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Outreach Hook</div>
                    <div className="text-sm text-indigo-400">{lead.outreach_hook}</div>
                  </div>
                  {lead.linkedin_message && (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">LinkedIn Message</div>
                      <div className="text-sm text-zinc-300 bg-zinc-800 rounded-lg p-3">{lead.linkedin_message}</div>
                      <button onClick={() => navigator.clipboard.writeText(lead.linkedin_message || '')}
                        className="text-xs text-zinc-600 hover:text-white mt-2">📋 Kopieren</button>
                    </div>
                  )}
                  {lead.email_subject && (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Email Betreff</div>
                      <div className="text-sm text-zinc-300">{lead.email_subject}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {leads.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-zinc-400">Wähle Vertical + Land und klicke „Leads finden"</div>
          <div className="text-zinc-600 text-sm mt-2">234+ Leads in 8 Verticals und 7 Ländern</div>
        </div>
      )}
    </main>
  )
}
