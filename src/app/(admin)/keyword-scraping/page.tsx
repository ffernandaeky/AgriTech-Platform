"use client";
import React, { useState, useEffect } from "react";
import { AngleLeftIcon, AngleRightIcon, PencilIcon, TrashBinIcon } from "@/icons";

// Interface untuk memastikan tipe data objek keyword
interface KeywordData {
  id: number; 
  topic: string; 
  keyword: string; 
  label_id: number;
}

export default function KeywordScrapingPage() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTopic, setNewTopic] = useState<string>("");
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTopic, setEditTopic] = useState<string>("");
  const [editKeyword, setEditKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/keywords");
      const result = await res.json();
      setKeywords(result.data || []);
    } catch (error) { 
      console.error("Gagal fetch data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic || !newKeyword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/add-keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic, keyword: newKeyword }),
      });
      if (res.ok) { 
        setNewTopic(""); 
        setNewKeyword(""); 
        fetchKeywords(); 
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`http://localhost:8000/update-keyword/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: editTopic, keyword: editKeyword }),
      });
      if (res.ok) { 
        setEditingId(null); 
        fetchKeywords(); 
      }
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(`http://localhost:8000/delete-keyword/${id}`, { method: "DELETE" });
      if (res.ok) fetchKeywords();
    } catch (error) { 
      console.error(error); 
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = Array.isArray(keywords) ? keywords.slice(indexOfLastItem - itemsPerPage, indexOfLastItem) : [];
  const totalPages = Math.ceil(keywords.length / itemsPerPage);

  return (
    <div className="space-y-10 p-4 md:p-8 bg-transparent min-h-screen relative font-sans transition-all duration-500 text-left text-gray-800 dark:text-gray-100">
      
      {/* HEADER SECTION - Sekarang menggunakan tombol Refresh Data seperti Web Scraping */}
      <header className="relative overflow-hidden bg-[#15803d] dark:bg-green-600/20 border border-transparent dark:border-green-500/30 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-green-900/10 transition-colors">
        <div className="relative z-10 space-y-3">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Keyword <span className="opacity-60 dark:text-green-400">Scraping</span>
          </h1>
          <p className="text-sm text-white/80 dark:text-gray-300 font-medium max-w-md">
            Sistem manajemen kata kunci cerdas untuk ekstraksi data YouTube Agriculture.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-right px-8 border-r border-white/20 dark:border-green-500/30">
             <p className="text-[10px] font-black text-white/60 dark:text-gray-400 uppercase tracking-widest mb-1">Total Entries</p>
             <p className="text-3xl font-black text-white dark:text-green-400 leading-none">{keywords.length}</p>
          </div>
          {/* TOMBOL SUDAH DIGANTI MENJADI REFRESH DATA SESUAI PERMINTAAN */}
          <button 
            onClick={fetchKeywords} 
            className="px-6 py-3 bg-white dark:bg-green-600 text-[#15803d] dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-green-400 transition-all shadow-md"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </header>

      {/* FORM SECTION */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 dark:border-white/[0.08] shadow-sm transition-colors text-left">
        <div className="mb-10 text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em]">Add New <span className="text-[#15803d] dark:text-green-400">Keyword</span></h2>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-50 mt-4 rounded-full"></div>
        </div>

        <form onSubmit={handleAddKeyword} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3 group text-left">
               <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-[#15803d] transition-colors">Topik Kategori</label>
               <input 
                 type="text" 
                 value={newTopic} 
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTopic(e.target.value)} 
                 placeholder="MISAL: PUPUK" 
                 className="w-full px-8 py-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-[1.5rem] text-sm font-bold outline-none uppercase text-gray-800 dark:text-white focus:border-[#15803d] transition-all" 
               />
            </div>
            <div className="space-y-3 group text-left">
               <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-[#15803d] transition-colors">Kata Kunci Pencarian</label>
               <input 
                 type="text" 
                 value={newKeyword} 
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyword(e.target.value)} 
                 placeholder="MISAL: CARA BUAT PUPUK ORGANIK" 
                 className="w-full px-8 py-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-[1.5rem] text-sm font-bold outline-none text-gray-800 dark:text-white focus:border-[#15803d] transition-all" 
               />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              disabled={isSubmitting || !newTopic || !newKeyword} 
              className="px-12 py-5 bg-[#15803d] dark:bg-green-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 shadow-lg shadow-green-900/20"
            >
              {isSubmitting ? "Sinking..." : "Submit ke Database"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-white/[0.08] overflow-hidden shadow-none transition-colors text-left">
        <div className="p-10 border-b border-gray-50 dark:border-white/[0.05] bg-gray-50/20 dark:bg-white/[0.01] text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em]">Database <span className="text-[#15803d] dark:text-green-400">Exploration</span></h2>
        </div>
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-10 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center w-24">Index</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Topic</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Keyword</th>
                <th className="px-10 py-8 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.05] text-left">
              {loading ? (
                <tr><td colSpan={4} className="px-10 py-24 text-center text-[10px] font-black text-gray-400 animate-pulse uppercase tracking-[0.2em]">Fetching Data...</td></tr>
              ) : (
                currentItems.map((item: KeywordData, index: number) => (
                  <tr key={item.id} className="hover:bg-green-50/20 dark:hover:bg-green-500/[0.02] transition-all group text-left">
                    <td className="px-10 py-7 text-center text-sm font-black text-gray-400 group-hover:text-[#15803d]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-10 py-7 text-left">
                      {editingId === item.id ? (
                        <input type="text" value={editTopic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTopic(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f172a] border border-green-500/20 rounded-xl px-4 py-3 text-xs uppercase font-black dark:text-white outline-none" />
                      ) : (
                        <span className="px-5 py-2 bg-green-50 dark:bg-green-500/10 text-[#15803d] dark:text-green-400 border border-green-100 dark:border-green-500/20 rounded-xl text-[10px] font-black uppercase inline-block">{item.topic}</span>
                      )}
                    </td>
                    <td className="px-10 py-7 text-sm font-bold text-gray-700 dark:text-gray-300 text-left">
                      {editingId === item.id ? (
                        <input type="text" value={editKeyword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditKeyword(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f172a] border border-green-500/20 rounded-xl px-4 py-3 text-xs font-bold dark:text-white outline-none" />
                      ) : ( item.keyword )}
                    </td>
                    <td className="px-10 py-7 text-center whitespace-nowrap space-x-4">
                      {editingId === item.id ? (
                        <div className="flex gap-4 justify-center">
                          <button onClick={handleUpdate} className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest hover:underline">Simpan</button>
                          <button onClick={() => setEditingId(null)} className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:underline">Batal</button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => {setEditingId(item.id); setEditTopic(item.topic); setEditKeyword(item.keyword);}}
                            className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shadow-sm transition-all hover:scale-110 dark:bg-blue-500/10"
                            aria-label={`Edit keyword ${item.keyword}`}
                            title="Edit keyword"
                          >
                            <PencilIcon className="size-4 shrink-0" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm transition-all hover:scale-110 dark:bg-red-500/10"
                            aria-label={`Hapus keyword ${item.keyword}`}
                            title="Hapus keyword"
                          >
                            <TrashBinIcon className="size-4 shrink-0" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION SECTION */}
        <div className="p-10 border-t border-gray-50 dark:border-white/[0.05] flex items-center justify-between bg-gray-50/10 dark:bg-white/[0.01] text-left">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic text-left">Showing {indexOfLastItem - 9} to {Math.min(indexOfLastItem, keywords.length)} of {keywords.length} entries</p>
          <div className="flex gap-3">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex size-10 items-center justify-center border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white disabled:opacity-20 hover:border-[#15803d] transition-all" aria-label="Halaman sebelumnya">
              <AngleLeftIcon className="size-4" />
            </button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="flex size-10 items-center justify-center border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white disabled:opacity-20 hover:border-[#15803d] transition-all" aria-label="Halaman berikutnya">
              <AngleRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
