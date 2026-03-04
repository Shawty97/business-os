'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function BuildPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    zielgruppe: '',
    land: 'DE',
    budget: 'niedrig <5K',
    timeline: '3 Monate',
    unique_edge: '',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          qualifications: {
            zielgruppe: form.zielgruppe,
            land: form.land,
            budget: form.budget,
            timeline: form.timeline,
            unique_edge: form.unique_edge,
          }
        })
      })
      const data = await res.json()
      router.push(`/progress/${data.job_id}`)
    } catch (e) {
      alert('Fehler beim Starten. Ist das Backend erreichbar?')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Beschreibe dein Business</h2>
            <p className="text-zinc-400 mb-6">2-5 Sätze reichen. Was machst du, für wen, warum jetzt?</p>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 resize-none h-40 focus:outline-none focus:border-indigo-500"
              placeholder="z.B. Eine AI Voice Agent Plattform für Versicherungsmakler in der DACH-Region. Automatisiert eingehende Anrufe, qualifiziert Leads und trägt sie ins CRM ein..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
            />
            <button
              onClick={() => form.description.length > 20 && setStep(2)}
              disabled={form.description.length < 20}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Weiter →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-2">5 kurze Fragen</h2>
            <p className="text-zinc-400 mb-6">Damit das Business-Paket zu dir passt.</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Zielgruppe</label>
                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="z.B. Versicherungsmakler, 10-50 MA, DACH"
                  value={form.zielgruppe} onChange={e => update('zielgruppe', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Land / Region</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={form.land} onChange={e => update('land', e.target.value)}>
                    <option value="DE">🇩🇪 Deutschland</option>
                    <option value="DACH">🇩🇪🇦🇹🇨🇭 DACH</option>
                    <option value="EU">🇪🇺 Europa</option>
                    <option value="US">🇺🇸 USA</option>
                    <option value="Global">🌍 Global</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Budget für Start</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    value={form.budget} onChange={e => update('budget', e.target.value)}>
                    <option value="niedrig <5K">Niedrig (&lt;5K)</option>
                    <option value="mittel 5-20K">Mittel (5-20K)</option>
                    <option value="hoch >20K">Hoch (&gt;20K)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Timeline für MVP</label>
                <select className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  value={form.timeline} onChange={e => update('timeline', e.target.value)}>
                  <option>2 Wochen</option>
                  <option>4 Wochen</option>
                  <option>3 Monate</option>
                  <option>6 Monate</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Was macht dich einzigartig?</label>
                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  placeholder="z.B. DSGVO-konform, auf Deutsch, Branchen-spezifisch"
                  value={form.unique_edge} onChange={e => update('unique_edge', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors">
                ← Zurück
              </button>
              <button
                onClick={submit}
                disabled={loading || !form.zielgruppe || !form.unique_edge}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? '⏳ Wird gestartet...' : '🚀 Business bauen!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
