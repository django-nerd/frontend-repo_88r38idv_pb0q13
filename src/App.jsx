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

  const handleIngest = async () => {
    try {
      setLoadingIngest(true)
      await apiPost('/api/ingest/demo')
      setToast('Loaded demo data!')
      setTimeout(() => setToast(''), 2500)
    } catch (e) {
      setToast(e.message)
      setTimeout(() => setToast(''), 3000)
    } finally {
      setLoadingIngest(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Hero onIngest={loadingIngest ? undefined : handleIngest} />
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
