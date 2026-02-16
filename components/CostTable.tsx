
import React from 'react';
import { CostItem } from '../types';

interface CostTableProps {
  items: CostItem[];
  participants: number;
  onUpdate: (id: string, value: number) => void;
}

export const CostTable: React.FC<CostTableProps> = ({ items, participants, onUpdate }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Beban Biaya</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Borongan</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Harga Satuan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            // Fix: CostType is a type union, not an enum. Comparing directly with string literal 'BORONGAN'.
            const isBorongan = item.type === 'BORONGAN';
            const unitPrice = isBorongan 
              ? (participants > 0 ? item.value / participants : 0)
              : item.value;

            return (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                </td>
                <td className="px-6 py-4">
                  {isBorongan ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">Rp</span>
                      <input 
                        type="number"
                        value={item.value === 0 ? '' : item.value}
                        placeholder="0"
                        onChange={(e) => onUpdate(item.id, Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50/30 border border-transparent hover:border-indigo-200 focus:bg-white focus:border-indigo-400 rounded-lg outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-300 italic">@Satuan</span>
                  )}
                </td>
                <td className="px-6 py-4">
                   {!isBorongan ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rp</span>
                      <input 
                        type="number"
                        value={item.value === 0 ? '' : item.value}
                        placeholder="0"
                        onChange={(e) => onUpdate(item.id, Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50/30 border border-transparent hover:border-emerald-200 focus:bg-white focus:border-emerald-400 rounded-lg outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-600">
                      {formatCurrency(unitPrice)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
