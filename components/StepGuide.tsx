import React, { useState } from 'react';
import { Step, Module } from '../types';
import { ArrowRight, Lightbulb, Code, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepGuideProps {
  module: Module;
  currentStepIndex: number;
  onNext: () => void;
  canAdvance: boolean;
}

const StepGuide: React.FC<StepGuideProps> = ({ module, currentStepIndex, onNext, canAdvance }) => {
  const step = module.steps[currentStepIndex];
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col overflow-hidden w-full max-h-full">
      {/* Header - Interactive and minimal */}
      <div className="p-2 sm:p-2.5 lg:p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-redis-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Step {currentStepIndex + 1}/{module.steps.length}</span>
                <div className="opacity-40">{isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}</div>
            </div>
            <h2 className="text-[10px] sm:text-[11px] md:text-lg font-bold text-white truncate leading-tight uppercase">{step.analogy}</h2>
        </div>
        
        {!isExpanded && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={!canAdvance} className={`ml-2 px-2 py-1 rounded-lg text-[8px] font-bold transition-all ${canAdvance ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-slate-600'}`}>
              NEXT
          </button>
        )}
      </div>

      {/* Expandable Task Content - Flexible and scrollable internally if needed */}
      <AnimatePresence initial={true}>
        {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden"
            >
                <div className="px-2 sm:px-2.5 lg:px-4 pb-2 lg:pb-4 space-y-1.5 lg:space-y-3">
                    {/* Goal Section: Limited height on mobile, full on desktop */}
                    <div className="bg-redis-900/10 border border-redis-500/10 rounded-lg p-2 lg:p-3 max-h-24 lg:max-h-none overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-yellow-500" />
                            <span className="text-[8px] lg:text-[10px] font-black text-white uppercase tracking-widest opacity-60 leading-none">Goal</span>
                        </div>
                        <p className="text-[10px] sm:text-[10px] md:text-sm text-slate-300 leading-snug">{step.task}</p>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-1.5 lg:p-3 flex items-center gap-2">
                        <Code className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-blue-400 shrink-0" />
                        <code className="text-[9px] sm:text-[9px] md:text-sm font-mono text-blue-300 truncate">{step.command}</code>
                    </div>

                    <button 
                      onClick={onNext} 
                      disabled={!canAdvance} 
                      className={`w-full flex items-center justify-center gap-1 lg:gap-2 py-1.5 lg:py-3 rounded-lg text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all ${canAdvance ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}
                    >
                        {canAdvance ? 'Continue' : 'Awaiting Input'} {canAdvance && <ArrowRight className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepGuide;