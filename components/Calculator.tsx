import React, { useMemo } from 'react';
import { useBaking } from '../context/BakingContext';
import { Wheat, Droplets, Play, CalendarClock, ArrowDown } from 'lucide-react';

const Calculator: React.FC = () => {
  const { flourWeight, hydration, setFlourWeight, setHydration, resetApp, startWizard } = useBaking();

  const water = Math.round(flourWeight * (hydration / 100));
  const starter = Math.round(flourWeight * 0.30); // 30% ratio
  const salt = Math.round(flourWeight * 0.035);   // 3.5% ratio

  // Smart Schedule Calculation
  const schedule = useMemo(() => {
      const now = new Date();
      
      const addMinutes = (date: Date, min: number) => new Date(date.getTime() + min * 60000);
      const format = (date: Date) => date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

      // Approximate durations based on steps (cumulative)
      // 1. Mixing Phase (Autolyse 30 + Mix 30 + Salt 30) = 1.5h
      const endOfMixing = addMinutes(now, 30 + 30 + 30);
      
      // 2. Bulk Fermentation (4 folds x 30m + extra 30m rest) = 2.5h
      const endOfBulk = addMinutes(endOfMixing, (4 * 30) + 30);

      // 3. Shaping + Room Proof (2h)
      const endOfRoomProof = addMinutes(endOfBulk, 120);

      // 4. Cold Proof (Next Morning usually, min 6h)
      const readyToBake = addMinutes(endOfRoomProof, 60 * 8); // +8 hours

      return {
          mixing: format(endOfMixing),
          shaping: format(endOfBulk),
          fridge: format(endOfRoomProof),
          bake: format(readyToBake),
          isTomorrow: readyToBake.getDate() !== now.getDate()
      };
  }, []);

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center animate-fadeIn max-w-sm mx-auto px-4 pb-12">
        
        {/* Header Section */}
        <div className="text-center mb-10 space-y-2 mt-8">
            <h1 className="font-serif text-5xl text-charcoal tracking-tight">Levain</h1>
            <p className="text-stone-400 font-serif italic text-lg tracking-wide">Artisan Sourdough Companion</p>
        </div>

        {/* Card Container */}
        <div className="w-full bg-white relative rounded-3xl p-8 shadow-warm border border-stone-100 mb-8">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none rounded-3xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            <div className="relative z-10">
                {/* Flour Input - Hero */}
                <div className="mb-10 text-center">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">
                        משקל הקמח (גרם)
                    </label>
                    <div className="relative inline-block">
                        <input
                            type="number"
                            value={flourWeight}
                            onChange={(e) => setFlourWeight(Number(e.target.value))}
                            className="w-48 bg-transparent border-b border-sand focus:border-crust focus:outline-none pb-2 font-serif text-6xl text-charcoal text-center transition-colors placeholder-stone-200"
                        />
                        <Wheat size={20} strokeWidth={1} className="absolute -right-8 top-1/2 -translate-y-1/2 text-stone-300" />
                    </div>
                </div>

                {/* Hydration Slider */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4 px-2">
                         <label className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                            הידרציה
                        </label>
                        <span className="font-mono text-lg text-crust">{hydration}%</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <input
                            type="range"
                            min="50"
                            max="90"
                            step="1"
                            value={hydration}
                            onChange={(e) => setHydration(Number(e.target.value))}
                            className="relative z-10 w-full h-1.5 bg-sand rounded-full appearance-none cursor-pointer accent-crust focus:outline-none"
                        />
                         {/* Tick marks decorative */}
                         <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none">
                            <div className="w-px h-1 bg-stone-300 mt-3"></div>
                            <div className="w-px h-1 bg-stone-300 mt-3"></div>
                            <div className="w-px h-1 bg-stone-300 mt-3"></div>
                         </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 mt-2 font-sans px-1">
                        <span>יבש (מתחילים)</span>
                        <span>רטוב (מתקדמים)</span>
                    </div>
                </div>

                {/* Recipe Output - Grid */}
                <div className="grid grid-cols-3 gap-px bg-sand/30 rounded-xl overflow-hidden border border-sand/30">
                    <div className="bg-white/50 p-4 text-center hover:bg-white transition-colors">
                        <span className="block font-mono text-xl text-charcoal mb-1">{water}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">מים</span>
                    </div>
                    <div className="bg-white/50 p-4 text-center hover:bg-white transition-colors">
                        <span className="block font-mono text-xl text-charcoal mb-1">{starter}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">מחמצת</span>
                    </div>
                    <div className="bg-white/50 p-4 text-center hover:bg-white transition-colors">
                        <span className="block font-mono text-xl text-charcoal mb-1">{salt}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">מלח</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Schedule Preview */}
        <div className="w-full mb-10 px-4">
             <div className="flex items-center gap-2 mb-4 justify-center text-stone-400">
                <CalendarClock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">אם מתחילים עכשיו...</span>
             </div>
             <div className="flex justify-between text-center relative">
                 {/* Connecting Line */}
                 <div className="absolute top-3 left-0 right-0 h-px bg-stone-200 -z-10"></div>

                 <div className="bg-cream px-2">
                     <div className="w-2 h-2 bg-stone-300 rounded-full mx-auto mb-2 ring-4 ring-cream"></div>
                     <span className="block font-mono text-sm text-charcoal">{schedule.mixing}</span>
                     <span className="text-[10px] text-stone-400">סיום לישה</span>
                 </div>
                  <div className="bg-cream px-2">
                     <div className="w-2 h-2 bg-stone-300 rounded-full mx-auto mb-2 ring-4 ring-cream"></div>
                     <span className="block font-mono text-sm text-charcoal">{schedule.shaping}</span>
                     <span className="text-[10px] text-stone-400">עיצוב</span>
                 </div>
                  <div className="bg-cream px-2">
                     <div className="w-2 h-2 bg-crust rounded-full mx-auto mb-2 ring-4 ring-cream"></div>
                     <span className="block font-mono text-sm text-crust font-bold">{schedule.bake}</span>
                     <span className="text-[10px] text-crust">אפייה {schedule.isTomorrow && '(מחר)'}</span>
                 </div>
             </div>
        </div>

        {/* Start Action */}
        <div>
            <button 
                onClick={startWizard}
                className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-charcoal text-paper rounded-full shadow-lg shadow-stone-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
                <span className="relative z-10 font-sans font-medium text-xl tracking-wide pl-1">התחל לאפות</span>
                <span className="relative z-10 bg-white/10 rounded-full p-1.5 group-hover:bg-white/20 transition-colors">
                    <Play size={18} strokeWidth={2} className="fill-current" />
                </span>
            </button>
            <button 
                onClick={resetApp} 
                className="block mx-auto mt-6 text-xs text-stone-300 hover:text-stone-500 transition-colors border-b border-transparent hover:border-stone-300 pb-0.5"
            >
                אפס הגדרות
            </button>
        </div>
    </div>
  );
};

export default Calculator;