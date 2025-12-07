import React, { useState } from 'react';
import { useBaking } from '../context/BakingContext';
import { askBaker } from '../services/gemini';
import { Sparkles, Send } from 'lucide-react';

interface AssistantProps {
  stepName: string;
}

const Assistant: React.FC<AssistantProps> = ({ stepName }) => {
  const { roomTemp, hydration, flourWeight, timerEndTime } = useBaking();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);

    // Construct rich context
    const context = `
      Current Step: ${stepName}
      Environment: Room Temp ${roomTemp}°C, Hydration ${hydration}%, Flour ${flourWeight}g.
      Timer: ${timerEndTime ? 'Running' : 'Stopped'}.
    `.trim();

    const answer = await askBaker(query, context);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="mt-4 bg-white dark:bg-stone-800 rounded-xl p-1 border border-stone-100 dark:border-stone-700 shadow-sm">
      <div className="flex items-center gap-2 mb-3 px-2 pt-2 text-stone-500 dark:text-stone-400">
        <Sparkles size={14} strokeWidth={1.5} className="text-sage" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Levain Assistant</span>
      </div>

      {response && (
        <div className="mb-3 text-sm font-sans font-light leading-relaxed text-charcoal dark:text-stone-200 bg-sand/30 dark:bg-stone-700/50 p-3 rounded-lg border border-sand dark:border-stone-700">
          {response}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`שאל שאלה על שלב זה...`}
          className="w-full bg-stone-50 dark:bg-stone-900 border border-transparent focus:bg-white dark:focus:bg-stone-800 focus:border-stone-200 dark:focus:border-stone-600 rounded-lg py-3 px-4 pr-10 text-sm placeholder:text-stone-400 text-charcoal dark:text-stone-200 focus:outline-none transition-all font-sans"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-sage dark:hover:text-sage disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-stone-200 border-t-sage rounded-full animate-spin"></div>
          ) : (
            <Send size={16} strokeWidth={1.5} />
          )}
        </button>
      </form>
    </div>
  );
};

export default Assistant;