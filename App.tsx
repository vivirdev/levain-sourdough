import React, { useEffect, useState } from 'react';
import { BakingProvider, useBaking } from './context/BakingContext';
import Calculator from './components/Calculator';
import StepWizard from './components/StepWizard';
import OverviewModal from './components/OverviewModal';
import BakeJournal from './components/BakeJournal';
import { ArrowRight, Menu, Moon, Sun, Book, WifiOff } from 'lucide-react';

const GlobalTimer: React.FC = () => {
    const { activeStepId, timerEndTime, formatTime, steps, currentStepIndex, goToStep } = useBaking();

    // Find the step object that is currently active (running timer)
    const activeStep = steps.find(s => s.id === activeStepId);

    // Check if we are currently viewing the step that has the timer
    const isViewingActiveStep = activeStep && steps[currentStepIndex].id === activeStep.id;

    // Time left calculation for display
    const [timeLeft, setTimeLeft] = React.useState(0);

    React.useEffect(() => {
        if (!timerEndTime) return;
        const interval = setInterval(() => {
            const left = Math.max(0, timerEndTime - Date.now());
            setTimeLeft(left);
        }, 1000);
        return () => clearInterval(interval);
    }, [timerEndTime]);

    if (!activeStepId || !timerEndTime || !activeStep || isViewingActiveStep || timeLeft <= 0) return null;

    const activeStepIdx = steps.findIndex(s => s.id === activeStepId);

    return (
        <button
            onClick={() => goToStep(activeStepIdx)}
            className="absolute left-1/2 -translate-x-1/2 top-24 bg-white/90 backdrop-blur-md border border-sage/20 text-charcoal pl-4 pr-5 py-2 rounded-full flex items-center gap-3 shadow-warm hover:shadow-float hover:scale-105 transition-all animate-slideUp z-30 group"
        >
            <div className="relative">
                <div className="w-2 h-2 rounded-full bg-sage animate-ping absolute top-0 left-0 opacity-75" />
                <div className="w-2 h-2 rounded-full bg-sage relative z-10" />
            </div>
            <span className="font-mono text-base font-bold tracking-tight text-sage">{formatTime(timeLeft)}</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 border-l border-stone-200 pl-3 ml-1 group-hover:text-charcoal transition-colors">חזור לשלב</span>
        </button>
    );
};

// Simple Component for the Header Timer Display
const HeaderTimerDisplay: React.FC<{ endTime: number }> = ({ endTime }) => {
    const { formatTime } = useBaking();
    const [timeLeft, setTimeLeft] = useState(Math.max(0, endTime - Date.now()));

    useEffect(() => {
        const i = setInterval(() => setTimeLeft(Math.max(0, endTime - Date.now())), 1000);
        return () => clearInterval(i);
    }, [endTime]);

    return <>{formatTime(timeLeft)}</>;
};

const BatterySaverOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { activeStepId, timerEndTime, formatTime, steps } = useBaking();
    const [timeLeft, setTimeLeft] = React.useState(0);
    const activeStep = steps.find(s => s.id === activeStepId);

    React.useEffect(() => {
        if (!timerEndTime) return;
        const tick = () => setTimeLeft(Math.max(0, timerEndTime - Date.now()));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [timerEndTime]);

    return (
        <div onClick={onClose} className="fixed inset-0 z-[100] bg-black text-stone-400 flex flex-col items-center justify-center cursor-pointer">
            <div className="text-center space-y-4 animate-pulse">
                <Moon size={32} className="mx-auto text-stone-600 mb-8" />
                <div className="font-mono text-6xl text-stone-200 font-light tracking-tighter">
                    {formatTime(timeLeft)}
                </div>
                {activeStep && (
                    <div className="font-serif text-xl tracking-widest uppercase opacity-50">
                        {activeStep.title}
                    </div>
                )}
                <div className="absolute bottom-12 left-0 right-0 text-center text-xs tracking-[0.3em] uppercase opacity-30">
                    לחץ בכל מקום ליציאה
                </div>
            </div>
        </div>
    );
};

const MainView: React.FC = () => {
    const { isWizardActive, exitWizard, activeStepId, isDarkMode, toggleTheme, steps, timerEndTime } = useBaking();
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isJournalOpen, setIsJournalOpen] = useState(false);

    // Find active step for header title
    const activeStep = steps.find(s => s.id === activeStepId);

    // Offline Detection
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Wake Lock API: Keep screen on while wizard is active
    useEffect(() => {
        let wakeLock: any = null;
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator && isWizardActive) {
                try {
                    wakeLock = await (navigator as any).wakeLock.request('screen');
                } catch (err) {
                    console.log('Wake Lock denied:', err);
                }
            }
        };

        requestWakeLock();

        return () => {
            if (wakeLock) console.log('Wake Lock released');
        };
    }, [isWizardActive]);

    return (
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-cream dark:bg-zinc-900 shadow-2xl overflow-hidden relative transition-colors duration-500 flex flex-col supports-[height:100svh]:h-[100svh]">

            {/* Global Header */}
            <header className="flex-none px-6 pt-safe-top pb-2 flex items-center justify-between z-50 bg-cream/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 border-b border-stone-100 dark:border-stone-800 transition-colors">
                {isWizardActive ? (
                    <button
                        onClick={exitWizard}
                        className="p-2 -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors"
                    >
                        <ArrowRight size={24} strokeWidth={1.5} />
                    </button>
                ) : (
                    <div className="w-10"></div> // Spacer
                )}

                {/* Dynamic Title / Offline Badge */}
                <div className="flex flex-col items-center">
                    {!isOnline ? (
                        <div className="flex items-center gap-2 text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full animate-pulse">
                            <WifiOff size={14} />
                            <span className="text-xs font-bold uppercase tracking-widest">Offline</span>
                        </div>
                    ) : activeStep ? (
                        <span className="font-serif text-lg text-charcoal dark:text-stone-200 animate-fadeIn tracking-wide">
                            {activeStep.title}
                        </span>
                    ) : (
                        <span className="font-serif text-lg text-charcoal dark:text-stone-200 tracking-wider">
                            LEVAIN
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsJournalOpen(true)}
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 transition-colors"
                    >
                        <Book size={20} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 -mr-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 transition-colors"
                    >
                        {isDarkMode ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
                    </button>
                </div>
            </header>

            {/* Global Timer (Floating below header) */}
            {timerEndTime && activeStepId && (
                <div className="flex-none px-4 py-2 animate-slideUp z-40 bg-cream dark:bg-zinc-900 transition-colors">
                    <div className="bg-charcoal dark:bg-stone-800 text-white dark:text-stone-200 rounded-xl p-3 shadow-lg shadow-charcoal/10 flex items-center justify-between border border-white/10 dark:border-stone-700">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="relative z-10 block w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                            </div>
                            <span className="font-mono text-sm tracking-widest uppercase text-stone-400">Timer Active</span>
                        </div>
                        <span className="font-mono text-xl font-bold tracking-wider">
                            <HeaderTimerDisplay endTime={timerEndTime} />
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-hidden relative">
                {isWizardActive ? <StepWizard /> : <Calculator />}
            </main>

            <OverviewModal isOpen={isOverviewOpen} onClose={() => setIsOverviewOpen(false)} />
            <BakeJournal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BakingProvider>
            <MainView />
        </BakingProvider>
    );
};

export default App;