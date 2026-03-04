import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business OS — A-Impact',
  description: 'Du gibst eine Idee ein. Wir bauen die Firma.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-black text-white min-h-screen antialiased">{children}</body>
    </html>
  )
}
