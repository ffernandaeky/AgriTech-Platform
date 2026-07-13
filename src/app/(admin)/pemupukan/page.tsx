"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  CalenderIcon, 
  EyeIcon, 
  UserIcon,
} from "@/icons"; 

interface Video {
  id: number | null;
  title: string;
  description: string;
  video_url: string;
  channel_name: string;
  published_at: string;
  view_count: string;
  like_count: string;
  pred_label?: string;
}

export default function PemupukanPage() {
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch("/api/videos/pemupukan");
        const json = await res.json();
        if (json) {
          setTopVideos(json.topVideos || []);
          setAllVideos(json.allVideos || []);
        }
      } catch (err) {
        console.error("Gagal memuat data pemupukan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="size-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-4"></div>
      <p className="text-gray-500 font-medium font-sans uppercase tracking-widest text-xs">Menyinkronkan Materi Pemupukan...</p>
    </div>
  );

  return (
    <div className="space-y-12 p-4 md:p-8 bg-transparent min-h-screen relative font-sans transition-all duration-300">
      
      {/* SECTION 1: VIDEO TERPOPULER */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          {/* Aksen diganti Hijau */}
          <div className="h-8 w-1.5 bg-brand-500 rounded-full"></div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">
            video paling banyak ditonton pada topik pemupukan
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topVideos.map((video, index) => (
            <VideoCard key={getVideoKey("top", video, index)} video={video} onDetail={() => setSelectedVideo(video)} />
          ))}
        </div>
      </section>

      {/* SECTION 2: DAFTAR SEMUA MATERI */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Aksen diganti Hijau */}
            <div className="h-8 w-1.5 bg-brand-500 rounded-full"></div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">
              video lainnya pada topik pemupukan
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allVideos.map((video, index) => (
            <VideoCard key={getVideoKey("all", video, index)} video={video} onDetail={() => setSelectedVideo(video)} />
          ))}
        </div>
      </section>

      {/* --- MODAL DETAIL --- */}
      {mounted && selectedVideo && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#121212] border dark:border-white/[0.05] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 font-sans relative">
            <div className="absolute top-6 right-6">
              <button onClick={() => setSelectedVideo(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="px-10 py-12">
              <div className="mb-4">
                {/* Badge diganti Hijau agar seragam */}
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-500/20">
                  {selectedVideo.pred_label || "Pemupukan"}
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
                  {selectedVideo.description || "Video edukasi mengenai materi pemupukan tanaman..."}
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

function VideoCard({ video, onDetail }: { video: Video; onDetail: () => void }) {
  const formattedDate = new Date(video.published_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formatNum = (val: string) => Number(val).toLocaleString("id-ID");

  return (
    <div className="group flex flex-col h-full rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Judul Adaptif */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2 group-hover:text-brand-600 transition-colors">
        {video.title}
      </h3>
      
      {/* Deskripsi Adaptif */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-8 leading-relaxed italic">
        {'"'}{video.description || "Materi edukasi mengenai teknik pemupukan..."}{'"'}
      </p>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 mt-auto pt-6 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
          <UserIcon className="size-4 text-brand-500 shrink-0" />
          <span className="truncate">{video.channel_name}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
          <CalenderIcon className="size-4 text-orange-500 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
          <EyeIcon className="size-4 text-blue-500 shrink-0" />
          <span>{formatNum(video.view_count)} Views</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
          <span className="text-[14px] leading-none shrink-0">❤️</span>
          <span>{formatNum(video.like_count)} Likes</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onDetail} 
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest text-center"
        >
          Detail Video
        </button>
        <a 
          href={video.video_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1 px-4 py-3 bg-[#006622] hover:bg-[#004d1a] text-white text-[11px] font-black rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest text-center"
        >
          Lihat Video
        </a>
      </div>
    </div>
  );
}

const getVideoKey = (prefix: string, video: Video, index: number) =>
  `${prefix}-${video.id ?? video.video_url ?? `${video.title}-${index}`}`;
