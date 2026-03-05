'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://187.124.4.166:8001'

type Job = {
  id: string
  status: string
  created: string
  brand_name?: string
  niche?: string
  founder_name?: string
}

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, done: 0, running: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/admin/jobs`)
        const data = await res.json()
        setJobs(data.jobs || [])
        setStats(data.stats || { total: 0, done: 0, running: 0 })
      } catch {
        // Backend might not have admin endpoint yet
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">⚡ Admin — Business OS</h1>
        <p className="text-zinc-400">Alle erstellten Businesses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Businesses', value: stats.total, color: 'text-white' },
          { label: 'Fertig', value: stats.done, color: 'text-green-400' },
          { label: 'In Bearbeitung', value: stats.running, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-semibold text-zinc-500 uppercase border-b border-zinc-800">
          <div>ID</div>
          <div>Brand</div>
          <div>Nische</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-zinc-500">Lädt...</div>
        ) : jobs.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-500">
            Noch keine Businesses erstellt. <a href="/build" className="text-indigo-400 hover:underline">Erstes erstellen →</a>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">
              <div className="font-mono text-xs text-zinc-500">{job.id.slice(0, 8)}...</div>
              <div className="font-medium text-white truncate">{job.brand_name || '—'}</div>
              <div className="text-zinc-400 text-sm truncate">{job.niche || '—'}</div>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  job.status === 'done' ? 'bg-green-500/10 text-green-400' :
                  job.status === 'running' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{job.status}</span>
              </div>
              <div className="flex gap-2">
                <a href={`/result/${job.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">Result</a>
                <a href={`/dashboard/${job.id}`} className="text-xs text-zinc-400 hover:text-white">Dashboard</a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-zinc-600 text-center">
        Refresht alle 30 Sekunden · Admin: /admin
      </div>
    </main>
  )
}
