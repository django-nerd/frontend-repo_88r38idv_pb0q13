import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BossCard from './BossCard'
import { apiGet } from '../lib/api'

export default function BossList({ onSelect }) {
  const [bosses, setBosses] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const params = query ? `?q=${encodeURIComponent(query)}` : ''
        const data = await apiGet(`/api/bosses${params}`)
        if (mounted) setBosses(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [query])

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Bosses</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bosses..."
          className="px-4 py-2 rounded-lg bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-blue-200">Loading...</p>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {bosses.map((b) => (
              <motion.div key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <BossCard boss={b} onSelect={onSelect} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
