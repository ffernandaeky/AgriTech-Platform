"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AngleLeftIcon, AngleRightIcon } from "@/icons";

const MODEL_API_URL = "/api/videos/model";
const MODEL_REPORT_API_URL = "/api/videos/model-report";

interface BertPredictionData {
  id: number;
  topic?: string;
  clean_text: string;
  prediction?: string;
  view_count?: number;
  like_count?: number;
}

interface BertMetricSummary {
  best_epoch?: number;
  selection_score?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  classification_report?: string;
}

interface BertTrainingResult {
  max_epoch: number;
  best_test_accuracy: number;
  best_test_f1: number;
  waktu_menit: number;
}

interface BertVisualization {
  title: string;
  image_src?: string | null;
}

interface BertReport {
  status?: string;
  device?: string;
  duration?: string;
  dataset?: {
    total: number;
    training: number;
    testing: number;
    evaluation: number;
    classified_evaluation_rows?: number;
    classified_all_rows?: number;
  };
  training?: {
    results: BertTrainingResult[];
  };
  testing?: BertMetricSummary;
  evaluation?: BertMetricSummary;
  outputs?: {
    saved_predictions: number;
    best_accuracy_f1_predictions_csv?: string;
  };
  best_epoch_summary?: {
    source?: string;
    columns?: string[];
    rows?: Record<string, string | number | null>[];
  };
  visualizations?: BertVisualization[];
}

interface BertStatus {
  status?: string;
  message?: string;
  progress?: number;
  stage?: string;
  device?: string | null;
  job_id?: string | null;
  is_processing?: boolean;
  error?: string | null;
}

export default function ModelPredictionPage() {
  const [data, setData] = useState<BertPredictionData[]>([]);
  const [report, setReport] = useState<BertReport | null>(null);
  const [bertStatus, setBertStatus] = useState<BertStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [showResearchOutput, setShowResearchOutput] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(MODEL_API_URL, { cache: "no-store" });
      
      // Jika tidak OK, kita set data kosong saja, jangan THROW ERROR
      if (!res.ok) {
        console.error("API internal /api/model bermasalah");
        setData([]);
        return;
      }

      const result = await res.json();
      setData(Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(MODEL_REPORT_API_URL, { cache: "no-store" });
      if (!res.ok) return;
      const result = await res.json();
      const statusData = result?.status || null;
      const reportData = result?.report || null;
      setBertStatus(statusData);
      setReport(reportData?.status === "empty" ? null : reportData);
      setIsPredicting(Boolean(statusData?.is_processing));
      if (!statusData?.is_processing) {
        localStorage.removeItem("isPredicting_AgriTube");
      }
    } catch (err) {
      console.error("Report Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchReport();
    const savedStatus = localStorage.getItem("isPredicting_AgriTube");
    if (savedStatus === "true") setIsPredicting(true);
  }, [fetchData, fetchReport]);

  useEffect(() => {
    if (!isPredicting) return;
    const interval = window.setInterval(() => {
      fetchReport();
    }, 2000);
    return () => window.clearInterval(interval);
  }, [fetchReport, isPredicting]);

  useEffect(() => {
    if (isPredicting) return;
    fetchData();
  }, [fetchData, isPredicting]);

  const handleRunModel = async () => {
    if (!confirm("Jalankan prediksi model BERT?")) return;
    setIsPredicting(true);
    setShowResearchOutput(true);
    localStorage.setItem("isPredicting_AgriTube", "true");
    try {
      const res = await fetch(MODEL_API_URL, { method: "POST" });
      const result = await res.json();
      if (!res.ok || result.status === "error") {
        alert(result.message || "Gagal menjalankan model.");
        setIsPredicting(false);
        localStorage.removeItem("isPredicting_AgriTube");
        return;
      }
      alert(result.message || "Prediksi dimulai.");
    } catch {
      alert("Gagal menjalankan model.");
      setIsPredicting(false);
      localStorage.removeItem("isPredicting_AgriTube");
      return;
    } finally {
      setTimeout(() => {
        fetchReport();
      }, 3000);
    }
  };

  const formatCellValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4);
    return value;
  };

  const safeData = Array.isArray(data) ? data : [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = safeData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));
  const systemStatusText = !showResearchOutput && !isPredicting
    ? "System Ready - Waiting Command"
    : isPredicting
      ? "Sistem sedang menjalankan prediksi..."
    : "Sinkronisasi hasil prediksi best epoch selesai.";

  const getTopicStyle = () => {
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 p-4 md:p-8 bg-transparent min-h-screen relative font-sans transition-all duration-500 text-left text-gray-800 dark:text-gray-100">
      <header className="relative overflow-hidden bg-[#15803d] dark:bg-green-600/20 border border-transparent dark:border-green-500/30 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl transition-colors">
        <div className="relative z-10 space-y-3 text-left">
          <h1 className="text-2xl font-black uppercase tracking-tight">AI <span className="opacity-60 dark:text-green-400">Model</span></h1>
          <p className="text-sm text-white/80 dark:text-gray-400 font-medium max-w-md text-left leading-relaxed">
            Sistem klasifikasi menggunakan model BERT lokal dari output training yang sudah tersedia.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-right px-8 border-r border-white/20 dark:border-green-500/30">
            <p className="text-[10px] font-black text-white/60 dark:text-gray-500 uppercase tracking-widest mb-1 text-right">Data Predicted</p>
            <p className="text-3xl font-black text-white dark:text-green-400 leading-none text-right">{safeData.length}</p>
          </div>
          <button
            onClick={() => {
              setShowResearchOutput(false);
              fetchData();
            }}
            className="px-6 py-3 bg-white dark:bg-green-600 text-[#15803d] dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-green-500 transition-all shadow-xl active:scale-95"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 dark:border-white/[0.08] shadow-sm transition-colors text-left">
        <div className="mb-10 text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Model <span className="text-[#15803d] dark:text-green-400 text-left">Control</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">jalankan klasifikasi menggunakan model BERT</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50 dark:bg-white/[0.02] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] transition-all">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white dark:bg-white/[0.05] rounded-[1.5rem] flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
              <div className={`w-4 h-4 rounded-full ${isPredicting ? "bg-orange-400 animate-ping" : "bg-[#15803d] dark:bg-green-400 shadow-[0_0_15px_#15803d]"}`}></div>
            </div>
            <div className="space-y-2 text-left">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left">System Status</p>
              <p className="text-sm font-black text-gray-800 dark:text-white uppercase text-left tracking-wide">
                {systemStatusText}
              </p>
              {bertStatus?.error && (
                <p className="max-w-xl text-xs font-bold text-red-500">{bertStatus.error}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleRunModel}
            disabled={isPredicting}
            className={`px-12 py-5 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${isPredicting ? "bg-gray-300 dark:bg-white/10 cursor-not-allowed opacity-50" : "bg-[#15803d] dark:bg-green-600 hover:brightness-110 shadow-green-900/20"}`}
          >
            {isPredicting ? "Memproses..." : "Jalankan Prediksi"}
          </button>
        </div>
      </div>

      {showResearchOutput && (
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 dark:border-white/[0.08] shadow-sm transition-colors text-left">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Research <span className="text-[#15803d] dark:text-green-400">Output</span></h2>
            <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
          </div>
          <button
            onClick={() => setShowResearchOutput(false)}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-[#15803d] transition-all"
          >
            Refresh Output
          </button>
        </div>

        {!report?.best_epoch_summary?.rows?.length ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-600">
            File best_epoch_accuracy_f1_summary.csv belum tersedia.
          </div>
        ) : (
          <div className="space-y-4">
            {(report.best_epoch_summary?.rows || []).map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {(report.best_epoch_summary?.columns || []).map((column) => (
                  <div key={column} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                      {column.replaceAll("_", " ")}
                    </p>
                    <p className="mt-3 break-words text-sm font-black leading-relaxed text-[#15803d] dark:text-green-400">
                      {formatCellValue(row[column])}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-white/[0.08] overflow-hidden shadow-none transition-colors text-left">
        <div className="p-10 border-b border-gray-50 dark:border-white/[0.05] bg-gray-50/20 dark:bg-white/[0.01] text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Classification <span className="text-[#15803d] dark:text-green-400 text-left">Exploration</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">lihat isi database hasil_prediksi_bert hasil inferensi model</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>

        <div className="w-full text-left">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-3 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-[7%]">ID</th>
                <th className="px-3 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-[15%]">Topic</th>
                <th className="px-3 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left w-[48%]">Clean Text</th>
                <th className="px-3 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-[15%]">Prediction</th>
                <th className="px-3 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-[15%]">Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.05] text-left">
              {loading && !isPredicting ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-300 dark:text-gray-600 animate-pulse uppercase tracking-[0.3em]">Loading Records...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Tabel hasil_prediksi_bert Masih Kosong</td></tr>
              ) : (
                currentItems.map((item: BertPredictionData, index: number) => (
                  <tr key={item.id || index} className="hover:bg-green-50/20 dark:hover:bg-green-500/[0.02] transition-all text-left group">
                    <td className="px-3 py-5 text-center text-xs font-black text-gray-400 dark:text-gray-600 group-hover:text-[#15803d]">{item.id}</td>
                    <td className="px-3 py-5 text-left">
                      <span className={`inline-block max-w-full px-2 py-1.5 border rounded-lg text-[8px] font-black uppercase leading-tight break-words ${getTopicStyle()}`}>
                        {item.topic || "Unclassified"}
                      </span>
                    </td>
                    <td className="px-3 py-5 text-left">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-left text-[10px] font-medium italic leading-relaxed text-[#15803d] dark:border-white/10 dark:bg-white/[0.03] dark:text-green-400">
                        {item.clean_text}
                      </div>
                    </td>
                    <td className="px-3 py-5 text-center">
                      <span className="inline-block max-w-full px-2 py-2 bg-[#15803d]/10 dark:bg-green-500/10 text-[#15803d] dark:text-green-400 rounded-lg font-black text-[9px] uppercase border border-[#15803d]/20 dark:border-green-500/20 shadow-sm leading-tight break-words">
                        {item.prediction || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-5 text-center">
                      <div className="space-y-1 text-[10px] font-black text-[#15803d] dark:text-green-400">
                        <p>{Number(item.view_count || 0).toLocaleString()} views</p>
                        <p className="text-gray-400 dark:text-gray-500">{Number(item.like_count || 0).toLocaleString()} likes</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-10 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between bg-gray-50/10 dark:bg-white/[0.01] text-left">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic text-left">
            Showing {safeData.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, safeData.length)} of {safeData.length} records
          </p>
          <div className="flex gap-4 text-left">
            <button 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="flex items-center justify-center size-10 border border-gray-200 dark:border-white/10 rounded-xl text-lg font-bold dark:text-white disabled:opacity-20 hover:border-[#15803d] transition-all leading-none"
            >
              <AngleLeftIcon className="size-4" />
            </button>
            <button 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
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
