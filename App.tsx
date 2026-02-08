import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { RedisStore, CommandResult } from './types';
import { executeCommand, checkExpirations } from './services/mockRedis';
import Terminal from './components/Terminal';
import WarehouseVisualizer from './components/WarehouseVisualizer';
import StepGuide from './components/StepGuide';
import Sidebar from './components/Sidebar';
import { Menu, X, Terminal as TerminalIcon, Database, Github, Linkedin, Globe, ChevronRight, Play, CheckCircle, Lock, Cpu, Activity, Zap } from 'lucide-react';
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const currentModule = CURRICULUM.modules.find(m => m.id === currentModuleId)!;
  
  // Keyboard Detection for Mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Detect keyboard open/close on mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) { // Only on mobile/tablet
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        // If viewport height is significantly smaller, keyboard is likely open
        const isOpen = viewportHeight < windowHeight * 0.75;
        setIsKeyboardOpen(isOpen);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    // Use visualViewport if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }
    
    handleResize(); // Initial check
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  // Game Loop for Expiration
  useEffect(() => {
    const interval = setInterval(() => {
        const newStore = checkExpirations(store);
        if (newStore) {
            setStore(newStore);
        }
    }, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [store]);

  // Check if task is completed
  useEffect(() => {
    const step = currentModule.steps[currentStepIndex];
    
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (lastEntry.status === 'success') {
            const userCmd = lastEntry.command.toLowerCase().trim();
            const expectedCmd = step.input_code.toLowerCase().trim();
            
            // Allow exact match or logic-based validation
            const isExactMatch = userCmd === expectedCmd;
            
            // Specific validation helpers
            const keyMatches = (key: string, val: any) => store[key]?.value === val;
            const keyExists = (key: string) => !!store[key];
            const keyDeleted = (key: string) => !store[key];
            
            if (isExactMatch) {
                setCanAdvance(true);
            } else if (step.command.startsWith("SET") && expectedCmd.includes("user:name") && keyMatches("user:name", "Alice")) {
                 setCanAdvance(true);
            } else if (step.command.startsWith("DEL") && expectedCmd.includes("user:name") && keyDeleted("user:name")) {
                setCanAdvance(true);
            } else if (step.command.startsWith("LPUSH") && keyExists("todo_list")) {
                if (store["todo_list"].value[0] === "urgent_task") setCanAdvance(true);
            } else if (step.command.startsWith("FLUSHALL") && Object.keys(store).length === 0) {
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

    if (result.newStore) {
        setStore(result.newStore);
    }
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
            alert("Congratulations! You've mastered the Robot Warehouse basics!");
        }
    }
  };

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Swipe Left (Show Visualizer)
    if (isLeftSwipe && mobileTab === 'terminal') {
        setMobileTab('visualizer');
    }
    // Swipe Right (Show Terminal)
    if (isRightSwipe && mobileTab === 'visualizer') {
        setMobileTab('terminal');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-[100dvh] bg-robot-dark text-slate-200 font-sans overflow-hidden" style={{ 
      height: typeof window !== 'undefined' && window.visualViewport ? `${window.visualViewport.height}px` : undefined 
    }}>
      
      {/* UNIQUE MOBILE/TABLET HEADER: Floating HUD Style */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 p-4 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
            {/* Identity Chip */}
            <div className="flex-1 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 relative overflow-hidden ring-1 ring-white/5">
                 {/* Techy decorations */}
                 <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1 h-1 bg-slate-600 rounded-full" />
                    <div className="w-1 h-1 bg-slate-600 rounded-full" />
                 </div>
                 
                 <div className="w-10 h-10 bg-gradient-to-br from-redis-900 to-slate-900 rounded-xl border border-redis-500/30 flex items-center justify-center shrink-0 shadow-inner group">
                    <Database className="w-5 h-5 text-redis-500 group-hover:text-redis-400 transition-colors" />
                 </div>
                 
                 <div className="flex flex-col justify-center">
                     <h1 className="font-bold text-white text-xs tracking-wide flex items-center gap-2">
                        REDIS_OS <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     </h1>
                     <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Activity className="w-3 h-3" /> SYSTEM_READY
                     </p>
                 </div>
            </div>

            {/* Menu Trigger - Mechanical Button */}
            <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="w-14 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 active:scale-95 transition-all shadow-lg ring-1 ring-white/5 group"
            >
                {mobileMenuOpen ? (
                    <X className="w-6 h-6 text-redis-500" />
                ) : (
                    <Menu className="w-6 h-6 group-hover:text-white transition-colors" />
                )}
            </button>
        </div>
      </header>

      {/* Mobile/Tablet Sidebar Overlay */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl lg:hidden flex flex-col pt-24 pb-8 px-4"
        >
             <div className="flex-1 overflow-y-auto rounded-3xl bg-black/20 border border-white/5 p-4 custom-scrollbar">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                    <Zap className="w-3 h-3 text-yellow-500" /> Training Modules
                 </h2>
                 <div className="space-y-2">
                 {CURRICULUM.modules.map((module, idx) => {
                    const isCurrent = currentModuleId === module.id;
                    const isCompleted = completedModules.includes(module.id);
                    const isLocked = !isCompleted && !isCurrent && idx > 0 && !completedModules.includes(CURRICULUM.modules[idx - 1].id);

                    return (
                        <button 
                            key={module.id}
                            disabled={isLocked}
                            onClick={() => {
                                if (!isLocked) {
                                    setCurrentModuleId(module.id);
                                    setCurrentStepIndex(0);
                                    setMobileMenuOpen(false);
                                }
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                                isCurrent 
                                ? 'bg-gradient-to-r from-redis-900/40 to-slate-800/50 border-redis-500/50 text-white shadow-lg' 
                                : isLocked 
                                    ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 opacity-70'
                                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1 relative z-10">
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent ? 'text-redis-400' : 'text-slate-500'}`}>
                                    Module {idx + 1}
                                </span>
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : isLocked ? (
                                    <Lock className="w-3 h-3" />
                                ) : isCurrent ? (
                                    <Play className="w-3 h-3 text-redis-500 fill-current" />
                                ) : null}
                            </div>
                            <div className="font-semibold text-sm relative z-10">{module.title}</div>
                        </button>
                    );
                 })}
                 </div>
             </div>
             
             {/* Footer */}
             <div className="mt-4 flex justify-center gap-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                <a href="https://github.com/bhavinsachaniya" className="text-slate-500 hover:text-white"><Github className="w-5 h-5" /></a>
                <a href="https://linkedin.com/in/bhavindotdraft" className="text-slate-500 hover:text-[#0077b5]"><Linkedin className="w-5 h-5" /></a>
                <a href="https://bhavinsachaniya.in" className="text-slate-500 hover:text-emerald-400"><Globe className="w-5 h-5" /></a>
             </div>
        </motion.div>
      )}
      </AnimatePresence>

      <Sidebar 
        modules={CURRICULUM.modules} 
        currentModuleId={currentModuleId}r
        completedModules={completedModules}
        currentStepIndex={currentStepIndex}
        onSelectModule={(id) => {
            setCurrentModuleId(id);
            setCurrentStepIndex(0);
        }}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#0B1221] lg:bg-[#0B1221]">
         
         {/* DESKTOP STATUS BAR */}
         <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f172a]/50 shrink-0">
             <div className="flex items-center gap-4">
                 <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Module</span>
                     <span className="text-sm font-bold text-slate-200">{currentModule.title}</span>
                 </div>
                 <div className="h-6 w-[1px] bg-slate-700/50" />
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-mono font-bold text-emerald-400">HOST: ONLINE</span>
                 </div>
             </div>
         </div>

         {/* Main Content Area */}
         {/* Mobile: Optimized padding to prevent overlaps - adjust when keyboard is open */}
         <div 
            className={`flex-1 flex flex-col lg:flex-row p-2 pt-[88px] lg:p-4 lg:pb-4 gap-2 lg:gap-4 min-h-0 overflow-hidden relative transition-all duration-200 ${
              isKeyboardOpen ? 'pb-2' : 'pb-[120px] lg:pb-4'
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
         >
            {/* Left Column: Guide & Terminal */}
            <div className={`flex flex-col gap-2 lg:gap-4 w-full lg:w-1/2 h-full min-h-0 overflow-y-auto lg:overflow-visible ${mobileTab === 'visualizer' ? 'hidden lg:flex' : 'flex'}`}>
                <div className={`z-10 shrink-0 transition-all duration-200 ${isKeyboardOpen ? 'hidden' : 'flex-none'}`}>
                    <StepGuide 
                        module={currentModule} 
                        currentStepIndex={currentStepIndex} 
                        onNext={handleNext}
                        canAdvance={canAdvance}
                    />
                </div>
                <div className={`min-h-0 relative z-0 transition-all duration-200 ${isKeyboardOpen ? 'flex-1' : 'flex-1 min-h-[200px]'}`}>
                    <Terminal 
                        onExecute={handleExecute} 
                        history={history} 
                        isProcessing={false}
                        isActive={mobileTab === 'terminal'}
                        suggestedCommand={currentModule.steps[currentStepIndex].input_code}
                        isKeyboardOpen={isKeyboardOpen}
                    />
                </div>
            </div>

            {/* Right Column: Visualizer */}
            <div className={`flex-1 h-full min-h-0 ${mobileTab === 'terminal' ? 'hidden lg:block' : 'block'}`}>
                <WarehouseVisualizer store={store} />
            </div>
         </div>

         {/* UNIQUE MOBILE/TABLET BOTTOM NAV: Floating Control Deck - hide when keyboard is open */}
         <div className={`lg:hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none transition-all duration-200 ${
           isKeyboardOpen ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
         }`}>
             <div className="pointer-events-auto mx-auto max-w-sm bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex relative ring-1 ring-white/10 overflow-hidden">
                 {/* Elastic Background Pill */}
                 <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-gradient-to-b from-redis-600 to-redis-700 rounded-2xl shadow-lg shadow-redis-900/50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        mobileTab === 'terminal' ? 'left-1.5' : 'left-1/2'
                    }`} 
                 >
                    {/* Top shine - Softened to prevent harsh line artifacts */}
                    <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 rounded-2xl" />
                 </div>

                 <button 
                    onClick={() => setMobileTab('terminal')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-bold tracking-wider transition-colors relative z-10 ${
                        mobileTab === 'terminal' 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                 >
                    <TerminalIcon className={`w-4 h-4 ${mobileTab === 'terminal' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    <span>TERMINAL</span>
                 </button>
                 
                 <button 
                    onClick={() => setMobileTab('visualizer')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-bold tracking-wider transition-colors relative z-10 ${
                        mobileTab === 'visualizer' 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                 >
                    <Cpu className={`w-4 h-4 ${mobileTab === 'visualizer' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    <span>VISUALIZER</span>
                 </button>
             </div>
         </div>
      </main>
    </div>
  );
};

export default App;