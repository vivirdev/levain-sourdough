import React, { useEffect, useState } from 'react';
import { useBaking } from '../context/BakingContext';
import { Check, X, Circle, Clock } from 'lucide-react';

interface OverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OverviewModal: React.FC<OverviewModalProps> = ({ isOpen, onClose }) => {
  const { steps, currentStepIndex, goToStep, activeStepId, timerEndTime, formatTime } = useBaking();
  const [now, setNow] = useState(Date.now());

  // Update timer in modal
  useEffect(() => {
      if (!isOpen) return;
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-paper h-full shadow-2xl animate-slideUp border-l border-stone-100 flex flex-col">
        <div className="p-6 border-b border-sand flex justify-between items-center bg-cream/50">
          <div>
              <h2 className="font-serif text-2xl text-charcoal">מפת הדרך</h2>
              <p className="text-xs text-stone-400 font-sans mt-1">סקירה מלאה של התהליך</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-charcoal">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {steps.map((step, index) => {
            const isActive = activeStepId === step.id;
            const isCompleted = step.status === 'completed';
            const isCurrentView = currentStepIndex === index;
            
            // Calculate time left if active
            const timeLeft = isActive && timerEndTime ? Math.max(0, timerEndTime - now) : 0;

            return (
              <button
                key={step.id}
                onClick={() => {
                  goToStep(index);
                  onClose();
                }}
                className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-all
                  ${isCurrentView ? 'bg-white shadow-soft border border-stone-100' : 'hover:bg-white/50 border border-transparent'}
                  ${isActive ? 'ring-1 ring-crust ring-offset-2' : ''}
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
                  ${isCompleted ? 'bg-sage border-sage text-white' : ''}
                  ${isActive ? 'bg-crust border-crust text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-stone-200 text-stone-200' : ''}
                `}>
                  {isCompleted ? <Check size={12} /> : isActive ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/> : <span className="text-[10px] font-mono">{index + 1}</span>}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                      <span className={`block font-serif text-lg leading-none mb-1 ${isCompleted ? 'text-stone-400 line-through decoration-stone-300' : 'text-charcoal'}`}>
                        {step.title}
                      </span>
                      {isCompleted && step.completedAt && (
                          <span className="text-[9px] font-mono text-stone-300">
                              {new Date(step.completedAt).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                      )}
                  </div>
                  
                  {isActive && timeLeft > 0 ? (
                       <span className="flex items-center gap-1 text-[11px] text-crust font-mono font-bold">
                          <Clock size={10} /> {formatTime(timeLeft)}
                       </span>
                  ) : step.durationMin > 0 ? (
                      <span className="flex items-center gap-1 text-[10px] text-stone-400 font-sans tracking-wider uppercase">
                          <Clock size={10} /> {step.durationMin} דק'
                      </span>
                  ) : null}
                </div>

                {isCurrentView && (
                    <div className="w-1.5 h-1.5 rounded-full bg-charcoal/20"></div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-6 bg-cream border-t border-sand text-center">
             <p className="font-serif italic text-stone-400 text-sm">
                "Bread is mostly time."
             </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewModal;