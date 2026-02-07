import React from 'react';
import { Module } from '../types';
import { CheckCircle, Lock, PlayCircle, Check, ChevronRight, Github, Linkedin, Globe, Database, Activity } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  currentModuleId: string;
  completedModules: string[];
  currentStepIndex: number;
  onSelectModule: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ modules, currentModuleId, completedModules, currentStepIndex, onSelectModule }) => {
  return (
    <div className="w-full md:w-72 bg-[#0f172a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col hidden md:flex h-full shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-20 relative">
      {/* Decorative tech lines */}
      <div className="absolute top-0 right-0 w-[1px] h-24 bg-gradient-to-b from-redis-500/50 to-transparent opacity-50" />

      {/* Sidebar Header - Matching Mobile Identity Chip */}
      <div className="p-6 pb-8 border-b border-white/5 shrink-0 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-redis-900 to-slate-900 rounded-xl border border-redis-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Database className="w-5 h-5 text-redis-500" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
              REDIS_OS <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </h1>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" /> SYSTEM_READY
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-1">
          <div className="h-1 w-8 bg-redis-500/20 rounded-full" />
          <div className="h-1 w-2 bg-redis-500/20 rounded-full" />
          <div className="h-1 w-2 bg-redis-500/20 rounded-full" />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {modules.map((module, idx) => {
          const isCompleted = completedModules.includes(module.id);
          const isCurrent = currentModuleId === module.id;
          const isLocked = !isCompleted && !isCurrent && idx > 0 && !completedModules.includes(modules[idx - 1].id);

          return (
            <div key={module.id} className="group/item">
              <button
                disabled={isLocked}
                onClick={() => !isLocked && onSelectModule(module.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${isCurrent
                  ? 'bg-gradient-to-r from-redis-900/40 to-slate-800/50 border-redis-500/50 text-white shadow-lg shadow-redis-900/20'
                  : isLocked
                    ? 'bg-slate-800/20 border-white/5 text-slate-600 opacity-60 cursor-not-allowed'
                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:border-white/10 hover:text-slate-200'
                  }`}
              >
                {/* Active Indicator Line */}
                {isCurrent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-redis-500 to-redis-700" />
                )}

                <div className="flex items-center justify-between mb-1.5 relative z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-redis-400' : 'text-slate-500'}`}>
                    Module {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : isCurrent ? (
                    <PlayCircle className="w-3.5 h-3.5 text-redis-500 fill-current opacity-100" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-600 group-hover:border-slate-400" />
                  )}
                </div>

                <h3 className="text-xs md:text-sm font-semibold relative z-10 leading-tight">
                  {module.title}
                </h3>
              </button>

              {/* Steps - Only show for current */}
              {isCurrent && (
                <div className="mt-2 ml-4 pl-4 border-l border-white/10 space-y-1 relative">
                  {module.steps.map((step, sIdx) => {
                    const isStepCompleted = sIdx < currentStepIndex;
                    const isStepCurrent = sIdx === currentStepIndex;

                    return (
                      <div key={step.step_id} className={`
                                py-1.5 px-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2
                                ${isStepCurrent ? 'bg-white/5 text-white' : isStepCompleted ? 'text-slate-500' : 'text-slate-600'}
                            `}>
                        {isStepCurrent ? (
                          <div className="w-1.5 h-1.5 bg-redis-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                        ) : isStepCompleted ? (
                          <Check className="w-3 h-3 text-emerald-500/50" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        )}
                        <span className={isStepCompleted ? 'line-through opacity-50' : ''}>
                          {step.command.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm shrink-0">
        <div className="flex justify-center gap-6">
          <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-110">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-all transform hover:scale-110">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-all transform hover:scale-110">
            <Globe className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;