import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-white text-lg hover:text-indigo-400 transition-colors">
          <span className="text-indigo-400">⚡</span>
          <span>Business OS</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/build" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            Business bauen
          </Link>
          <Link
            href="/build"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Starten →
          </Link>
        </nav>
      </div>
    </header>
  )
}
