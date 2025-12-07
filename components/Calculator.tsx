import React, { useState } from 'react';
import { useBaking } from '../context/BakingContext';
import { ChefHat, Minus, Plus, Scale, Droplet, Calendar, Settings, Share2, CloudSun, FlaskConical, Layers, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SchedulePreview from './SchedulePreview';
import StepEditor from './StepEditor';
import { useHaptic } from '../hooks/useHaptic';
import { useWeather } from '../hooks/useWeather';

const Calculator: React.FC = () => {
    const { flourWeight, setFlourWeight, hydration, setHydration, roomTemp, setRoomTemp, steps, startStep, resetApp, startWizard, starterRatio, setStarterRatio, saltRatio, setSaltRatio, loafCount, setLoafCount } = useBaking();
    const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const triggerHaptic = useHaptic();
    const { getLocalTemp, isLoading: isLoadingWeather } = useWeather();

    // Calculations
    const waterWeight = Math.round(flourWeight * (hydration / 100));
    const starterWeight = Math.round(flourWeight * (starterRatio / 100)); // Dynamic starter
    const saltWeight = Math.round(flourWeight * (saltRatio / 100));   // Dynamic salt 

    const totalWeight = flourWeight + waterWeight + starterWeight + saltWeight;

    return (
        <div className="h-full flex flex-col px-6 pb-6 animate-fadeIn overflow-y-auto scrollbar-hide">
            {/* Header Section */}
            <div className="text-center mb-8 space-y-2 mt-8">
                <h1 className="font-serif text-5xl text-charcoal dark:text-stone-100 tracking-tight transition-colors">Levain</h1>
                <p className="text-stone-400 dark:text-stone-500 font-serif italic text-lg tracking-wide">Artisan Sourdough Companion</p>

                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        className="text-xs font-bold uppercase tracking-widest text-sage hover:text-charcoal dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Calendar size={12} />
                        תכנן לוח זמנים
                    </button>
                    <div className="w-px h-3 bg-stone-300 dark:bg-stone-700"></div>
                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Settings size={12} />
                        ערוך שלבים
                    </button>
                </div>
            </div>

            {/* Card Container */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl dark:shadow-none border border-stone-100 dark:border-stone-700 p-8 space-y-8 relative overflow-hidden transition-colors duration-500 mb-6">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <ChefHat size={120} />
                </div>

                {/* Flour Input Group */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="flex items-center gap-2 text-sm font-bold text-stone-400 uppercase tracking-wider">
                            <Scale size={16} /> קמח (גרם)
                        </label>
                        <span className="font-mono text-3xl text-charcoal dark:text-stone-100 font-medium">{flourWeight}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                triggerHaptic(true);
                                setFlourWeight(Math.max(100, flourWeight - 50));
                            }}
                            className="w-10 h-10 rounded-full bg-sand dark:bg-stone-700 text-charcoal dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                        >
                            <Minus size={16} />
                        </motion.button>
                        <input
                            type="range"
                            min="100"
                            max="2000"
                            step="50"
                            value={flourWeight}
                            onChange={(e) => setFlourWeight(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-sand dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-crust"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                triggerHaptic(true);
                                setFlourWeight(flourWeight + 50);
                            }}
                            className="w-10 h-10 rounded-full bg-sand dark:bg-stone-700 text-charcoal dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* Hydration Input Group */}
                <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                    {/* Hydration Input */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">הידרציה (מים)</label>
                            <span className="font-mono font-bold text-sage dark:text-stone-300">{hydration}%</span>
                        </div>
                        <div className="relative">
                            <input
                                type="range"
                                min="50"
                                max="90"
                                value={hydration}
                                onChange={(e) => setHydration(Number(e.target.value))}
                                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-sage relative z-10"
                            />
                            {/* Ticks */}
                            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-30 px-1">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-px h-1 bg-stone-600 dark:bg-stone-400"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-stone-400 font-mono">
                        {/* RTL Swap: First Child is Right. Slider Max (90) is Right. */}
                        <span>רני (90%)</span>
                        <span>יבש (50%)</span>
                    </div>
                </div>

                {/* Room Temp Input */}
                <div>
                    <div className="flex justify-between mb-2 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">טמפ' חדר</label>
                            <button
                                onClick={async () => {
                                    const temp = await getLocalTemp();
                                    if (temp) {
                                        setRoomTemp(Math.round(temp));
                                        triggerHaptic(true);
                                    }
                                }}
                                disabled={isLoadingWeather}
                                className="p-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-400 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-600 transition-colors disabled:opacity-50"
                                title="זיהוי אוטומטי (לפי מיקום)"
                            >
                                <CloudSun size={14} className={isLoadingWeather ? "animate-pulse" : ""} />
                            </button>
                        </div>
                        <span className="font-mono font-bold text-orange-400 dark:text-orange-300">{roomTemp}°C</span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="18"
                            max="35"
                            value={roomTemp}
                            onChange={(e) => setRoomTemp(Number(e.target.value))}
                            className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-400 relative z-10"
                        />
                        {/* Ticks */}
                        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-30 px-1">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="w-px h-1 bg-stone-600 dark:bg-stone-400"></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-stone-400 font-mono">
                    {/* RTL Swap: First Child is Right. Slider Max (35) is Right. */}
                    <span>חם (35°)</span>
                    <span>קר (18°)</span>
                </div>

                {/* Batch Scaling */}
                <div className="flex items-center justify-between py-4 border-t border-stone-100 dark:border-stone-700">
                    <label className="flex items-center gap-2 text-sm font-bold text-stone-400 uppercase tracking-wider">
                        <Layers size={16} /> כיכרות
                    </label>
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                triggerHaptic(true);
                                setLoafCount(Math.max(1, loafCount - 1));
                            }}
                            className="w-8 h-8 rounded-full bg-sand dark:bg-stone-700 text-charcoal dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                        >
                            <Minus size={14} />
                        </motion.button>
                        <span className="font-mono text-xl text-charcoal dark:text-stone-100 font-medium w-4 text-center">{loafCount}</span>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                triggerHaptic(true);
                                setLoafCount(Math.min(10, loafCount + 1));
                            }}
                            className="w-8 h-8 rounded-full bg-sand dark:bg-stone-700 text-charcoal dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                        >
                            <Plus size={14} />
                        </motion.button>
                    </div>
                </div>

                {/* Advanced Ratios (Collapsible) */}
                <div className="py-2 border-t border-stone-100 dark:border-stone-700">
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="w-full flex items-center justify-between py-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Settings size={14} /> הגדרות מתקדמות
                        </span>
                        <motion.div
                            animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={16} />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isAdvancedOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-6 pt-2 pb-4">
                                    {/* Starter Ratio */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">
                                                <FlaskConical size={12} /> מחמצת
                                            </label>
                                            <span className="font-mono font-bold text-sage dark:text-stone-300">{starterRatio}%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="10"
                                                max="50"
                                                value={starterRatio}
                                                onChange={(e) => setStarterRatio(Number(e.target.value))}
                                                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-sage relative z-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Salt Ratio */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs">
                                                <Scale size={12} /> מלח
                                            </label>
                                            <span className="font-mono font-bold text-sage dark:text-stone-300">{saltRatio}%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                step="0.1"
                                                value={saltRatio}
                                                onChange={(e) => setSaltRatio(Number(e.target.value))}
                                                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-sage relative z-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Recipe Output Grid */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white/60 dark:bg-stone-800/40 p-4 rounded-2xl text-center border border-stone-100 dark:border-stone-700/50 shadow-inner">
                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">מים</span>
                    <span className="font-mono text-xl text-charcoal dark:text-stone-200">{waterWeight} גר'</span>
                </div>
                <div className="bg-white/60 dark:bg-stone-800/40 p-4 rounded-2xl text-center border border-stone-100 dark:border-stone-700/50 shadow-inner">
                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">מחמצת</span>
                    <span className="font-mono text-xl text-charcoal dark:text-stone-200">{starterWeight} גר'</span>
                </div>
                <div className="bg-white/60 dark:bg-stone-800/40 p-4 rounded-2xl text-center border border-stone-100 dark:border-stone-700/50 shadow-inner col-span-2 flex items-center justify-between px-8 relative">
                    <div>
                        <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest">משקל סופי</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xl text-charcoal dark:text-stone-200 font-bold">{totalWeight} גר'</span>
                            {loafCount > 1 && (
                                <span className="text-xs text-stone-400 font-mono">
                                    (~{Math.round(totalWeight / loafCount)} / כיכר)
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Levain Recipe',
                                    text: `🍞 תוכנית אפייה (${loafCount} כיכרות):\nקמח: ${flourWeight} גר'\nהידרציה: ${hydration}%\nמלח: ${saltRatio}%\nמחמצת: ${starterRatio}%\n\nסה"כ משקל: ${totalWeight} גר'`,
                                }).catch(console.error);
                            } else {
                                alert('הדפדפן שלך לא תומך בשיתוף.');
                            }
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-sage transition-colors"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Start Button */}
            <div className="mt-auto pt-6 sticky bottom-0 z-20 pb-2 bg-gradient-to-t from-[#F9F7F2] via-[#F9F7F2] to-transparent dark:from-zinc-900 dark:via-zinc-900 -mx-6 px-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        triggerHaptic(true);
                        startWizard();
                    }}
                    className="w-full bg-charcoal dark:bg-sage text-white py-4 rounded-2xl font-serif text-xl shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="font-bold tracking-wide">התחל לאפות</span>
                    <ChefHat size={24} strokeWidth={1.5} />
                </motion.button>
            </div>

            {/* Modals */}
            <SchedulePreview isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
            <StepEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
        </div>
    );
};

export default Calculator;