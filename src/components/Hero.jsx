import { motion } from 'framer-motion'

export default function Hero({ onIngest }) {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-fuchsia-500 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Boss Encyclopedia
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mt-4 text-blue-100 text-lg">
              Find bosses, watch strategies, and learn how to beat them.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-8 flex gap-3">
              <button onClick={onIngest} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/20 transition-colors">
                Load Demo Data
              </button>
              <a href="/test" className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors">
                Check System
              </a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
            <div className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
              <div className="w-full h-full rounded-xl bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.25),transparent_60%)] flex items-center justify-center text-blue-200">
                Smooth animations, clean design, powerful search.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
