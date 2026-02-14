import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { RedisStore, CommandResult } from './types';
import { executeCommand, checkExpirations } from './services/mockRedis';
import Terminal from './components/Terminal';
import WarehouseVisualizer from './components/WarehouseVisualizer';
import StepGuide from './components/StepGuide';
import Sidebar from './components/Sidebar';
import { Menu, X, Database, Activity, Github, Linkedin, Globe, Trophy, RotateCcw, Terminal as TerminalIcon, LayoutGrid } from 'lucide-react';
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

  // Safely get module or fallback
  const currentModule = CURRICULUM.modules.find(m => m.id === currentModuleId) || CURRICULUM.modules[0];
  const currentStep = currentModule.steps[currentStepIndex];
  
  // Game Loop: Expirations
  useEffect(() => {
    const interval = setInterval(() => {
        const newStore = checkExpirations(store);
        if (newStore) setStore(newStore);
    }, 1000); // Optimized from 100ms to 1s for performance
    return () => clearInterval(interval);
  }, [store]);

  // Validation Logic
  useEffect(() => {
    if (!currentStep) return;
    
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (lastEntry.status === 'success') {
            const userCmd = lastEntry.command.toLowerCase().trim();
            const expectedCmd = currentStep.input_code.toLowerCase().trim();
            
            // 1. Exact Match
            if (userCmd === expectedCmd) {
                setCanAdvance(true);
                return;
            }

            // 2. Logic-based Validation
            const cmdParts = userCmd.split(' ');
            const mainCmd = cmdParts[0].toUpperCase();
            
            // Basic checks based on the command type and store state
            // This allows some flexibility (e.g. if they did the task but with extra spaces)
            if (currentStep.input_code.includes("user:name")) {
                if (mainCmd === "SET" && store["user:name"]?.value === "Alice") setCanAdvance(true);
                if (mainCmd === "DEL" && !store["user:name"]) setCanAdvance(true);
            }
            else if (currentStep.input_code.includes("session_id")) {
                if (mainCmd === "SET" && store["session_id"]?.value === "123") setCanAdvance(true);
            }
            else if (mainCmd === "FLUSHALL" && Object.keys(store).length === 0) {
                setCanAdvance(true);
            }
        }
    }
  }, [store, history, currentModule, currentStepIndex, currentStep]);

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
    <div className="flex flex-col lg:flex-row h-full w-full bg-robot-dark text-slate-200 font-sans overflow-hidden relative">
      
      {/* COMPLETION OVERLAY */}
      <AnimatePresence>
        {showCompletion && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="max-w-lg w-full bg-[#0b101b] border border-redis-500/30 rounded-3xl p-8 relative overflow-hidden text-center shadow-2xl"
                >
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-redis-500 to-transparent" />
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white mb-2 uppercase">Redis Master</h1>
                    <p className="text-slate-400 mb-8">You have successfully navigated the entire warehouse!</p>
                    <button onClick={handleReset} className="w-full py-4 rounded-xl bg-redis-600 text-white font-bold hover:bg-redis-500 transition-all flex items-center justify-center gap-2">
                        <RotateCcw className="w-5 h-5" /> Restart Mission
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '-100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '-100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-[100] bg-[#0b101b] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/5">
                <span className="font-bold text-slate-400 text-xs tracking-widest uppercase">Select Module</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-800 rounded-lg"><X className="w-6 h-6 text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {CURRICULUM.modules.map((m, idx) => (
                    <button key={m.id} onClick={() => { setCurrentModuleId(m.id); setCurrentStepIndex(0); setMobileMenuOpen(false); }} className={`w-full text-left p-5 rounded-2xl border transition-all ${currentModuleId === m.id ? 'bg-redis-900/20 border-redis-500/50 text-white' : 'bg-slate-800/40 border-transparent text-slate-400'}`}>
                        <div className="text-xs uppercase font-bold mb-1 opacity-60">Module {idx + 1}</div>
                        <div className="text-base font-bold">{m.title}</div>
                    </button>
                ))}
            </div>
            <div className="p-6 border-t border-white/5 flex justify-center gap-8">
                <a href="https://github.com/bhavinsachaniya" className="text-slate-500 hover:text-white"><Github className="w-8 h-8" /></a>
                <a href="https://linkedin.com/in/bhavindotdraft" className="text-slate-500 hover:text-blue-400"><Linkedin className="w-8 h-8" /></a>
                <a href="https://bhavinsachaniya.in" className="text-slate-500 hover:text-emerald-400"><Globe className="w-8 h-8" /></a>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full bg-[#090e1a] min-w-0 relative">
         
         {/* MOBILE NAVBAR */}
         <header className="lg:hidden shrink-0 px-3 py-2 bg-[#0b101b] border-b border-slate-800 flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
                <Menu className="w-5 h-5" />
             </button>
             <div className="flex-1 min-w-0">
                 <h1 className="font-bold text-white text-xs tracking-wide truncate">REDIS_PLAYGROUND</h1>
                 <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                 </div>
             </div>
             <div className="w-10 h-10 bg-redis-900/30 rounded-xl flex items-center justify-center border border-redis-500/20">
                <Database className="w-5 h-5 text-redis-500" />
             </div>
         </header>

         {/* CONTENT WRAPPER */}
         <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            
            {/* Step Guide - Always visible at top on mobile */}
            <div className="shrink-0 z-10">
                <StepGuide 
                  module={currentModule} 
                  currentStepIndex={currentStepIndex} 
                  onNext={handleNext} 
                  canAdvance={canAdvance} 
                />
            </div>

            {/* Desktop: Split View | Mobile: Tabbed View */}
            <div className="flex-1 flex lg:flex-row min-h-0 relative">
                
                {/* Terminal Pane */}
                <div className={`
                    absolute inset-0 lg:static lg:flex-1 flex flex-col min-h-0 bg-[#090e1a] transition-all duration-300
                    ${mobileTab === 'terminal' ? 'translate-x-0 z-10' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100 lg:z-auto'}
                `}>
                    <Terminal 
                      onExecute={handleExecute} 
                      history={history} 
                      isProcessing={false} 
                      isActive={mobileTab === 'terminal'} 
                      suggestedCommand={currentStep?.input_code} 
                    />
                </div>

                {/* Visualizer Pane */}
                <div className={`
                    absolute inset-0 lg:static lg:flex-1 flex flex-col min-h-0 bg-[#0f172a] transition-all duration-300 border-l border-slate-800
                    ${mobileTab === 'visualizer' ? 'translate-x-0 z-10' : 'translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100 lg:z-auto'}
                `}>
                     <WarehouseVisualizer store={store} />
                </div>
            </div>
         </div>

         {/* MOBILE BOTTOM NAVIGATION */}
         <nav className="lg:hidden shrink-0 p-3 bg-[#0b101b] border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
             <div className="bg-slate-900 p-1 rounded-2xl flex relative isolate">
                 <motion.div 
                    layout 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-slate-700 rounded-xl -z-10 shadow-md ${mobileTab === 'terminal' ? 'left-1' : 'left-[50%]'}`} 
                 />
                 <button 
                    onClick={() => setMobileTab('terminal')} 
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${mobileTab === 'terminal' ? 'text-white' : 'text-slate-500'}`}
                 >
                    <TerminalIcon className="w-4 h-4" /> Terminal
                 </button>
                 <button 
                    onClick={() => setMobileTab('visualizer')} 
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${mobileTab === 'visualizer' ? 'text-white' : 'text-slate-500'}`}
                 >
                    <LayoutGrid className="w-4 h-4" /> Visualizer
                 </button>
             </div>
         </nav>

      </main>
    </div>
  );
};

export default App;