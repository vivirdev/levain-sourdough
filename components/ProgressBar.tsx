import React from 'react';

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex gap-1 h-0.5 px-6 mt-4 w-full max-w-md mx-auto">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div 
          key={idx}
          className={`flex-1 rounded-full transition-all duration-500 ease-out
            ${idx <= currentStep ? 'bg-charcoal' : 'bg-stone-200'}
            ${idx === currentStep ? 'opacity-100' : idx < currentStep ? 'opacity-80' : 'opacity-30'}
          `}
        />
      ))}
    </div>
  );
};

export default ProgressBar;