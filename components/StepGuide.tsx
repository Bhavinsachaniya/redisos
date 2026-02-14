import React, { useState } from 'react';
import { Step, Module } from '../types';
import { ArrowRight, Lightbulb, Code, ChevronDown, ChevronUp } from 'lucide-react';
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
    <section className="bg-slate-900 border-b lg:border border-slate-700/50 lg:rounded-xl flex flex-col overflow-hidden shadow-lg shrink-0 z-20">
      {/* Interactive Header */}
      <button 
        className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-redis-900/30 border border-redis-500/20 text-redis-400 text-[10px] font-black uppercase tracking-widest">
                    Step {currentStepIndex + 1} / {module.steps.length}
                </span>
                <span className="text-slate-500">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white truncate leading-tight">
                {step.analogy}
            </h2>
        </div>
        
        {!isExpanded && (
          <div 
            role="button"
            onClick={(e) => { e.stopPropagation(); if(canAdvance) onNext(); }} 
            className={`
                shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                ${canAdvance 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                    : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }
            `}
          >
              NEXT
          </div>
        )}
      </button>

      {/* Content Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden"
            >
                <div className="px-3 md:px-4 pb-4 space-y-3">
                    {/* Task Description */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mission Goal</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                            {step.task}
                        </p>
                    </div>
                    
                    {/* Command Hint */}
                    <div className="bg-black/30 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                        <Code className="w-4 h-4 text-blue-400 shrink-0" />
                        <code className="text-sm font-mono text-blue-300 font-bold tracking-wide">
                            {step.command}
                        </code>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={onNext} 
                      disabled={!canAdvance} 
                      className={`
                        w-full flex items-center justify-center gap-2 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all
                        ${canAdvance 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 translate-y-0' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }
                      `}
                    >
                        {canAdvance ? 'Complete Step' : 'Execute Command to Continue'} 
                        {canAdvance && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default StepGuide;