import { motion } from 'framer-motion'

export default function BossCard({ boss, onSelect }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(boss)}
      className="text-left group bg-slate-800/60 hover:bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-lg transition-colors"
    >
      {boss.image && (
        <div className="aspect-video overflow-hidden">
          <img src={boss.image} alt={boss.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg">{boss.name}</h3>
        {boss.summary && <p className="text-blue-200/80 text-sm line-clamp-2 mt-1">{boss.summary}</p>}
        {boss.difficulty && <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{boss.difficulty}</span>}
      </div>
    </motion.button>
  )
}
