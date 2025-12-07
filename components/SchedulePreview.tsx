import React, { useState, useMemo } from 'react';
import { useBaking } from '../context/BakingContext';
import { X, Clock, Calendar, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SchedulePreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

const SchedulePreview: React.FC<SchedulePreviewProps> = ({ isOpen, onClose }) => {
    const { steps } = useBaking();
    const [startTime, setStartTime] = useState(() => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    });

    const schedule = useMemo(() => {
        const [hours, minutes] = startTime.split(':').map(Number);
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);

        return steps.map(step => {
            const start = new Date(currentTime);
            // Add duration
            const durationMs = (step.durationMin || 0) * 60000;
            // Add gap (rough estimate for transition/handling time, say 5 mins)
            const handlingMs = 5 * 60000;

            currentTime = new Date(currentTime.getTime() + durationMs + handlingMs);

            return {
                ...step,
                startTime: start,
                endTime: new Date(start.getTime() + durationMs)
            };
        });
    }, [startTime, steps]);

    const formatTime = (date: Date) => date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-paper dark:bg-stone-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col relative z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-sand dark:border-stone-800 flex justify-between items-center bg-cream/50 dark:bg-stone-800/50 rounded-t-2xl">
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal dark:text-stone-200">לוח זמנים</h2>
                                <p className="text-xs text-stone-400 font-sans mt-0.5">תכנן את האפייה שלך</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-charcoal dark:text-stone-300">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Start Time Selector */}
                        <div className="px-6 py-4 bg-white dark:bg-stone-800/30 border-b border-sand dark:border-stone-800 flex items-center justify-between">
                            <label className="text-sm font-bold text-stone-400 uppercase tracking-wide flex items-center gap-2">
                                <Clock size={14} />
                                שעת התחלה משוערת:
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-sand/30 dark:bg-stone-700/50 border-none rounded-lg px-3 py-1.5 text-lg font-mono text-charcoal dark:text-stone-200 focus:ring-2 focus:ring-sage focus:outline-none"
                            />
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-0">
                            {schedule.map((item, idx) => {
                                const isLast = idx === schedule.length - 1;
                                const isLong = (item.durationMin || 0) > 60;

                                return (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Time Column */}
                                        <div className="w-16 flex flex-col items-end pt-1">
                                            <span className="font-mono text-sm font-bold text-charcoal dark:text-stone-300">{formatTime(item.startTime)}</span>
                                            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                                                +{item.durationMin} דק'
                                            </span>
                                        </div>

                                        {/* Line Column */}
                                        <div className="relative flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full border-2 z-10 
                                                ${isLong ? 'bg-sage border-sage' : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600'}
                                            `}></div>
                                            {!isLast && (
                                                <div className="w-px h-full bg-stone-200 dark:bg-stone-700 absolute top-3"></div>
                                            )}
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 pb-8 pt-0.5">
                                            <h3 className="font-serif text-lg text-charcoal dark:text-stone-200 leading-none mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Finish Line */}
                            <div className="flex gap-4">
                                <div className="w-16 text-right">
                                    <span className="font-mono text-sm font-bold text-sage">{formatTime(schedule[schedule.length - 1].endTime)}</span>
                                </div>
                                <div className="relative flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-sage border-2 border-sage z-10 shadow-lg shadow-sage/40"></div>
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-sm text-sage uppercase tracking-widest">סיום משוער</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SchedulePreview;
