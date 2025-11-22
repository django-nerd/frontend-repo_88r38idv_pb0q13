import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BossCard from './BossCard'
import { apiGet } from '../lib/api'

export default function BossList({ onSelect }) {
  const [bosses, setBosses] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const limit = 12

  // debounce query
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const params = new URLSearchParams()
        if (debounced) params.set('q', debounced)
        params.set('skip', String(page * limit))
        params.set('limit', String(limit))
        const data = await apiGet(`/api/bosses?${params.toString()}`)
        if (mounted) setBosses(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [debounced, page])

  useEffect(() => {
    // reset to first page on new query
    setPage(0)
  }, [debounced])

  const hasMore = useMemo(() => bosses.length === limit, [bosses.length])

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-white">Bosses</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bosses..."
          className="px-4 py-2 rounded-lg bg-slate-800/80 border border-white/10 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-800/40 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : bosses.length === 0 ? (
        <p className="text-blue-200">No bosses found. Try loading demo data or adjusting your search.</p>
      ) : (
        <>
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {bosses.map((b) => (
                <motion.div key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <BossCard boss={b} onSelect={onSelect} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 rounded border border-white/10 bg-slate-800/70 text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-blue-200/80">Page {page + 1}</span>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded border border-white/10 bg-slate-800/70 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}
