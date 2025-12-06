import React, { useState } from 'react';
import { Step } from '../types';
import { useBaking } from '../context/BakingContext';
import { Check, Play, Info, ChevronDown, ChevronUp } from 'lucide-react';
import TimerRing from './TimerRing';
import Assistant from './Assistant';

interface StepCardProps {
  step: Step;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const { activeStepId, timerEndTime, startStep, completeStep } = useBaking();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const isActive = activeStepId === step.id;
  const isCompleted = step.status === 'completed';
  
  // Is this step active and has a running timer?
  const isTimerRunning = isActive && timerEndTime && step.durationMin > 0;

  const handleAction = () => {
    if (isActive) {
      completeStep(step.id);
    } else if (!isCompleted) {
      startStep(step.id);
    }
  };

  return (
    <div className={`mb-4 transition-all duration-300 ${isActive ? 'scale-[1.02]' : 'opacity-90'}`}>
      <div 
        className={`
          relative rounded-sm p-5 border 
          ${isActive ? 'bg-white border-crust shadow-warm' : 'bg-white border-stone-200'}
          ${isCompleted ? 'bg-stone-50 border-stone-100' : ''}
        `}
      >
        {/* Connection Line to next step (visual only) */}
        <div className="absolute right-[-14px] top-8 w-px h-full bg-stone-200 -z-10 hidden md:block"></div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div 
              onClick={handleAction}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors border
                ${isCompleted ? 'bg-sage border-sage text-white' : ''}
                ${isActive ? 'bg-crust border-crust text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-cream border-stone-300 text-stone-300' : ''}
              `}
            >
              {isCompleted ? <Check size={16} /> : isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <Play size={14} className="ml-0.5" />}
            </div>

            <div>
              <h3 className={`font-serif text-lg ${isCompleted ? 'text-stone-400 line-through' : 'text-charcoal'}`}>
                {step.title}
              </h3>
              <p className="text-xs text-stone-500 font-sans">{step.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Timer Visualization */}
            {isTimerRunning && timerEndTime && (
              <TimerRing endTime={timerEndTime} totalDurationMin={step.durationMin} />
            )}

            {/* Action Button */}
            {!isTimerRunning && !isCompleted && step.durationMin > 0 && isActive && (
               <span className="text-xs font-mono text-crust animate-pulse">בתהליך...</span>
            )}

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-stone-400 hover:text-charcoal transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-stone-100 animate-fadeIn">
            <div className="bg-cream p-4 rounded-sm border border-stone-100 mb-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-charcoal mb-2">
                    <Info size={14} className="text-crust" /> טיפים של אופים
                </h4>
                <ul className="text-sm text-stone-600 font-sans space-y-2 list-disc list-inside">
                    {step.tips?.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                    ))}
                </ul>
            </div>

            {/* Manual Completion if it was a timer step */}
            {isActive && (
                 <button 
                    onClick={() => completeStep(step.id)}
                    className="w-full py-3 bg-charcoal text-white text-sm font-bold tracking-wide uppercase hover:bg-stone-800 transition-colors rounded-sm"
                 >
                    סיים שלב זה
                 </button>
            )}
            
             {/* AI Assistant Toggle */}
             <div className="mt-4">
                <button 
                    onClick={() => setShowAssistant(!showAssistant)}
                    className="text-xs font-bold text-sage underline hover:text-charcoal"
                >
                    {showAssistant ? 'סגור עזרה' : 'יש לך שאלה לאופה?'}
                </button>
                {showAssistant && <Assistant stepName={step.title} />}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepCard;
