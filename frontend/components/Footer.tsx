import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-black text-white mb-3">⚡ Business OS</div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              KI-gesteuerte Firma. Du entscheidest nur noch.
              Powered by A-Impact.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Produkt</div>
            <div className="space-y-2">
              {[['Demo', '/demo'], ['Build', '/build'], ['Pricing', '/pricing']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-zinc-500 hover:text-white text-sm transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">A-Impact</div>
            <div className="space-y-2">
              {[['a-impact.io', 'https://a-impact.io'], ['Colony CRM', 'https://platform-ai-mpact.vercel.app'], ['Kontakt', 'mailto:apex@a-impact.io']].map(([l, h]) => (
                <a key={h} href={h} className="block text-zinc-500 hover:text-white text-sm transition-colors" target={h.startsWith('http') ? '_blank' : undefined}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Legal</div>
            <div className="space-y-2 text-zinc-500 text-sm">
              <div>ALMPACT LTD</div>
              <div>Paphos, Zypern</div>
              <div className="text-xs text-zinc-600">DSGVO-konform</div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-zinc-600 text-xs">© 2026 ALMPACT LTD · A-Impact Business OS</p>
          <div className="flex gap-4">
            <a href="https://a-impact.io" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white text-xs transition-colors">Website</a>
            <a href="mailto:apex@a-impact.io" className="text-zinc-600 hover:text-white text-xs transition-colors">E-Mail</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
