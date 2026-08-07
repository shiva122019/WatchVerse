import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ViewsChart({ data }) {
  const [timeRange, setTimeRange] = useState('30d');

  // data is now an object: { '1d': [], '7d': [], '30d': [], '1y': [] }
  const currentData = data?.[timeRange] || [];

  if (!currentData || currentData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <p className="text-neutral-500">Not enough data to display chart.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#121212]/95 p-4 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-sm font-medium text-neutral-400">{label}</p>
          <p className="font-display text-xl font-bold text-[#00F0FF]">
            {payload[0].value.toLocaleString()} <span className="text-sm font-normal text-white">views</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "rgba(0, 240, 255, 0.4)", boxShadow: "0 0 30px rgba(0, 240, 255, 0.1)" }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="glass rounded-2xl border border-white/10 p-6 shadow-xl transition-colors h-full flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Views Over Time</h3>
          <p className="text-sm text-neutral-400">
            {timeRange === '1d' ? 'Last 24 hours' : timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 1 year'} performance
          </p>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          {['1d', '7d', '30d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === range ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              stroke="rgba(255,255,255,0)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#00F0FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorViews)" 
              activeDot={{ r: 6, fill: "#00F0FF", stroke: "#000", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
