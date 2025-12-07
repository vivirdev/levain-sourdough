import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Step } from '../types';
import { INITIAL_STEPS } from '../constants';

// --- Types ---

export interface BakeLog {
  id: string;
  date: string; // ISO string
  rating: number; // 1-5
  flourWeight: number;
  hydration: number;
  notes: string;
  durationTotalMin: number;
  image?: string;
}

interface BakingContextType {
  // State
  view: 'calculator' | 'wizard';
  activeStepId: string | null;
  steps: Step[];
  flourWeight: number;
  hydration: number;
  roomTemp: number;
  setFlourWeight: (weight: number) => void;
  setHydration: (percentage: number) => void;
  setRoomTemp: (temp: number) => void;

  // Pro Controls
  starterRatio: number;
  saltRatio: number;
  loafCount: number;
  setStarterRatio: (ratio: number) => void;
  setSaltRatio: (ratio: number) => void;
  setLoafCount: (count: number) => void;

  // Timer
  timerEndTime: number | null;
  startTimer: (durationMin: number) => void;
  cancelTimer: () => void;

  // Actions
  startWizard: () => void;
  resetApp: () => void;
  startStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  undoStep: (stepId: string) => void;
  updateStepDuration: (stepId: string, newDuration: number) => void;
  saveStepNote: (stepId: string, note: string) => void;
  toggleStepTip: (stepId: string, tipIndex: number) => void;
  toggleStepIngredient: (stepId: string, ingredientIndex: number) => void;

  // Navigation (Wizard)
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (index: number) => void;
  currentStepIndex: number;
  isWizardActive: boolean;
  exitWizard: () => void;

  // Theme & Features
  isDarkMode: boolean;
  toggleTheme: () => void;
  requestNotificationPermission: () => void;

  // History
  bakeHistory: BakeLog[];
  saveBakeToHistory: (log: Omit<BakeLog, 'id' | 'date'>) => void;
  deleteBake: (id: string) => void;

  // Utils
  formatTime: (ms: number) => string;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
}

const BakingContext = createContext<BakingContextType | undefined>(undefined);

const STORAGE_KEY = 'levain_app_state_v7';
const HISTORY_STORAGE_KEY = 'levain_bake_history_v1';

// Deep clone helper
const getInitialSteps = () => JSON.parse(JSON.stringify(INITIAL_STEPS));

export const BakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // --- Core State ---
  const [view, setView] = useState<'calculator' | 'wizard'>('calculator');
  const [flourWeight, setFlourWeightState] = useState(1000);
  const [hydration, setHydrationState] = useState(60);
  const [roomTemp, setRoomTempState] = useState(24);
  const [starterRatio, setStarterRatioState] = useState(30);
  const [saltRatio, setSaltRatioState] = useState(3.5);
  const [loafCount, setLoafCountState] = useState(1);
  const [steps, setSteps] = useState<Step[]>(getInitialSteps());
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);

  // --- UI State ---
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isWizardActive, setIsWizardActive] = useState(false);

  // --- History State ---
  const [bakeHistory, setBakeHistory] = useState<BakeLog[]>([]);

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('levain_theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Audio Ref ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // --- Persistence: Load on Mount ---
  useEffect(() => {
    // App State
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.flourWeight) setFlourWeightState(parsed.flourWeight);
        if (parsed.hydration) setHydrationState(parsed.hydration);
        if (parsed.roomTemp) setRoomTempState(parsed.roomTemp);
        if (parsed.starterRatio) setStarterRatioState(parsed.starterRatio);
        if (parsed.saltRatio) setSaltRatioState(parsed.saltRatio);
        if (parsed.loafCount) setLoafCountState(parsed.loafCount);
        if (parsed.steps) setSteps(parsed.steps);
        if (parsed.activeStepId) setActiveStepId(parsed.activeStepId);
        if (parsed.timerEndTime) setTimerEndTime(parsed.timerEndTime);
      } catch (e) {
        console.error("Failed to load app state", e);
      }
    }

    // History
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        setBakeHistory(JSON.parse(savedHistory));
      } catch (e) { console.error("Failed load history", e); }
    }
  }, []);

  // --- Persistence: Save on Change ---
  useEffect(() => {
    const stateToSave = { flourWeight, hydration, roomTemp, steps, activeStepId, timerEndTime, starterRatio, saltRatio, loafCount };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [flourWeight, hydration, roomTemp, steps, activeStepId, timerEndTime, starterRatio, saltRatio, loafCount]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(bakeHistory));
  }, [bakeHistory]);

  // --- Temperature Logic ---
  // Recalculate duration for fermentation steps when roomTemp changes.
  // Base Temp: 24°C.
  // Rule: For every 1°C increase, reduce time by ~10% (factor 0.9).
  // Steps affected: Autolyse, Mix, Bulk Fermentation steps (folds), Pre-shape Rest (shaping).
  // Essentially everything before 'cold-proof'.
  // We use INITIAL_STEPS as the base truth for "BaseDuration" to avoid compounding errors.
  useEffect(() => {
    if (roomTemp === 24) return; // Optimization: If default, rely on initial or saved steps (unless we want to force reset, but let's assume 24 is baseline).

    // Actually, we should always recalculate if temp != 24 is desired, or if we want to support dynamic updates.
    // To avoid overwriting user manual edits, we might need a flag.
    // For this phase, we'll overwrite *standard* durations based on the formula from the BASE duration.

    const factor = Math.pow(0.9, roomTemp - 24);

    // List of steps to adjust (Ambient temperature steps)
    const ambientSteps = ['mix-flour-water', 'add-starter', 'add-salt', 'fold-1', 'fold-2', 'fold-3', 'fold-4', 'shaping'];

    setSteps(prevSteps => {
      return prevSteps.map(step => {
        if (ambientSteps.includes(step.id)) {
          // Find base duration from constant
          const baseStep = getInitialSteps().find((s: Step) => s.id === step.id);
          if (baseStep) {
            const newDuration = Math.round(baseStep.durationMin * factor);
            // Only update if it's different to avoid loops/noise, optionally check if user manually edited it? 
            // For now, simplicity: Temperature drives the schedule.
            return { ...step, durationMin: newDuration };
          }
        }
        return step;
      });
    });
  }, [roomTemp]);


  // --- Sync Steps Index ---
  useEffect(() => {
    if (activeStepId) {
      const idx = steps.findIndex(s => s.id === activeStepId);
      if (idx !== -1) {
        setCurrentStepIndex(idx);
        setIsWizardActive(true);
      }
    }
  }, [steps, activeStepId]);

  // --- Theme Logic ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('levain_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('levain_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);

  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // --- Actions ---
  const setFlourWeight = (w: number) => setFlourWeightState(w);
  const setHydration = (h: number) => setHydrationState(h);
  const setStarterRatio = (r: number) => setStarterRatioState(r);
  const setSaltRatio = (r: number) => setSaltRatioState(r);

  const setLoafCount = (newCount: number) => {
    if (newCount < 1) return;
    const oldTotalFlour = flourWeight; // Current total flour matches current loaf count
    // Logic: Keep weight-per-loaf approximately constant.
    // If we have 1 loaf of 1000g, and go to 2 loaves, we want 2000g.
    const weightPerLoaf = flourWeight / loafCount;
    const newTotalFlour = Math.round(weightPerLoaf * newCount);

    setLoafCountState(newCount);
    setFlourWeightState(newTotalFlour);
  };

  const startWizard = () => setIsWizardActive(true);
  const exitWizard = () => setIsWizardActive(false);

  const resetApp = () => {
    if (window.confirm('האם לאפס את כל התהליך ולהתחיל מחדש?')) {
      localStorage.removeItem(STORAGE_KEY);
      setFlourWeightState(1000);
      setHydrationState(60);
      setStarterRatioState(30);
      setSaltRatioState(3.5);
      setLoafCountState(1);
      setSteps(getInitialSteps());
      setActiveStepId(null);
      setTimerEndTime(null);
      setCurrentStepIndex(0);
      setIsWizardActive(false);
    }
  };

  const startStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      return { ...s, status: 'active' };
    }));

    setActiveStepId(stepId);

    const step = steps.find(s => s.id === stepId);
    if (step && step.durationMin > 0) {
      setTimerEndTime(Date.now() + step.durationMin * 60000);
    } else {
      setTimerEndTime(null);
    }
  }, [steps]);

  const completeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, status: 'completed', completedAt: Date.now() } : s
    ));
    setActiveStepId(null);
    setTimerEndTime(null);
  }, []);

  const undoStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, status: 'pending', completedAt: undefined } : s
    ));
  }, []);

  const updateStepDuration = useCallback((stepId: string, newDuration: number) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, durationMin: newDuration } : s));
  }, []);

  const saveStepNote = useCallback((stepId: string, note: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, userNote: note } : s));
  }, []);

  const toggleStepTip = useCallback((stepId: string, tipIndex: number) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const current = s.checkedTips || [];
      const updated = current.includes(tipIndex) ? current.filter(i => i !== tipIndex) : [...current, tipIndex];
      return { ...s, checkedTips: updated };
    }));
  }, []);

  const toggleStepIngredient = useCallback((stepId: string, idx: number) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const current = s.checkedIngredients || [];
      const updated = current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx];
      return { ...s, checkedIngredients: updated };
    }));
  }, []);

  // --- Navigation ---
  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) setCurrentStepIndex(index);
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
  };

  // --- Timer Tick ---
  useEffect(() => {
    if (!timerEndTime || !activeStepId) {
      document.title = "Levain - מחמצת";
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const left = timerEndTime - now;

      if (left > 0) {
        const m = Math.floor(left / 60000);
        const s = Math.floor((left % 60000) / 1000);
        document.title = `${m}:${s.toString().padStart(2, '0')} ⏳ Levain`;
      } else {
        document.title = "🔔 הסתיים! - Levain";
        if (audioRef.current) audioRef.current.play().catch(e => console.error(e));
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Levain", { body: "השלב הסתיים!" });
        }
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        clearInterval(interval);
        // Auto complete active step logic removed to keep user control, or we can just keep ringing.
        // For now, we just notify.
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEndTime, activeStepId]);

  // --- History Actions ---
  const saveBakeToHistory = (log: Omit<BakeLog, 'id' | 'date'>) => {
    const newLog: BakeLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...log
    };
    setBakeHistory(prev => [newLog, ...prev]);
  };

  const deleteBake = (id: string) => {
    setBakeHistory(prev => prev.filter(b => b.id !== id));
  };

  // --- Timer Helpers ---
  const startTimer = (min: number) => {
    // Not used directly much as startStep handles it, but good for custom timers
  };
  const cancelTimer = () => setTimerEndTime(null);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const p = (n: number) => n.toString().padStart(2, '0');
    return hours > 0 ? `${p(hours)}:${p(minutes)}:${p(seconds)}` : `${p(minutes)}:${p(seconds)}`;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(bakeHistory, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `levain_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        // Basic validation handling could be better but sufficient for now
        setBakeHistory(parsed);
        return true;
      }
    } catch (e) {
      console.error("Import failed", e);
    }
    return false;
  };

  const value: BakingContextType = {
    view,
    activeStepId,
    steps,
    flourWeight,
    hydration,
    roomTemp,
    setFlourWeight,
    setHydration,
    setRoomTemp: setRoomTempState,
    starterRatio,
    saltRatio,
    loafCount,
    setStarterRatio,
    setSaltRatio,
    setLoafCount,
    timerEndTime,
    startTimer,
    cancelTimer,
    startWizard,
    resetApp,
    startStep,
    completeStep,
    undoStep,
    updateStepDuration,
    saveStepNote,
    toggleStepTip,
    toggleStepIngredient,
    goToNextStep,
    goToPrevStep,
    goToStep,
    currentStepIndex,
    isWizardActive,
    exitWizard,
    isDarkMode,
    toggleTheme,
    requestNotificationPermission,
    bakeHistory,
    saveBakeToHistory,
    deleteBake,
    formatTime,
    exportData,
    importData
  };

  return (
    <BakingContext.Provider value={value}>
      {children}
    </BakingContext.Provider>
  );
};

export const useBaking = () => {
  const context = useContext(BakingContext);
  if (!context) throw new Error("useBaking must be used within a BakingProvider");
  return context;
};