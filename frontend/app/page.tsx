export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-4xl mx-auto">

        <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-8">
          Powered by A-Impact · AI Business Operating System
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Dein Business läuft.{" "}
          <span className="gradient-text">Du entscheidest nur noch.</span>
        </h1>

        <p className="text-xl text-zinc-400 mb-4 max-w-2xl mx-auto leading-relaxed">
          Business OS deployed deine Firma — und stellt AI-Agenten ein, die sie betreiben.
          Sales, Marketing, Support, Finance. Alles autonom.
        </p>

        <p className="text-sm text-indigo-400/80 mb-12 max-w-xl mx-auto">
          Du bekommst einen CEO-Dashboard mit täglicherem Briefing. 
          Agenten bringen dir nur noch Entscheidungen — alles andere läuft.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            href="/build"
          >
            Business starten →
          </a>
          <a
            href="/demo"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-zinc-800"
          >
            ⚡ Live Demo (90 Sek.)
          </a>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-zinc-200">In 3 Schritten zur laufenden Firma</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-3xl font-black text-indigo-400 mb-3">01</div>
              <div className="font-bold text-white mb-2 text-lg">Eingabe</div>
              <div className="text-sm text-zinc-400 leading-relaxed">
                Name, Nische, Zielmarkt, Business-Modell. 
                5 Minuten. Kein Tech-Wissen nötig.
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-3xl font-black text-indigo-400 mb-3">02</div>
              <div className="font-bold text-white mb-2 text-lg">Deploy</div>
              <div className="text-sm text-zinc-400 leading-relaxed">
                Landing Page live. Stripe-Zahlungen aktiv. 
                Buchungssystem. Welcome-Emails. Alles fertig in 72h.
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-3xl font-black text-indigo-400 mb-3">03</div>
              <div className="font-bold text-white mb-2 text-lg">Betrieb</div>
              <div className="text-sm text-zinc-400 leading-relaxed">
                AI-Agenten übernehmen Sales, Marketing, Support.
                Du triffst nur noch die wichtigen Entscheidungen.
              </div>
            </div>
          </div>
        </div>

        {/* AI Agents */}
        <div id="what-you-get" className="mb-16">
          <h2 className="text-2xl font-bold mb-2 text-zinc-200">Dein AI-Team</h2>
          <p className="text-zinc-500 text-sm mb-8">Eingestellt. Trainiert. Sofort einsatzbereit.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-white mb-1">Sales Agent</div>
              <div className="text-sm text-zinc-500">Leads qualifizieren, Follow-ups, Deals abschließen</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">📢</div>
              <div className="font-semibold text-white mb-1">Marketing Agent</div>
              <div className="text-sm text-zinc-500">Content, Social Media, Email-Kampagnen</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold text-white mb-1">Support Agent</div>
              <div className="text-sm text-zinc-500">Kundenfragen 24/7 beantworten</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-white mb-1">Finance Agent</div>
              <div className="text-sm text-zinc-500">Invoicing, Umsatz tracken, Reports</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-white mb-1">Analytics Agent</div>
              <div className="text-sm text-zinc-500">Tägliches CEO-Briefing, KPIs, Alerts</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold text-white mb-1">Ops Agent</div>
              <div className="text-sm text-zinc-500">Prozesse automatisieren, Integrationen managen</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-2 text-zinc-200">Pricing</h2>
          <p className="text-zinc-500 text-sm mb-8">Kein Risiko. Wir verdienen nur wenn du verdienst.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-indigo-400 text-sm font-semibold mb-2">STARTER</div>
              <div className="text-3xl font-black text-white mb-1">€49 <span className="text-lg font-normal text-zinc-500">einmalig</span></div>
              <div className="text-zinc-400 text-sm mb-4">Business-Dokumente + Blueprint</div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>✓ Brand + Positioning</li>
                <li>✓ Marketing-Plan (90 Tage)</li>
                <li>✓ Sales Deck</li>
                <li>✓ Tech Stack Empfehlung</li>
                <li>✓ Revenue-Modell + Break-Even</li>
              </ul>
            </div>
            <div className="bg-indigo-900/30 border border-indigo-500/40 rounded-xl p-6">
              <div className="text-indigo-400 text-sm font-semibold mb-2">OPERATOR <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">NEU</span></div>
              <div className="text-3xl font-black text-white mb-1">€299 <span className="text-lg font-normal text-zinc-400">/Mo</span></div>
              <div className="text-zinc-400 text-sm mb-4">+ 3% Revenue Share bis 50K EUR</div>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>✓ Alles aus Starter</li>
                <li>✓ Landing Page deployed</li>
                <li>✓ Stripe + Booking live</li>
                <li>✓ 6 AI-Agenten aktiv</li>
                <li>✓ Tägliches CEO-Briefing</li>
                <li>✓ Decision Queue Dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-4 text-zinc-600 text-sm">
          Business OS v2.0 · ALMPACT LTD · A-Impact
        </p>
      </div>
    </main>
  );
}
