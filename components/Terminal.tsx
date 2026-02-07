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
  DEL: 'key [key ...]',
  EXISTS: 'key',
  EXPIRE: 'key seconds',
  TTL: 'key',
  PERSIST: 'key',
  LPUSH: 'key value [value ...]',
  RPUSH: 'key value [value ...]',
  LPOP: 'key',
  LRANGE: 'key start stop',
  SADD: 'key member [member ...]',
  SMEMBERS: 'key',
  SISMEMBER: 'key member',
  HSET: 'key field value',
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
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-300 text-xs md:text-sm">
        <span className="text-redis-500 shrink-0">127.0.0.1:6379&gt;</span>
        <span className="break-all">{entry.command}</span>
      </div>
      <div className="relative group">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${entry.status === 'error' ? 'text-red-400' : 'text-green-400'} whitespace-pre-wrap pl-2 border-l-2 border-slate-700/50 pr-8 text-xs md:text-sm`}
        >
          {entry.output}
        </motion.div>
        
        {entry.output && (
          <button
            onClick={handleCopy}
            className="absolute right-0 top-0 p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 z-10"
            title="Copy output"
            aria-label="Copy output to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
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

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Auto-focus logic
  useEffect(() => {
    if (isActive) {
        // Small timeout ensures component is fully visible/rendered before focus
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Update hints
  useEffect(() => {
    const trimmed = input.trimStart();
    if (!trimmed) {
        setHint('');
        return;
    }

    // Smart Hint: Check if input matches start of suggested command for the current step
    if (suggestedCommand && suggestedCommand.toLowerCase().startsWith(trimmed.toLowerCase())) {
        setHint(suggestedCommand.substring(trimmed.length));
        return;
    }

    // Generic Hint: Check standard command list
    const firstWord = trimmed.split(' ')[0].toUpperCase();
    if (firstWord && COMMAND_HINTS[firstWord] !== undefined) {
      setHint(COMMAND_HINTS[firstWord]);
    } else {
      setHint('');
    }
  }, [input, suggestedCommand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onExecute(input);
    setInput('');
  };

  const handleContainerClick = () => {
    const selection = window.getSelection();
    // Only focus if user isn't selecting text
    if (!selection || selection.toString().length === 0) {
        inputRef.current?.focus();
    }
  };

  const isMatchingSuggestion = suggestedCommand && input.trim() && suggestedCommand.toLowerCase().startsWith(input.trim().toLowerCase());

  return (
    <div 
      className="flex flex-col h-full bg-black/90 rounded-xl overflow-hidden border border-slate-700 shadow-2xl font-mono text-sm relative"
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-semibold">redis-cli</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        <div className="text-slate-500 mb-4 text-xs md:text-sm">
          Welcome to Redis Playground v1.1.0<br/>
          Connected to localhost:6379
        </div>
        
        {history.map((entry, i) => (
          <HistoryItem key={i} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="relative shrink-0">
        {/* Hint Tooltip - positioned higher on mobile to avoid covering text if keyboard opens weirdly */}
        <AnimatePresence>
            {hint && input.trim() && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-full left-2 md:left-4 mb-2 px-3 py-1 bg-slate-800 border border-slate-600 text-[10px] md:text-xs rounded-lg shadow-xl pointer-events-none flex items-center gap-2 max-w-[90vw] truncate"
                >
                    {isMatchingSuggestion ? (
                        <>
                            <span className="text-yellow-400 font-bold shrink-0">Suggestion:</span>
                            <span className="text-slate-300 font-mono truncate">
                                {input}<span className="text-slate-500">{hint}</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-slate-400 font-bold shrink-0">Usage:</span>
                            <span className="text-redis-400 font-bold font-mono">{input.trim().split(' ')[0].toUpperCase()}</span> 
                            <span className="text-slate-500 font-mono truncate">{hint}</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 relative z-10">
            <span className="text-redis-500 font-bold shrink-0 text-sm">127.0.0.1:6379&gt;</span>
            <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // Text-base prevents iOS zooming on input focus
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 text-base md:text-sm font-mono min-w-0"
            placeholder="Type command..."
            autoComplete="off"
            // Auto focus handled by effect, but 'true' can help on some desktop browsers
            autoFocus
            />
            <button 
                type="submit" 
                className={`p-1.5 rounded-md transition-colors shrink-0 ${input.trim() ? 'bg-redis-600 text-white hover:bg-redis-500' : 'text-slate-600 bg-slate-800 cursor-not-allowed'}`}
                disabled={!input.trim()}
            >
                <Play className="w-4 h-4 fill-current" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default Terminal;