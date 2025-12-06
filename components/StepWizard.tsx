import React from 'react';
import { useBaking } from '../context/BakingContext';
import StepView from './StepView';
import ProgressBar from './ProgressBar';
import { AnimatePresence } from 'framer-motion';

const StepWizard: React.FC = () => {
  const { steps, currentStepIndex } = useBaking();
  const currentStep = steps[currentStepIndex];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-cream">
      <ProgressBar totalSteps={steps.length} currentStep={currentStepIndex} />
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <StepView key={currentStep.id} step={currentStep} />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StepWizard;