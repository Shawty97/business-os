import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-8">
          Powered by A-Impact · AI Business Builder
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Du gibst eine Idee ein.{' '}
          <span className="gradient-text">Wir bauen die Firma.</span>
        </h1>

        <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto leading-relaxed">
          In 20 Minuten: Brand, Marketing-Plan, Sales Deck, Tech Stack, AI Agents, Revenue-Modell — als fertiges ZIP-Paket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/build"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Business bauen →
          </Link>
          <a
            href="#what-you-get"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-zinc-800"
          >
            Was bekommst du?
          </a>
        </div>

        <div id="what-you-get" className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: '🎨', title: 'Brand', desc: 'Name, Farben, Tagline, Positioning' },
            { icon: '📢', title: 'Marketing-Plan', desc: '90-Tage Strategie, Woche für Woche' },
            { icon: '💰', title: 'Sales Deck', desc: 'Fertige Präsentation für Kunden' },
            { icon: '⚙️', title: 'Tech Stack', desc: 'Architektur-Empfehlung, Repo-Struktur' },
            { icon: '🤖', title: 'AI Agents', desc: '8 Agents mit ROI-Kalkulation' },
            { icon: '📊', title: 'Revenue Modell', desc: 'Break-Even, 6-Monats-Projektion' },
          ].map((item) => (
            <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-white mb-1">{item.title}</div>
              <div className="text-sm text-zinc-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-zinc-600 text-sm">
          Erstellt mit A-Impact Business OS v2.0 · ALMPACT LTD
        </p>
      </div>
    </main>
  )
}
