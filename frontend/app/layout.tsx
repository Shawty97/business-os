import type { Metadata } from 'next'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Business OS — A-Impact',
  description: 'Du gibst eine Idee ein. Wir bauen die Firma.',
  openGraph: {
    title: 'Business OS — A-Impact',
    description: 'Dein Business läuft. Du entscheidest nur noch.',
    siteName: 'A-Impact Business OS',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-black text-white min-h-screen antialiased">
        <Header />
        <div className="min-h-[calc(100vh-56px)]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
