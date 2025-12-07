import React, { useState } from 'react';
import { useBaking } from '../context/BakingContext';
import { X, Save, RotateCcw, Clock, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

const StepEditor: React.FC<StepEditorProps> = ({ isOpen, onClose }) => {
    const { steps, updateStepDuration, activeStepId } = useBaking();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempDuration, setTempDuration] = useState(0);

    const handleEditStart = (stepId: string, currentDuration: number) => {
        setEditingId(stepId);
        setTempDuration(currentDuration);
    };

    const handleSave = (stepId: string) => {
        updateStepDuration(stepId, tempDuration);
        setEditingId(null);
    };

    // Calculate total time
    const totalMinutes = steps.reduce((acc, step) => acc + step.durationMin, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-charcoal/60 dark:bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-paper dark:bg-stone-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 max-h-[80vh] flex flex-col"
                    >
                        <div className="p-5 border-b border-sand dark:border-stone-800 flex justify-between items-center bg-cream/50 dark:bg-stone-800/50">
                            <div>
                                <h2 className="font-serif text-xl text-charcoal dark:text-stone-200">עריכת שלבים</h2>
                                <p className="text-xs text-stone-500 font-mono mt-1">
                                    סה"כ זמן: {hours} שעות ו-{mins} דקות
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                                <X size={20} className="text-charcoal dark:text-stone-300" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`p-3 rounded-xl border border-transparent transition-all ${editingId === step.id
                                            ? 'bg-white dark:bg-stone-800 shadow-md border-sage/30'
                                            : 'bg-stone-50 dark:bg-stone-800/30 hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-charcoal dark:text-stone-200 text-sm">
                                            {step.title}
                                        </span>
                                        {/* Editing Controls */}
                                        {editingId === step.id ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleSave(step.id)} className="text-sage hover:text-green-600 p-1">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-stone-400 hover:text-stone-600 p-1">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditStart(step.id, step.durationMin)}
                                                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1"
                                                disabled={activeStepId !== null} // Disable editing if timer running? Optional.
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Duration Display / Edit */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Clock size={12} className={editingId === step.id ? "text-sage" : "text-stone-400"} />
                                        {editingId === step.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={tempDuration}
                                                    onChange={(e) => setTempDuration(Math.max(0, parseInt(e.target.value)))}
                                                    className="w-16 p-1 rounded bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-center font-mono focus:outline-none focus:ring-2 focus:ring-sage/50"
                                                />
                                                <span className="text-stone-500">דקות</span>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-stone-600 dark:text-stone-400">
                                                {step.durationMin} דקות
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reset Defaults */}
                        <div className="p-4 border-t border-sand dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                            <button
                                onClick={() => {
                                    if (confirm('לשחזר את זמני ברירת המחדל?')) {
                                        useBaking().resetApp(); // This resets everything including weight, maybe add specific resetSteps?
                                        onClose();
                                    }
                                }}
                                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors"
                            >
                                <RotateCcw size={14} />
                                שחזר ברירת מחדל
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StepEditor;
