import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { RedisStore, CommandResult } from './types';
import { executeCommand, checkExpirations } from './services/mockRedis';
import Terminal from './components/Terminal';
import WarehouseVisualizer from './components/WarehouseVisualizer';
import StepGuide from './components/StepGuide';
import Sidebar from './components/Sidebar';
import { Menu, X, Database, Activity, Github, Linkedin, Globe, Trophy, RotateCcw, Terminal as TerminalIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = useState(CURRICULUM.modules[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [store, setStore] = useState<RedisStore>({});
  const [history, setHistory] = useState<Array<{ command: string; output: string; status: 'success' | 'error' }>>([]);
  const [canAdvance, setCanAdvance] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'terminal' | 'visualizer'>('terminal');
  const [showCompletion, setShowCompletion] = useState(false);

  const currentModule = CURRICULUM.modules.find(m => m.id === currentModuleId)!;
  
  useEffect(() => {
    const interval = setInterval(() => {
        const newStore = checkExpirations(store);
        if (newStore) setStore(newStore);
    }, 100);
    return () => clearInterval(interval);
  }, [store]);

  useEffect(() => {
    const step = currentModule.steps[currentStepIndex];
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (lastEntry.status === 'success') {
            const userCmd = lastEntry.command.toLowerCase().trim();
            const expectedCmd = step.input_code.toLowerCase().trim();
            
            // 1. Generic exact match
            if (userCmd === expectedCmd) {
                setCanAdvance(true);
                return;
            }

            // 2. State-based validation
            // Module 1: SET user:name
            if (step.input_code.includes("user:name") && step.command.startsWith("SET") && store["user:name"]?.value === "Alice") {
                setCanAdvance(true);
            }
            // Module 1: DEL user:name
            else if (step.input_code.includes("user:name") && step.command.startsWith("DEL") && !store["user:name"]) {
                setCanAdvance(true);
            }
            // Module 2: SET session_id (New Step)
            else if (step.input_code.includes("session_id") && step.command.startsWith("SET") && store["session_id"]?.value === "123") {
                setCanAdvance(true);
            }
            // Module 6: FLUSHALL
            else if (step.command.startsWith("FLUSHALL") && Object.keys(store).length === 0) {
                setCanAdvance(true);
            }
        }
    }
  }, [store, history, currentModule, currentStepIndex]);

  const handleExecute = (cmdInput: string) => {
    const result: CommandResult = executeCommand(cmdInput, store);
    setHistory(prev => [...prev, {
        command: cmdInput,
        output: result.output,
        status: result.output.startsWith('(error)') ? 'error' : 'success'
    }]);
    if (result.newStore) setStore(result.newStore);
  };

  const handleNext = () => {
    setCanAdvance(false);
    if (currentStepIndex < currentModule.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
    } else {
        if (!completedModules.includes(currentModuleId)) {
            setCompletedModules(prev => [...prev, currentModuleId]);
        }
        const currIdx = CURRICULUM.modules.findIndex(m => m.id === currentModuleId);
        if (currIdx < CURRICULUM.modules.length - 1) {
            setCurrentModuleId(CURRICULUM.modules[currIdx + 1].id);
            setCurrentStepIndex(0);
        } else {
            // Finished the last module
            setShowCompletion(true);
        }
    }
  };

  const handleReset = () => {
    setStore({});
    setHistory([]);
    setCurrentModuleId(CURRICULUM.modules[0].id);
    setCurrentStepIndex(0);
    setCompletedModules([]);
    setShowCompletion(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-robot-dark text-slate-200 font-sans overflow-hidden relative">
      
      {/* COMPLETION SCREEN OVERLAY */}
      <AnimatePresence>
        {showCompletion && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-2xl w-full bg-black/40 border border-redis-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center shadow-[0_0_100px_rgba(220,38,38,0.2)]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-redis-500 to-transparent opacity-50" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-redis-500/20 blur-[100px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-redis-600 to-red-900 rounded-2xl mx-auto flex items-center justify-center shadow-2xl border border-white/10 mb-6"
                    >
                        <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">
                        Redis Master
                    </h1>
                    <p className="text-redis-400 font-mono text-xs md:text-sm tracking-widest uppercase mb-8 opacity-80">
                        System Access Level: UNRESTRICTED
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-2xl font-bold text-white">{completedModules.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Modules</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-2xl font-bold text-white">{history.length}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Commands</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => setShowCompletion(false)} className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                            <TerminalIcon className="w-4 h-4" />
                            Return to Terminal
                        </button>
                        <button onClick={handleReset} className="px-6 py-3 rounded-xl bg-redis-600 text-white font-bold hover:bg-redis-500 transition-colors shadow-lg shadow-redis-900/20 flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Reboot System
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-6 opacity-50 hover:opacity-100 transition-opacity">
                        <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><Github className="w-5 h-5" /></a>
                        <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5]"><Linkedin className="w-5 h-5" /></a>
                        <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400"><Globe className="w-5 h-5" /></a>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay (Not sticky, just an overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-slate-500 text-xs tracking-widest uppercase">Curriculum</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {CURRICULUM.modules.map((m, idx) => (
                    <button key={m.id} onClick={() => { setCurrentModuleId(m.id); setCurrentStepIndex(0); setMobileMenuOpen(false); }} className={`w-full text-left p-4 rounded-xl border ${currentModuleId === m.id ? 'bg-redis-900/20 border-redis-500/50 text-white' : 'bg-slate-800/40 border-white/5 text-slate-400'}`}>
                        <div className="text-[10px] uppercase font-bold mb-1 opacity-60">Module {idx + 1}</div>
                        <div className="text-sm font-semibold">{m.title}</div>
                    </button>
                ))}
            </div>
            
            {/* Social Icons Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-6">
                <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-110">
                    <Github className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-all transform hover:scale-110">
                    <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-all transform hover:scale-110">
                    <Globe className="w-6 h-6" />
                </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        modules={CURRICULUM.modules} 
        currentModuleId={currentModuleId} 
        completedModules={completedModules}
        currentStepIndex={currentStepIndex} 
        onSelectModule={(id) => { setCurrentModuleId(id); setCurrentStepIndex(0); }}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
      />

      <main className="flex-1 flex flex-col h-full bg-[#0B1221] overflow-hidden">
         {/* MOBILE HEADER: Standard Flex Item, NOT sticky/fixed */}
         <header className="lg:hidden shrink-0 p-2 sm:p-3 bg-robot-dark border-b border-white/5">
            <div className="flex gap-2 w-full max-w-xl mx-auto">
                <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-1.5 flex items-center gap-2 min-w-0">
                     <div className="w-7 h-7 bg-redis-900 rounded-md border border-redis-500/30 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4 text-redis-500" />
                     </div>
                     <div className="flex flex-col min-w-0">
                         <h1 className="font-bold text-white text-[10px] tracking-wide truncate">REDIS_OS</h1>
                         <p className="text-[8px] text-slate-500 font-mono flex items-center gap-1 truncate"><Activity className="w-2.5 h-2.5" /> ONLINE</p>
                     </div>
                </div>
                <button onClick={() => setMobileMenuOpen(true)} className="w-10 h-10 bg-slate-900/50 border border-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <Menu className="w-5 h-5" />
                </button>
            </div>
         </header>

         {/* MAIN FLEX AREA */}
         <div className="flex-1 flex flex-col p-2 lg:p-4 gap-2 lg:gap-4 min-h-0 overflow-hidden relative">
            
            {/* INSTRUCTIONS: Flexible height */}
            <div className="shrink-0 max-h-[40%] flex flex-col min-h-0 overflow-hidden">
                <StepGuide module={currentModule} currentStepIndex={currentStepIndex} onNext={handleNext} canAdvance={canAdvance} />
            </div>

            {/* INTERACTIVE AREA: Split view on Desktop, Tab view on Mobile */}
            <div className="flex-1 min-h-0 relative flex lg:flex-row gap-4 overflow-hidden">
                
                {/* Terminal Section */}
                <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-300 ${mobileTab === 'visualizer' ? 'hidden lg:flex' : 'flex'}`}>
                    <Terminal onExecute={handleExecute} history={history} isProcessing={false} isActive={mobileTab === 'terminal' || window.innerWidth >= 1024} suggestedCommand={currentModule.steps[currentStepIndex].input_code} />
                </div>

                {/* Visualizer Section */}
                <div className={`flex-1 flex flex-col min-h-0 transition-opacity duration-300 lg:border-l lg:border-white/5 lg:pl-4 ${mobileTab === 'terminal' ? 'hidden lg:flex' : 'flex'}`}>
                     <WarehouseVisualizer store={store} />
                </div>
                
            </div>
         </div>

         {/* TOGGLE NAVIGATION: Standard Flex Item, NOT sticky/fixed. HIDDEN ON DESKTOP */}
         <footer className="lg:hidden shrink-0 p-2 pb-4 bg-robot-dark border-t border-white/5">
             <div className="max-w-[280px] mx-auto bg-slate-900 border border-white/10 rounded-2xl p-1 flex relative overflow-hidden shadow-2xl">
                 <div className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-redis-600 rounded-xl transition-all duration-300 ease-out ${mobileTab === 'terminal' ? 'left-1' : 'left-1/2'}`} />
                 <button onClick={() => setMobileTab('terminal')} className={`flex-1 py-2 text-[10px] font-black tracking-widest relative z-10 transition-colors uppercase ${mobileTab === 'terminal' ? 'text-white' : 'text-slate-500'}`}>
                    Terminal
                 </button>
                 <button onClick={() => setMobileTab('visualizer')} className={`flex-1 py-2 text-[10px] font-black tracking-widest relative z-10 transition-colors uppercase ${mobileTab === 'visualizer' ? 'text-white' : 'text-slate-500'}`}>
                    Visualizer
                 </button>
             </div>
         </footer>
      </main>
    </div>
  );
};

export default App;