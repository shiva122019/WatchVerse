import { motion } from "framer-motion";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  minHeight = "300px" 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex w-full flex-col items-center justify-center rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden"
      style={{ minHeight }}
    >
      {/* Background glowing orb */}
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00F0FF]/10 blur-[80px] pointer-events-none" />

      {Icon && (
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.2)] text-[#00F0FF]"
        >
          <Icon size={32} />
        </motion.div>
      )}

      <motion.h3 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-xl font-bold text-white tracking-wide"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-2 max-w-sm text-sm text-neutral-400 leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {actionLabel && onAction && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          onClick={onAction}
          className="mt-8 rounded-full border border-[#00F0FF]/50 bg-[#00F0FF]/10 px-6 py-2.5 text-sm font-semibold text-[#00F0FF] transition-all hover:bg-[#00F0FF] hover:text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
