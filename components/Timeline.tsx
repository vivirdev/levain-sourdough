import React from 'react';
import { useBaking } from '../context/BakingContext';
import StepCard from './StepCard';

const Timeline: React.FC = () => {
  const { steps } = useBaking();

  return (
    <div className="relative pb-20">
      <div className="space-y-2">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
      
      <div className="mt-12 text-center">
          <p className="font-serif italic text-stone-400 text-sm">
            "Sourdough is a practice of patience."
          </p>
      </div>
    </div>
  );
};

export default Timeline;
