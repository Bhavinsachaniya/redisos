import React from 'react';
import { RedisStore, RedisEntry } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Clock, List as ListIcon, Layers, Hash, Database } from 'lucide-react';

interface VisualizerProps {
  store: RedisStore;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'list': return <ListIcon className="w-3.5 h-3.5" />;
    case 'set': return <Layers className="w-3.5 h-3.5" />;
    case 'hash': return <Hash className="w-3.5 h-3.5" />;
    default: return <Box className="w-3.5 h-3.5" />;
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'list': return 'border-blue-500/30 bg-blue-500/5 text-blue-300 hover:border-blue-500/50';
    case 'set': return 'border-purple-500/30 bg-purple-500/5 text-purple-300 hover:border-purple-500/50';
    case 'hash': return 'border-orange-500/30 bg-orange-500/5 text-orange-300 hover:border-orange-500/50';
    default: return 'border-green-500/30 bg-green-500/5 text-green-300 hover:border-green-500/50';
  }
};

const DataCard: React.FC<{ id: string; entry: RedisEntry }> = ({ id, entry }) => {
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`relative flex flex-col p-3 rounded-xl border backdrop-blur-sm shadow-sm transition-all duration-200 min-h-[120px] ${getTypeStyles(entry.type)}`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-70 mb-0.5">
                {getTypeIcon(entry.type)}
                <span>{entry.type}</span>
            </div>
            <div className="font-mono text-sm font-bold text-white truncate" title={id}>{id}</div>
        </div>
        
        {displayTtl !== null && (
            <div className={`shrink-0 flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${displayTtl < 10 ? 'bg-red-500/20 text-red-300' : 'bg-slate-900/40'}`}>
                <Clock className="w-3 h-3" />
                <span>{displayTtl}s</span>
            </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 min-h-0 bg-slate-950/30 rounded-lg p-2 font-mono text-xs overflow-hidden border border-white/5 relative group-hover:border-white/10 transition-colors">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
            {entry.type === 'string' && (
                <div className="break-all text-slate-200">"{entry.value}"</div>
            )}
            
            {entry.type === 'list' && (
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">List Items (Head → Tail)</span>
                    <div className="flex flex-wrap gap-1.5">
                        {(entry.value as any[]).map((v, i) => (
                            <span key={`${i}-${v}`} className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-200 break-all">
                                {v}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {entry.type === 'set' && (
                <div className="flex flex-wrap gap-1.5">
                    {(entry.value as any[]).map((v) => (
                        <span key={v} className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-200 break-all">
                            {v}
                        </span>
                    ))}
                </div>
            )}

            {entry.type === 'hash' && (
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                    {Object.entries(entry.value).map(([k, v]) => (
                        <React.Fragment key={k}>
                            <span className="text-orange-300/80 truncate text-right">{k}:</span>
                            <span className="text-orange-100 font-medium truncate">"{String(v)}"</span>
                        </React.Fragment>
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
    <section className="h-full bg-[#0f172a] lg:border lg:border-slate-700/50 lg:rounded-xl flex flex-col relative overflow-hidden w-full min-w-0 shadow-xl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-redis-600/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0 z-10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-redis-500/10 rounded-lg">
                <Database className="w-4 h-4 text-redis-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-200 tracking-tight">Visualizer</h2>
        </div>
        <div className="px-2.5 py-1 bg-slate-900 rounded-full border border-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${keys.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-400 font-mono font-medium">{keys.length} Items</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 w-full">
        <AnimatePresence mode='popLayout'>
            {keys.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
                        <Database className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium text-sm">Database is empty</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 pb-20 lg:pb-0">
                    {keys.map(key => (
                        <DataCard key={key} id={key} entry={store[key]} />
                    ))}
                </div>
            )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WarehouseVisualizer;