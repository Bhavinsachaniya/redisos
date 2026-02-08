import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  onExecute: (cmd: string) => void;
  history: Array<{ command: string; output: string; status: 'success' | 'error' }>;
  isProcessing: boolean;
  isActive?: boolean;
  suggestedCommand?: string;
  isKeyboardOpen?: boolean;
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
        <span className="text-redis-500 shrink-0 text-xs md:text-sm">127.0.0.1:6379&gt;</span>
        <span className="break-all font-semibold">{entry.command}</span>
      </div>
      <div className="relative group">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${entry.status === 'error' ? 'text-red-400' : 'text-green-400'} whitespace-pre-wrap pl-2 md:pl-3 border-l-2 border-slate-700/50 pr-10 md:pr-8 text-xs md:text-sm leading-relaxed break-words overflow-x-auto`}
        >
          {entry.output}
        </motion.div>
        
        {entry.output && (
          <button
            onClick={handleCopy}
            className="absolute right-0 top-0 p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 z-10 touch-manipulation"
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

const Terminal: React.FC<TerminalProps> = ({ onExecute, history, isActive = true, suggestedCommand, isKeyboardOpen = false }) => {
  const [input, setInput] = useState('');
  const [hint, setHint] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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

  // Aggressive scroll and positioning when keyboard opens
  useEffect(() => {
    if (!isKeyboardOpen || !isActive) return;
    
    // Multiple scroll attempts to ensure input is visible
    const scrollToInput = () => {
      if (inputRef.current) {
        // Method 1: ScrollIntoView
        inputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end',
          inline: 'nearest'
        });
        
        // Method 2: Scroll parent containers
        let parent = inputRef.current.parentElement;
        while (parent) {
          if (parent.scrollHeight > parent.clientHeight) {
            parent.scrollTop = parent.scrollHeight;
          }
          parent = parent.parentElement;
        }
        
        // Method 3: Window scroll
        if (window.innerWidth < 1024) {
          const rect = inputRef.current.getBoundingClientRect();
          const viewportHeight = window.visualViewport?.height || window.innerHeight;
          
          // If input is below viewport, scroll window
          if (rect.bottom > viewportHeight) {
            window.scrollTo({
              top: window.scrollY + (rect.bottom - viewportHeight) + 20,
              behavior: 'smooth'
            });
          }
        }
      }
    };
    
    // Scroll immediately, then again after keyboard animation
    scrollToInput();
    const timer1 = setTimeout(scrollToInput, 100);
    const timer2 = setTimeout(scrollToInput, 300);
    const timer3 = setTimeout(scrollToInput, 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isKeyboardOpen, isActive]);

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
  
  // Handle input focus - scroll into view aggressively on mobile
  const handleInputFocus = () => {
    if (window.innerWidth >= 1024) return;
    
    const scrollToInput = () => {
      if (!inputRef.current) return;
      
      // Scroll the input into view
      inputRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      });
      
      // Also scroll terminal to bottom
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    
    // Multiple attempts to ensure visibility
    setTimeout(scrollToInput, 100);
    setTimeout(scrollToInput, 300);
    setTimeout(scrollToInput, 600);
  };

  const isMatchingSuggestion = suggestedCommand && input.trim() && suggestedCommand.toLowerCase().startsWith(input.trim().toLowerCase());

  return (
    <div 
      ref={terminalRef}
      className={`flex flex-col h-full bg-black/90 rounded-xl overflow-hidden border border-slate-700 shadow-2xl font-mono relative ${
        isKeyboardOpen ? 'lg:h-full' : ''
      }`}
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-semibold">redis-cli</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Output Area - Aggressively reduce height when keyboard is open */}
      <div className={`overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar ${
        isKeyboardOpen ? 'flex-none h-[25vh] min-h-[150px]' : 'flex-1'
      }`}>
        <div className="text-slate-500 mb-4 text-xs md:text-sm leading-relaxed">
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
        {/* Hint Tooltip - hide on mobile when keyboard is open to prevent overflow */}
        <AnimatePresence>
            {hint && input.trim() && !isKeyboardOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-full left-2 md:left-4 mb-2 px-2 md:px-3 py-1 bg-slate-800 border border-slate-600 text-[10px] md:text-xs rounded-lg shadow-xl pointer-events-none flex items-center gap-1.5 md:gap-2 max-w-[calc(100vw-2rem)] md:max-w-[90vw] overflow-hidden"
                >
                    {isMatchingSuggestion ? (
                        <>
                            <span className="text-yellow-400 font-bold shrink-0 text-[9px] md:text-xs">Suggestion:</span>
                            <span className="text-slate-300 font-mono truncate min-w-0">
                                {input}<span className="text-slate-500">{hint}</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-slate-400 font-bold shrink-0 text-[9px] md:text-xs">Usage:</span>
                            <span className="text-redis-400 font-bold font-mono truncate">{input.trim().split(' ')[0].toUpperCase()}</span> 
                            <span className="text-slate-500 font-mono truncate min-w-0">{hint}</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <form 
          onSubmit={handleSubmit} 
          className={`p-3 md:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 z-50 ${
            isKeyboardOpen ? 'fixed bottom-0 left-2 right-2 lg:relative lg:bottom-auto shadow-[0_-8px_24px_rgba(0,0,0,0.8)] rounded-b-xl pb-safe' : 'relative'
          }`}
          style={isKeyboardOpen && window.innerWidth < 1024 ? { 
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))' 
          } : undefined}
        >
            <span className="text-redis-500 font-bold shrink-0 text-sm md:text-base">127.0.0.1:6379&gt;</span>
            <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleInputFocus}
            onClick={(e) => {
              e.stopPropagation();
              handleInputFocus();
            }}
            // Must be 16px on mobile to prevent zoom on focus (iOS/Android)
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 text-base font-mono min-w-0"
            style={{ fontSize: window.innerWidth < 1024 ? '16px' : undefined }}
            placeholder="Type command..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="send"
            inputMode="text"
            autoFocus
            />
            <button 
                type="submit" 
                className={`p-2 rounded-md transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${input.trim() ? 'bg-redis-600 text-white hover:bg-redis-500 active:bg-redis-700' : 'text-slate-600 bg-slate-800 cursor-not-allowed'}`}
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