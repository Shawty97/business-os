import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-5xl mx-auto w-full">

        {/* Hero Badge */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-1.5 rounded-full">
            <span>⚡</span>
            <span>Powered by A-Impact · AI Business Operating System</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1.5 rounded-full">
            <span>🏆</span>
            <span>NVIDIA Inception</span>
          </div>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Dein Business läuft.{" "}
          <span className="gradient-text">Du entscheidest nur noch.</span>
        </h1>

        <p className="text-xl text-zinc-400 mb-4 max-w-2xl mx-auto leading-relaxed">
          Business OS erstellt deine Firma in 90 Sekunden — komplett.
          Brand, Marketing, Sales, Landing Page, 6 AI-Agenten.
          Dann betreiben sie dein Business autonom.
        </p>

        <p className="text-sm text-indigo-400/80 mb-12 max-w-xl mx-auto">
          Kein Tech-Wissen. Keine Agentur. Kein Team. Nur du und deine Idee.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            href="/build"
          >
            Business starten →
          </Link>
          <Link
            href="/demo"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-zinc-800 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Live Demo (90 Sek.)</span>
          </Link>
        </div>

        <p className="text-zinc-600 text-xs mb-16">
          €49 Starter · €299/Mo Operator · Kein Risiko — Geld zurück wenn du nicht zufrieden bist
        </p>

        {/* Social Proof Numbers */}
        <div className="grid grid-cols-3 gap-6 mb-20 max-w-2xl mx-auto">
          {[
            { value: '90s', label: 'bis zur fertigen Firma' },
            { value: '11', label: 'Dokumente pro Business' },
            { value: '6', label: 'AI-Agenten im Team' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-white mb-1">{value}</div>
              <div className="text-zinc-500 text-sm">{label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mb-20 text-left">
          <h2 className="text-3xl font-black mb-2 text-center text-white">In 3 Schritten zur laufenden Firma</h2>
          <p className="text-zinc-500 text-sm text-center mb-10">Was klassische Berater 3 Monate und €10.000 kosten würde.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Beschreiben',
                desc: 'Du beschreibst deine Idee in 2-4 Sätzen. Nische, Zielmarkt, Business-Modell. 5 Minuten.',
                icon: '✍️',
              },
              {
                num: '02',
                title: 'Generieren',
                desc: '90 Sekunden. 11 Dokumente: Brand, Marketing-Plan, Sales Deck, Tech Stack, Revenue-Modell, CEO Dashboard.',
                icon: '⚡',
              },
              {
                num: '03',
                title: 'Betreiben',
                desc: '6 AI-Agenten übernehmen Sales, Marketing, Support, Finance. Du triffst nur noch Entscheidungen.',
                icon: '🤖',
              },
            ].map(({ num, title, desc, icon }) => (
              <div key={num} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-3xl font-black text-indigo-400 mb-2">{num}</div>
                <div className="font-bold text-white mb-2 text-lg">{title}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Team */}
        <div id="agents" className="mb-20">
          <h2 className="text-3xl font-black mb-2 text-white">Dein AI-Team</h2>
          <p className="text-zinc-500 text-sm mb-10">Eingestellt. Trainiert. Sofort einsatzbereit. Kein Onboarding.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {[
              { icon: '🎯', name: 'Sales Agent', desc: 'Leads qualifizieren, Follow-ups, Deals abschließen' },
              { icon: '📢', name: 'Marketing Agent', desc: 'Content, Social Media, Email-Kampagnen automatisch' },
              { icon: '💬', name: 'Support Agent', desc: 'Kundenfragen beantworten — 24/7, auf Deutsch' },
              { icon: '💰', name: 'Finance Agent', desc: 'Invoicing, Umsatz tracken, monatliche Reports' },
              { icon: '📊', name: 'Analytics Agent', desc: 'Tägliches CEO-Briefing, KPIs, Alerts' },
              { icon: '⚡', name: 'Ops Agent', desc: 'Prozesse automatisieren, Integrationen managen' },
            ].map(({ icon, name, desc }) => (
              <div key={name} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-semibold text-white mb-1">{name}</div>
                <div className="text-sm text-zinc-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="mb-20">
          <h2 className="text-3xl font-black mb-2 text-white">Pricing</h2>
          <p className="text-zinc-500 text-sm mb-10">Kein Risiko. Wir verdienen wenn du verdienst.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wide mb-3">Starter</div>
              <div className="text-4xl font-black text-white mb-1">€49 <span className="text-xl font-normal text-zinc-500">einmalig</span></div>
              <div className="text-zinc-500 text-sm mb-5">Business-Paket + CEO Dashboard (30 Tage)</div>
              <ul className="text-sm text-zinc-400 space-y-1.5 mb-6">
                {['Brand + Positioning', 'Marketing-Plan (90 Tage)', 'Sales Deck (HTML)', 'Tech Stack Empfehlung', 'Revenue-Modell + Break-Even', 'CEO Dashboard'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-indigo-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/build" className="block text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Starten →
              </Link>
            </div>
            <div className="bg-indigo-900/20 border-2 border-indigo-500/40 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">BELIEBT</div>
              <div className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-3">Operator</div>
              <div className="text-4xl font-black text-white mb-1">€299 <span className="text-xl font-normal text-zinc-400">/Mo</span></div>
              <div className="text-zinc-400 text-sm mb-5">+ 3% Revenue Share bis €50K Umsatz</div>
              <ul className="text-sm text-zinc-300 space-y-1.5 mb-6">
                {['Alles aus Starter', 'Landing Page deployed', 'Stripe + Booking live', '6 AI-Agenten dauerhaft aktiv', 'Wöchentliches Marketing auto', 'Strategy Call monatlich'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-indigo-400">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/demo" className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
                Demo starten →
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/pricing" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Enterprise ab €1.500/Mo → <span className="text-indigo-400">Alle Pläne ansehen</span>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20 text-left max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-10 text-center text-white">Häufige Fragen</h2>
          <div className="space-y-3">
            {[
              { q: 'Brauche ich Tech-Kenntnisse?', a: 'Nein. Du tippst eine Beschreibung. Wir kümmern uns um alles.' },
              { q: 'Was ist Revenue Share?', a: 'Du zahlst €299/Mo und 3% deines Umsatzes bis du €50K/Mo verdienst. Danach 0%. Wir haben ein direktes Interesse an deinem Wachstum.' },
              { q: 'Kann ich monatlich kündigen?', a: 'Ja. Keine Mindestlaufzeit, kein Vertrag. Kündigung per E-Mail.' },
              { q: 'Was unterscheidet das von ChatGPT?', a: 'ChatGPT gibt Text. Business OS deployt deine Landing Page, aktiviert AI-Agenten und betreibt dein Business autonom. Wir sind kein Tool — wir sind dein erstes Team.' },
            ].map(({ q, a }) => (
              <details key={q} className="bg-zinc-900 border border-zinc-800 rounded-xl">
                <summary className="p-4 font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                  {q} <span className="text-zinc-500 text-sm">+</span>
                </summary>
                <div className="px-4 pb-4 text-zinc-400 text-sm leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mb-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-10">
          <h2 className="text-3xl font-black mb-3 text-white">Bereit in 90 Sekunden?</h2>
          <p className="text-zinc-400 mb-6">Starte jetzt — keine Kreditkarte nötig für die Demo.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              ⚡ Live Demo — 90 Sekunden
            </Link>
            <Link href="/build" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Eigenes Business bauen
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
