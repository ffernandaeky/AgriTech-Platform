"use client";
import React, { useState, useEffect } from "react";
import { AngleLeftIcon, AngleRightIcon, EyeIcon, TrashBinIcon } from "@/icons";

interface VideoRawData {
  video_id: string; title: string; description: string; channel_name: string;
  published_at: string; view_count: number; like_count: number; topic: string; video_url: string;
}

interface ScheduleJob { topic: string; time: string; status: string; }

export default function WebScrapingPage() {
  const [topics, setTopics] = useState<string[]>([]);
  const [allVideos, setAllVideos] = useState<VideoRawData[]>([]);
  const [schedules, setSchedules] = useState<ScheduleJob[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [mode, setMode] = useState("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoadingTable(true);
    try {
      const [vRes, sRes, tRes] = await Promise.all([
        fetch("http://localhost:8000/videos-raw"),
        fetch("http://localhost:8000/schedules"),
        fetch("http://localhost:8000/scraping-topics")
      ]);
      const vData = await vRes.json();
      const sData = await sRes.json();
      const tData = await tRes.json();
      setAllVideos(vData.data || []);
      setSchedules(sData.data || []);
      setTopics(tData.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingTable(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    setIsScraping(true);
    try {
      await fetch("http://localhost:8000/start-scraping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: selectedTopic, 
          mode, 
          schedule_time: mode === "schedule" ? scheduleTime : null 
        }),
      });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setIsScraping(false); }
  };

  const handleDelete = async (video_id: string) => {
    if (!confirm("Hapus data video ini?")) return;
    try {
      const res = await fetch(`http://localhost:8000/delete-video-raw/${video_id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(allVideos) ? allVideos.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Math.ceil(allVideos.length / 10);

  const getTopicStyle = () => {
    return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  return (
    <div className="space-y-8 font-sans min-h-screen p-4 md:p-0 text-left animate-in fade-in duration-500 max-w-full bg-transparent">
      
      {/* HEADER SECTION - Identik dengan Keyword Page */}
      <header className="relative bg-[#15803d] dark:bg-green-600/20 border border-transparent dark:border-green-500/30 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-green-900/10 transition-colors">
        <div className="space-y-2 relative z-10 text-left">
          <h1 className="text-xl font-black uppercase tracking-tight">Web <span className="opacity-70 dark:text-green-400">Scraping</span></h1>
          <p className="text-sm text-white/90 dark:text-gray-300 font-medium text-left">Sistem manajemen scraping data YouTube Agriculture.</p>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right px-6 border-r border-white/20 dark:border-green-500/30">
             <p className="text-[10px] font-black text-white/70 dark:text-gray-400 uppercase tracking-widest text-right">Total Entry</p>
             <p className="text-2xl font-black text-white dark:text-green-400 text-right">{allVideos.length}</p>
          </div>
          <button onClick={fetchData} className="px-6 py-3 bg-white dark:bg-green-500 text-[#15803d] dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-green-400 transition-all shadow-md">Refresh Data</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. CONFIGURATION CARD - Glassmorphism style */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm h-full text-left">
          <div className="mb-10 relative text-left">
            <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Add New <span className="text-[#15803d] dark:text-green-400 text-left">Scraping</span></h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left text-left">input data ke database berdasarkan topik</p>
            <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
          </div>
          <form onSubmit={handleStartScraping} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 text-left">Pilih Topik</label>
                <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-medium outline-none uppercase text-gray-800 dark:text-white appearance-none focus:border-green-500 transition-all">
                  <option value="" className="dark:bg-[#1e293b]"> klik untuk memilih topik </option>
                  {topics.map(t => <option key={t} value={t} className="dark:bg-[#1e293b]">{t}</option>)}
                </select>
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 text-left">Waktu Eksekusi</label>
                <div className="flex gap-3 text-left">
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="flex-1 px-6 py-5 bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-medium outline-none uppercase text-gray-800 dark:text-white appearance-none focus:border-green-500 transition-all">
                    <option value="now" className="dark:bg-[#1e293b]">Sekarang</option>
                    <option value="schedule" className="dark:bg-[#1e293b]">Jadwalkan</option>
                  </select>
                  {mode === "schedule" && (
                    <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="flex-1 px-4 py-5 bg-gray-50 dark:bg-white/[0.05] border border-[#15803d]/30 rounded-2xl text-sm font-medium outline-none text-gray-800 dark:text-white focus:border-green-500 transition-all" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end text-left">
              <button disabled={isScraping || !selectedTopic || (mode === "schedule" && !scheduleTime)} className="px-10 py-4 bg-[#15803d] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shadow-lg shadow-green-900/20 border-none dark:bg-green-600 dark:text-white">
                {isScraping ? "Processing..." : "Mulai Scraping"}
              </button>
            </div>
          </form>
        </div>

        {/* 2. ACTIVE SCHEDULES CARD - Glassmorphism style */}
        <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm flex flex-col h-full max-h-[460px] text-left">
          <div className="flex-none text-left">
            <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-widest mb-2 text-left">Active Schedules</h2>
            <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mb-8 rounded-full"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar text-left text-left">
            {schedules.length === 0 ? (
              <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase italic text-center py-10">Tidak ada antrean.</p>
            ) : (
              schedules.map((s, i) => (
                <div key={i} className="p-5 bg-gray-50 dark:bg-white/[0.05] rounded-3xl border border-gray-100 dark:border-white/5 transition-all hover:bg-green-50/20 dark:hover:bg-green-500/[0.05] text-left">
                  <p className="text-[11px] font-black text-[#15803d] dark:text-green-400 uppercase tracking-tight text-left">{s.topic}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 text-left">{s.time}</p>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[8px] font-black uppercase ${s.status === 'Selesai' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. DATABASE EXPLORATION TABLE - Identik dengan Keyword Page */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col shadow-sm transition-colors text-left text-left">
        <div className="p-10 border-b border-gray-50 dark:border-white/10 bg-gray-50/20 dark:bg-white/[0.02] text-left">
          <h2 className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-[0.2em] text-left">Database <span className="text-[#15803d] dark:text-green-400 text-left">Exploration</span></h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase italic tracking-widest mt-1 text-left">lihat isi database videos_raw hasil scraping</p>
          <div className="w-16 h-1 bg-[#15803d] dark:bg-green-500 mt-4 rounded-full"></div>
        </div>
        <div className="w-full text-left">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.05]">
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-12">ID</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-24">Topic</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-64">Title & Desc</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-20 text-center">Stats</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-24 text-center">Date</th>
                <th className="px-6 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/10 text-left">
              {loadingTable ? (
                <tr><td colSpan={6} className="px-10 py-24 text-center text-[10px] font-black text-gray-400 dark:text-gray-600 animate-pulse uppercase">Fetching Data...</td></tr>
              ) : (
                currentItems.map((video, index) => (
                  <tr key={video.video_id} className="hover:bg-green-50/20 dark:hover:bg-green-500/[0.05] transition-all group text-left">
                    <td className="px-6 py-5 text-center text-[11px] font-black text-gray-400 dark:text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-left">
                      <span className={`px-3 py-1.5 border rounded-xl text-[9px] font-black uppercase leading-none inline-block ${getTopicStyle()}`}>
                        {video.topic}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-left">
                      <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate mb-1 text-left" title={video.title}>{video.title}</p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 italic truncate text-left" title={video.description}>{video.description || "-"}</p>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap text-center">
                      <p className="text-[10px] font-black text-gray-800 dark:text-white">{video.view_count?.toLocaleString()} V</p>
                      <p className="text-[8px] font-bold text-gray-400 dark:text-gray-600">{video.like_count?.toLocaleString() || 0} L</p>
                    </td>
                    <td className="px-6 py-5 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase text-center">{new Date(video.published_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</td>
                    <td className="px-6 py-5 text-center whitespace-nowrap space-x-4 text-center">
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 transition-all hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400" aria-label={`Buka video ${video.title}`} title="Buka video">
                        <EyeIcon className="size-4" />
                      </a>
                      <button onClick={() => handleDelete(video.video_id)} className="inline-flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all hover:scale-105 dark:bg-red-500/10 dark:text-red-400" aria-label={`Hapus video ${video.title}`} title="Hapus video">
                        <TrashBinIcon className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION SECTION - Identik dengan Keyword Page */}
        <div className="p-10 border-t border-gray-50 dark:border-white/10 flex items-center justify-between bg-gray-50/10 dark:bg-white/[0.02] text-left">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic text-left">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allVideos.length)} of {allVideos.length} entries</p>
          <div className="flex gap-3 text-left">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-600 dark:text-gray-300 disabled:opacity-20 hover:border-green-500 transition-all leading-none">
              <AngleLeftIcon className="size-4" />
              Previous
            </button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-600 dark:text-gray-300 disabled:opacity-20 hover:border-green-500 transition-all leading-none">
              Next
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
