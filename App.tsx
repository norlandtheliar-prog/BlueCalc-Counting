
/**
 * GOOGLE APPS SCRIPT (Copy-Paste ini ke Script Editor Spreadsheet Anda):
 * 
 * const SS = SpreadsheetApp.getActiveSpreadsheet();
 *
 * function getSheet(name) {
 *   let sheet = SS.getSheetByName(name);
 *   if (!sheet) {
 *     sheet = SS.insertSheet(name);
 *     sheet.getRange('A1').setValue('[]');
 *   }
 *   return sheet;
 * }
 *
 * function doGet(e) {
 *   if (!e || !e.parameter) {
 *     return ContentService.createTextOutput("Backend Aktif. Gunakan URL ini di BlueCalc.")
 *       .setMimeType(ContentService.MimeType.TEXT);
 *   }
 *   const action = e.parameter.action;
 *   if (action === 'read') {
 *     const history = JSON.parse(getSheet('History').getRange('A1').getValue() || '[]');
 *     const masterData = JSON.parse(getSheet('Master').getRange('A1').getValue() || '[]');
 *     const contacts = JSON.parse(getSheet('Contacts').getRange('A1').getValue() || '[]');
 *     return ContentService.createTextOutput(JSON.stringify({ history, masterData, contacts }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
 * }
 *
 * function doPost(e) {
 *   try {
 *     const data = JSON.parse(e.postData.contents);
 *     if (data.history) getSheet('History').getRange('A1').setValue(JSON.stringify(data.history));
 *     if (data.masterData) getSheet('Master').getRange('A1').setValue(JSON.stringify(data.masterData));
 *     if (data.contacts) getSheet('Contacts').getRange('A1').setValue(JSON.stringify(data.contacts));
 *     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 *   } catch (err) {
 *     return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
 *   }
 * }
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Plus,
  Trash2,
  Layers,
  UserCheck,
  Tag,
  Save,
  Image as ImageIcon,
  History,
  X,
  Coins,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Settings,
  ArrowLeft,
  Edit2,
  Check,
  SaveAll,
  Search,
  PlusCircle,
  MessageCircle,
  UserPlus,
  Zap,
  LayoutList,
  Target,
  FileText,
  ClipboardCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { CostItem, CalculationResult, CostType, SavedTrip, Contact } from './types';
import { AiInsights } from './components/AiInsights';
import { AiBundling } from './components/AiBundling';

interface MasterDataItem {
  id: string;
  name: string;
  value: number;
  type: CostType;
}

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyyOF8hkqWRE9OtpGrKLjGatXQMIyk4izmgYWqu5kFE8XSTpZa-2o8c02HeSrE6IIH8/exec';

export default function App() {
  const [view, setView] = useState<'calculator' | 'config'>('calculator');
  const [history, setHistory] = useState<SavedTrip[]>([]);
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline' | 'error'>('connected');
  const [syncing, setSyncing] = useState(false);

  // Form Visibility State
  const [showAddForm, setShowAddForm] = useState<{ [key in CostType]: boolean }>({
    BORONGAN: false,
    SATUAN: false
  });

  // WhatsApp State
  const [waName, setWaName] = useState<string>('');
  const [waNumber, setWaNumber] = useState<string>('');

  // AI & Content State
  const [bundlingText, setBundlingText] = useState<string>('');
  const [insightText, setInsightText] = useState<string>('');
  const [showRincianPreview, setShowRincianPreview] = useState<boolean>(false);

  // Quick Add State (Calculator View)
  const [quickAdd, setQuickAdd] = useState<{ [key in CostType]: { name: string, value: number | '' } }>({
    BORONGAN: { name: '', value: '' },
    SATUAN: { name: '', value: '' }
  });

  // Master Data Form (Config Page)
  const [newMaster, setNewMaster] = useState<{name: string, value: number, type: CostType}>({
    name: '', value: 0, type: 'BORONGAN'
  });
  const [editingMasterId, setEditingMasterId] = useState<string | null>(null);

  // Calculator State
  const [items, setItems] = useState<CostItem[]>([]);
  const [participants, setParticipants] = useState<number>(0);
  const [paxPrice, setPaxPrice] = useState<number>(0);
  const [personalProfitShare, setPersonalProfitShare] = useState<number>(50);
  const [destination, setDestination] = useState<string>('');
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [freeSeatsCount, setFreeSeatsCount] = useState<number>(0);
  
  const [resetKey, setResetKey] = useState(0); 
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const response = await fetch(`${GAS_URL}?action=read`, { method: 'GET', cache: 'no-cache' });
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData.history) setHistory(cloudData.history);
        if (cloudData.masterData) setMasterData(cloudData.masterData);
        if (cloudData.contacts) setContacts(cloudData.contacts);
        setCloudStatus('connected');
      } else { throw new Error(); }
    } catch {
      setCloudStatus('offline');
      const localHist = localStorage.getItem('tourcalc_v4_stable');
      const localMaster = localStorage.getItem('tourcalc_master_v4');
      const localContacts = localStorage.getItem('tourcalc_contacts_v4');
      if (localHist) setHistory(JSON.parse(localHist));
      if (localMaster) setMasterData(JSON.parse(localMaster));
      if (localContacts) setContacts(JSON.parse(localContacts));
    } finally { setInitialLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const syncToCloud = async (newHistory: SavedTrip[], newMaster: MasterDataItem[], newContacts: Contact[]) => {
    setSyncing(true);
    localStorage.setItem('tourcalc_v4_stable', JSON.stringify(newHistory));
    localStorage.setItem('tourcalc_master_v4', JSON.stringify(newMaster));
    localStorage.setItem('tourcalc_contacts_v4', JSON.stringify(newContacts));
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ history: newHistory, masterData: newMaster, contacts: newContacts })
      });
      setCloudStatus('connected');
    } catch { setCloudStatus('error'); } finally { setSyncing(false); }
  };

  const results = useMemo((): CalculationResult => {
    const safeParticipants = participants > 0 ? participants : 1;
    let totalBasicPerPerson = 0;
    let totalUnitCostPerPerson = 0;
    items.forEach(item => {
      const val = Number(item.value) || 0;
      if (item.type === 'BORONGAN') totalBasicPerPerson += val / safeParticipants;
      else { totalBasicPerPerson += val; totalUnitCostPerPerson += val; }
    });
    const profitPerPax = paxPrice - totalBasicPerPerson;
    const profitGross = profitPerPax * safeParticipants;
    const totalDiscount = (Number(discountFixed) || 0) + (totalUnitCostPerPerson * freeSeatsCount);
    const profitTotal = profitGross - totalDiscount;
    const personalProfit = (profitTotal * personalProfitShare) / 100;

    return {
      totalBasicPerPerson, totalBasicTotal: totalBasicPerPerson * safeParticipants,
      totalUnitCostPerPerson, totalPaxPerPerson: paxPrice, totalPaxTotal: paxPrice * safeParticipants,
      discountFixed, discountFreeSeatsValue: totalUnitCostPerPerson * freeSeatsCount,
      totalDiscount, profitPerPax, profitGross, profitTotal, personalProfit,
    };
  }, [items, participants, paxPrice, personalProfitShare, discountFixed, freeSeatsCount]);

  const formatIDR = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const generateRincianText = useCallback(() => {
    const boronganText = items.filter(i => i.type === 'BORONGAN').map(i => `• ${i.name}: ${formatIDR(i.value)}`).join('\n') || 'N/A';
    const satuanText = items.filter(i => i.type === 'SATUAN').map(i => `• ${i.name}: ${formatIDR(i.value)}`).join('\n') || 'N/A';
    return `*RINCIAN BIAYA TRIP*\n------------------------------\n*Destinasi:* ${destination || 'N/A'}\n*Peserta:* ${participants} PAX\n\n*A. Borongan:*\n${boronganText}\n\n*B. Satuan:*\n${satuanText}\n\n------------------------------\n*Ringkasan:*\n• HPP/PAX: ${formatIDR(results.totalBasicPerPerson)}\n• Jual/PAX: ${formatIDR(results.totalPaxPerPerson)}\n• Total Modal: ${formatIDR(results.totalBasicTotal)}\n• Total Sales: ${formatIDR(results.totalPaxTotal)}\n• Net Profit: ${formatIDR(results.profitTotal)}\n• Bagi Hasil: ${formatIDR(results.personalProfit)}`;
  }, [destination, participants, items, results]);

  const handleResetUI = () => {
    setItems([]); setParticipants(0); setPaxPrice(0); setPersonalProfitShare(50);
    setDestination(''); setDiscountFixed(0); setFreeSeatsCount(0);
    setBundlingText(''); setInsightText(''); setShowRincianPreview(false);
    setResetKey(prev => prev + 1);
  };

  const saveToHistory = async () => {
    if (!destination) { alert("Masukkan nama perjalanan!"); return; }
    setSaving(true);
    try {
      const timestamp = new Date().toLocaleString('id-ID');
      let updatedMaster = [...masterData];
      let masterChanged = false;

      items.forEach(item => {
        if (!item.name) return;
        const exists = updatedMaster.find(m => m.name.toLowerCase() === item.name.toLowerCase() && m.type === item.type);
        if (!exists) {
          updatedMaster.push({
            id: `master-${Date.now()}-${Math.random()}`,
            name: item.name,
            value: item.value,
            type: item.type
          });
          masterChanged = true;
        }
      });

      if (masterChanged) {
        setMasterData(updatedMaster);
      }

      const newEntry: SavedTrip = {
        id: `trip-${Date.now()}`, timestamp, destination, participants, paxPrice, items, discountFixed, freeSeatsCount, personalProfitShare, results
      };
      const newHistory = [newEntry, ...history].slice(0, 50);
      setHistory(newHistory);
      
      await syncToCloud(newHistory, updatedMaster, contacts);
      alert("Berhasil disimpan ke Riwayat & Master Data!");
    } catch (e) {
      alert("Gagal menyimpan ke cloud.");
    } finally { setSaving(false); }
  };

  const deleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Hapus data perjalanan ini?")) return;
    const updatedHistory = history.filter(t => t.id !== id);
    setHistory(updatedHistory);
    await syncToCloud(updatedHistory, masterData, contacts);
  };

  const loadTrip = (trip: SavedTrip) => {
    setDestination(trip.destination); setParticipants(trip.participants); 
    setPaxPrice(trip.paxPrice); setItems(trip.items); 
    setDiscountFixed(trip.discountFixed || 0); setFreeSeatsCount(trip.freeSeatsCount || 0);
    setPersonalProfitShare(trip.personalProfitShare || 50); setShowHistory(false);
  };

  const handleSaveMaster = async () => {
    if (!newMaster.name) return;
    let updated: MasterDataItem[];
    if (editingMasterId) {
      updated = masterData.map(m => m.id === editingMasterId ? { ...m, ...newMaster } : m);
      setEditingMasterId(null);
    } else {
      updated = [{ ...newMaster, id: `master-${Date.now()}` }, ...masterData];
    }
    setMasterData(updated);
    setNewMaster({ name: '', value: 0, type: 'BORONGAN' });
    await syncToCloud(history, updated, contacts);
  };

  const handleAddItemToList = (type: CostType) => {
    const { name, value } = quickAdd[type];
    if (!name || value === '') return;
    let finalValue = Number(value);
    const newItem: CostItem = { 
      id: `item-${Date.now()}-${Math.random()}`, 
      name, 
      value: finalValue, 
      type 
    };
    setItems(prev => [...prev, newItem]);
    setQuickAdd(prev => ({ ...prev, [type]: { name: '', value: '' } }));
    setShowAddForm(prev => ({ ...prev, [type]: false }));
  };

  const handleSaveContact = async () => {
    if (!waName || !waNumber) { alert("Nama dan Nomor harus diisi!"); return; }
    const exists = contacts.find(c => c.name.toLowerCase() === waName.toLowerCase());
    if (exists) {
      if (!window.confirm("Nama kontak sudah ada. Update nomornya?")) return;
      const updated = contacts.map(c => c.id === exists.id ? { ...c, phone: waNumber } : c);
      setContacts(updated);
      await syncToCloud(history, masterData, updated);
      alert("Nomor kontak diperbarui!");
    } else {
      const newContact: Contact = { id: `contact-${Date.now()}`, name: waName, phone: waNumber };
      const updated = [...contacts, newContact];
      setContacts(updated);
      await syncToCloud(history, masterData, updated);
      alert("Kontak baru disimpan ke Spreadsheet!");
    }
  };

  const startEditMaster = (item: MasterDataItem) => {
    setEditingMasterId(item.id);
    setNewMaster({ name: item.name, value: item.value, type: item.type });
    document.getElementById('master-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteMasterItem = async (id: string) => {
    if (!window.confirm("Hapus item master ini?")) return;
    const updated = masterData.filter(m => m.id !== id);
    setMasterData(updated);
    await syncToCloud(history, updated, contacts);
  };

  const downloadJPG = async () => {
    if (!reportRef.current) return;
    setSaving(true);
    await document.fonts.ready;
    try {
      const dataUrl = await htmlToImage.toJpeg(reportRef.current, { backgroundColor: '#ffffff', pixelRatio: 2, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `REPORT-${(destination || 'TOUR').toUpperCase()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Gagal ekspor gambar."); } finally { setSaving(false); }
  };

  const handleShareWa = (type: 'rincian' | 'insights' | 'bundling') => {
    if (!destination) { alert("Nama perjalanan kosong!"); return; }
    let cleanNumber = waNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.slice(1);
    if (!cleanNumber) { alert("Masukkan nomor WhatsApp!"); return; }

    let message = '';

    if (type === 'rincian') {
      message = generateRincianText();
    } else if (type === 'insights') {
      if (!insightText) { alert("Generate AI Insights dulu!"); return; }
      message = `*AI BUDGET INSIGHTS*\n------------------------------\n*Trip:* ${destination}\n\n${insightText}`;
    } else if (type === 'bundling') {
      if (!bundlingText) { alert("Generate Marketing Bundling dulu!"); return; }
      message = `${bundlingText}`;
    }

    const encoded = encodeURIComponent(message + '\n\n_Generated via BlueCalc Pro_');
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  const copyRincian = () => {
    const text = generateRincianText();
    navigator.clipboard.writeText(text);
    alert("Rincian disalin ke clipboard!");
  };

  const masterBorongan = masterData.filter(m => m.type === 'BORONGAN');
  const masterSatuan = masterData.filter(m => m.type === 'SATUAN');

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-12 font-sans" key={resetKey}>
      {/* HEADER */}
      <header className="bg-[#1e3a8a] border-b border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('calculator')} className="bg-orange-500 p-2 rounded-lg text-white shadow-lg active:scale-90 transition-transform">
              <Calculator size={20} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-white uppercase tracking-tight leading-none">BlueCalc Pro</h1>
              <p className="text-[8px] font-bold text-sky-300 uppercase mt-0.5 tracking-widest">{syncing ? 'Syncing...' : 'Connected'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {view === 'calculator' ? (
              <>
                <button onClick={handleResetUI} title="Reset" className="p-2.5 text-white/50 hover:text-white transition-all"><RotateCcw size={18} /></button>
                <button onClick={() => setShowHistory(true)} className="p-2.5 text-white/50 hover:text-white relative" title="History">
                  <History size={20} />
                  {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-[#1e3a8a]"></span>}
                </button>
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <div className="flex items-center gap-3">
                  <button onClick={saveToHistory} disabled={saving} title="Simpan ke Riwayat & Master" className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 border border-white/10 shadow-sm transition-all group relative">
                    <Save size={20} />
                    <span className="absolute -bottom-10 right-0 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-[9px] px-2 py-1 rounded text-white whitespace-nowrap">Simpan & Update Master</span>
                  </button>
                  <button onClick={downloadJPG} disabled={saving} title="Download JPG" className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md transition-all">
                    <ImageIcon size={20} />
                  </button>
                  <button onClick={() => setView('config')} title="Master Data" className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 shadow-md transition-all">
                    <Settings size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => setView('calculator')} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold text-xs uppercase hover:bg-white/20 transition-all border border-white/10">
                <ArrowLeft size={18} /> Kembali
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {view === 'calculator' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Perjalanan</label>
                    <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20" placeholder="Contoh: Tour Bali 3D2N" />
                  </div>
                  <div className="w-full md:w-32 space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block">JUMLAH PAX</label>
                    <input type="number" value={participants || ''} onChange={(e) => setParticipants(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-black text-center outline-none focus:ring-2 focus:ring-sky-500/20" placeholder="0" />
                  </div>
                </section>

                {['BORONGAN', 'SATUAN'].map(type => (
                  <div key={type} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-700 uppercase text-[9px] tracking-widest flex items-center gap-2">
                        {type === 'BORONGAN' ? <Layers size={14} className="text-sky-500"/> : <UserCheck size={14} className="text-orange-500"/>}
                        BIAYA {type}
                      </h3>
                      {!showAddForm[type as CostType] && (
                        <button 
                          onClick={() => setShowAddForm({ ...showAddForm, [type as CostType]: true })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-black text-[9px] uppercase shadow-sm active:scale-95 transition-all ${type === 'BORONGAN' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                          <Plus size={12} /> Tambah {type}
                        </button>
                      )}
                    </div>
                    
                    {showAddForm[type as CostType] && (
                      <div className={`p-4 bg-${type === 'BORONGAN' ? 'sky' : 'orange'}-50/30 border-b border-slate-100 animate-in slide-in-from-top-2 duration-200`}>
                        <div className="flex flex-row items-end gap-3">
                          <div className="flex-[3] min-w-0 space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Item (Combobox)</label>
                            <input 
                              list={`${type}-master-list`}
                              autoFocus
                              value={quickAdd[type as CostType].name}
                              onChange={(e) => {
                                const val = e.target.value;
                                const match = (type === 'BORONGAN' ? masterBorongan : masterSatuan).find(m => m.name.toLowerCase() === val.toLowerCase());
                                setQuickAdd({
                                  ...quickAdd, 
                                  [type]: {
                                    name: val, 
                                    value: match ? match.value : quickAdd[type as CostType].value
                                  }
                                });
                              }}
                              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500/20" 
                              placeholder="Ketik atau pilih..." 
                            />
                            <datalist id={`${type}-master-list`}>
                              {(type === 'BORONGAN' ? masterBorongan : masterSatuan).map(m => (
                                <option key={m.id} value={m.name} />
                              ))}
                            </datalist>
                          </div>
                          <div className="flex-[2] min-w-0 space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Harga (Rp)</label>
                            <input 
                              type="number"
                              value={quickAdd[type as CostType].value}
                              onChange={(e) => setQuickAdd({...quickAdd, [type]: {...quickAdd[type as CostType], value: e.target.value === '' ? '' : Number(e.target.value)}})}
                              className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-sky-500/20 text-right" 
                              placeholder="0" 
                            />
                          </div>
                          <div className="flex gap-2 pb-0.5">
                            <button 
                              onClick={() => handleAddItemToList(type as CostType)}
                              className={`p-2.5 rounded-xl text-white font-black shadow-sm active:scale-95 transition-all flex items-center justify-center ${type === 'BORONGAN' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => setShowAddForm({ ...showAddForm, [type as CostType]: false })}
                              className="p-2.5 bg-slate-200 text-slate-500 rounded-xl hover:bg-slate-300 active:scale-95 transition-all"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-slate-100">
                      {items.filter(i => i.type === type).map(item => (
                        <div key={item.id} className="flex flex-row items-center gap-4 px-5 py-3 hover:bg-slate-50 group transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={13}/></button>
                            <div className="flex-1 truncate">
                               <input 
                                  value={item.name} 
                                  placeholder="Nama item..." 
                                  onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} 
                                  className="w-full bg-transparent border-none text-xs font-semibold text-slate-700 focus:ring-0 outline-none" 
                                />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-transparent focus-within:border-sky-300 transition-all">
                            <span className="text-[9px] font-bold text-slate-400">Rp</span>
                            <input 
                              type="number" 
                              value={item.value || ''} 
                              onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, value: Number(e.target.value)} : i))} 
                              className="bg-transparent border-none p-0 text-xs font-black text-slate-800 w-24 text-right outline-none" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Tag size={11} className="text-orange-500" /> Potongan Fixed (Diskon)</label>
                    <input type="number" value={discountFixed || ''} onChange={(e) => setDiscountFixed(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500/10 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><UserCheck size={11} className="text-sky-500" /> Free Seats (FOC)</label>
                    <input type="number" value={freeSeatsCount || ''} onChange={(e) => setFreeSeatsCount(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-sky-500/10 outline-none" placeholder="0" />
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden sticky top-[80px]">
                  <div className="bg-[#1e3a8a] text-white p-8 grid grid-cols-2 gap-8 border-b border-white/10 shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.2em]">HPP / PAX</p>
                      <p className="text-2xl font-black">{formatIDR(results.totalBasicPerPerson)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-sky-300 uppercase tracking-[0.2em]">JUAL / PAX</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs font-bold text-orange-400">Rp</span>
                        <input type="number" value={paxPrice || ''} onChange={(e) => setPaxPrice(Number(e.target.value))} className="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-2xl font-black text-white focus:ring-2 focus:ring-white/30 outline-none w-36 text-right transition-all" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL MODAL</p>
                        <p className="text-sm font-bold text-slate-700">{formatIDR(results.totalBasicTotal)}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL SALES</p>
                        <p className="text-sm font-bold text-slate-700">{formatIDR(results.totalPaxTotal)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FIX DISKON</p>
                        <p className="text-sm font-bold text-orange-600">{formatIDR(discountFixed)}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FREE SEAT ({freeSeatsCount})</p>
                        <p className="text-sm font-bold text-orange-600">{formatIDR(results.discountFreeSeatsValue)}</p>
                      </div>
                    </div>
                    
                    <div className="h-px bg-slate-100 my-2"></div>
                    
                    <div className="bg-sky-50 rounded-2xl p-4 flex justify-between items-center border border-sky-100">
                      <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest">NET PROFIT AKHIR</p>
                      <p className="text-2xl font-black text-sky-900">{formatIDR(results.profitTotal)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-200">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BAGI HASIL ({personalProfitShare}%)</p>
                      <p className="text-xl font-black text-slate-800">{formatIDR(results.personalProfit)}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AiInsights items={items} results={results} participants={participants} destination={destination} onGenerate={setInsightText} />
              <AiBundling items={items} results={results} participants={participants} destination={destination} onGenerate={setBundlingText} />
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-emerald-500" size={20} />
                  <h2 className="text-sm font-black uppercase tracking-widest">Share Hub</h2>
                </div>
                {items.length > 0 && (
                   <button 
                    onClick={() => setShowRincianPreview(!showRincianPreview)}
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-1"
                   >
                     {showRincianPreview ? <><EyeOff size={14}/> Sembunyikan Preview</> : <><Eye size={14}/> Preview Rincian</>}
                   </button>
                )}
              </div>
              
              <div className="space-y-6">
                {showRincianPreview && (
                  <div className="bg-slate-900 rounded-2xl p-5 relative group animate-in slide-in-from-top-4 duration-300">
                    <button 
                      onClick={copyRincian}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                      title="Copy Rincian"
                    >
                      <ClipboardCheck size={16} />
                    </button>
                    <pre className="text-[10px] text-sky-100 font-mono whitespace-pre-wrap leading-relaxed">
                      {generateRincianText()}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Penerima</label>
                    <input 
                      list="wa-contact-list"
                      type="text" 
                      value={waName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setWaName(name);
                        const contact = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
                        if (contact) setWaNumber(contact.phone);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="Cari atau ketik nama..."
                    />
                    <datalist id="wa-contact-list">
                      {contacts.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" 
                        placeholder="0812..."
                      />
                      <button 
                        onClick={handleSaveContact}
                        title="Simpan ke Spreadsheet"
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
                      >
                        <UserPlus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleShareWa('rincian')}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-md transition-all active:scale-[0.98]"
                  >
                    <FileText size={14} /> Share Rincian
                  </button>
                  <button 
                    onClick={() => handleShareWa('insights')}
                    className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-md transition-all active:scale-[0.98]"
                  >
                    <Target size={14} /> Share Insights
                  </button>
                  <button 
                    onClick={() => handleShareWa('bundling')}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] shadow-md transition-all active:scale-[0.98]"
                  >
                    <LayoutList size={14} /> Share Bundling
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            <section id="master-form" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b pb-4">
                <Settings size={24} className="text-sky-500" />
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Manajemen Data Master</h2>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl border transition-all ${editingMasterId ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Biaya</label>
                  <input value={newMaster.name} onChange={e => setNewMaster({...newMaster, name: e.target.value})} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold outline-none" placeholder="Contoh: Tiket Masuk" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe</label>
                  <select value={newMaster.type} onChange={e => setNewMaster({...newMaster, type: e.target.value as CostType})} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold outline-none">
                    <option value="BORONGAN">BORONGAN</option>
                    <option value="SATUAN">SATUAN</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nilai (Rp)</label>
                  <div className="flex gap-2">
                    <input type="number" value={newMaster.value || ''} onChange={(e) => setNewMaster({...newMaster, value: Number(e.target.value)})} className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold outline-none" />
                    <button onClick={handleSaveMaster} className={`p-2.5 rounded-xl text-white transition-all shadow-sm active:scale-95 ${editingMasterId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-sky-500 hover:bg-sky-600'}`}>
                      {editingMasterId ? <SaveAll size={20}/> : <Plus size={20}/>}
                    </button>
                    {editingMasterId && (
                      <button onClick={() => { setEditingMasterId(null); setNewMaster({name: '', value: 0, type: 'BORONGAN'}); }} className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Biaya Borongan', data: masterBorongan, color: 'sky' },
                  { title: 'Biaya Satuan', data: masterSatuan, color: 'orange' }
                ].map(table => (
                  <div key={table.title} className="space-y-3">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] text-${table.color}-600 border-b-2 pb-2`}>{table.title}</h4>
                    <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-black text-slate-400 uppercase">
                          <tr>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3 text-right">Nilai</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {table.data.map(m => (
                            <tr key={m.id} className={`hover:bg-slate-50/80 transition-all ${editingMasterId === m.id ? 'bg-orange-50/50' : ''}`}>
                              <td className={`px-4 py-2 font-bold ${editingMasterId === m.id ? 'text-orange-600' : 'text-slate-700'}`}>{m.name}</td>
                              <td className="px-4 py-2 text-right font-black text-slate-800">{formatIDR(m.value)}</td>
                              <td className="px-4 py-2">
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => startEditMaster(m)} className="p-1.5 text-sky-500 bg-sky-50 rounded-lg hover:bg-sky-500 hover:text-white transition-all"><Edit2 size={14}/></button>
                                  <button onClick={() => deleteMasterItem(m.id)} className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : 'translate-x-full'} border-l border-slate-200 flex flex-col`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#1e3a8a] text-white">
          <h2 className="font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><History size={16}/> Saved Trips</h2>
          <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50">
          {history.map((trip) => (
            <div key={trip.id} className="relative group">
              <button onClick={() => loadTrip(trip)} className="w-full text-left p-4 bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all active:scale-[0.98]">
                <p className="text-[8px] font-bold text-slate-400 mb-1">{trip.timestamp}</p>
                <h4 className="font-black text-slate-800 truncate uppercase text-xs mb-1 group-hover:text-sky-600 pr-8 leading-tight">{trip.destination}</h4>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-widest">{trip.participants} PAX</span>
                  <span className="font-black text-sky-600">{formatIDR(trip.results.profitTotal)}</span>
                </div>
              </button>
              <button onClick={(e) => deleteTrip(trip.id, e)} className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Hapus"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed top-0 left-0 w-0 h-0 overflow-visible pointer-events-none z-[-50] opacity-0">
        <div ref={reportRef} className="w-[800px] p-12 bg-white flex flex-col min-h-[600px]">
          <div className="mb-10 flex justify-between items-end border-b-4 border-slate-900 pb-8">
             <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-none">{destination || 'TOUR CALCULATION'}</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-[#1e3a8a] text-white px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">SUMMARY REPORT</div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</p>
                </div>
             </div>
             <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-2xl shadow-xl">{participants} PAX</div>
          </div>
          
          <div className="rounded-[3rem] border-2 border-slate-200 shadow-2xl overflow-hidden mb-8">
              <div className="bg-[#1e3a8a] text-white px-12 py-10 grid grid-cols-2 gap-12">
                <div className="space-y-1">
                  <p className="text-[14px] font-bold text-sky-300 uppercase tracking-[0.2em]">HPP PER PAX</p>
                  <p className="text-4xl font-black tracking-tight">{formatIDR(results.totalBasicPerPerson)}</p>
                </div>
                <div className="space-y-1 text-right border-l border-white/10 pl-12">
                  <p className="text-[14px] font-bold text-sky-300 uppercase tracking-[0.2em]">HARGA JUAL / PAX</p>
                  <p className="text-4xl font-black tracking-tight">{formatIDR(results.totalPaxPerPerson)}</p>
                </div>
              </div>
              
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">TOTAL MODAL (HPP x PESERTA)</p>
                    <p className="text-2xl font-black text-slate-700">{formatIDR(results.totalBasicTotal)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">TOTAL SALES (JUAL x PESERTA)</p>
                    <p className="text-2xl font-black text-slate-700">{formatIDR(results.totalPaxTotal)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">FIX DISKON</p>
                    <p className="text-2xl font-black text-orange-600">{formatIDR(discountFixed)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">FREE SEAT {freeSeatsCount}</p>
                    <p className="text-2xl font-black text-orange-600">({formatIDR(results.discountFreeSeatsValue)})</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2"></div>

                <div className="flex justify-between items-center bg-slate-50 px-8 py-6 rounded-[1.5rem] border border-slate-100 shadow-inner">
                   <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">NET PROFIT TOTAL</p>
                   <p className="text-4xl font-black text-[#1e3a8a] tracking-tighter">{formatIDR(results.profitTotal)}</p>
                </div>
                <div className="flex justify-between items-center bg-orange-50 px-8 py-6 rounded-[1.5rem] border border-orange-100">
                   <p className="text-[12px] font-black text-orange-600 uppercase tracking-[0.2em]">BAGI HASIL ADMIN ({personalProfitShare}%)</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tighter">{formatIDR(results.personalProfit)}</p>
                </div>
              </div>
          </div>

          {/* Rincian Borongan & Satuan */}
          <div className="grid grid-cols-2 gap-10 mb-8">
             {['BORONGAN', 'SATUAN'].map((type, idx) => (
               <div key={type} className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                  <h3 className={`text-[12px] font-black uppercase tracking-[0.3em] mb-6 border-b pb-3 ${idx === 0 ? 'text-sky-600 border-sky-100' : 'text-orange-500 border-orange-100'}`}>RINCIAN {type}</h3>
                  <div className="space-y-4">
                     {items.filter(i => i.type === type).length > 0 ? (
                       items.filter(i => i.type === type).map(i => (
                         <div key={i.id} className="flex justify-between items-center">
                            <span className="text-[14px] font-bold text-slate-500 uppercase truncate pr-4">{i.name || 'ITEM'}</span>
                            <span className="text-[14px] font-black text-slate-800">{formatIDR(i.value)}</span>
                         </div>
                       ))
                     ) : (
                       <p className="text-[11px] text-slate-300 italic uppercase font-bold tracking-widest">Tidak ada item</p>
                     )}
                  </div>
               </div>
             ))}
          </div>
          
          <div className="mt-auto pt-12 border-t border-slate-100 flex justify-between items-center opacity-30">
             <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-slate-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">BLUECALC ENGINE V4.85 • VERIFIED CALCULATION</p>
             </div>
             <p className="text-[10px] font-bold italic">Generated via BlueCalc Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
