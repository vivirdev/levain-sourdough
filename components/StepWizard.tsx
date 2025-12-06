import React from 'react';
import { useBaking } from '../context/BakingContext';
import StepView from './StepView';
import ProgressBar from './ProgressBar';

const StepWizard: React.FC = () => {
  const { steps, currentStepIndex } = useBaking();
  const currentStep = steps[currentStepIndex];

  return (
    <div className="h-full flex flex-col">
       <ProgressBar totalSteps={steps.length} currentStep={currentStepIndex} />
       <StepView step={currentStep} />
    </div>
  );
};

export default StepWizard;