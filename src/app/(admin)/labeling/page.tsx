"use client";
import React, { useState, useEffect } from "react";
import { AngleLeftIcon, AngleRightIcon } from "@/icons";

interface LabeledData {
  video_id: string;
  title: string;
  description: string;
  clean_text: string;
  label_model: number;
  topic_raw: string;
}

interface LabelingStatus {
  status?: string;
  message?: string;
  is_processing?: boolean;
  error?: string | null;
  result?: {
    source_rows?: number;
    mapped_rows?: number;
    failed_rows?: number;
    target_rows?: number;
  } | null;
}

export default function LabelingPage() {
  const [data, setData] = useState<LabeledData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    fetchData();
    const savedStatus = localStorage.getItem("isLabeling_AgriTube");
    if (savedStatus === "true") setIsProcessing(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/labeled-results");
      const json = await res.json();
      if (json.status === "success") setData(json.data || []);
    } catch {
      console.error("Gagal memuat data labeling.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartLabeling = async () => {
    setIsProcessing(true);
    setStatusMessage("Labeling dimulai...");
    localStorage.setItem("isLabeling_AgriTube", "true");
    try {
      const res = await fetch("http://localhost:8000/start-labeling", { method: "POST" });
      const result = await res.json();
      setStatusMessage(result.message || "Labeling sedang berjalan...");
      await pollLabelingStatus();
    } catch {
      alert("Koneksi backend gagal.");
      setIsProcessing(false);
      localStorage.removeItem("isLabeling_AgriTube");
    } finally {
      fetchData();
    }
  };

  const pollLabelingStatus = async () => {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await fetch("http://localhost:8000/labeling-status", { cache: "no-store" });
      const json = await res.json();
      const status: LabelingStatus = json.data || {};
      setStatusMessage(status.message || "Labeling sedang berjalan...");

      if (!status.is_processing && status.status !== "running") {
        setIsProcessing(false);
        localStorage.removeItem("isLabeling_AgriTube");
        if (status.status === "error") {
          alert(status.error || status.message || "Labeling gagal.");
        } else if (status.result) {
          alert(
            `Labeling selesai. videos_preprocessed: ${status.result.source_rows ?? "-"}, ` +
            `berhasil dilabeli: ${status.result.mapped_rows ?? "-"}, ` +
            `videos_labeled: ${status.result.target_rows ?? "-"}`
          );
        }
        return;
      }
    }

    setIsProcessing(false);
    localStorage.removeItem("isLabeling_AgriTube");
    alert("Status labeling timeout. Klik Refresh untuk memeriksa data terbaru.");
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
          <h1 className="text-2xl font-black uppercase tracking-tight">Data <span className="opacity-60 dark:text-green-400">Labeling</span></h1>
          <p className="text-sm text-white/80 dark:text-gray-400 font-medium max-w-md text-left leading-relaxed">
            Sistem manajemen labeling dataset terstandarisasi untuk permodelan YouTube Agriculture.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-right px-8 border-r border-white/20 dark:border-green-500/30">
             <p className="text-[10px] font-black text-white/60 dark:text-gray-500 uppercase tracking-widest mb-1 text-right">Data Labeled</p>
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

      {/* CONTROL SECTION - Premium Card */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 dark:border-white/[0.08] shadow-sm transition-colors text-left">
        <div className="mb-10 text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Labeling <span className="text-[#15803d] dark:text-green-400 text-left">Control</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left text-left">jalankan proses pemetaan label otomatis</p>
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
                {isProcessing ? "System Busy - Mapping labels..." : "System Ready - Waiting command"}
              </p>
              {statusMessage && (
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={handleStartLabeling} 
            disabled={isProcessing} 
            className={`px-12 py-5 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${isProcessing ? 'bg-gray-300 dark:bg-white/10 cursor-not-allowed opacity-50' : 'bg-[#15803d] dark:bg-green-600 hover:brightness-110 shadow-green-900/20'}`}
          >
            {isProcessing ? "Processing..." : "Start Labeling"}
          </button>
        </div>
      </div>

      {/* DATA EXPLORATION TABLE */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-white/[0.08] overflow-hidden shadow-none transition-colors text-left">
        <div className="p-10 border-b border-gray-50 dark:border-white/[0.05] bg-gray-50/20 dark:bg-white/[0.01] text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Dataset <span className="text-[#15803d] dark:text-green-400 text-left">Exploration</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">lihat isi database videos_labeled hasil proses labeling</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>

        <div className="w-full overflow-x-auto text-left">
          <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center w-20">ID</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-36">Topic</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] w-72 text-left">Title & Description</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-left w-80">Clean Text</th>
                <th className="px-8 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center w-32">Model Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.05] text-left">
              {loading && !isProcessing ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-300 dark:text-gray-600 animate-pulse uppercase tracking-[0.3em]">Loading Records...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Tabel videos_labeled Masih Kosong</td></tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.video_id || index} className="hover:bg-green-50/20 dark:hover:bg-green-500/[0.02] transition-all text-left group">
                    <td className="px-8 py-7 text-center text-sm font-black text-gray-400 dark:text-gray-600 group-hover:text-[#15803d]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-8 py-7 text-left">
                      <span className={`inline-block px-3 py-1.5 border rounded-xl text-[9px] font-black uppercase whitespace-nowrap leading-none ${getTopicStyle()}`}>
                        {item.topic_raw || "Unclassified"}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-left">
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 text-[11px] truncate mb-1 text-left" title={item.title}>{item.title}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium line-clamp-2 italic text-left">{item.description || "-"}</p>
                    </td>
                    <td className="px-8 py-7 text-left">
                      <div className="p-5 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/10 text-[#15803d] dark:text-green-400 text-[10px] font-medium italic leading-relaxed text-left">
                        {item.clean_text}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <div className="inline-block px-4 py-2 bg-[#15803d]/10 dark:bg-green-500/10 text-[#15803d] dark:text-green-400 rounded-xl font-black text-xs border border-[#15803d]/20 dark:border-green-500/20 shadow-sm leading-none">
                        {item.label_model}
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} records
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
