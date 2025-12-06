export interface Ingredient {
  name: string;
  weight: number;
  percentage?: number;
}

export type StepStatus = 'pending' | 'active' | 'completed';

export interface Step {
  id: string;
  title: string; // Hebrew title
  description: string;
  durationMin: number; // Duration in minutes. 0 if manual.
  status: StepStatus;
  tips?: string[]; // Content for the "Info" button
  videoTimestamp?: number; // Optional placeholder for video link logic
  userNote?: string; // User's personal notes
  checkedTips?: number[]; // Indices of checked tips
  checkedIngredients?: number[]; // New: Indices of checked ingredients
  completedAt?: number; // New: Timestamp when step was completed
}

export interface BakingState {
  flourWeight: number;
  hydration: number;
  steps: Step[];
  activeStepId: string | null;
  timerEndTime: number | null; // Timestamp in ms
}

export interface BakingContextType extends BakingState {
  setFlourWeight: (weight: number) => void;
  setHydration: (percentage: number) => void;
  startStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  undoStep: (stepId: string) => void; // New
  updateStepDuration: (stepId: string, newDuration: number) => void;
  saveStepNote: (stepId: string, note: string) => void;
  toggleStepTip: (stepId: string, tipIndex: number) => void;
  toggleStepIngredient: (stepId: string, ingredientIndex: number) => void; // New
  resetApp: () => void;
  formatTime: (ms: number) => string;
}