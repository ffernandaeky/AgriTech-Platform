"use client";

import React, { useState, useMemo } from "react";
import { PredictionData } from "@/types";

interface PredictionTablesProps {
  data: PredictionData[];
}

const FILTER_OPTIONS = [
  { id: "all", label: "Semua Video", group: "Urutan & Kategori" },
  { id: "latest", label: "Video Terbaru", group: "Urutan & Kategori" },
  { id: "Budidaya Organik", label: "Budidaya Organik", group: "Topik Terklasifikasi" },
  { id: "Hidroponik", label: "Hidroponik", group: "Topik Terklasifikasi" },
  { id: "Irigasi", label: "Irigasi", group: "Topik Terklasifikasi" },
  { id: "Pemupukan", label: "Pemupukan", group: "Topik Terklasifikasi" },
  { id: "Pengendalian Hama", label: "Pengendalian Hama", group: "Topik Terklasifikasi" },
];

const PredictionTables: React.FC<PredictionTablesProps> = ({ data }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeFilterLabel = useMemo(() => {
    return FILTER_OPTIONS.find((opt) => opt.id === selectedFilter)?.label || "Pilih Filter";
  }, [selectedFilter]);

  // Jantung pemrosesan data yang disesuaikan dengan skema asli database Anda
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. FILTER TOPIK NLP INDOBERT
    const isTopicFilter = ["Budidaya Organik", "Hidroponik", "Irigasi", "Pemupukan", "Pengendalian Hama"].includes(selectedFilter);
    if (isTopicFilter) {
      result = result.filter((v) => v.pred_label === selectedFilter);
    }

    // 2. FILTER URUTAN TERBARU (Menggunakan urutan ID descending)
    if (selectedFilter === "latest") {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    // 3. FITUR LIVE SEARCH (Mencocokkan nama properti channel_name sesuai skema asli)
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.title || "").toLowerCase().includes(query) ||
          (v.channel_name || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [data, selectedFilter, searchTerm]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04]">
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Cari judul atau channel..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-xs font-bold text-black outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-green-500"
          />
          <svg className="absolute right-3 top-1.5 h-4 w-4 text-gray-400 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="relative inline-block z-40 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-11 items-center gap-3 rounded-xl border border-gray-300 bg-white px-5 text-xs font-black uppercase tracking-wider text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Kategori: <span className="text-green-600 dark:text-green-400 font-black">{activeFilterLabel}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950 z-50 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                
                <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Urutan & Kategori</p>
                {FILTER_OPTIONS.filter(o => o.group === "Urutan & Kategori").map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFilterChange(opt.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition mb-0.5 ${
                      selectedFilter === opt.id
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 font-black"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                    {selectedFilter === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />}
                  </button>
                ))}

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Topik Hasil Klasifikasi BERT</p>
                {FILTER_OPTIONS.filter(o => o.group === "Topik Terklasifikasi").map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFilterChange(opt.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition mb-0.5 ${
                      selectedFilter === opt.id
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 font-black"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                    {selectedFilter === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />}
                  </button>
                ))}

              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/[0.05]">
        <table className="min-w-[1100px] w-full table-auto text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-black uppercase tracking-[0.15em] text-black dark:border-white/[0.05] dark:bg-white/[0.02] dark:text-white">
              <th className="px-5 py-4 w-[100px]">ID Video</th>
              <th className="px-5 py-4 w-[480px]">Judul Konten Video</th>
              <th className="px-5 py-4 w-[240px]">Nama Channel</th>
              <th className="px-5 py-4 text-center w-[140px]">Views Count</th>
              <th className="px-5 py-4 text-center w-[180px]">Topik Hasil BERT</th>
              <th className="px-5 py-4 text-right w-[140px]">Tautan Konten</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs dark:divide-white/[0.05]">
            {paginatedData.length > 0 ? (
              paginatedData.map((video, index) => (
                <tr key={video.id ?? video.video_url ?? `${video.title}-${index}`} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition">
                  <td className="px-5 py-4 font-bold text-black dark:text-white">
                    {video.id}
                  </td>
                  {/* PERBAIKAN ERROR 3: Menambahkan fallback string kosong "" jika video.title bernilai null */}
                  <td className="px-5 py-4 font-black text-black dark:text-white max-w-[450px]">
                    <div className="line-clamp-2 leading-relaxed" title={video.title || ""}>
                      {video.title || "Tanpa Judul"}
                    </div>
                  </td>
                  {/* PERBAIKAN ERROR 1 & 2: Mengubah properti channelName menjadi channel_name */}
                  <td className="px-5 py-4 font-bold text-gray-700 dark:text-gray-300 truncate max-w-[220px]">
                    {video.channel_name || "-"}
                  </td>
                  {/* PERBAIKAN: Mengubah properti viewCount menjadi view_count sesuai tipe data string database */}
                  <td className="px-5 py-4 text-center font-bold text-black dark:text-white">
                    {video.view_count ? Number(video.view_count).toLocaleString("id-ID") : "0"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {video.pred_label || "Unlabeled"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={video.video_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-black uppercase tracking-wider text-[10px] hover:underline dark:text-blue-400"
                    >
                      Buka Link
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                  Data metadata tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* COMPONENT BAR PAGINASI DATA */}
      {totalPages > 1 && (
        <div className="mt-5 flex justify-end items-center gap-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-black/60 dark:text-white/60 mr-2">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-50 dark:bg-white/[0.03] text-black dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-50 dark:bg-white/[0.03] text-black dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionTables;