import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="group glass relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-xl transition-colors"
    >
      <div className="absolute -right-4 -top-4 opacity-10">
        <Icon className="h-24 w-24 text-[#00F0FF]" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 text-neutral-400 group-hover:text-neutral-200 transition-colors">
          <Icon className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-[#00F0FF] group-hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]" />
          <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
        </div>
        
        <div className="mt-4 flex items-end justify-between">
          <p className="font-display text-4xl font-bold text-white">{value}</p>
          
          {trend && (
            <span className={`text-sm font-medium ${trend.startsWith("+") ? "text-green-400" : "text-neutral-400"}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
