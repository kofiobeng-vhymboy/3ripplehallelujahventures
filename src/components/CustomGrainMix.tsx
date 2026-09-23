import React from 'react';
import { ChefHat, Sparkles, ArrowRight, CornerRightDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function CustomGrainMix() {
  const baseIngredients = ["Brown Rice", "White Maize", "Ancient Grains", "Honey Oats"];
  const addOns = ["Dried Berries", "Walnuts", "Superseeds", "Date Syrup"];

  return (
    <div className="card-premium relative overflow-hidden h-full group">
      {/* Decorative background circle */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-brand-mint)] rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="text-[var(--color-brand-blue)]" size={24} />
          <h2 className="text-xl font-bold">Personal Grain Mix</h2>
        </div>

        <p className="text-sm text-slate-500 mb-6 font-medium">
          Create a blend that perfectly matches your dietary goals and taste preferences.
        </p>

        <div className="space-y-6">
          {/* Step 1: Base */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">Step 1: Choose Base</span>
              <span className="text-[10px] text-slate-400">Select one</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {baseIngredients.map((ing) => (
                <div key={ing} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 opacity-60">
                  {ing}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center -my-2 opacity-20">
             <CornerRightDown size={20} className="text-slate-400 dark:text-slate-600 rotate-45" />
          </div>

          {/* Step 2: Add-ons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-blue)]">Step 2: Nutrition Boost</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Pick up to 3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {addOns.map((ing) => (
                <div key={ing} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 opacity-60">
                  {ing}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder Overly */}
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center -mx-6 -my-6 transition-colors duration-300">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-[#334155] text-center max-w-[240px]">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-[var(--color-brand-blue)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Feature Launching Soon!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Our "Create Your Own" lab is currently in limited beta.
            </p>
            <button className="btn-primary !py-2 !text-xs w-full">
              Get Early Access <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
