import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-6">
          Transparent. Kein Verstecktes.
        </div>
        <h1 className="text-5xl font-black mb-4">Pricing</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Wir verdienen nur wenn du verdienst. 
          Revenue Share statt hohe Setup-Fees.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

        {/* Starter */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 flex flex-col">
          <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wide mb-4">Starter</div>
          <div className="text-4xl font-black text-white mb-1">€49</div>
          <div className="text-zinc-500 text-sm mb-6">einmalig</div>
          <ul className="space-y-2 text-sm text-zinc-300 mb-8 flex-1">
            {[
              'Brand + Positioning',
              'Marketing-Plan (90 Tage)',
              'Sales Deck (HTML)',
              'Tech Stack Empfehlung',
              'Revenue-Modell',
              'CEO Dashboard (30 Tage)',
              'ZIP-Download aller Dokumente',
            ].map(f => (
              <li key={f} className="flex gap-2"><span className="text-indigo-400">✓</span>{f}</li>
            ))}
          </ul>
          <Link
            href="/build"
            className="text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Starten →
          </Link>
        </div>

        {/* Operator */}
        <div className="bg-indigo-900/20 border-2 border-indigo-500/50 rounded-2xl p-7 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            EMPFOHLEN
          </div>
          <div className="text-indigo-400 text-sm font-semibold uppercase tracking-wide mb-4">Operator</div>
          <div className="text-4xl font-black text-white mb-1">€299</div>
          <div className="text-zinc-400 text-sm mb-1">/Monat</div>
          <div className="text-indigo-400/70 text-xs mb-6">+ 3% Revenue Share bis €50K Umsatz</div>
          <ul className="space-y-2 text-sm text-zinc-200 mb-8 flex-1">
            {[
              'Alles aus Starter',
              'Landing Page live deployt',
              'Stripe + Booking System',
              '6 AI-Agents aktiv',
              'Tägliches CEO-Briefing',
              'Decision Queue Dashboard',
              'Erste Content-Woche auto-generiert',
              'Welcome Email Sequenz',
              'Monthly Strategy Call',
            ].map(f => (
              <li key={f} className="flex gap-2"><span className="text-indigo-400">✓</span>{f}</li>
            ))}
          </ul>
          <a
            href="https://cal.com/a-impact/strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Strategy Call buchen →
          </a>
        </div>

        {/* Enterprise */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 flex flex-col">
          <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wide mb-4">Enterprise</div>
          <div className="text-4xl font-black text-white mb-1">Custom</div>
          <div className="text-zinc-500 text-sm mb-6">ab €1.500/Mo</div>
          <ul className="space-y-2 text-sm text-zinc-300 mb-8 flex-1">
            {[
              'White-Label Lösung',
              'Custom Agent-Training',
              'Dedicated Account Manager',
              'API-Zugang zu allen Agents',
              'Eigene Vercel/AWS Infra',
              'SLA + Priority Support',
              'Revenue Share-Modell verhandelbar',
            ].map(f => (
              <li key={f} className="flex gap-2"><span className="text-indigo-400">✓</span>{f}</li>
            ))}
          </ul>
          <a
            href="mailto:apex@a-impact.io"
            className="text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Kontakt aufnehmen →
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Häufige Fragen</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Was ist Revenue Share?',
              a: 'Wir nehmen 3% deines monatlichen Umsatzes bis du €50.000 Umsatz pro Monat erreichst. Danach: 0%. Wir haben ein Incentive damit du wächst.',
            },
            {
              q: 'Kann ich monatlich kündigen?',
              a: 'Ja. Kein Vertrag, keine Mindestlaufzeit. Kündigung per E-Mail, sofort wirksam zum Monatsende.',
            },
            {
              q: 'Was passiert nach dem Deploy?',
              a: 'Deine Agents laufen weiter. CEO Dashboard bleibt aktiv. Du bekommst tägliche Briefings. Wir optimieren auf Basis deiner Entscheidungen.',
            },
            {
              q: 'Brauche ich Tech-Kenntnisse?',
              a: 'Nein. Du schreibst Text, wir kümmern uns um alles andere. Landing Page, Hosting, Agents, Analytics — komplett managed.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="font-semibold text-white mb-2">{q}</div>
              <div className="text-zinc-400 text-sm leading-relaxed">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-zinc-900 border border-zinc-800 rounded-2xl p-10">
        <h2 className="text-3xl font-black mb-3">Bereit loszulegen?</h2>
        <p className="text-zinc-400 mb-6">Dein erstes Business in 90 Sekunden. Keine Kreditkarte nötig.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            ⚡ Live Demo starten
          </Link>
          <Link
            href="/build"
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Eigenes Business bauen
          </Link>
        </div>
      </div>
    </main>
  )
}
