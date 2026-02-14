import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Check, ChevronRight } from 'lucide-react';
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
    <div className="group w-full min-w-0 py-0.5">
      <div className="flex items-start gap-2 text-xs md:text-sm font-mono min-w-0">
        <span className="text-redis-500 shrink-0 select-none font-bold mt-0.5">redis&gt;</span>
        <span className="break-all font-semibold text-slate-200">{entry.command}</span>
      </div>
      
      <div className="relative mt-1 pl-4 md:pl-6 w-full min-w-0">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`
            relative whitespace-pre-wrap break-all text-xs md:text-sm font-mono leading-relaxed py-1
            ${entry.status === 'error' ? 'text-red-400' : 'text-emerald-400'}
            before:content-[''] before:absolute before:left-[-12px] before:top-0 before:bottom-0 before:w-[2px] 
            ${entry.status === 'error' ? 'before:bg-red-500/30' : 'before:bg-emerald-500/30'}
          `}
        >
          {entry.output}
        </motion.div>
        
        {entry.output && (
          <button 
            onClick={handleCopy} 
            className="absolute -right-1 -top-1 p-2 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 hover:text-slate-300 transition-all focus:opacity-100 active:scale-95"
            aria-label="Copy output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
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

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Handle Focus - Be careful not to aggressively autofocus on mobile on load to avoid keyboard popping
  useEffect(() => {
    if (isActive && window.matchMedia('(min-width: 1024px)').matches) {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Command Hints
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
    // Keep focus on desktop, but maybe blur on mobile if they want to see result? 
    // Usually terminal keeps focus.
    inputRef.current?.focus();
  };

  const isMatchingSuggestion = suggestedCommand && input.trim() && suggestedCommand.toLowerCase().startsWith(input.trim().toLowerCase());

  return (
    <section 
      className="flex flex-col h-full bg-[#090e1a] lg:rounded-xl overflow-hidden border-t lg:border border-slate-700/50 shadow-2xl font-mono relative w-full min-w-0" 
      onClick={() => {
        // Only focus if user clicked the empty area, not when selecting text
        if (window.getSelection()?.toString().length === 0) {
           inputRef.current?.focus();
        }
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700/50 shrink-0 select-none backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-400">
          <TerminalIcon className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">redis-cli</span>
          <span className="hidden xs:inline-block px-1.5 py-0.5 rounded bg-slate-700/50 text-[10px] text-slate-500 border border-slate-600/30">v7.0</span>
        </div>
        <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
        </div>
      </header>

      {/* History Output */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar w-full min-w-0 bg-[#090e1a]">
        <div className="text-slate-600 text-xs font-bold uppercase tracking-widest opacity-40 mb-4 select-none">
          // Connected to 127.0.0.1:6379
        </div>
        {history.map((entry, i) => <HistoryItem key={i} entry={entry} />)}
        <div ref={bottomRef} className="h-2 w-full" />
      </div>

      {/* Input Area */}
      <div className="relative shrink-0 w-full min-w-0 z-10 bg-[#090e1a] border-t border-slate-800">
        <AnimatePresence>
            {hint && input.trim() && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute bottom-full left-0 w-full bg-slate-800/90 border-t border-slate-700 backdrop-blur-sm px-3 py-1.5 text-xs flex items-center gap-2 pointer-events-none"
                >
                    <span className="text-slate-400 font-semibold">{isMatchingSuggestion ? 'Suggestion:' : 'Hint:'}</span>
                    <span className="text-white font-mono">
                        {input}<span className="text-slate-500">{hint}</span>
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="p-2 sm:p-3 flex items-center gap-2 relative">
            <ChevronRight className="w-4 h-4 text-redis-500 shrink-0 animate-pulse" />
            
            <div className="relative flex-1 min-w-0">
                <input 
                  ref={inputRef} 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-700 font-mono min-w-0 text-base md:text-sm py-1" 
                  placeholder="Enter command..." 
                  autoComplete="off" 
                  autoCorrect="off" 
                  autoCapitalize="off" 
                  spellCheck="false"
                  enterKeyHint="go"
                />
            </div>

            <button 
                type="submit" 
                disabled={!input.trim()}
                className={`
                    p-2 rounded-lg transition-all shrink-0 flex items-center justify-center
                    ${input.trim() 
                        ? 'bg-redis-600 text-white shadow-lg shadow-redis-900/20 active:scale-95' 
                        : 'text-slate-700 bg-slate-800/30'
                    }
                `}
                aria-label="Execute command"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
        </form>
      </div>
    </section>
  );
};

export default Terminal;