"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AngleLeftIcon, AngleRightIcon } from "@/icons";

interface PreprocessedData {
  id: number;
  topic_raw: string; 
  title: string;
  description: string;
  clean_text: string;
  word_count: number;
}

interface ProcessingStatus {
  status?: string;
  message?: string;
  is_processing?: boolean;
  error?: string | null;
  result?: {
    status?: string;
    message?: string;
  } | null;
}

export default function DataProcessingPage() {
  const [data, setData] = useState<PreprocessedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/processed-results");
      const json = await res.json();
      if (json.status === "success") setData(json.data || []);
    } catch {
      console.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  const pollProcessingStatus = useCallback(async () => {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await fetch("http://localhost:8000/processing-status", { cache: "no-store" });
      const json = await res.json();
      const status: ProcessingStatus = json.data || {};
      setStatusMessage(status.message || "Pemrosesan NLP sedang berjalan...");

      if (!status.is_processing && status.status !== "running") {
        setIsProcessing(false);
        localStorage.removeItem("isProcessing_AgriTube");
        await fetchData();

        if (status.status === "error") {
          alert(status.error || status.message || "Pemrosesan NLP gagal.");
        } else {
          alert(status.message || status.result?.message || "Pemrosesan NLP selesai.");
        }
        return;
      }
    }

    setIsProcessing(false);
    localStorage.removeItem("isProcessing_AgriTube");
    alert("Status pemrosesan NLP timeout. Klik Refresh untuk memeriksa data terbaru.");
  }, [fetchData]);

  useEffect(() => {
    setMounted(true);
    fetchData();
    
    const savedStatus = localStorage.getItem("isProcessing_AgriTube");
    if (savedStatus === "true") {
      setIsProcessing(true);
      setStatusMessage("Memeriksa status pemrosesan NLP...");
      pollProcessingStatus();
    }
  }, [fetchData, pollProcessingStatus]);

  const handleStart = async () => {
    setIsProcessing(true);
    setStatusMessage("Pemrosesan NLP dimulai...");
    localStorage.setItem("isProcessing_AgriTube", "true");
    
    try {
      const res = await fetch("http://localhost:8000/start-processing", { 
        method: "POST" 
      });
      const result = await res.json();
      setStatusMessage(result.message || "Pemrosesan NLP sedang berjalan...");
      await pollProcessingStatus();
    } catch {
      alert("Koneksi backend gagal / Timeout (Proses mungkin masih jalan di terminal)");
      setIsProcessing(false);
      localStorage.removeItem("isProcessing_AgriTube");
    } finally {
      fetchData();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const getTopicStyle = () => {
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-8 bg-transparent min-h-screen relative font-sans transition-all duration-500 text-left text-gray-800 dark:text-gray-100">
      
      {/* HEADER SECTION - Glassmorphism style */}
      <header className="relative overflow-hidden bg-[#15803d] dark:bg-green-600/20 border border-transparent dark:border-green-500/30 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl transition-colors">
        <div className="relative z-10 space-y-3 text-left">
          <h1 className="text-2xl font-black uppercase tracking-tight">Data <span className="opacity-60 dark:text-green-400">Processing</span></h1>
          <p className="text-sm text-white/80 dark:text-gray-400 font-medium max-w-md text-left leading-relaxed">
            Sistem manajemen pembersihan teks NLP untuk dataset YouTube Agriculture.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-right px-8 border-r border-white/20 dark:border-green-500/30">
             <p className="text-[10px] font-black text-white/60 dark:text-gray-500 uppercase tracking-widest mb-1 text-right">Data Cleaned</p>
             <p className="text-3xl font-black text-white dark:text-green-400 leading-none text-right">{data.length}</p>
          </div>
          <button 
            onClick={fetchData} 
            className="px-6 py-3 bg-white dark:bg-green-600 text-[#15803d] dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-green-500 transition-all shadow-xl active:scale-95"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* EXECUTION CONTROL - Premium Card */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 dark:border-white/[0.08] shadow-sm transition-colors text-left">
        <div className="mb-10 text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Execution <span className="text-[#15803d] dark:text-green-400 text-left">Control</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">jalankan proses pembersihan teks nlp</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50 dark:bg-white/[0.02] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] transition-all">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white dark:bg-white/[0.05] rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
              <div className={`w-4 h-4 rounded-full ${isProcessing ? 'bg-orange-400 animate-ping' : 'bg-[#15803d] dark:bg-green-400 shadow-[0_0_15px_#15803d]'}`}></div>
            </div>
            <div className="space-y-2 text-left">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">System Status</p>
              <p className="text-sm font-black text-gray-800 dark:text-white uppercase text-left tracking-wide">
                {isProcessing ? "System Busy - Processing NLP..." : "System Ready - Waiting Command"}
              </p>
              {statusMessage && (
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleStart}
            disabled={isProcessing} 
            className={`px-12 py-5 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${isProcessing ? 'bg-gray-300 dark:bg-white/10 cursor-not-allowed opacity-50' : 'bg-[#15803d] dark:bg-green-600 hover:brightness-110 shadow-green-900/20'}`}
          >
            {isProcessing ? "Processing Data..." : "Start Processing Data"}
          </button>
        </div>
      </div>

      {/* DATABASE EXPLORATION TABLE */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-white/[0.08] overflow-hidden shadow-none transition-colors text-left">
        <div className="p-10 border-b border-gray-50 dark:border-white/[0.05] bg-gray-50/20 dark:bg-white/[0.01] text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Database <span className="text-[#15803d] dark:text-green-400 text-left">Exploration</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">lihat isi database videos_preprocessed hasil processing</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>

        <div className="w-full overflow-x-auto text-left">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center w-20">ID</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-36">Topic</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-64">Title</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-72">Description</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-80 text-center">Clean Text</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.05] text-left">
              {loading && !isProcessing ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-300 dark:text-gray-600 animate-pulse uppercase tracking-[0.3em]">Loading Records...</td></tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={index} className="hover:bg-green-50/20 dark:hover:bg-green-500/[0.02] transition-all text-left group">
                    <td className="px-8 py-7 text-center text-sm font-black text-gray-400 dark:text-gray-600 group-hover:text-[#15803d]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-8 py-7 text-left">
                      <span className={`inline-block px-3 py-1.5 border rounded-xl text-[9px] font-black uppercase whitespace-nowrap leading-none ${getTopicStyle()}`}>
                        {item.topic_raw || "Unclassified"}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-left font-bold text-gray-700 dark:text-gray-200 text-[11px] truncate" title={item.title}>{item.title}</td>
                    <td className="px-8 py-7 text-left">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium line-clamp-2 text-left">{item.description || "-"}</p>
                    </td>
                    <td className="px-8 py-7 text-left">
                      <div className="p-5 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/10 text-[#15803d] dark:text-green-400 text-[10px] font-medium italic leading-relaxed text-left">
                        {item.clean_text}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        <div className="p-10 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between bg-gray-50/10 dark:bg-white/[0.01] text-left">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic text-left">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} entries
          </p>
          <div className="flex gap-4 text-left">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className="flex items-center justify-center size-10 border border-gray-200 dark:border-white/10 rounded-xl text-lg font-bold dark:text-white disabled:opacity-20 hover:border-[#15803d] transition-all leading-none"
            >
              <AngleLeftIcon className="size-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || totalPages === 0} 
              className="flex items-center justify-center size-10 border border-gray-200 dark:border-white/10 rounded-xl text-lg font-bold dark:text-white disabled:opacity-20 hover:border-[#15803d] transition-all leading-none"
            >
              <AngleRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #15803d; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}
