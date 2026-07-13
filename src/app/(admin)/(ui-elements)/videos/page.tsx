"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { titleCaseTopic } from "@/lib/topics";
import { CalenderIcon, ChevronDownIcon, EyeIcon, UserIcon } from "@/icons";
import { fetchJson } from "@/lib/fetchJson";
import { useAuthUser } from "@/lib/auth";

interface VideoData {
  video_id?: string;
  id?: number;
  title?: string;
  description?: string;
  channel_name?: string;
  published_at?: string;
  view_count?: number | string;
  like_count?: number | string;
  label_model?: string | number | null;
  label_id?: string | number | null;
  label_source?: string | null;
  pred_id?: string | number | null;
  true_id?: string | number | null;
  true_label?: string | null;
  clean_text?: string;
  word_count?: number | string | null;
  token_count?: number | string | null;
  pred_label?: string | null;
  topic?: string | null;
  topic_raw?: string | null;
  video_url?: string;
}

interface RawVideoData extends VideoData {
  judul?: string;
  deskripsi?: string;
  clean_text?: string;
  channel?: string;
  channelName?: string;
  publishedAt?: string;
  tanggal_publish?: string;
  views?: number | string;
  likes?: number | string;
  videoUrl?: string;
}

interface DirectPrediction extends VideoData {
  confidence?: number;
  display_confidence?: number;
  confidence_percent?: number;
  prediction_source?: string;
  video?: VideoData;
}

type SaveMessageStatus = "idle" | "checking" | "success" | "exists" | "error";

const TOPIC_LABELS: Record<string, string> = {
  "0": "pengendalian hama",
  "1": "pemupukan",
  "2": "irigasi",
  "3": "budidaya organik",
  "4": "hidroponik",
};

const resolveTopicValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "";
  const cleaned = String(value).trim().toLowerCase();
  if (!cleaned) return "";
  return TOPIC_LABELS[cleaned] ?? cleaned;
};

const normalizeFilterKey = (value?: string | number | null) => {
  const resolved = resolveTopicValue(value);
  return resolved.trim().toLowerCase().replace(/\s+/g, " ");
};

const getVideoTopicKey = (video: VideoData) =>
  normalizeFilterKey(
    video.pred_label ??
      video.label_model ??
      video.topic ??
      video.topic_raw
  );

const normalizeTopic = (video: VideoData) => {
  const resolved = getVideoTopicKey(video);
  return resolved ? titleCaseTopic(resolved) : "Umum";
};

const formatNumber = (value?: number | string) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("id-ID");
};

const formatConfidencePercent = (prediction?: DirectPrediction | null) => {
  const rawValue =
    prediction?.confidence_percent ??
    (prediction?.display_confidence !== undefined ? Number(prediction.display_confidence) * 100 : undefined) ??
    (prediction?.confidence !== undefined ? Number(prediction.confidence) * 100 : undefined);

  const value = Number(rawValue);
  if (!Number.isFinite(value)) return "-";

  return `${value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

const buildVideoUrl = (video: VideoData) => {
  if (video.video_url) return video.video_url;
  if (video.video_id) return `https://www.youtube.com/watch?v=${video.video_id}`;
  return "#";
};

const extractYoutubeId = (url?: string | number) => {
  if (!url) return "";
  const value = String(url);
  const match = value.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? "";
};

const getYoutubeThumbnailUrl = (video: VideoData) => {
  const youtubeId = String(video.video_id ?? extractYoutubeId(video.video_url)).trim();
  return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "";
};

const hasYoutubeThumbnail = (video: VideoData) => Boolean(getYoutubeThumbnailUrl(video));

const validateYoutubeThumbnail = (video: VideoData) =>
  new Promise<boolean>((resolve) => {
    const thumbnailUrl = getYoutubeThumbnailUrl(video);
    if (!thumbnailUrl || typeof window === "undefined") {
      resolve(false);
      return;
    }

    const image = new window.Image();
    image.onload = () => resolve(image.naturalWidth > 120 && image.naturalHeight > 90);
    image.onerror = () => resolve(false);
    image.src = thumbnailUrl;
  });

const filterVideosWithReachableThumbnails = async (videos: VideoData[]) => {
  const thumbnailChecks = await Promise.all(videos.map(validateYoutubeThumbnail));
  return videos.filter((_video, index) => thumbnailChecks[index]);
};

const parseVideos = (data: RawVideoData[]): VideoData[] =>
  data
    .map((item) => ({
      ...item,
      title: item.title || item.judul || item.clean_text || "Video Pertanian",
      description: item.description || item.deskripsi || item.clean_text || "Tidak ada deskripsi tersedia.",
      channel_name: item.channel_name || item.channel || item.channelName || "Channel tidak diketahui",
      published_at: item.published_at || item.publishedAt || item.tanggal_publish || "",
      view_count: item.view_count ?? item.views ?? 0,
      like_count: item.like_count ?? item.likes ?? 0,
      label_model: item.label_model ?? item.pred_label ?? item.topic ?? item.topic_raw ?? null,
      label_id: item.label_id ?? null,
      label_source: item.label_source ?? null,
      pred_id: item.pred_id ?? null,
      true_id: item.true_id ?? null,
      true_label: item.true_label ?? null,
      pred_label: item.pred_label || null,
      topic: item.topic || item.topic_raw || null,
      topic_raw: item.topic_raw || null,
      video_url: item.video_url || item.videoUrl || (item.video_id ? `https://www.youtube.com/watch?v=${item.video_id}` : "#"),
    }))
    .filter(hasYoutubeThumbnail);

const VIDEO_FILTERS = [
  { value: "latest", label: "Video Terbaru" },
  { value: "oldest", label: "Video Terlama" },
  { value: "most-viewed", label: "Video Paling Banyak Ditonton" },
  { value: "most-liked", label: "Video Paling Banyak Disukai" },
];

const VIDEOS_PER_PAGE = 15;

const TOPIC_FILTERS = [
  { value: "pengendalian hama", label: "Pengendalian Hama" },
  { value: "pemupukan", label: "Pemupukan" },
  { value: "irigasi", label: "Irigasi" },
  { value: "hidroponik", label: "Hidroponik" },
  { value: "budidaya organik", label: "Budidaya Organik" },
];

const toggleFilterValue = (values: string[], value: string) => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value];
};

const sortByPublishedAsc = (items: VideoData[]) =>
  [...items].sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));

const getVideoYear = (video: VideoData) => {
  if (!video.published_at) return "";
  const date = new Date(video.published_at);
  return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
};

export default function VideoPage() {
  const user = useAuthUser();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [selectedVideoFilters, setSelectedVideoFilters] = useState<string[]>([]);
  const [selectedTopicFilters, setSelectedTopicFilters] = useState<string[]>([]);
  const [selectedYearFilters, setSelectedYearFilters] = useState<string[]>([]);
  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [prediction, setPrediction] = useState<DirectPrediction | null>(null);
  const [predictionMessage, setPredictionMessage] = useState("");
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageStatus, setSaveMessageStatus] = useState<SaveMessageStatus>("idle");
  const [predictionDetailVideo, setPredictionDetailVideo] = useState<VideoData | null>(null);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/videos");
      const json = await res.json();
      const rawVideos = Array.isArray(json.videos) ? json.videos : [];
      const rawTotalVideos = Number(json.totalVideos ?? rawVideos.length);
      const parsedVideos = parseVideos(rawVideos);
      const visibleVideos = await filterVideosWithReachableThumbnails(parsedVideos);
      setTotalVideos(Number.isFinite(rawTotalVideos) ? rawTotalVideos : rawVideos.length);
      setVideos(visibleVideos);
    } catch (err) {
      console.error("Gagal memuat data video:", err);
      setError("Terjadi masalah saat memuat video. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(videos.map(getVideoYear).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let results = videos;

    if (selectedTopicFilters.length > 0) {
      const selectedTopicKeys = new Set(selectedTopicFilters.map((topic) => normalizeFilterKey(topic)));
      results = results.filter((video) => selectedTopicKeys.has(getVideoTopicKey(video)));
    }

    if (selectedYearFilters.length > 0) {
      const selectedYears = new Set(selectedYearFilters);
      results = results.filter((video) => selectedYears.has(getVideoYear(video)));
    }

    if (selectedVideoFilters.length === 0) return sortByPublishedAsc(results);

    const pickedVideos = new Map<string, VideoData>();
    const addRankedVideos = (rankedVideos: VideoData[]) => {
      rankedVideos.slice(0, 10).forEach((video, index) => {
        const key = String(video.video_id ?? video.id ?? `${video.title}-${index}`);
        pickedVideos.set(key, video);
      });
    };

    if (selectedVideoFilters.includes("latest")) {
      addRankedVideos([...results].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")));
    }
    if (selectedVideoFilters.includes("oldest")) addRankedVideos(sortByPublishedAsc(results));

    if (selectedVideoFilters.includes("most-viewed")) {
      addRankedVideos(
        [...results].sort((a, b) => {
          const diff = Number(b.view_count ?? 0) - Number(a.view_count ?? 0);
          if (diff !== 0) return diff;
          return (b.published_at ?? "").localeCompare(a.published_at ?? "");
        })
      );
    }

    if (selectedVideoFilters.includes("most-liked")) {
      addRankedVideos(
        [...results].sort((a, b) => {
          const diff = Number(b.like_count ?? 0) - Number(a.like_count ?? 0);
          if (diff !== 0) return diff;
          return (b.published_at ?? "").localeCompare(a.published_at ?? "");
        })
      );
    }

    return sortByPublishedAsc(Array.from(pickedVideos.values()));
  }, [selectedVideoFilters, selectedTopicFilters, selectedYearFilters, videos]);

  const totalVideoPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));
  const paginatedVideos = useMemo(() => {
    const start = (currentVideoPage - 1) * VIDEOS_PER_PAGE;
    return filteredVideos.slice(start, start + VIDEOS_PER_PAGE);
  }, [currentVideoPage, filteredVideos]);

  const cleanActiveLabel = [
    selectedVideoFilters.join("-") || "all-videos",
    selectedTopicFilters.join("-") || "all-topics",
    selectedYearFilters.join("-") || "all-years",
  ].join("|");
  const predictionVideo = prediction ? normalizePredictionVideo(prediction) : null;
  const isAdmin = user?.role === "admin";
  const hasActiveVideoFilters =
    selectedVideoFilters.length > 0 || selectedTopicFilters.length > 0 || selectedYearFilters.length > 0;

  useEffect(() => {
    setCurrentVideoPage(1);
  }, [selectedVideoFilters, selectedTopicFilters, selectedYearFilters]);

  useEffect(() => {
    setCurrentVideoPage((current) => Math.min(current, totalVideoPages));
  }, [totalVideoPages]);

  const resetVideoFilters = () => {
    setSelectedVideoFilters([]);
    setSelectedTopicFilters([]);
    setSelectedYearFilters([]);
    setCurrentVideoPage(1);
  };

  const toggleVideoFilter = (value: string) => setSelectedVideoFilters((current) => toggleFilterValue(current, value));
  const toggleTopicFilter = (value: string) => setSelectedTopicFilters((current) => toggleFilterValue(current, value));
  const toggleYearFilter = (value: string) =>
    setSelectedYearFilters((current) => toggleFilterValue(current, value).sort((a, b) => Number(b) - Number(a)));

  const handleClassifyVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = videoUrl.trim();

    if (!url) {
      setPredictionMessage("Masukkan link video YouTube terlebih dahulu.");
      return;
    }

    setIsClassifying(true);
    setPrediction(null);
    setPredictionMessage("");

    try {
      const result = await fetchJson<{ status?: string; message?: string; data?: DirectPrediction }>("/api/videos/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: url }),
      });

      if (result.status === "error" || result.status === "invalid") {
        setPredictionMessage(result.message || "Gagal memproses link video.");
        setPrediction(null);
        return;
      }

      setPrediction(result.data ?? null);
      setPredictionMessage(result.message || "Video berhasil diklasifikasikan.");
      setSaveMessage("");
      setSaveMessageStatus("idle");
      setVideoUrl("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setPredictionMessage(message || "Server Flask belum aktif atau endpoint klasifikasi belum terjangkau.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleResetPrediction = () => {
    setVideoUrl("");
    setPrediction(null);
    setPredictionMessage("");
    setSaveMessage("");
    setSaveMessageStatus("idle");
    setPredictionDetailVideo(null);
  };

  const handleRefreshAll = async () => {
    handleResetPrediction();
    await loadVideos();
  };

  const handleSavePrediction = async () => {
    if (!prediction || !predictionVideo) return;

    setIsSavingPrediction(true);
    setSaveMessage("Memeriksa apakah video sudah ada di database...");
    setSaveMessageStatus("checking");

    try {
      const result = await fetchJson<{ status?: string; message?: string; video?: RawVideoData }>("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prediction, video: predictionVideo }),
      });

      if (result.status === "exists") {
        setSaveMessage(result.message || "Video ini sudah ada di database, sehingga tidak disimpan ulang.");
        setSaveMessageStatus("exists");
        return;
      }

      setSaveMessage(result.message || "Video berhasil disimpan ke database.");
      setSaveMessageStatus("success");
      if (result.video) {
        setTotalVideos((current) => current + 1);
        const [savedVideo] = await filterVideosWithReachableThumbnails(parseVideos([result.video]));
        if (savedVideo) {
          setVideos((current) => {
            const filtered = current.filter((item) => item.video_id !== savedVideo.video_id);
            return [savedVideo, ...filtered];
          });
        }
      } else {
        await loadVideos();
      }
      setPrediction(null);
      setPredictionMessage("");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Video gagal disimpan.");
      setSaveMessageStatus("error");
    } finally {
      setIsSavingPrediction(false);
    }
  };

  const saveMessageClass =
    saveMessageStatus === "exists"
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
      : saveMessageStatus === "error"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        : saveMessageStatus === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          : "border-gray-200 bg-white/70 text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200";

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden bg-[#15803d] dark:bg-green-600/20 border border-transparent dark:border-green-500/30 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl transition-colors">
        <div className="relative z-10 space-y-3 text-left">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Daftar <span className="opacity-60 dark:text-green-400">Video</span>
          </h1>
          <p className="text-sm text-white/80 dark:text-gray-400 font-medium max-w-md leading-relaxed">
            Semua video pertanian hasil klasifikasi model IndoBERT.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8">
          <div className="text-right px-8 border-r border-white/20">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Video</p>
            <p className="text-3xl font-black text-white leading-none">{formatNumber(totalVideos)}</p>
          </div>
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loading}
            className="px-6 py-3 bg-white dark:bg-green-600 text-[#15803d] dark:text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-green-500 transition-all shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-white/50"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.04] dark:border-white/10 dark:bg-[#07110b]">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">Klasifikasi Video Baru</p>
                <h2 className="mt-2 text-lg font-black uppercase tracking-[0.16em] text-gray-900 dark:text-white">
                  Analisis Link YouTube
                </h2>
                <p className="mt-2 max-w-xl text-xs font-medium leading-6 text-gray-500 dark:text-gray-400">
                  Tempel link video untuk melihat topik BERT dan metadata video pertanian.
                </p>
              </div>

              <form onSubmit={handleClassifyVideo} className="flex w-full flex-col gap-3 xl:max-w-3xl xl:flex-row">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#15803d] focus:ring-4 focus:ring-emerald-600/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isClassifying}
                  className="min-h-12 rounded-xl bg-[#15803d] px-6 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-green-900/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClassifying ? "Memproses..." : "Proses"}
                </button>
              </form>
            </div>

            {(predictionMessage || predictionVideo || saveMessage) && (
              <div className="rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50 via-white to-white p-5 dark:border-white/10 dark:from-green-500/10 dark:via-white/[0.03] dark:to-white/[0.02]">
                {(predictionMessage || saveMessage) && (
                  <p className={`rounded-xl border px-4 py-3 text-sm font-bold ${saveMessage ? saveMessageClass : "border-transparent text-gray-700 dark:text-gray-200"}`}>
                    {saveMessage || predictionMessage}
                  </p>
                )}
                {predictionVideo && (
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Topik Prediksi</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#15803d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                            {normalizeTopic(predictionVideo)}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-left shadow-sm dark:border-green-500/20 dark:bg-white/[0.04] md:min-w-56">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Skor Kecocokan Topik</p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-[#15803d] dark:text-green-300">
                          {formatConfidencePercent(prediction)}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold leading-5 text-gray-500 dark:text-gray-400">
                          Semakin tinggi nilainya, semakin yakin sistem bahwa video ini sesuai dengan topik prediksi.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-emerald-900/10 pt-5 dark:border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Informasi Video</p>
                      <div className="mt-3 grid gap-4 md:grid-cols-[220px_1fr]">
                        <div className="overflow-hidden rounded-xl bg-slate-900">
                          {getYoutubeThumbnailUrl(predictionVideo) ? (
                            <img
                              src={getYoutubeThumbnailUrl(predictionVideo)}
                              alt={predictionVideo.title}
                              className="h-full min-h-[130px] w-full object-cover"
                            />
                          ) : (
                            <div className="flex min-h-[130px] items-center justify-center text-xs font-bold text-slate-300">No thumbnail</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-black text-gray-900 dark:text-white">{predictionVideo.title}</h3>
                          <p className="mt-2 line-clamp-2 text-xs font-medium leading-6 text-gray-500 dark:text-gray-400">{predictionVideo.description}</p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <VideoMetaItem label="Channel" value={predictionVideo.channel_name || "-"} />
                            <VideoMetaItem label="Publish" value={formatDateShort(predictionVideo.published_at)} />
                            <VideoMetaItem label="Views" value={formatNumber(predictionVideo.view_count)} />
                            <VideoMetaItem label="Likes" value={formatNumber(predictionVideo.like_count)} />
                          </div>
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <button
                              type="button"
                              onClick={() => setPredictionDetailVideo(predictionVideo)}
                              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800 dark:border-green-500/20 dark:bg-white/5 dark:text-green-300"
                            >
                              Detail Video
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSavePrediction}
                                  disabled={isSavingPrediction}
                                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#15803d] px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isSavingPrediction ? "Menyimpan..." : "Simpan Video"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleResetPrediction}
                                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.16em] text-gray-700 transition hover:border-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                                >
                                  Tidak Simpan
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>


      <section className="relative overflow-visible rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1410] lg:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-white/10 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-black uppercase tracking-[0.16em] text-gray-900 dark:text-white">Daftar Video</h3>
          </div>

          <div className="w-full lg:max-w-4xl">
            <div className="mb-2 grid gap-3 sm:grid-cols-3">
              <div className="hidden sm:block" />
              <div className="hidden sm:block" />
              <button
                type="button"
                onClick={resetVideoFilters}
                disabled={!hasActiveVideoFilters}
                className="inline-flex min-h-9 w-fit items-center justify-center justify-self-end rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-green-500/10 dark:hover:text-green-300"
              >
                Reset
              </button>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-3">
              <VideoFilterPopover
                title="Jenis Video"
                allLabel="Semua Video"
                label={selectedVideoFilters.length === 0 ? "Semua Video" : `${selectedVideoFilters.length} Pilihan`}
                options={VIDEO_FILTERS}
                selectedValues={selectedVideoFilters}
                onToggle={toggleVideoFilter}
                onSelectAll={() => setSelectedVideoFilters([])}
              />
              <VideoFilterPopover
                title="Topik"
                allLabel="Semua Topik"
                label={selectedTopicFilters.length === 0 ? "Semua Topik" : `${selectedTopicFilters.length} Topik`}
                options={TOPIC_FILTERS}
                selectedValues={selectedTopicFilters}
                onToggle={toggleTopicFilter}
                onSelectAll={() => setSelectedTopicFilters([])}
              />
              <VideoFilterPopover
                title="Tahun"
                allLabel="Semua Tahun"
                label={selectedYearFilters.length === 0 ? "Semua Tahun" : `${selectedYearFilters.length} Tahun`}
                options={yearOptions.map((year) => ({ value: year, label: year }))}
                selectedValues={selectedYearFilters}
                onToggle={toggleYearFilter}
                onSelectAll={() => setSelectedYearFilters([])}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Memuat daftar video...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center dark:border-red-500/10 dark:bg-red-950/10">
            <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
            Tidak ada video yang cocok dengan filter saat ini.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedVideos.map((video, index) => (
                <VideoCard key={`${video.video_id ?? video.id ?? index}-${cleanActiveLabel}-${currentVideoPage}`} video={video} onDetail={() => setSelectedVideo(video)} />
              ))}
            </div>

            {totalVideoPages > 1 && (
              <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  Halaman {currentVideoPage} dari {totalVideoPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentVideoPage((page) => Math.max(page - 1, 1))}
                    disabled={currentVideoPage === 1}
                    className="min-h-10 rounded-xl border border-gray-300 bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentVideoPage((page) => Math.min(page + 1, totalVideoPages))}
                    disabled={currentVideoPage === totalVideoPages}
                    className="min-h-10 rounded-xl border border-gray-300 bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedVideo && <DetailModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {predictionDetailVideo && <DetailModal video={predictionDetailVideo} onClose={() => setPredictionDetailVideo(null)} />}
    </div>
  );
}

function VideoFilterPopover({
  title,
  allLabel,
  label,
  options,
  selectedValues,
  onToggle,
  onSelectAll,
}: {
  title: string;
  allLabel: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-40 min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
        {title}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-gray-300 bg-white px-4 text-left text-xs font-black uppercase tracking-[0.12em] text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-white/[0.04]"
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Tutup filter"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 max-h-80 w-full min-w-[260px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <button
              type="button"
              onClick={() => {
                onSelectAll();
                setIsOpen(false);
              }}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                selectedValues.length === 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              <span>{allLabel}</span>
              <span
                className={`h-4 w-4 rounded border ${
                  selectedValues.length === 0
                    ? "border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400"
                    : "border-gray-300 dark:border-white/20"
                }`}
              />
            </button>

            {options.map((option) => {
              const active = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                    active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`h-4 w-4 rounded border ${
                      active
                        ? "border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400"
                        : "border-gray-300 dark:border-white/20"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function normalizePredictionVideo(prediction: DirectPrediction): VideoData {
  const source = prediction.video ?? prediction;

  return {
    ...source,
    title: source.title || "Video YouTube",
    description: source.description || "Tidak ada deskripsi tersedia.",
    channel_name: source.channel_name || "Channel tidak diketahui",
    published_at: source.published_at || "",
    view_count: source.view_count ?? 0,
    like_count: source.like_count ?? 0,
    clean_text: source.clean_text || prediction.clean_text || "",
    word_count: source.word_count ?? prediction.word_count ?? null,
    token_count: source.token_count ?? prediction.token_count ?? null,
    label_id: source.label_id ?? prediction.label_id ?? null,
    label_model: source.label_model ?? prediction.label_model ?? null,
    label_source: source.label_source ?? prediction.label_source ?? null,
    pred_id: source.pred_id ?? prediction.pred_id ?? null,
    true_id: source.true_id ?? prediction.true_id ?? null,
    true_label: source.true_label ?? prediction.true_label ?? null,
    pred_label: prediction.pred_label || source.pred_label || prediction.topic_raw || source.topic_raw || null,
    topic: source.topic || prediction.topic || prediction.topic_raw || null,
    topic_raw: source.topic_raw || prediction.topic_raw || null,
    video_url: source.video_url || prediction.video_url || (source.video_id ? `https://www.youtube.com/watch?v=${source.video_id}` : "#"),
  };
}

function formatDateShort(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function VideoMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-emerald-900/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}

function DetailModal({ video, onClose }: { video: VideoData; onClose: () => void }) {
  const publishedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";
  const topic = normalizeTopic(video);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#07110b]">
        <div className="shrink-0 border-b border-gray-200 px-6 py-4 dark:border-white/10">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Detail Video</p>
          <h2 className="mt-2 line-clamp-2 text-xl font-black leading-snug text-gray-900 dark:text-white">{video.title}</h2>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 pr-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Channel</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{video.channel_name}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Dipublikasikan</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{publishedDate}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Views</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{formatNumber(video.view_count)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Likes</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{formatNumber(video.like_count)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Topik</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{topic}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Deskripsi lengkap</p>
            <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="whitespace-pre-line break-words leading-7 text-gray-600 dark:text-gray-300">{video.description}</p>
            </div>
          </div>
          <div className="sticky bottom-0 -mx-6 grid gap-3 border-t border-gray-100 bg-white px-6 pt-4 md:grid-cols-2 dark:border-white/10 dark:bg-[#07110b]">
            <a
              href={buildVideoUrl(video)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-brand-600"
            >
              Buka Video
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-gray-900 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:bg-[#0b1410] dark:text-white"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, onDetail }: { video: VideoData; onDetail: () => void }) {
  const publishedDate = video.published_at
    ? new Date(video.published_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";
  const topic = normalizeTopic(video);
  const thumbnail = getYoutubeThumbnailUrl(video);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#07110b]">
      <div className="relative overflow-hidden bg-slate-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="h-[200px] w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-[200px] items-center justify-center bg-slate-800 text-sm text-slate-200">Thumbnail tidak tersedia</div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
          {topic}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 line-clamp-3">{video.description}</p>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
          <div className="flex items-center gap-2 font-semibold">
            <UserIcon className="size-4 text-gray-400" />
            <span className="truncate">{video.channel_name}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <CalenderIcon className="size-4 text-orange-500" />
            <span>{publishedDate}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
            <EyeIcon className="size-4 text-blue-500" />
            <span>{formatNumber(video.view_count)} views</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-300">
            <span className="text-[14px]">❤️</span>
            <span>{formatNumber(video.like_count)} likes</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4 dark:border-white/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onDetail}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-black uppercase tracking-[0.2em] text-gray-900 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:bg-[#0b1410] dark:text-white"
          >
            Detail Video
          </button>
          <a
            href={buildVideoUrl(video)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-500 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-brand-600"
          >
            Lihat Video
          </a>
        </div>
      </div>
    </div>
  );
}
