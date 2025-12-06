import React, { useState } from 'react';
import { askBaker } from '../services/gemini';
import { Sparkles, Send } from 'lucide-react';

interface AssistantProps {
  stepName: string;
}

const Assistant: React.FC<AssistantProps> = ({ stepName }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    const answer = await askBaker(query, stepName);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="mt-2 bg-white rounded-lg p-1">
      <div className="flex items-center gap-2 mb-3 px-1 text-crust/80">
        <Sparkles size={14} strokeWidth={1.5} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Levain Assistant</span>
      </div>
      
      {response && (
        <div className="mb-4 text-sm font-sans font-light leading-relaxed text-stone-700 bg-paper p-3 rounded-lg border border-sand">
          {response}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`שאל שאלה על שלב זה...`}
          className="w-full bg-stone-50 border border-transparent focus:bg-white focus:border-stone-200 rounded-lg py-2.5 px-3 pr-10 text-sm placeholder:text-stone-400 focus:outline-none transition-all font-sans"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-crust disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-stone-200 border-t-crust rounded-full animate-spin"></div>
          ) : (
            <Send size={16} strokeWidth={1.5} />
          )}
        </button>
      </form>
    </div>
  );
};

export default Assistant;