import React from 'react';
import { Module } from '../types';
import { CheckCircle, PlayCircle, Check, Database, Activity, Github, Linkedin, Globe } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  currentModuleId: string;
  completedModules: string[];
  currentStepIndex: number;
  onSelectModule: (id: string) => void;
  onSelectStep: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ modules, currentModuleId, completedModules, currentStepIndex, onSelectModule, onSelectStep }) => {
  return (
    <aside className="w-64 bg-[#0b101b] border-r border-white/5 flex-col hidden lg:flex h-full shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-30 relative shrink-0">
      {/* Decorative Line */}
      <div className="absolute top-0 right-0 w-[1px] h-32 bg-gradient-to-b from-redis-500/50 to-transparent opacity-50" />
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-redis-900 to-slate-900 rounded-xl border border-redis-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Database className="w-5 h-5 text-redis-500" />
            </div>
            <div>
                <h1 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                    REDIS_OS <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </h1>
                <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                    <Activity className="w-3 h-3" /> v1.0 ONLINE
                </p>
            </div>
        </div>
      </div>

      {/* Module List */}
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {modules.map((module, idx) => {
          const isCompleted = completedModules.includes(module.id);
          const isCurrent = currentModuleId === module.id;
          
          return (
            <div key={module.id} className="group/item">
              <button
                onClick={() => onSelectModule(module.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                    isCurrent 
                    ? 'bg-gradient-to-r from-redis-900/20 to-transparent border-redis-500/30 text-white shadow-inner' 
                    : 'bg-transparent border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                 {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-redis-500" />}

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-redis-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                    Module {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <PlayCircle className="w-4 h-4 text-redis-500 fill-current opacity-100" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-700" />
                  )}
                </div>
                
                <h3 className="text-sm font-semibold leading-snug">
                  {module.title}
                </h3>
              </button>

              {/* Steps Sub-navigation */}
              {isCurrent && (
                <div className="mt-2 ml-4 pl-4 border-l border-white/5 space-y-1">
                    {module.steps.map((step, sIdx) => {
                        const isStepCompleted = sIdx < currentStepIndex;
                        const isStepCurrent = sIdx === currentStepIndex;
                        
                        return (
                            <button 
                                key={step.step_id} 
                                onClick={() => onSelectStep(sIdx)}
                                className={`
                                w-full text-left py-2 px-3 rounded-lg text-xs font-mono transition-colors flex items-center gap-2.5
                                ${isStepCurrent ? 'bg-white/5 text-white font-bold' : isStepCompleted ? 'text-emerald-500/70 hover:text-emerald-400' : 'text-slate-600 hover:text-slate-400'}
                            `}>
                                {isStepCurrent ? (
                                    <div className="w-1.5 h-1.5 bg-redis-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                ) : isStepCompleted ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                                )}
                                <span className={isStepCompleted ? 'line-through opacity-50' : ''}>
                                    {step.command.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="p-4 border-t border-white/5 bg-[#0b101b] shrink-0">
        <div className="flex justify-center gap-6">
            <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg" aria-label="GitHub">
                <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#0077b5] transition-colors p-2 hover:bg-slate-800 rounded-lg" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-emerald-400 transition-colors p-2 hover:bg-slate-800 rounded-lg" aria-label="Portfolio">
                <Globe className="w-5 h-5" />
            </a>
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;