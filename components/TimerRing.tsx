import React, { useEffect, useState } from 'react';
import { useBaking } from '../context/BakingContext';

interface TimerRingProps {
  endTime: number;
  totalDurationMin: number;
}

const TimerRing: React.FC<TimerRingProps> = ({ endTime, totalDurationMin }) => {
  const { formatTime } = useBaking();
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalMs = totalDurationMin * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const elapsed = totalMs - remaining;

      setTimeLeft(remaining);
      setProgress((elapsed / totalMs) * 100);
    };

    tick(); // Initial call
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [endTime, totalDurationMin]);

  // SVG Config
  const size = 180;
  const strokeWidth = 1; // Ultra thin
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full absolute inset-0 overflow-visible">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          className="text-stone-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle with Glow */}
        <circle
          className="text-sage transition-all duration-1000 ease-linear"
          strokeWidth={strokeWidth * 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          filter="url(#glow)"
        />
      </svg>

      {/* Time Display */}
      <div className="flex flex-col items-center justify-center animate-fadeIn">
        <span className="text-4xl font-mono font-light text-charcoal tracking-tighter tabular-nums">
          {formatTime(timeLeft)}
        </span>
        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em] mt-2">
          נותרו
        </span>
      </div>
    </div>
  );
};

export default TimerRing;