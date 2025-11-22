import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import BossList from './components/BossList'
import BossDetail from './components/BossDetail'
import { apiPost } from './lib/api'

function App() {
  const [selected, setSelected] = useState(null)
  const [loadingIngest, setLoadingIngest] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleIngest = async () => {
    try {
      setLoadingIngest(true)
      await apiPost('/api/ingest/demo')
      notify('Loaded demo data!')
    } catch (e) {
      notify(e.message)
    } finally {
      setLoadingIngest(false)
    }
  }

  const handleScheduled = async () => {
    try {
      setLoadingIngest(true)
      const res = await apiPost('/api/ingest/scheduled-run')
      notify(`Queued ${res?.queued?.length ?? 0} items for review`)
    } catch (e) {
      notify(e.message)
    } finally {
      setLoadingIngest(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Hero onIngest={loadingIngest ? undefined : handleIngest} onScheduled={loadingIngest ? undefined : handleScheduled} />
      <BossList onSelect={setSelected} />
      <AnimatePresence>
        {selected && (
          <BossDetail boss={selected} onClose={() => setSelected(null)} />)
        }
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 border border-white/10 rounded-lg px-4 py-2">
          <p className="text-sm">{toast}</p>
        </div>
      )}
    </div>
  )
}

export default App
