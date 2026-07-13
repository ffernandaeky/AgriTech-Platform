"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalenderIcon, EyeIcon, UserIcon } from "@/icons";

interface VideoData {
  id: number | null;
  title: string;
  description: string;
  channel_name: string;
  view_count: string;
  like_count: string;
  published_at: string;
  pred_label: string;
  video_url: string;
}

export default function RecentVideos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (json.recentVideos) setVideos(json.recentVideos);
      } catch (error) {
        console.error("Gagal sinkronisasi video:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-full min-h-[500px] flex items-center justify-center border border-gray-100 rounded-3xl bg-white dark:bg-white/[0.03]">
      <p className="text-gray-500 animate-pulse font-sans font-bold uppercase tracking-widest text-xs">Memuat Video...</p>
    </div>
  );

  return (
    <div className="h-full min-h-0 flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-none dark:border-white/[0.05] dark:bg-[#121212] font-sans relative transition-all duration-300">
      
      {/* HEADER SECTION */}
      <div className="mb-6 shrink-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest border-l-4 border-brand-500 pl-4">
          Video Terbaru
        </h3>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 uppercase font-bold tracking-tight">
          video pertanian terbaru dari database YouTube Agriculture
        </p>
      </div>

      {/* LIST VIDEO */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto pr-3 space-y-10 custom-scrollbar">
          {videos.map((video, index) => (
            <div key={video.id ?? video.video_url ?? `${video.title}-${index}`} className="relative border-b border-gray-100 dark:border-white/[0.05] pb-8 last:border-0 last:pb-0">
              
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  {video.pred_label || "Umum"}
                </span>
              </div>
              
              {/* Judul: Hitam di Light, Putih di Dark */}
              <h4 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
                {video.title}
              </h4>

              {/* Deskripsi: Abu Gelap di Light, Abu Terang di Dark */}
              <p className="mt-3 text-[12px] text-gray-600 dark:text-gray-400 line-clamp-2 italic font-medium leading-relaxed">
                {"\""}{video.description}{"\""}
              </p>
              
              {/* METADATA UTAMA: Background menyesuaikan tema */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-gray-600 dark:text-gray-400 font-bold bg-gray-50 p-4 rounded-2xl dark:bg-white/[0.03] transition-all duration-300">
                <span className="flex items-center gap-2">
                  <UserIcon className="size-4 text-gray-400" /> 
                  <span className="truncate max-w-[120px]">{video.channel_name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <CalenderIcon className="size-4 text-orange-500" /> 
                  <span>{new Date(video.published_at).toLocaleDateString('id-ID')}</span>
                </span>
                <span className="flex items-center gap-2">
                  <EyeIcon className="size-4 text-blue-500" /> 
                  <span>{Number(video.view_count).toLocaleString('id-ID')} Views</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[14px]">❤️</span> 
                  <span>{Number(video.like_count).toLocaleString('id-ID')} Likes</span>
                </span>
              </div>

              {/* TOMBOL AKSI */}
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedVideo(video)}
                  className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-blue-600/20"
                >
                  Detail Video
                </button>
                <a 
                  href={video.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-green-600/20"
                >
                  Lihat Video
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL DETAIL (Warna Adaptif) --- */}
      {mounted && selectedVideo && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border dark:border-white/[0.05] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            
            <div className="flex justify-end p-6 pb-0">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="px-10 pb-10">
              <div className="mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {selectedVideo.pred_label || "Umum"}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
                {selectedVideo.title}
              </h2>

              <div className="flex flex-wrap gap-5 mb-8 py-5 border-y border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] rounded-2xl px-5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <UserIcon className="size-4 text-gray-400" /> {selectedVideo.channel_name}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <CalenderIcon className="size-4 text-orange-500" /> 
                  {new Date(selectedVideo.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <EyeIcon className="size-4 text-blue-500" /> {Number(selectedVideo.view_count).toLocaleString('id-ID')} Views
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span className="text-[14px]">❤️</span> {Number(selectedVideo.like_count).toLocaleString('id-ID')} Likes
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Isi Deskripsi Lengkap:</h4>
                <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line font-medium italic">
                  {selectedVideo.description || "Tidak ada deskripsi tersedia untuk materi ini."}
                </p>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="px-8 py-3 bg-gray-100 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 font-bold text-xs rounded-2xl hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all uppercase tracking-widest"
                >
                  Tutup
                </button>
                <a 
                  href={selectedVideo.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-green-600 text-white font-bold text-xs rounded-2xl hover:bg-green-700 transition-all uppercase tracking-widest shadow-lg shadow-green-600/20"
                >
                  Lihat Video
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')!
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}
