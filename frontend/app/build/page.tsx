'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

export default function BuildPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    niche: '',
    target_market: '',
    business_model: 'Monthly Retainer',
    founder_name: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.job_id) {
        router.push(`/progress/${data.job_id}`)
      } else {
        throw new Error('Kein Job-ID erhalten')
      }
    } catch (e) {
      alert('Fehler beim Starten. Bitte nochmal versuchen.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Beschreibe dein Business</h2>
            <p className="text-zinc-400 mb-6">
              Was machst du? Für wen? Warum jetzt? 2-4 Sätze reichen.
            </p>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 resize-none h-40 focus:outline-none focus:border-indigo-500"
              placeholder="z.B. Eine AI Voice Agent Plattform für Versicherungsmakler in der DACH-Region. Automatisiert eingehende Anrufe, qualifiziert Leads und trägt sie ins CRM ein..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />

            <div className="mt-4">
              <label className="text-sm text-zinc-400 mb-1 block">Dein Name (optional)</label>
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                placeholder="z.B. Robert"
                value={form.founder_name}
                onChange={e => update('founder_name', e.target.value)}
              />
            </div>

            <button
              onClick={() => form.description.length > 20 && setStep(2)}
              disabled={form.description.length < 20}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Weiter →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">3 kurze Fragen</h2>
            <p className="text-zinc-400 mb-6">Damit das Business-Paket + die AI-Agents zu dir passen.</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">In welcher Nische? *</label>
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="z.B. AI Automation, E-Commerce, SaaS, Coaching"
                  value={form.niche}
                  onChange={e => update('niche', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Zielmarkt / Zielgruppe *</label>
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="z.B. KMU DACH, Versicherungsmakler, Coaches 30-50 Jahre"
                  value={form.target_market}
                  onChange={e => update('target_market', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Business-Modell</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  value={form.business_model}
                  onChange={e => update('business_model', e.target.value)}
                >
                  <option value="Monthly Retainer">Monthly Retainer (Abo)</option>
                  <option value="One-Time + Revenue Share">One-Time + Revenue Share</option>
                  <option value="Project-Based">Projekt-basiert</option>
                  <option value="Freemium SaaS">Freemium SaaS</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Agency">Agentur-Modell</option>
                </select>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-6 text-sm text-zinc-400">
              <div className="font-semibold text-white mb-2">🤖 Was du bekommst:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>✓ Brand + Positioning</div>
                <div>✓ Marketing-Plan (90 Tage)</div>
                <div>✓ Sales Deck (HTML)</div>
                <div>✓ Tech Stack</div>
                <div>✓ AI Agents Konfiguration</div>
                <div>✓ Revenue-Modell + Break-Even</div>
              </div>
              <div className="mt-2 text-indigo-400 font-semibold">⏱ ~90 Sekunden · 49 EUR</div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                ← Zurück
              </button>
              <button
                onClick={submit}
                disabled={loading || !form.niche || !form.target_market}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? '⏳ Wird gestartet...' : '🚀 Business bauen für €49'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
