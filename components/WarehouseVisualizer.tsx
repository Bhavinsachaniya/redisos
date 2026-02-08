import React from 'react';
import { RedisStore, RedisEntry } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Clock, List as ListIcon, Layers, Hash, Database } from 'lucide-react';

interface VisualizerProps {
  store: RedisStore;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'list': return <ListIcon className="w-4 h-4 text-blue-400" />;
    case 'set': return <Layers className="w-4 h-4 text-purple-400" />;
    case 'hash': return <Hash className="w-4 h-4 text-orange-400" />;
    default: return <Box className="w-4 h-4 text-green-400" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'list': return 'border-blue-500/30 bg-blue-500/5 text-blue-300 shadow-blue-500/10';
    case 'set': return 'border-purple-500/30 bg-purple-500/5 text-purple-300 shadow-purple-500/10';
    case 'hash': return 'border-orange-500/30 bg-orange-500/5 text-orange-300 shadow-orange-500/10';
    default: return 'border-green-500/30 bg-green-500/5 text-green-300 shadow-green-500/10';
  }
};

const DataCard: React.FC<{ id: string; entry: RedisEntry }> = ({ id, entry }) => {
  // Calculate display TTL if available
  const [displayTtl, setDisplayTtl] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (entry.expiresAt) {
      const updateTtl = () => {
        const remaining = Math.ceil((entry.expiresAt! - Date.now()) / 1000);
        setDisplayTtl(remaining > 0 ? remaining : 0);
      };
      updateTtl();
      const interval = setInterval(updateTtl, 1000);
      return () => clearInterval(interval);
    } else {
      setDisplayTtl(null);
    }
  }, [entry.expiresAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      // Standard height h-36 (144px)
      className={`relative w-full h-36 lg:h-auto flex flex-col p-3 rounded-xl border backdrop-blur-md shadow-lg group hover:border-white/20 transition-all duration-300 ${getTypeColor(entry.type)}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-1.5 mb-2 shrink-0">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 overflow-hidden w-full">
                <div className="p-1.5 rounded bg-black/40 shadow-inner shrink-0">
                    {getTypeIcon(entry.type)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-none mb-0.5">Key</div>
                    <div className="font-mono text-xs md:text-sm font-bold text-white truncate w-full" title={id}>{id}</div>
                </div>
            </div>
        </div>
        
        {displayTtl !== null && (
            <div className={`self-start flex items-center gap-1.5 text-[10px] md:text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${displayTtl < 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-yellow-500/10 text-yellow-500'}`}>
            <Clock className="w-3 h-3" />
            <span>{displayTtl}s</span>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-black/30 rounded-lg p-2 font-mono text-xs text-slate-300 overflow-hidden shadow-inner border border-white/5 relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-1">
            {entry.type === 'string' && (
                <motion.div 
                    key={String(entry.value)}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="break-all leading-relaxed"
                >
                    "{entry.value}"
                </motion.div>
            )}
            {entry.type === 'list' && (
                <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mr-1 sticky top-0">Head</span>
                    {(entry.value as any[]).map((v, i) => (
                        <span key={`${i}-${v}`} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30 truncate max-w-full block">
                            "{v}"
                        </span>
                    ))}
                </div>
            )}
            {entry.type === 'set' && (
                <div className="flex flex-wrap gap-1">
                    {(entry.value as any[]).map((v) => (
                        <span key={v} className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-200 border border-purple-500/30 truncate max-w-full block">
                            "{v}"
                        </span>
                    ))}
                </div>
            )}
            {entry.type === 'hash' && (
                <div className="space-y-1">
                    {Object.entries(entry.value).map(([k, v]) => (
                        <div key={k} className="flex flex-col border-b border-white/5 last:border-0 pb-1 last:pb-0">
                            <span className="text-orange-300 opacity-80 truncate text-[10px]">{k}:</span>
                            <span className="text-orange-100 font-semibold truncate pl-1">"{String(v)}"</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

const WarehouseVisualizer: React.FC<VisualizerProps> = ({ store }) => {
  const keys = Object.keys(store);

  return (
    <div className="h-full bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 flex flex-col relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-redis-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-700/50 z-10 shrink-0">
        <div className="p-2 bg-redis-500/10 rounded-lg">
            <Database className="w-4 h-4 text-redis-500" />
        </div>
        <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Memory Warehouse</h2>
        </div>
        <div className="ml-auto px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            <div className="text-[10px] text-slate-300 font-mono flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${keys.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                {keys.length} Keys
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar z-10 relative">
        <AnimatePresence mode='popLayout'>
        {keys.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"
            >
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 border border-slate-700/50">
                    <Database className="w-8 h-8 text-slate-700" />
                </div>
                <p className="font-semibold text-slate-400 text-sm">Warehouse Empty</p>
            </motion.div>
        ) : (
            // Grid
            <div className="grid grid-cols-2 gap-3 pb-24 lg:pb-3 w-full content-start">
                {keys.map(key => (
                    <DataCard key={key} id={key} entry={store[key]} />
                ))}
            </div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WarehouseVisualizer;