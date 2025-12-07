import React, { useEffect, useState } from 'react';
import { BakingProvider, useBaking } from './context/BakingContext';
import Calculator from './components/Calculator';
import StepWizard from './components/StepWizard';
import OverviewModal from './components/OverviewModal';
import { ArrowRight, Menu, Moon, Sun } from 'lucide-react';

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
    const { isWizardActive, exitWizard, activeStepId } = useBaking();
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [isDimMode, setIsDimMode] = useState(false);

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
            if (wakeLock) wakeLock.release();
        };
    }, [isWizardActive]);

    return (
        <div className="min-h-screen bg-cream font-sans text-charcoal selection:bg-sage/20 selection:text-charcoal flex flex-col">
            {/* Dim Mode Overlay */}
            {isDimMode && <BatterySaverOverlay onClose={() => setIsDimMode(false)} />}

            {/* Header */}
            <header className={`z-40 px-6 py-0 transition-all relative ${isWizardActive ? 'bg-cream' : 'bg-transparent'}`}>
                <GlobalTimer />

                <div className="max-w-md mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 w-12">
                        {isWizardActive ? (
                            <button onClick={exitWizard} className="p-2 -ml-2 text-stone-400 hover:text-charcoal transition-colors rounded-full hover:bg-stone-100">
                                <ArrowRight size={20} strokeWidth={1.5} />
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>

                    <h1 className={`font-serif text-xl text-charcoal tracking-wide transition-opacity duration-500 ${isWizardActive ? 'opacity-100' : 'opacity-0'}`}>
                        Levain
                    </h1>

                    <div className="flex justify-end items-center gap-1">
                        {isWizardActive && activeStepId && (
                            <button
                                onClick={() => setIsDimMode(true)}
                                className="p-2 text-stone-400 hover:text-charcoal transition-colors rounded-full hover:bg-stone-100"
                                title="מצב חיסכון בסוללה"
                            >
                                <Moon size={20} strokeWidth={1.5} />
                            </button>
                        )}
                        {isWizardActive && (
                            <button
                                onClick={() => setIsOverviewOpen(true)}
                                className="p-2 -mr-2 text-stone-400 hover:text-charcoal transition-colors rounded-full hover:bg-stone-100"
                            >
                                <Menu size={20} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 max-w-md mx-auto w-full relative">
                {isWizardActive ? (
                    <StepWizard />
                ) : (
                    <Calculator />
                )}
            </main>

            {/* Overview Drawer */}
            <OverviewModal isOpen={isOverviewOpen} onClose={() => setIsOverviewOpen(false)} />
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