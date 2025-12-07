import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step } from '../types';
import { useBaking } from '../context/BakingContext';
import { ArrowLeft, Clock, CheckCircle2, Circle, AlertCircle, ChefHat, Info, PartyPopper, ChevronDown, RotateCcw, NotebookPen, Scale, Check, Minus, Plus, SquareCheck, Square, PenLine, ArrowRight, ChevronUp, Camera, X, Volume2 } from 'lucide-react';
import TimerRing from './TimerRing';
import Assistant from './Assistant';
import Confetti from './Confetti';
import { useHaptic } from '../hooks/useHaptic';
import useWakeLock from '../hooks/useWakeLock';
import { useSpeech } from '../hooks/useSpeech';

interface StepViewProps {
    step: Step;
}

const StepView: React.FC<StepViewProps> = ({ step }) => {
    const {
        startStep,
        completeStep,
        undoStep,
        updateStepDuration,
        activeStepId,
        timerEndTime,
        goToNextStep,
        goToPrevStep,
        currentStepIndex,
        steps,
        flourWeight,
        hydration,
        saveStepNote,
        toggleStepTip,
        toggleStepIngredient
    } = useBaking();

    const [showAssistant, setShowAssistant] = useState(false);
    const [isTipsOpen, setIsTipsOpen] = useState(true);
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<HTMLDivElement>(null);
    const triggerHaptic = useHaptic(); // Initialize Haptic Hook
    useWakeLock(); // Keep screen on while this component is mounted
    const { speak, stop, isSpeaking } = useSpeech();

    // Scroll to top on step change - Aggressive Fix
    useLayoutEffect(() => {
        const scrollToTop = () => {
            window.scrollTo(0, 0); // Window scroll
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0; // Direct DOM property
                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
            }
        };

        // Immediate
        scrollToTop();

        // Animation Frame
        requestAnimationFrame(scrollToTop);

        // Timeouts to catch subsequent render/layout updates
        const t1 = setTimeout(scrollToTop, 10);
        const t2 = setTimeout(scrollToTop, 50);
        const t3 = setTimeout(scrollToTop, 150);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [step.id]);

    // Swipe Logic
    const touchStartX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartX.current) return;
        const touchEndX = e.changedTouches[0].clientX;
        const distance = touchStartX.current - touchEndX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentStepIndex < steps.length - 1) {
            triggerHaptic(true); // Soft haptic on swipe
            goToNextStep();
        }
        if (isRightSwipe && currentStepIndex > 0) {
            triggerHaptic(true);
            goToPrevStep();
        }
        touchStartX.current = null;
    };

    const isActive = activeStepId === step.id;
    const isCompleted = step.status === 'completed';
    const isTimerRunning = isActive && timerEndTime && step.durationMin > 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    const nextStep = steps[currentStepIndex + 1];

    const handleStart = () => {
        triggerHaptic(); // Standard haptic on start
        startStep(step.id);
        // Auto-scroll to timer
        setTimeout(() => {
            timerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };
    const handleComplete = () => {
        triggerHaptic(); // Standard haptic on complete
        completeStep(step.id);
        if (!isLastStep) {
            goToNextStep();
        }
    };

    const handleUndo = () => {
        undoStep(step.id);
    };

    const handleDurationChange = (delta: number) => {
        triggerHaptic(true); // Soft haptic on adjust
        const newDuration = Math.max(1, step.durationMin + delta);
        updateStepDuration(step.id, newDuration);
    };

    // Recipe Calculations for Ingredients Card
    const recipeData = useMemo(() => {
        const format = (n: number) => Math.round(n);
        const wWater = Math.round(flourWeight * (hydration / 100));
        const wStarter = Math.round(flourWeight * 0.30);
        const wSalt = Math.round(flourWeight * 0.035);

        // Spelt/Rye logic for the tip
        const rye = Math.round(flourWeight * 0.1);
        const spelt = Math.round(flourWeight * 0.25);
        const white = flourWeight - rye - spelt;

        return {
            flour: format(flourWeight),
            water: format(wWater),
            starter: format(wStarter),
            salt: format(wSalt),
            mix: { rye: format(rye), spelt: format(spelt), white: format(white) },
            starterFeed: {
                total: wStarter + 15,
                unit: Math.ceil((wStarter + 15) / 3)
            }
        };
    }, [flourWeight, hydration]);

    // Determine if we should show an Ingredients Card
    const IngredientsCard = () => {
        let items: { label: string, amount: string, icon?: React.ReactNode }[] = [];
        let title = "הכנות לשלב זה";

        if (step.id === 'starter-feed') {
            title = "האכלת המחמצת";
            items = [
                { label: "מחמצת אם", amount: `${recipeData.starterFeed.unit} גר'` },
                { label: "קמח", amount: `${recipeData.starterFeed.unit} גר'` },
                { label: "מים", amount: `${recipeData.starterFeed.unit} גר'` },
            ];
        } else if (step.id === 'mix-flour-water') {
            title = "מערבבים בקערה";
            items = [
                { label: "קמח", amount: `${recipeData.flour} גר'` },
                { label: "מים", amount: `${recipeData.water} גר'` },
            ];
        } else if (step.id === 'add-starter') {
            title = "מוסיפים לקערה";
            items = [
                { label: "מחמצת פעילה", amount: `${recipeData.starter} גר'` },
            ];
        } else if (step.id === 'add-salt') {
            title = "מוסיפים לקערה";
            items = [
                { label: "מלח", amount: `${recipeData.salt} גר'` },
                { label: "מים (תוספת)", amount: "טיפה" },
            ];
        }

        if (items.length === 0) return null;

        return (
            <div className="mb-8 mx-4 bg-paper dark:bg-stone-800/80 rounded-xl border border-sand/60 dark:border-stone-700/50 p-5 shadow-sm relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Scale size={80} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-crust relative z-10">
                    <Scale size={16} strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3 relative z-10">
                    {items.map((item, idx) => {
                        const isChecked = step.checkedIngredients?.includes(idx);
                        return (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    triggerHaptic(true); // Soft haptic
                                    toggleStepIngredient(step.id, idx)
                                }}
                                className={`p-3 rounded-lg text-center border min-w-[90px] flex-1 transition-all duration-300
                                ${isChecked
                                        ? 'bg-stone-100/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-700 opacity-60'
                                        : 'bg-white/80 dark:bg-stone-700/80 border-sand/30 dark:border-stone-600 backdrop-blur-sm'
                                    }
                            `}
                            >
                                <span className={`block font-mono text-lg font-medium transition-all ${isChecked ? 'text-stone-400 dark:text-stone-600 line-through' : 'text-charcoal dark:text-stone-200'}`}>
                                    {item.amount}
                                </span>
                                <span className={`block text-[10px] mt-1 transition-all ${isChecked ? 'text-stone-300' : 'text-stone-400'}`}>
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
                {step.id === 'starter-feed' && (
                    <p className="text-[10px] text-stone-400 text-center mt-3 font-mono relative z-10">
                        (סה"כ יתקבלו {recipeData.starterFeed.unit * 3} גרם מחמצת)
                    </p>
                )}
            </div>
        );
    };

    // Celebration Component
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const { saveBakeToHistory } = useBaking();

    if (isLastStep && isCompleted) {
        return (
            <>
                <Confetti />
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn p-8 text-center bg-cream dark:bg-zinc-900">
                    <div className="w-24 h-24 bg-sage text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-sage/20 animate-bounce">
                        <PartyPopper size={40} />
                    </div>
                    <h2 className="font-serif text-4xl text-charcoal dark:text-stone-200 mb-4">ברכות!</h2>
                    <p className="font-sans text-lg text-stone-600 dark:text-stone-400 mb-6">
                        סיימת את תהליך האפייה. הלחם מוכן לצינון.
                    </p>

                    {/* Photo Capture Section */}
                    <div className="mb-6 w-full max-w-xs">
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={fileInputRef}
                            onChange={handlePhotoCapture}
                            className="hidden"
                        />
                        {capturedImage ? (
                            <div className="relative">
                                <img src={capturedImage} alt="Captured Bread" className="w-full h-40 object-cover rounded-xl border-2 border-sage shadow-lg" />
                                <button
                                    onClick={() => setCapturedImage(null)}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-4 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl text-stone-400 hover:border-sage hover:text-sage transition-colors flex flex-col items-center gap-2"
                            >
                                <Camera size={24} />
                                <span className="text-xs font-bold uppercase tracking-widest">צלם את הלחם</span>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button
                            onClick={() => {
                                saveBakeToHistory({
                                    rating: 5,
                                    flourWeight: flourWeight,
                                    hydration: hydration,
                                    notes: "נאפה בהצלחה!",
                                    durationTotalMin: 0,
                                    image: capturedImage || undefined
                                });
                                alert('נשמר ליומן!');
                            }}
                            className="bg-charcoal dark:bg-stone-700 text-white dark:text-stone-200 py-3 rounded-xl font-bold hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            <NotebookPen size={18} /> שמור ליומן
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-sm font-bold uppercase tracking-widest text-charcoal dark:text-stone-400 underline"
                        >
                            התחל מחדש
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(2px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // smooth cubic-bezier
            className="flex flex-col h-full max-w-md mx-auto w-full relative"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >

            {/* Scrollable Content */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-48 no-scrollbar">

                {/* Minimal Step Indicator */}
                <div className="mt-8 mb-6 flex justify-center">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-300">
                        שלב {currentStepIndex + 1} / {steps.length}
                    </span>
                </div>

                {/* Step Title & Description */}
                <div className="px-6 text-center mb-8">
                    <h2 className="font-serif text-4xl text-charcoal mb-4 leading-none tracking-tight">
                        {step.title}
                    </h2>
                    <p className="text-stone-500 font-sans font-light text-lg max-w-xs mx-auto leading-relaxed">
                        {step.description}
                    </p>
                    <button
                        onClick={() => {
                            if (isSpeaking) {
                                stop();
                            } else {
                                speak(step.description);
                            }
                        }}
                        className={`mt-3 p-2 rounded-full transition-all ${isSpeaking ? 'bg-sage text-white animate-pulse' : 'text-stone-300 hover:text-charcoal hover:bg-stone-100'}`}
                        title="הקרא הנחיה"
                    >
                        {isSpeaking ? <Volume2 size={18} /> : <Volume2 size={18} className="opacity-70" />}
                    </button>
                </div>

                {/* Central Visual & Time Controls */}
                <div ref={timerRef} className="my-6 flex flex-col items-center justify-center min-h-[160px]">
                    {isTimerRunning && timerEndTime ? (
                        <div className="scale-110">
                            <TimerRing endTime={timerEndTime} totalDurationMin={step.durationMin} />
                        </div>
                    ) : (
                        <div className="relative">
                            <div className={`
                    relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 z-10
                    ${isCompleted
                                    ? 'bg-sage text-white shadow-lg shadow-sage/20 scale-90'
                                    : 'bg-white dark:bg-stone-800 text-stone-200 dark:text-stone-600 shadow-soft border border-stone-100 dark:border-stone-700'
                                }
                `}>
                                {isCompleted ? (
                                    <Check size={40} strokeWidth={1} />
                                ) : (
                                    <span className="font-serif text-5xl italic font-light">{currentStepIndex + 1}</span>
                                )}
                            </div>

                            {/* Duration Controls (Only if not running/completed and has duration) */}
                            {!isActive && !isCompleted && step.durationMin > 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 flex justify-between items-center z-0">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDurationChange(-5)}
                                        className="w-8 h-8 rounded-full bg-sand text-charcoal flex items-center justify-center hover:bg-stone-300 transition-colors -ml-4"
                                    >
                                        <Minus size={14} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDurationChange(5)}
                                        className="w-8 h-8 rounded-full bg-sand text-charcoal flex items-center justify-center hover:bg-stone-300 transition-colors -mr-4"
                                    >
                                        <Plus size={14} />
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Duration Display under Circle */}
                    {!isTimerRunning && !isCompleted && step.durationMin > 0 && (
                        <div className="mt-4 flex flex-col items-center">
                            <span className="font-mono text-5xl text-charcoal tracking-tighter">{step.durationMin}</span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">דקות</span>
                        </div>
                    )}
                </div>

                {/* Dynamic Ingredients Card */}
                <IngredientsCard />

                {/* Checklist / Instructions */}
                <div className="px-4 space-y-4">
                    <div className={`transition-all duration-500 bg-white dark:bg-stone-800/60 rounded-2xl border overflow-hidden ${isTipsOpen ? 'border-stone-100 dark:border-stone-700 shadow-sm' : 'border-transparent bg-transparent'}`}>
                        <button
                            onClick={() => setIsTipsOpen(!isTipsOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <ChefHat size={16} className="text-stone-300" strokeWidth={1.5} />
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">רשימת משימות</span>
                            </div>
                            <div className={`p-1 rounded-full transition-transform duration-300 ${isTipsOpen ? 'rotate-180 text-charcoal' : 'text-stone-300'}`}>
                                <ChevronDown size={16} />
                            </div>
                        </button>

                        {isTipsOpen && (
                            <div className="px-2 pb-2 animate-fadeIn">
                                <div className="space-y-1">
                                    {step.tips?.map((tip, i) => {
                                        const isChecked = step.checkedTips?.includes(i);
                                        return (
                                            <motion.button
                                                key={i}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    triggerHaptic(true); // Soft haptic
                                                    toggleStepTip(step.id, i)
                                                }}
                                                className={`w-full text-right flex gap-4 p-3 rounded-lg transition-all group ${isChecked ? 'bg-stone-50 dark:bg-stone-900/50' : 'hover:bg-cream dark:hover:bg-stone-700/30'}`}
                                            >
                                                <div className={`mt-0.5 transition-colors ${isChecked ? 'text-sage' : 'text-stone-300 group-hover:text-stone-400'}`}>
                                                    {isChecked ? <SquareCheck size={20} strokeWidth={1.5} /> : <Square size={20} strokeWidth={1.5} />}
                                                </div>
                                                <p className={`text-base font-sans font-light leading-relaxed transition-all ${isChecked ? 'text-stone-400 line-through decoration-stone-200' : 'text-stone-700'}`}>
                                                    {tip}
                                                </p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Baker's Journal */}
                    <div className="bg-white dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setIsNoteOpen(!isNoteOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <NotebookPen size={16} className="text-stone-300" strokeWidth={1.5} />
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">יומן האופה</span>
                                {step.userNote && <div className="w-1.5 h-1.5 rounded-full bg-crust"></div>}
                            </div>
                            <PenLine size={14} className="text-stone-300" />
                        </button>

                        {(isNoteOpen || step.userNote) && (
                            <div className="px-4 pb-4 animate-fadeIn">
                                <textarea
                                    value={step.userNote || ''}
                                    onChange={(e) => saveStepNote(step.id, e.target.value)}
                                    placeholder="כתוב הערות אישיות כאן (טמפרטורה, תחושת הבצק...)"
                                    className="w-full h-24 bg-paper dark:bg-stone-900 border border-sand/50 dark:border-stone-700 rounded-lg p-3 text-sm font-serif leading-relaxed text-charcoal dark:text-stone-300 placeholder-stone-300 focus:outline-none focus:border-crust/30 resize-none shadow-inner"
                                    style={{ backgroundImage: 'linear-gradient(transparent 1.5em, rgba(0,0,0,0.03) 1.5em)', backgroundSize: '100% 1.6em', lineHeight: '1.6em' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* AI Assistant Toggle */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => setShowAssistant(!showAssistant)}
                            className="text-[10px] font-bold uppercase tracking-widest text-sage hover:text-charcoal transition-colors border-b border-sage/30 hover:border-charcoal pb-0.5"
                        >
                            {showAssistant ? 'סגור עוזר אישי' : 'יש לך שאלה? שאל את Levain'}
                        </button>
                        {showAssistant && (
                            <div className="mt-4 animate-slideUp text-right">
                                <Assistant stepName={step.title} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Step Teaser - Inline at bottom of scroll content */}
                {nextStep && !isLastStep && (
                    <div
                        onClick={goToNextStep}
                        className="mt-12 mx-12 pb-8 flex flex-col items-center justify-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                    >
                        <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 mb-4"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">השלב הבא</span>
                        <div className="flex items-center gap-2 text-charcoal dark:text-stone-300">
                            <span className="font-serif text-lg">{nextStep.title}</span>
                            <ArrowLeft size={14} className="mt-1 opacity-50" />
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Navigation Bar */}
            <div className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto">
                <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md p-2 rounded-2xl shadow-float border border-white/50 dark:border-stone-700/50 flex items-center gap-2">

                    {/* Prev Button */}
                    <button
                        onClick={goToPrevStep}
                        disabled={currentStepIndex === 0}
                        className="w-14 h-14 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-charcoal dark:hover:text-stone-200 disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-95"
                    >
                        <ArrowRight size={22} strokeWidth={1} />
                    </button>

                    {/* Action Button */}
                    <div className="flex-1">
                        {!isActive && !isCompleted && step.durationMin > 0 ? (
                            <button
                                onClick={handleStart}
                                className="w-full h-14 bg-charcoal text-white rounded-xl font-medium text-base tracking-wide shadow-lg shadow-charcoal/10 hover:bg-black hover:shadow-charcoal/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <Clock size={18} strokeWidth={1.5} />
                                <span>הפעל טיימר ({step.durationMin} דק')</span>
                            </button>
                        ) : isActive && isTimerRunning ? (
                            <button
                                onClick={handleComplete}
                                className="w-full h-14 bg-paper border border-sage/30 text-sage rounded-xl font-medium text-sm hover:bg-sage hover:text-white transition-all active:scale-[0.98] flex flex-col items-center justify-center leading-tight"
                            >
                                <span className="font-bold">סיום מוקדם</span>
                                <span className="text-[10px] opacity-80 font-normal">עבור לשלב הבא</span>
                            </button>
                        ) : (
                            <div className="flex gap-2 w-full h-14">
                                {/* UNDO BUTTON (Only visible if completed) */}
                                {isCompleted && (
                                    <button
                                        onClick={handleUndo}
                                        className="w-14 h-full rounded-xl flex items-center justify-center text-stone-400 bg-stone-50 hover:bg-stone-200 transition-colors"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}

                                <button
                                    onClick={handleComplete}
                                    className={`flex-1 rounded-xl font-medium text-base tracking-wide shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-0.5
                                ${isCompleted
                                            ? 'bg-sage text-white shadow-sage/20'
                                            : 'bg-charcoal text-white shadow-charcoal/20'
                                        }
                            `}
                                >
                                    {isCompleted ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span>הושלם</span> <Check size={18} strokeWidth={2} />
                                            </div>
                                            {step.completedAt && (
                                                <span className="text-[9px] opacity-70 font-mono tracking-wider">
                                                    {new Date(step.completedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span>סיימתי, לשלב הבא</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Next Button (Nav Only) */}
                    <button
                        onClick={goToNextStep}
                        disabled={isLastStep}
                        className="w-14 h-14 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-charcoal dark:hover:text-stone-200 disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-95"
                    >
                        <ArrowLeft size={22} strokeWidth={1} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StepView;