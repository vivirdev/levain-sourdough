import React from 'react';

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-1 px-4 mt-8 w-full max-w-xs mx-auto mb-2">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-full flex-1 rounded-full transition-all duration-500 ease-out relative
            ${idx <= currentStep ? 'bg-charcoal shadow-[0_0_10px_rgba(45,42,38,0.2)]' : 'bg-stone-200'}
            ${idx === currentStep ? 'scale-y-[2.5] scale-x-105 opacity-100' : idx < currentStep ? 'opacity-60' : 'opacity-30'}
          `}
        >
          {/* Glow for active step */}
          {idx === currentStep && (
            <div className="absolute inset-0 bg-charcoal blur-[4px] opacity-40 rounded-full animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;