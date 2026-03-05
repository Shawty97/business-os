'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type DeployState = {
  deploy_status: 'pending' | 'building' | 'live' | 'failed' | 'not_found'
  url: string
  error: string
}

export default function DeployPage() {
  const { id } = useParams()
  const router = useRouter()
  const [deployState, setDeployState] = useState<DeployState>({ deploy_status: 'pending', url: '', error: '' })
  const [started, setStarted] = useState(false)

  const startDeploy = async () => {
    setStarted(true)
    try {
      // Get result data first
      const resultRes = await fetch(`${API}/api/jobs/${id}/result`)
      if (!resultRes.ok) throw new Error('Job nicht gefunden')
      const result = await resultRes.json()

      // Trigger v3 deploy
      const deployRes = await fetch(`${API}/api/v3/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: id,
          brand_name: result.brand_name,
          tagline: result.tagline,
          niche: 'Business',
          target_market: 'Kunden',
          business_model: 'Subscription',
          primary_color: '#6366f1',
        })
      })
      const deployData = await deployRes.json()
      setDeployState({ deploy_status: 'building', url: '', error: '' })
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Unbekannter Fehler'
      setDeployState({ deploy_status: 'failed', url: '', error: errorMsg })
    }
  }

  // Poll deploy status
  useEffect(() => {
    if (!started || deployState.deploy_status === 'live' || deployState.deploy_status === 'failed') return
    if (deployState.deploy_status !== 'building' && deployState.deploy_status !== 'pending') return

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/v3/deploy/${id}/status`)
        const data: DeployState = await res.json()
        setDeployState(data)
        if (data.deploy_status === 'live' || data.deploy_status === 'failed') {
          clearInterval(poll)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(poll)
  }, [started, deployState.deploy_status, id])

  useEffect(() => {
    startDeploy()
  }, [])

  const isLive = deployState.deploy_status === 'live'
  const isFailed = deployState.deploy_status === 'failed'
  const isBuilding = deployState.deploy_status === 'building' || deployState.deploy_status === 'pending'

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">

        {isBuilding && (
          <>
            <div className="text-6xl mb-6 animate-pulse">🚀</div>
            <h2 className="text-3xl font-bold mb-3">Deine Firma wird deployed</h2>
            <p className="text-zinc-400 mb-8">Wir erstellen deine Landing Page auf Vercel. Dauert ~30 Sekunden.</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex gap-3 items-start mb-3">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-zinc-300 text-sm">Business-Dokumente generiert</span>
              </div>
              <div className="flex gap-3 items-start mb-3">
                <span className="animate-spin text-indigo-400 mt-0.5">⟳</span>
                <span className="text-white text-sm font-medium">Landing Page wird deployed...</span>
              </div>
              <div className="flex gap-3 items-start mb-3 opacity-40">
                <span className="text-zinc-500 mt-0.5">○</span>
                <span className="text-zinc-500 text-sm">6 AI-Agents werden aktiviert</span>
              </div>
              <div className="flex gap-3 items-start opacity-40">
                <span className="text-zinc-500 mt-0.5">○</span>
                <span className="text-zinc-500 text-sm">CEO Dashboard einrichten</span>
              </div>
            </div>
          </>
        )}

        {isLive && (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-3">Deine Firma ist live!</h2>
            <p className="text-zinc-400 mb-8">Landing Page deployed. Agents sind aktiv.</p>
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 mb-6">
              <div className="text-indigo-400 text-sm font-semibold mb-2">LIVE URL</div>
              <a
                href={deployState.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono text-sm break-all hover:text-indigo-400 transition-colors"
              >
                {deployState.url}
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={deployState.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                🌐 Landing Page öffnen
              </a>
              <a
                href={`/dashboard/${id}`}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                ⚡ CEO Dashboard öffnen
              </a>
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div className="text-6xl mb-6">
              {deployState.error?.includes('Limit') || deployState.error?.includes('limit') ? '⏳' : '⚠️'}
            </div>
            <h2 className="text-3xl font-bold mb-3">
              {deployState.error?.includes('Limit') || deployState.error?.includes('limit') ? 'Deploy-Limit erreicht' : 'Deploy fehlgeschlagen'}
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-zinc-300 text-sm leading-relaxed">{deployState.error || 'Unbekannter Fehler'}</p>
              {(deployState.error?.includes('Limit') || deployState.error?.includes('limit')) && (
                <p className="text-indigo-400 text-sm mt-2">
                  💡 In der Zwischenzeit: CEO Dashboard + alle Dokumente sind bereits verfügbar!
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!(deployState.error?.includes('Limit') || deployState.error?.includes('limit')) && (
                <button
                  onClick={() => { setStarted(false); setDeployState({ deploy_status: 'pending', url: '', error: '' }); startDeploy() }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl"
                >
                  Erneut versuchen
                </button>
              )}
              <a href={`/dashboard/${id}`} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-center">
                CEO Dashboard öffnen
              </a>
              <a href={`/result/${id}`} className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl text-center">
                Zurück
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
