
import React, { useState } from 'react';
import { Sparkles, Megaphone, RefreshCw, ClipboardCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { CostItem, CalculationResult } from '../types';

interface AiBundlingProps {
  items: CostItem[];
  results: CalculationResult;
  participants: number;
  destination: string;
  onGenerate?: (text: string) => void;
}

export const AiBundling: React.FC<AiBundlingProps> = ({ items, results, participants, destination, onGenerate }) => {
  const [bundling, setBundling] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateBundling = async () => {
    if (!destination || results.totalPaxPerPerson <= 0) {
      alert("Pastikan destinasi dan harga jual sudah terisi!");
      return;
    }
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Deteksi Tipe Bus
      const hasBigBus = items.some(i => i.name.toLowerCase().includes('bigbus') || i.name.toLowerCase().includes('big bus'));
      
      const prompt = `
        Tugas: Buat daftar fasilitas bundling paket tour yang RINGKAS dan AKURAT.
        
        DATA INPUT:
        - Nama Trip Utama: ${destination}
        - Harga Jual: Rp ${results.totalPaxPerPerson.toLocaleString('id-ID')} / pax
        - Daftar Item Biaya (Borongan & Satuan):
        ${items.map(i => `- ${i.name}`).join('\n')}

        ATURAN KETAT:
        1. JANGAN PERNAH MENAMBAH destinasi atau tempat wisata yang TIDAK ADA dalam Daftar Item Biaya di atas. 
        2. Identifikasi mana yang merupakan "Destinasi" (Tempat Wisata) dan mana yang merupakan "Fasilitas" (Layanan/Barang) dari daftar item tersebut.
        3. Tambahkan Fasilitas WAJIB STANDAR berikut:
           - Transportasi Bus Pariwisata (${hasBigBus ? 'Bigbus' : 'Medium Bus'})
           - Full AC, LED TV, Karaoke & Full Music
           - P3K & Spanduk Kegiatan
           - Dokumentasi & Drone (Kondisional)
           - ${hasBigBus ? 'Dispenser Hot & Cold (On Board)' : ''}
        
        FORMAT OUTPUT (WAJIB SEPERTI INI):
        *PAKET TRIP [NAMA DESTINASI]*
        Bajet: Rp [Harga]/pax

        *Fasilitas:*
        1. [Item Layanan dari daftar, misal: Makan, Tips, dll]
        2. [Fasilitas Wajib Standar di atas]
        ...

        *Destinasi:*
        1. [HANYA ambil nama tempat/objek wisata yang tertulis di Daftar Item Biaya]
        2. ...

        Happy Vacation By Bluexplore (:
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || 'Gagal menghasilkan bundling.';
      setBundling(text);
      if (onGenerate) onGenerate(text);
    } catch (error) {
      console.error(error);
      setBundling('Gagal mengambil data bundling dari AI.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!bundling) return;
    navigator.clipboard.writeText(bundling);
    alert("Copy ke clipboard berhasil!");
  };

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        <Megaphone size={80} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
          <Sparkles className="text-emerald-500 fill-emerald-500" size={18} />
          Marketing Bundling AI
        </h2>
        <div className="flex gap-2">
          {bundling && (
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-90"
              title="Salin Teks"
            >
              <ClipboardCheck size={18} />
            </button>
          )}
          <button 
            onClick={generateBundling}
            disabled={loading}
            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-all active:scale-90"
            title="Generate Bundling"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </div>
      </div>

      <div className="relative z-10">
        {!bundling && !loading ? (
          <div className="text-center py-6 px-4 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Buat penawaran cepat konsumen</p>
            <button 
              onClick={generateBundling}
              className="text-xs font-black text-emerald-600 hover:text-emerald-700 underline underline-offset-4 uppercase"
            >
              Generate Bundling
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/50 rounded-2xl p-4 text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap shadow-inner border border-emerald-100">
            {loading ? (
              <div className="space-y-3">
                <div className="h-3 bg-emerald-100 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-emerald-100 rounded animate-pulse w-full"></div>
              </div>
            ) : (
              bundling
            )}
          </div>
        )}
      </div>
    </section>
  );
};
