
import React from 'react';
import { CalculationResult } from '../types';

interface SummarySectionProps {
  results: CalculationResult;
  paxPrice: number;
  setPaxPrice: (val: number) => void;
  personalProfitShare: number;
  setPersonalProfitShare: (val: number) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ results, paxPrice, setPaxPrice, personalProfitShare, setPersonalProfitShare }) => {
  const format = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-8">
      {/* Primary Result Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">HPP / PAX</p>
          <p className="text-2xl font-black">{format(results.totalBasicPerPerson)}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">TOTAL HPP (MODAL)</p>
          <p className="text-2xl font-black">{format(results.totalBasicTotal)}</p>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full"></div>

      {/* Pricing Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-indigo-200 uppercase tracking-widest block">HARGA JUAL / PAX</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">Rp</span>
            <input 
              type="number"
              value={paxPrice || ''}
              onChange={(e) => setPaxPrice(Number(e.target.value))}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 outline-none text-xl font-black transition-all"
              placeholder="0"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-indigo-200 uppercase tracking-widest block">BAGI HASIL PROFIT</label>
          <div className="relative">
            <input 
              type="number"
              value={personalProfitShare || ''}
              onChange={(e) => setPersonalProfitShare(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-white/30 outline-none text-xl font-black transition-all"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Profit Highlighting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="bg-emerald-500/20 border border-emerald-500/30 p-5 rounded-3xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">NET PROFIT TOTAL</p>
          <p className="text-2xl font-black text-emerald-300">{format(results.profitTotal)}</p>
          <p className="text-xs text-emerald-200 mt-1 opacity-80">{format(results.profitPerPax)} / PAX</p>
        </div>
        <div className="bg-amber-500/20 border border-amber-500/30 p-5 rounded-3xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider mb-1">SHARE ADMIN ({personalProfitShare}%)</p>
          <p className="text-2xl font-black text-amber-300">{format(results.personalProfit)}</p>
          <p className="text-xs text-amber-200 mt-1 opacity-80 italic">Approved Final Amount</p>
        </div>
      </div>
    </div>
  );
};
