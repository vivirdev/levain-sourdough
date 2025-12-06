import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BakingContextType, Step, BakingState } from '../types';
import { INITIAL_STEPS } from '../constants';

// Extended context for Wizard support
interface ExtendedBakingContextType extends BakingContextType {
  // New Wizard Methods
  currentStepIndex: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (index: number) => void;
  isWizardActive: boolean;
  startWizard: () => void;
  exitWizard: () => void;
}

const BakingContext = createContext<ExtendedBakingContextType | undefined>(undefined);

const STORAGE_KEY = 'levain_app_state_v6'; // Version bump

// Deep clone helper to ensure clean resets
const getInitialSteps = () => JSON.parse(JSON.stringify(INITIAL_STEPS));

export const BakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BakingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      flourWeight: 1000,
      hydration: 60,
      steps: getInitialSteps(),
      activeStepId: null,
      timerEndTime: null,
    };
  });

  // Local state for UI navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isWizardActive, setIsWizardActive] = useState(false);

  // Sync currentStepIndex with activeStepId on load
  useEffect(() => {
    if (state.activeStepId) {
      const idx = state.steps.findIndex(s => s.id === state.activeStepId);
      if (idx !== -1) {
        setCurrentStepIndex(idx);
        setIsWizardActive(true);
      }
    }
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setFlourWeight = (weight: number) => setState(prev => ({ ...prev, flourWeight: weight }));
  const setHydration = (percentage: number) => setState(prev => ({ ...prev, hydration: percentage }));

  const updateStepDuration = useCallback((stepId: string, newDuration: number) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => 
        s.id === stepId ? { ...s, durationMin: newDuration } : s
      );
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const saveStepNote = useCallback((stepId: string, note: string) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => 
        s.id === stepId ? { ...s, userNote: note } : s
      );
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const toggleStepTip = useCallback((stepId: string, tipIndex: number) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const currentChecked = s.checkedTips || [];
        const newChecked = currentChecked.includes(tipIndex)
          ? currentChecked.filter(i => i !== tipIndex)
          : [...currentChecked, tipIndex];
        return { ...s, checkedTips: newChecked };
      });
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const toggleStepIngredient = useCallback((stepId: string, ingredientIndex: number) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => {
        if (s.id !== stepId) return s;
        const currentChecked = s.checkedIngredients || [];
        const newChecked = currentChecked.includes(ingredientIndex)
          ? currentChecked.filter(i => i !== ingredientIndex)
          : [...currentChecked, ingredientIndex];
        return { ...s, checkedIngredients: newChecked };
      });
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const startStep = useCallback((stepId: string) => {
    setState(prev => {
      const step = prev.steps.find(s => s.id === stepId);
      if (!step) return prev;

      let endTime = null;
      if (step.durationMin > 0) {
        endTime = Date.now() + step.durationMin * 60 * 1000;
      }

      const updatedSteps = prev.steps.map(s => 
        s.id === stepId ? { ...s, status: 'active' as const } : s
      );

      return {
        ...prev,
        steps: updatedSteps,
        activeStepId: stepId,
        timerEndTime: endTime,
      };
    });
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => 
        s.id === stepId ? { ...s, status: 'completed' as const, completedAt: Date.now() } : s
      );
      
      return {
        ...prev,
        steps: updatedSteps,
        activeStepId: null,
        timerEndTime: null,
      };
    });
  }, []);

  const undoStep = useCallback((stepId: string) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(s => 
        s.id === stepId ? { ...s, status: 'pending' as const, completedAt: undefined } : s
      );
      
      return {
        ...prev,
        steps: updatedSteps,
        // We don't necessarily restart the timer, just revert status
      };
    });
  }, []);

  const resetApp = () => {
    if (confirm('האם לאפס את כל התהליך ולהתחיל מחדש?')) {
      // Clear storage
      localStorage.removeItem(STORAGE_KEY);
      
      // Reset State with Fresh Objects
      setState({
        flourWeight: 1000,
        hydration: 60,
        steps: getInitialSteps(),
        activeStepId: null,
        timerEndTime: null,
      });
      setCurrentStepIndex(0);
      setIsWizardActive(false);
    }
  };

  // Wizard Navigation
  const startWizard = () => setIsWizardActive(true);
  const exitWizard = () => setIsWizardActive(false);

  const goToStep = (index: number) => {
    if (index >= 0 && index < state.steps.length) {
      setCurrentStepIndex(index);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < state.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const p = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) return `${p(hours)}:${p(minutes)}:${p(seconds)}`;
    return `${p(minutes)}:${p(seconds)}`;
  };

  // Timer Logic & Browser Title Update
  useEffect(() => {
    if (!state.timerEndTime || !state.activeStepId) {
        document.title = "Levain - מחמצת";
        return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = state.timerEndTime ? state.timerEndTime - now : 0;

      // Update Document Title
      if (timeLeft > 0) {
        // Simplified M:S format for tab
        const m = Math.floor(timeLeft / 60000);
        const s = Math.floor((timeLeft % 60000) / 1000);
        document.title = `${m}:${s.toString().padStart(2, '0')} ⏳ Levain`;
      } else {
        document.title = "🔔 הסתיים! - Levain";
      }

      if (state.timerEndTime && now >= state.timerEndTime) {
        // Audio
        if (audioRef.current) audioRef.current.play().catch(e => console.log(e));
        
        // Notification
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification("Levain", { body: "השלב הסתיים!" });
        }
        
        // Haptic Feedback (Vibration)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 400]);
        }

        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timerEndTime, state.activeStepId]);

  return (
    <BakingContext.Provider value={{ 
      ...state, 
      setFlourWeight, 
      setHydration, 
      startStep, 
      completeStep, 
      undoStep,
      updateStepDuration,
      saveStepNote,
      toggleStepTip,
      toggleStepIngredient,
      resetApp, 
      formatTime,
      currentStepIndex,
      goToNextStep,
      goToPrevStep,
      goToStep,
      isWizardActive,
      startWizard,
      exitWizard
    }}>
      {children}
    </BakingContext.Provider>
  );
};

export const useBaking = () => {
  const context = useContext(BakingContext);
  if (!context) throw new Error("useBaking must be used within a BakingProvider");
  return context;
};