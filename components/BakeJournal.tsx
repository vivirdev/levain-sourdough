import React, { useState } from 'react';
import { useBaking, BakeLog } from '../context/BakingContext';
import { X, Calendar, Droplet, Star, Trash2, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BakeJournalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BakeJournal: React.FC<BakeJournalProps> = ({ isOpen, onClose }) => {
    const { bakeHistory, deleteBake, exportData, importData } = useBaking();
    const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

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
                        className="bg-paper dark:bg-stone-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl h-[85vh] flex flex-col relative z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-sand dark:border-stone-800 flex justify-between items-center bg-cream/50 dark:bg-stone-800/50 rounded-t-2xl">
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal dark:text-stone-200">יומן האופה</h2>
                                <p className="text-xs text-stone-400 font-sans mt-0.5">היסטוריית האפיות שלך</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportData}
                                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-charcoal dark:text-stone-300"
                                    title="ייצא נתונים"
                                >
                                    <Download size={20} strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => document.getElementById('import-input')?.click()}
                                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-charcoal dark:text-stone-300"
                                    title="ייבא נתונים"
                                >
                                    <Upload size={20} strokeWidth={1.5} />
                                </button>
                                <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1"></div>
                                <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors text-charcoal dark:text-stone-300">
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Hidden Import Input */}
                        <input
                            type="file"
                            id="import-input"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const success = importData(event.target?.result as string);
                                        if (success) {
                                            alert('הנתונים שוחזרו בהצלחה!');
                                            onClose(); // Optional: close and reopen to refresh or just stay
                                        } else {
                                            alert('שגיאה בטעינת הקובץ.');
                                        }
                                    };
                                    reader.readAsText(file);
                                }
                            }}
                        />

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {bakeHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                                    <Calendar size={48} strokeWidth={1} className="mb-4 opacity-50" />
                                    <p className="font-serif text-lg">אין עדיין היסטוריה</p>
                                    <p className="text-xs">האפיות שלך יופיעו כאן לאחר סיום.</p>
                                </div>
                            ) : (
                                bakeHistory.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-sm border border-sand/50 dark:border-stone-700 group"
                                    >
                                        <div
                                            onClick={() => setSelectedLogId(selectedLogId === log.id ? null : log.id)}
                                            className="p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/30 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-mono">
                                                    <Calendar size={12} />
                                                    {new Date(log.date).toLocaleDateString('he-IL')}
                                                </div>
                                                <div className="flex text-sage">
                                                    {[...Array(log.rating)].map((_, i) => (
                                                        <Star key={i} size={12} fill="currentColor" />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mb-2">
                                                {log.image && (
                                                    <img
                                                        src={log.image}
                                                        alt="Bake"
                                                        className="w-16 h-16 rounded-lg object-cover border border-sand dark:border-stone-700 shadow-sm"
                                                    />
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-serif text-xl dark:text-stone-200 text-charcoal">{log.flourWeight}g</span>
                                                    <span className="text-[10px] text-stone-400 uppercase tracking-widest">קמח</span>
                                                </div>
                                                <div className="w-px h-4 bg-stone-200 dark:bg-stone-700"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Droplet size={12} className="text-blue-400" fill="currentColor" />
                                                    <span className="font-mono text-sm dark:text-stone-300 text-charcoal">{log.hydration}%</span>
                                                </div>
                                            </div>

                                            {log.notes && (
                                                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 font-serif italic border-l-2 border-sand dark:border-stone-600 pl-3">
                                                    "{log.notes}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Expanded Actions */}
                                        <AnimatePresence>
                                            {selectedLogId === log.id && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="bg-stone-50 dark:bg-stone-900/50 border-t border-sand dark:border-stone-700 overflow-hidden"
                                                >
                                                    <div className="p-3 flex justify-end">
                                                        <button
                                                            onClick={() => deleteBake(log.id)}
                                                            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            מחק רשומה
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BakeJournal;
