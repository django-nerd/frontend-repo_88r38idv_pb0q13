import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiGet } from '../lib/api'

export default function BossDetail({ boss, onClose }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await apiGet(`/api/bosses/${boss.id}`)
        if (mounted) setDetail(data)
      } catch (e) {
        setError(e.message)
      }
    }
    load()
    return () => { mounted = false }
  }, [boss.id])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
        {boss.image && (
          <div className="aspect-[21/9] overflow-hidden">
            <img src={boss.image} alt={boss.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{boss.name}</h3>
              {detail?.difficulty && <p className="text-blue-200/80 mt-1">Difficulty: {detail.difficulty}</p>}
            </div>
            <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 text-white/90 hover:text-white border border-white/10">Close</button>
          </div>

          {detail?.summary && <p className="text-blue-100 mt-4">{detail.summary}</p>}

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Strategies</h4>
              {detail?.strategies?.length ? (
                <ul className="space-y-3">
                  {detail.strategies.map((s) => (
                    <li key={s.id} className="bg-slate-800/50 border border-white/10 rounded-lg p-3">
                      <p className="text-white font-medium">{s.title}</p>
                      {s.recommended_level && <p className="text-blue-200/70 text-sm">Recommended: {s.recommended_level}</p>}
                      {s.steps?.length > 0 && (
                        <ul className="list-disc list-inside text-blue-100 mt-2 space-y-1">
                          {s.steps.map((st, idx) => (
                            <li key={idx}>{st}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-200">No strategies yet.</p>
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Video</h4>
              {detail?.strategies?.find((s) => s.video_url) ? (
                <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                  <iframe
                    className="w-full h-full"
                    src={detail.strategies.find((s) => s.video_url)?.video_url}
                    title={`How to beat ${boss.name}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-blue-200">No video available.</p>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </motion.div>
    </div>
  )
}
