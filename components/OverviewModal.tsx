import React, { useEffect, useState } from 'react';
import { useBaking } from '../context/BakingContext';
import { Check, X, Circle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-xs bg-paper dark:bg-stone-900 h-full shadow-2xl border-l border-stone-100 dark:border-stone-800 flex flex-col"
          >
            <div className="p-6 border-b border-sand dark:border-stone-800 flex justify-between items-center bg-cream/50 dark:bg-stone-800/50">
              <div>
                <h2 className="font-serif text-2xl text-charcoal dark:text-stone-200">מפת הדרך</h2>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-sans mt-1">סקירה מלאה של התהליך</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors text-charcoal dark:text-stone-300">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {steps.map((step, index) => {
                  const isActive = activeStepId === step.id;
                  const isCompleted = step.status === 'completed';
                  const isCurrentView = currentStepIndex === index;

                  const timeLeft = isActive && timerEndTime ? Math.max(0, timerEndTime - now) : 0;

                  return (
                    <motion.button
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        goToStep(index);
                        onClose();
                      }}
                      className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-all
                            ${isCurrentView
                          ? 'bg-white dark:bg-zinc-800 shadow-soft border border-stone-100 dark:border-stone-700'
                          : 'hover:bg-white/50 dark:hover:bg-white/5 border border-transparent'}
                            ${isActive ? 'ring-1 ring-crust dark:ring-stone-400 ring-offset-2 dark:ring-offset-stone-900' : ''}
                          `}
                    >
                      <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
                            ${isCompleted ? 'bg-sage border-sage text-white' : ''}
                            ${isActive ? 'bg-crust border-crust dark:bg-stone-600 dark:border-stone-600 text-white' : ''}
                            ${!isActive && !isCompleted ? 'border-stone-200 dark:border-stone-700 text-stone-200 dark:text-stone-700' : ''}
                          `}>
                        {isCompleted ? <Check size={12} /> : isActive ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : <span className="text-[10px] font-mono">{index + 1}</span>}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`block font-serif text-lg leading-none mb-1 ${isCompleted ? 'text-stone-400 dark:text-stone-500 line-through decoration-stone-300 dark:decoration-stone-600' : 'text-charcoal dark:text-stone-200'}`}>
                            {step.title}
                          </span>
                          {isCompleted && step.completedAt && (
                            <span className="text-[9px] font-mono text-stone-300 dark:text-stone-600">
                              {new Date(step.completedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {isActive && timeLeft > 0 ? (
                          <span className="flex items-center gap-1 text-[11px] text-crust dark:text-stone-300 font-mono font-bold">
                            <Clock size={10} /> {formatTime(timeLeft)}
                          </span>
                        ) : step.durationMin > 0 ? (
                          <span className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-wider uppercase">
                            <Clock size={10} /> {step.durationMin} דק'
                          </span>
                        ) : null}
                      </div>

                      {isCurrentView && (
                        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-charcoal/20 dark:bg-white/20" />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-cream dark:bg-stone-900 border-t border-sand dark:border-stone-800 text-center">
              <p className="font-serif italic text-stone-400 dark:text-stone-600 text-sm">
                "Bread is mostly time."
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OverviewModal;