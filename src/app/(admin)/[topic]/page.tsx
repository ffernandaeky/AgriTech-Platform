"use client";

import { CalenderIcon, EyeIcon, UserIcon } from "@/icons";
import { titleCaseTopic } from "@/lib/topics";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

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

const getVideoKey = (sectionTitle: string, video: Video, index: number) =>
  `${sectionTitle}-${video.id ?? video.video_url ?? `${video.title}-${index}`}`;

interface TopicResponse {
  topic: { label: string; slug: string } | null;
  topVideos: Video[];
  allVideos: Video[];
}

export default function DynamicTopicPage() {
  const params = useParams<{ topic: string }>();
  const [data, setData] = useState<TopicResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/videos/${params.topic}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Gagal memuat topik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.topic]);

  const topicLabel = data?.topic?.label || titleCaseTopic(params.topic.replace(/-/g, " "));

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-4"></div>
        <p className="text-gray-500 font-medium font-sans uppercase tracking-widest text-xs">Menyinkronkan Materi...</p>
      </div>
    );
  }

  if (!data?.topic) {
    return (
      <div className="p-8">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <h1 className="text-xl font-black uppercase text-gray-900 dark:text-white">Topik tidak ditemukan</h1>
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            Topik ini belum terdaftar di database keyword atau hasil prediksi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-4 md:p-8 bg-transparent min-h-screen relative font-sans transition-all duration-300">
      <section className="rounded-[2rem] bg-[#15803d] p-8 text-white shadow-lg shadow-green-900/10">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Video per Topik</p>
        <h1 className="text-2xl font-black uppercase tracking-tight">{topicLabel}</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/80">
          Daftar video hasil klasifikasi untuk topik {topicLabel}.
        </p>
      </section>

      <VideoSection title={`Video Paling Banyak Ditonton Pada Topik ${topicLabel}`} videos={data.topVideos} />
      <VideoSection title={`Video Lainnya Pada Topik ${topicLabel}`} videos={data.allVideos} />
    </div>
  );
}

function VideoSection({ title, videos }: { title: string; videos: Video[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1.5 bg-brand-500 rounded-full"></div>
        <h2 className="text-xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">{title}</h2>
      </div>
      {videos.length === 0 ? (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Belum ada video untuk topik ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <VideoCard key={getVideoKey(title, video, index)} video={video} />
          ))}
        </div>
      )}
    </section>
  );
}

function VideoCard({ video }: { video: Video }) {
  const formattedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  const formatNum = (value: string) => Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="group flex flex-col h-full rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2 group-hover:text-brand-600 transition-colors">
        {video.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-8 leading-relaxed italic">
        &quot;{video.description || "Materi edukasi pertanian."}&quot;
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
      </div>

      <a
        href={video.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-3 bg-[#006622] hover:bg-[#004d1a] text-white text-[11px] font-black rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest text-center"
      >
        Lihat Video
      </a>
    </div>
  );
}
