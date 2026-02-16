
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, ClipboardCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { CostItem, CalculationResult } from '../types';

interface AiInsightsProps {
  items: CostItem[];
  results: CalculationResult;
  participants: number;
  destination: string;
  onGenerate?: (text: string) => void;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ items, results, participants, destination, onGenerate }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateInsight = async () => {
    if (!destination || items.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const profitMargin = results.totalPaxPerPerson > 0 
        ? ((results.profitPerPax / results.totalPaxPerPerson) * 100).toFixed(1) 
        : '0';

      const prompt = `
        Analisis budget travel berikut secara singkat:
        Destinasi: ${destination}
        Peserta: ${participants}
        Modal: Rp ${results.totalBasicPerPerson}
        Jual: Rp ${results.totalPaxPerPerson}
        Profit: ${profitMargin}%
        
        Berikan analisis dalam 3 poin singkat Bahasa Indonesia:
        1. Kelayakan harga.
        2. Saran efisiensi.
        3. Strategi marketing.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || 'Tidak ada analisis tersedia.';
      setInsight(text);
      if (onGenerate) onGenerate(text);
    } catch (error) {
      console.error(error);
      setInsight('Gagal mengambil analisis AI.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!insight) return;
    navigator.clipboard.writeText(insight);
    alert("Analisis disalin!");
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        <BrainCircuit size={80} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
          <Sparkles className="text-amber-500 fill-amber-500" size={18} />
          AI Budget Insights
        </h2>
        <div className="flex gap-2">
          {insight && (
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-90"
              title="Salin Analisis"
            >
              <ClipboardCheck size={18} />
            </button>
          )}
          <button 
            onClick={generateInsight}
            disabled={loading}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-50 transition-all active:scale-90"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </div>

      <div className="relative z-10">
        {!insight && !loading ? (
          <div className="text-center py-6 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Analisa keuangan cerdas</p>
            <button 
              onClick={generateInsight}
              className="text-xs font-black text-indigo-600 hover:text-indigo-700 underline underline-offset-4 uppercase"
            >
              Analisa Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/80 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap italic shadow-inner border border-slate-100">
            {loading ? (
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-full"></div>
              </div>
            ) : (
              insight
            )}
          </div>
        )}
      </div>
    </section>
  );
};
