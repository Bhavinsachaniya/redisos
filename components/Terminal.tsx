import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  onExecute: (cmd: string) => void;
  history: Array<{ command: string; output: string; status: 'success' | 'error' }>;
  isProcessing: boolean;
  isActive?: boolean;
  suggestedCommand?: string;
}

const COMMAND_HINTS: Record<string, string> = {
  SET: 'key value',
  GET: 'key',
  DEL: 'key ...',
  EXISTS: 'key',
  EXPIRE: 'key sec',
  TTL: 'key',
  PERSIST: 'key',
  LPUSH: 'key val ...',
  RPUSH: 'key val ...',
  LPOP: 'key',
  LRANGE: 'key start stop',
  SADD: 'key mem ...',
  SMEMBERS: 'key',
  SISMEMBER: 'key mem',
  HSET: 'key field val',
  HGET: 'key field',
  HGETALL: 'key',
  KEYS: 'pattern',
  INFO: '',
  FLUSHALL: ''
};

const HistoryItem: React.FC<{ entry: { command: string; output: string; status: 'success' | 'error' } }> = ({ entry }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!entry.output) return;
    navigator.clipboard.writeText(entry.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-0.5 w-full min-w-0">
      <div className="flex items-center gap-1.5 text-slate-300 text-[10px] md:text-sm min-w-0">
        <span className="text-redis-500 shrink-0 select-none opacity-80 font-bold font-mono">redis&gt;</span>
        <span className="break-all font-semibold min-w-0 text-slate-200 font-mono">{entry.command}</span>
      </div>
      <div className="relative group w-full min-w-0">
        <motion.div 
          initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
          className={`${entry.status === 'error' ? 'text-red-400' : 'text-green-400'} whitespace-pre-wrap break-all pl-2 border-l border-slate-700/50 pr-6 text-[9px] md:text-sm font-mono leading-relaxed w-full min-w-0 bg-black/10`}
        >
          {entry.output}
        </motion.div>
        {entry.output && (
          <button onClick={handleCopy} className="absolute right-0 top-0 p-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
            {copied ? <Check className="w-2 h-2 md:w-3 md:h-3 text-green-500" /> : <Copy className="w-2 h-2 md:w-3 md:h-3" />}
          </button>
        )}
      </div>
    </div>
  );
};

const Terminal: React.FC<TerminalProps> = ({ onExecute, history, isActive = true, suggestedCommand }) => {
  const [input, setInput] = useState('');
  const [hint, setHint] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
    if (isActive) {
        const timer = setTimeout(() => inputRef.current?.focus(), 200);
        return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    const trimmed = input.trimStart();
    if (!trimmed) { setHint(''); return; }
    if (suggestedCommand && suggestedCommand.toLowerCase().startsWith(trimmed.toLowerCase())) {
        setHint(suggestedCommand.substring(trimmed.length));
        return;
    }
    const firstWord = trimmed.split(' ')[0].toUpperCase();
    setHint(COMMAND_HINTS[firstWord] || '');
  }, [input, suggestedCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onExecute(input);
    setInput('');
  };

  const isMatchingSuggestion = suggestedCommand && input.trim() && suggestedCommand.toLowerCase().startsWith(input.trim().toLowerCase());

  return (
    <div className="flex flex-col h-full bg-black/90 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl font-mono relative w-full min-w-0" onClick={() => inputRef.current?.focus()}>
      {/* Mini Terminal Header (Flex item) */}
      <div className="flex items-center justify-between px-2 py-1.5 md:px-4 md:py-2 bg-slate-800/80 border-b border-slate-700/50 shrink-0 w-full min-w-0">
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <TerminalIcon className="w-3 h-3 md:w-4 md:h-4 shrink-0" /><span className="text-[9px] md:text-xs uppercase tracking-widest font-bold truncate">redis-cli</span>
        </div>
        <div className="flex gap-1 shrink-0"><div className="w-1 h-1 rounded-full bg-red-500/30" /><div className="w-1 h-1 rounded-full bg-yellow-500/30" /><div className="w-1 h-1 rounded-full bg-green-500/30" /></div>
      </div>

      {/* History scroll container (Flex item filling space) */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1.5 custom-scrollbar w-full min-w-0 bg-black/20">
        <div className="text-slate-600 mb-1 text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-30">Connected to 127.0.0.1:6379</div>
        {history.map((entry, i) => <HistoryItem key={i} entry={entry} />)}
        <div ref={bottomRef} className="h-4 w-full" />
      </div>

      {/* Input area (Flex item at bottom of Terminal) */}
      <div className="relative shrink-0 w-full min-w-0">
        <AnimatePresence>
            {hint && input.trim() && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-2 mb-1 px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-[8px] rounded md:text-[10px] z-20 shadow-lg font-bold">
                    <span className="text-slate-500">{isMatchingSuggestion ? 'Auto: ' : 'Hint: '}{input}<span className="text-slate-200">{hint}</span></span>
                </motion.div>
            )}
        </AnimatePresence>
        <form onSubmit={handleSubmit} className="p-1.5 sm:p-2 md:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 relative w-full min-w-0">
            <span className="text-redis-500 font-black shrink-0 text-[10px] md:text-sm">redis&gt;</span>
            <input 
              ref={inputRef} 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-800 text-[11px] md:text-sm font-mono min-w-0 w-full" 
              placeholder="Command..." 
              autoComplete="off" 
              autoCorrect="off" 
              autoCapitalize="off" 
              spellCheck="false"
              enterKeyHint="enter"
            />
            <button type="submit" className={`p-1 rounded-lg transition-all shrink-0 ${input.trim() ? 'bg-redis-600 text-white shadow-md' : 'text-slate-700 bg-slate-800/50'}`} disabled={!input.trim()}>
              <Play className="w-3 h-3 fill-current" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default Terminal;