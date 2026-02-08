import React, { useState } from 'react';
import { Step, Module } from '../types';
import { CheckCircle, Circle, ArrowRight, Lightbulb, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepGuideProps {
  module: Module;
  currentStepIndex: number;
  onNext: () => void;
  canAdvance: boolean;
}

const StepGuide: React.FC<StepGuideProps> = ({ module, currentStepIndex, onNext, canAdvance }) => {
  const step = module.steps[currentStepIndex];
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded on mobile

  return (
    <div className="bg-robot-panel border border-slate-700 rounded-xl shadow-lg flex flex-col relative overflow-hidden transition-all duration-300 max-h-[45vh] md:max-h-none">
      {/* Background decoration - only show on desktop */}
      <div className="hidden md:block absolute -top-10 -right-10 w-28 h-28 bg-redis-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="p-3 md:p-4 pb-2 flex items-center justify-between z-10 cursor-pointer md:cursor-default" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-redis-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    Step {currentStepIndex + 1}/{module.steps.length}
                </h3>
                {/* Mobile Toggle Indicator */}
                <div className="md:hidden text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>
            <h2 className="text-base md:text-xl font-bold text-white leading-tight">{step.analogy}</h2>
        </div>
        
        {/* Progress Dots (Desktop) */}
        <div className="hidden md:flex gap-1.5">
            {module.steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-redis-500' : idx < currentStepIndex ? 'bg-green-500' : 'bg-slate-700'}`} 
                />
            ))}
        </div>
      </div>

      {/* Collapsible Content Section for Mobile */}
      <AnimatePresence initial={false}>
        {/* On desktop, always show. On mobile, check isExpanded */}
        <div className={`${isExpanded ? 'block' : 'hidden'} md:block overflow-y-auto`}>
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 md:px-4 pb-0 space-y-2 md:space-y-3 z-10 overflow-hidden"
            >
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                    {step.explanation}
                </p>

                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 md:p-3 flex items-center gap-2 md:gap-3">
                    <Code className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 shrink-0" />
                    <div>
                        <code className="font-mono text-blue-300 text-xs md:text-sm break-all">{step.command}</code>
                    </div>
                </div>
            </motion.div>
        </div>
      </AnimatePresence>

      {/* Task Section */}
      <div className="p-3 md:p-4 pt-2 md:pt-3 z-10 flex flex-col gap-2 md:gap-3">
        <div className="bg-redis-900/20 border border-redis-500/20 rounded-lg p-2.5 md:p-3">
            <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-400" />
                <span className="text-xs md:text-sm font-bold text-white">Your Task</span>
            </div>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">{step.task}</p>
        </div>

        {/* Mobile Collapse/Expand Hint */}
        <div className="md:hidden text-center">
            {isExpanded ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 w-full"
                >
                    Hide explanation <ChevronUp className="w-3 h-3" />
                </button>
            ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 w-full"
                >
                    Show explanation <ChevronDown className="w-3 h-3" />
                </button>
            )}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
            <button
                onClick={onNext}
                disabled={!canAdvance}
                className={`
                    w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs md:text-sm
                    ${canAdvance 
                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] transform md:hover:scale-105' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                `}
            >
                {canAdvance ? (currentStepIndex === module.steps.length - 1 ? 'Finish Module' : 'Next Step') : 'Complete Task'}
                {canAdvance ? <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Circle className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default StepGuide;