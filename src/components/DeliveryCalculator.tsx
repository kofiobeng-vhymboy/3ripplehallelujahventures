import React, { useEffect, useRef, useState } from 'react';
import { Truck, MapPin, Calculator, Info, Clock3, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatGhs } from '../lib/currency';

const LOCATIONS = [
  { keywords: ['amrahia', 'accra central', 'accra', 'ridge', 'osu', 'adabraka', 'cantonments', 'labone'], label: 'Nearby zone', distanceKm: 5, baseDays: 1 },
  { keywords: ['east legon', 'airport', 'roman ridge', 'north ridge', 'achimota'], label: 'Greater Accra · Near', distanceKm: 12, baseDays: 1 },
  { keywords: ['madina', 'dansoman', 'spintex', 'teshie', 'lapaz', 'kasoa'], label: 'Greater Accra · Metro', distanceKm: 25, baseDays: 2 },
  { keywords: ['tema', 'ashaiman', 'prampram'], label: 'Tema corridor', distanceKm: 35, baseDays: 2 },
  { keywords: ['cape coast'], label: 'Cape Coast', distanceKm: 150, baseDays: 3 },
  { keywords: ['takoradi', 'sekondi'], label: 'Takoradi', distanceKm: 225, baseDays: 3 },
  { keywords: ['kumasi'], label: 'Kumasi', distanceKm: 250, baseDays: 3 },
  { keywords: ['tamale'], label: 'Tamale', distanceKm: 430, baseDays: 5 },
];

type DeliveryResult = { fee: number; date: string; zone: string; distanceKm: number };

export default function DeliveryCalculator() {
  const [method, setMethod] = useState<'standard' | 'express'>('standard');
  const [location, setLocation] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DeliveryResult | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const calculate = () => {
    const query = location.trim().toLowerCase();
    if (!query) { setError('Enter a town or area to calculate delivery.'); return; }
    setError(''); setIsCalculating(true); setResult(null);
    const match = LOCATIONS.find(entry => entry.keywords.some(keyword => query.includes(keyword)));
    const distanceKm = match?.distanceKm ?? 30;
    const distanceFee = distanceKm <= 5 ? 5 : distanceKm <= 15 ? 10 : distanceKm <= 40 ? 20 : distanceKm <= 180 ? 40 : 60;
    const fee = distanceFee + (method === 'express' ? 12 : 0);
    const days = (match?.baseDays ?? 2) + (method === 'express' ? 0 : 1);
    const deliveryDate = new Date(); deliveryDate.setDate(deliveryDate.getDate() + days);
    timerRef.current = window.setTimeout(() => {
      setResult({ fee, distanceKm, zone: match?.label ?? 'Estimated zone', date: deliveryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) });
      setIsCalculating(false);
    }, 450);
  };

  return (
    <section className="card-premium h-full overflow-hidden relative">
      <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[var(--color-brand-blue)]"><Truck size={21} /></div><div><p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[var(--color-brand-blue)] mb-1">Delivery estimate</p><h2 className="text-xl font-bold">Know your delivery cost</h2></div></div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ghana zones</span>
        </div>
        <div className="space-y-5">
          <div><div className="flex items-center justify-between mb-2"><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Delivery speed</label><span className="text-[10px] text-slate-400">Choose one</span></div><div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800">{(['standard', 'express'] as const).map(option => <button type="button" key={option} aria-pressed={method === option} onClick={() => setMethod(option)} className={`rounded-xl px-4 py-3 text-sm font-bold transition-all ${method === option ? 'bg-white dark:bg-slate-700 text-[var(--color-brand-blue)] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>{option === 'standard' ? 'Standard · 2–6 days' : 'Express · faster'}</button>)}</div></div>
          <div><label htmlFor="delivery-location" className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">Where should we deliver?</label><div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input id="delivery-location" type="text" value={location} onChange={event => { setLocation(event.target.value); setError(''); }} onKeyDown={event => { if (event.key === 'Enter') calculate(); }} placeholder="Type your town or area, e.g. Amrahia" className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100/70 dark:focus:ring-blue-900/20 focus:border-[var(--color-brand-blue)] transition-all" /></div>{error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}</div>
          <button type="button" onClick={calculate} disabled={!location.trim() || isCalculating} className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">{isCalculating ? <><Calculator size={18} className="animate-spin" /> Checking route...</> : <>Calculate my estimate <Calculator size={18} /></>}</button>
          <AnimatePresence mode="wait">{result && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-4"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-1"><CheckCircle2 size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Estimated delivery</span></div><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatGhs(result.fee)}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.zone} · approx. {result.distanceKm} km</p></div><div className="text-left sm:text-right"><Clock3 size={17} className="text-emerald-600 dark:text-emerald-400 mb-2" /><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{result.date}</p><p className="text-[10px] text-slate-400">Estimated arrival</p></div></div></motion.div>}</AnimatePresence>
        </div>
        <div className="mt-6 flex items-start gap-2.5 pt-5 border-t border-slate-100 dark:border-slate-800"><Info className="text-slate-400 shrink-0 mt-0.5" size={14} /><p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Rates are estimated by distance zone. Amrahia and nearby areas start at GHS 5; the final amount is confirmed with your order.</p></div>
      </div>
    </section>
  );
}
