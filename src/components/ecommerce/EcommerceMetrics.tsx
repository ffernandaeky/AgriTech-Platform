"use client";

import React, { useEffect, useState } from "react";
import { GroupIcon, VideoIcon } from "@/icons";
import { fetchJson } from "@/lib/fetchJson";

interface DashboardStats {
  totalVideos: string;
  totalChannels: string;
}

interface TopicStat {
  label: string;
  slug: string;
  value: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface DashboardFilterProps {
  year?: string;
  month?: string;
  day?: string;
  topic?: string;
}

interface StatsResponse {
  summary?: DashboardStats;
  topicStats?: TopicStat[];
}

const TOPIC_EMOJIS: Record<string, string> = {
  hama: "🐛",
  pemupukan: "📦",
  pupuk: "📦",
  puk: "📦",
  irigasi: "💧",
  organik: "🥦",
  hidroponik: "🌱",
};

const getTopicEmoji = (label: string): string => {
  const normalized = label.toLowerCase().trim();
  const match = Object.entries(TOPIC_EMOJIS).find(([keyword]) => normalized.includes(keyword));
  return match?.[1] ?? "📦";
};

const buildStatsUrl = ({ year = "all", month = "all", day = "all", topic = "all" }: DashboardFilterProps): string => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (month !== "all") params.set("month", month);
  if (day !== "all") params.set("day", day);
  if (topic !== "all") params.set("topic", topic);
  const query = params.toString();
  return query ? `/api/stats?${query}` : "/api/stats";
};

export default function EcommerceMetrics({ year = "all", month = "all", day = "all", topic = "all" }: DashboardFilterProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        const json = await fetchJson<StatsResponse>(buildStatsUrl({ year, month, day, topic }));
        if (isMounted) {
          if (json.summary) setStats(json.summary);
          if (Array.isArray(json.topicStats)) setTopicStats(json.topicStats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, [year, month, day, topic]);

  if (loading) {
    return (
      <div className="col-span-full rounded-2xl border border-emerald-900/10 bg-white p-10 text-center text-xs font-black uppercase tracking-[0.18em] text-black shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white">
        Menyinkronkan data Agri-Tech...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {topicStats.map(({ slug, label, value }) => (
          <MetricCard
            key={slug}
            title={label}
            value={String(value)}
            subtitle="video aktif"
            icon={<span className="text-2xl leading-none select-none">{getTopicEmoji(label)}</span>}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <MetricCard
          title="Total Video Edukasi"
          value={stats.totalVideos}
          subtitle="video aktif"
          icon={<VideoIcon className="size-6 text-emerald-600 dark:text-emerald-300" />}
        />
        <MetricCard
          title="Jumlah Channel"
          value={stats.totalChannels}
          subtitle="channel aktif"
          icon={<GroupIcon className="size-6 text-emerald-600 dark:text-emerald-300" />}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  const numericValue = value && !Number.isNaN(Number(value)) ? Number(value) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm shadow-emerald-950/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/[0.07] dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none dark:hover:border-brand-500/30">
      <div className="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 flex flex-col justify-center min-h-[76px]">
          <span className="mb-1 block text-[10px] font-black uppercase leading-tight tracking-[0.16em] text-black dark:text-white truncate">
            {title}
          </span>
          <h4 className="text-2xl font-black tracking-tight text-black dark:text-white leading-none my-1">
            {numericValue.toLocaleString("id-ID")}
          </h4>
          <p className="mt-1 block text-[9px] font-black uppercase tracking-[0.16em] text-black dark:text-white">
            {subtitle}
          </p>
        </div>

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700 transition-all duration-500 group-hover:scale-105 group-hover:border-brand-500/20 group-hover:bg-brand-500/10 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-emerald-300">
          {icon}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
    </div>
  );
}
