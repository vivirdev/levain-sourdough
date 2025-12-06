import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Step } from '../types';
import { useBaking } from '../context/BakingContext';
import { Check, ChevronDown, ChevronUp, Clock, ArrowRight, ArrowLeft, Scale, ChefHat, Minus, Plus, PartyPopper, NotebookPen, PenLine, Square, SquareCheck, RotateCcw } from 'lucide-react';
import TimerRing from './TimerRing';
import Assistant from './Assistant';

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
            goToNextStep();
        }
        if (isRightSwipe && currentStepIndex > 0) {
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
        startStep(step.id);
        // Auto-scroll to timer
        setTimeout(() => {
            timerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };
    const handleComplete = () => {
        completeStep(step.id);
        if (!isLastStep) {
            goToNextStep();
        }
    };

    const handleUndo = () => {
        undoStep(step.id);
    };

    const handleDurationChange = (delta: number) => {
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
            <div className="mb-8 mx-4 bg-paper rounded-xl border border-sand/60 p-5 shadow-sm relative overflow-hidden">
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
                            <button
                                key={idx}
                                onClick={() => toggleStepIngredient(step.id, idx)}
                                className={`p-3 rounded-lg text-center border min-w-[90px] flex-1 transition-all duration-300
                                ${isChecked
                                        ? 'bg-stone-100/50 border-stone-200 opacity-60'
                                        : 'bg-white/80 border-sand/30 backdrop-blur-sm'
                                    }
                            `}
                            >
                                <span className={`block font-mono text-lg font-medium transition-all ${isChecked ? 'text-stone-400 line-through' : 'text-charcoal'}`}>
                                    {item.amount}
                                </span>
                                <span className={`block text-[10px] mt-1 transition-all ${isChecked ? 'text-stone-300' : 'text-stone-400'}`}>
                                    {item.label}
                                </span>
                            </button>
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
    if (isLastStep && isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fadeIn p-8 text-center bg-cream">
                <div className="w-24 h-24 bg-sage text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-sage/20 animate-bounce">
                    <PartyPopper size={40} />
                </div>
                <h2 className="font-serif text-4xl text-charcoal mb-4">ברכות!</h2>
                <p className="font-sans text-lg text-stone-600 mb-8">
                    סיימת את תהליך האפייה. הלחם מוכן לצינון.
                </p>
                <p className="font-serif italic text-stone-400 text-sm">
                    "הריח של לחם טרי הוא הריח של הבית."
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-12 text-sm font-bold uppercase tracking-widest text-charcoal underline"
                >
                    התחל מחדש
                </button>
            </div>
        );
    }

    return (
        <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // smooth cubic-bezier
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
                                    : 'bg-white text-stone-200 shadow-soft border border-stone-100'
                                }
                `}>
                                {isCompleted ? (
                                    <Check size={40} strokeWidth={1} />
                                ) : (
                                    <span className="font-serif text-5xl opacity-20 italic font-light">{currentStepIndex + 1}</span>
                                )}
                            </div>

                            {/* Duration Controls (Only if not running/completed and has duration) */}
                            {!isActive && !isCompleted && step.durationMin > 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 flex justify-between items-center z-0">
                                    <button
                                        onClick={() => handleDurationChange(-5)}
                                        className="w-8 h-8 rounded-full bg-sand text-charcoal flex items-center justify-center hover:bg-stone-300 transition-colors -ml-4"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDurationChange(5)}
                                        className="w-8 h-8 rounded-full bg-sand text-charcoal flex items-center justify-center hover:bg-stone-300 transition-colors -mr-4"
                                    >
                                        <Plus size={14} />
                                    </button>
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
                    <div className={`transition-all duration-500 bg-white rounded-2xl border overflow-hidden ${isTipsOpen ? 'border-stone-100 shadow-sm' : 'border-transparent bg-transparent'}`}>
                        <button
                            onClick={() => setIsTipsOpen(!isTipsOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
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
                                            <button
                                                key={i}
                                                onClick={() => toggleStepTip(step.id, i)}
                                                className={`w-full text-right flex gap-4 p-3 rounded-lg transition-all group ${isChecked ? 'bg-stone-50' : 'hover:bg-cream'}`}
                                            >
                                                <div className={`mt-0.5 transition-colors ${isChecked ? 'text-sage' : 'text-stone-300 group-hover:text-stone-400'}`}>
                                                    {isChecked ? <SquareCheck size={20} strokeWidth={1.5} /> : <Square size={20} strokeWidth={1.5} />}
                                                </div>
                                                <p className={`text-base font-sans font-light leading-relaxed transition-all ${isChecked ? 'text-stone-400 line-through decoration-stone-200' : 'text-stone-700'}`}>
                                                    {tip}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Baker's Journal */}
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setIsNoteOpen(!isNoteOpen)}
                            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
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
                                    className="w-full h-24 bg-paper border border-sand/50 rounded-lg p-3 text-sm font-serif leading-relaxed text-charcoal placeholder-stone-300 focus:outline-none focus:border-crust/30 resize-none shadow-inner"
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
                        <div className="w-px h-8 bg-stone-200 mb-4"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-1">השלב הבא</span>
                        <div className="flex items-center gap-2 text-charcoal">
                            <span className="font-serif text-lg">{nextStep.title}</span>
                            <ArrowLeft size={14} className="mt-1 opacity-50" />
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Navigation Bar */}
            <div className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto">
                <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-float border border-white/50 flex items-center gap-2">

                    {/* Prev Button */}
                    <button
                        onClick={goToPrevStep}
                        disabled={currentStepIndex === 0}
                        className="w-14 h-14 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-charcoal disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-95"
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
                        className="w-14 h-14 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-50 hover:text-charcoal disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-95"
                    >
                        <ArrowLeft size={22} strokeWidth={1} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StepView;