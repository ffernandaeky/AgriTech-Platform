"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ChevronDownIcon } from "@/icons";
import { fetchJson } from "@/lib/fetchJson";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type MetricKey = "contributors" | "avgViews" | "avgLikes";

interface ChannelContributionData {
  name: string;
  count: number;
}

interface ChannelAvgViewsData {
  name: string;
  avgViews: number;
  videoCount: number;
}

interface ChannelAvgLikesData {
  name: string;
  avgLikes: number;
  videoCount: number;
}

interface ChartFilterProps {
  year?: string;
  month?: string;
  day?: string;
  topic?: string;
}

interface StatsResponse {
  topChannels?: ChannelContributionData[];
  topChannelsByAvgViews?: ChannelAvgViewsData[];
  topChannelsByAvgLikes?: ChannelAvgLikesData[];
}

const METRIC_OPTIONS: Array<{ key: MetricKey; label: string; seriesName: string }> = [
  { key: "contributors", label: "Kontributor", seriesName: "Jumlah Video" },
  { key: "avgViews", label: "Avg Views", seriesName: "Rata-rata Views" },
  { key: "avgLikes", label: "Avg Likes", seriesName: "Rata-rata Likes" },
];

const buildStatsUrl = ({ year = "all", month = "all", day = "all", topic = "all" }: ChartFilterProps) => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (month !== "all") params.set("month", month);
  if (day !== "all") params.set("day", day);
  if (topic !== "all") params.set("topic", topic);
  const query = params.toString();
  return query ? `/api/stats?${query}` : "/api/stats";
};

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return `${Math.round(value)}`;
};

const metricValue = (metric: MetricKey, channelName: string, stats: StatsResponse) => {
  if (metric === "contributors") {
    return stats.topChannels?.find((item) => item.name === channelName)?.count ?? 0;
  }

  if (metric === "avgViews") {
    return Math.round(stats.topChannelsByAvgViews?.find((item) => item.name === channelName)?.avgViews ?? 0);
  }

  return Math.round(stats.topChannelsByAvgLikes?.find((item) => item.name === channelName)?.avgLikes ?? 0);
};

export default function TopChannelChart({ year = "all", month = "all", day = "all", topic = "all" }: ChartFilterProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("contributors");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stats, setStats] = useState<StatsResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchJson<StatsResponse>(buildStatsUrl({ year, month, day, topic }))
      .then((json) => {
        if (!isMounted) return;
        setStats(json);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data channel:", error);
        if (!isMounted) return;
        setStats({});
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [year, month, day, topic]);

  const chartData = useMemo(() => {
    const channels =
      selectedMetric === "contributors"
        ? stats.topChannels?.map((item) => item.name) ?? []
        : selectedMetric === "avgViews"
          ? stats.topChannelsByAvgViews?.map((item) => item.name) ?? []
          : stats.topChannelsByAvgLikes?.map((item) => item.name) ?? [];
    const metric = METRIC_OPTIONS.find((item) => item.key === selectedMetric) ?? METRIC_OPTIONS[0];

    return {
      categories: channels,
      series: [
        {
          name: metric.seriesName,
          data: channels.map((channelName) => metricValue(selectedMetric, channelName, stats)),
        },
      ],
    };
  }, [selectedMetric, stats]);

  const activeFilterLabel = METRIC_OPTIONS.find((metric) => metric.key === selectedMetric)?.label ?? "Top Kontributor";

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
      animations: {
        enabled: true,
        speed: 650,
        animateGradually: { enabled: true, delay: 90 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        horizontal: true,
        barHeight: "58%",
        dataLabels: { position: "top" },
      },
    },
    colors:
      selectedMetric === "contributors"
        ? ["#16A34A"]
        : selectedMetric === "avgViews"
          ? ["#0EA5E9"]
          : ["#F59E0B"],
    dataLabels: {
      enabled: true,
      formatter: (value: string | number) => formatCompactNumber(Number(value)),
      textAnchor: "start",
      offsetX: 8,
      style: {
        fontSize: "10px",
        colors: ["#111827"],
        fontWeight: 800,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        formatter: (value: string) => formatCompactNumber(Number(value)),
        style: {
          colors: "#111827",
          fontSize: "10px",
          fontWeight: 700,
        },
      },
      axisBorder: { show: true },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        maxWidth: 168,
        style: {
          colors: "#111827",
          fontSize: "10px",
          fontWeight: 900,
        },
      },
      axisBorder: { show: true },
      axisTicks: { show: false },
    },
    grid: {
      show: true,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      strokeDashArray: 5,
      padding: { top: 0, right: 34, bottom: 0, left: 4 },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
      fontWeight: 800,
      markers: { size: 7 },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value) => {
          if (selectedMetric === "contributors") return `${Math.round(value).toLocaleString("id-ID")} video`;
          if (selectedMetric === "avgViews") return `${Math.round(value).toLocaleString("id-ID")} avg views`;
          return `${Math.round(value).toLocaleString("id-ID")} avg likes`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: { bar: { barHeight: "58%" } },
          xaxis: { labels: { style: { fontSize: "10px" } } },
          yaxis: { labels: { maxWidth: 128 } },
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-emerald-900/10 bg-white text-xs font-bold uppercase tracking-[0.2em] text-gray-400 shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.03] transition-all duration-300 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">Top Channel</p>
          <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
            Kontribusi dan Engagement Channel
          </h3>
        </div>

        <div className="relative z-20 self-start">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 shadow-sm transition hover:border-green-300 hover:text-green-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300"
          >
          {activeFilterLabel}
            <ChevronDownIcon className={`size-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-gray-950">
                {METRIC_OPTIONS.map((metric) => (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => {
                      setSelectedMetric(metric.key);
                      setIsFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] transition ${
                      selectedMetric === metric.key
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                    }`}
                  >
                    <span>{metric.label}</span>
                    {selectedMetric === metric.key && <span className="h-2 w-2 rounded-full bg-green-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {chartData.series.length === 0 || chartData.categories.length === 0 ? (
        <div className="flex h-[390px] items-center justify-center rounded-2xl border border-dashed border-gray-200 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:border-white/10">
          Data channel belum tersedia
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <ReactApexChart options={options} series={chartData.series} type="bar" height={390} width="100%" />
        </div>
      )}

      <style jsx global>{`
        .apexcharts-yaxis-label,
        .apexcharts-xaxis-label {
          fill: #111827 !important;
          font-weight: 900 !important;
        }

        .apexcharts-gridline {
          stroke: #111827 !important;
          stroke-width: 1.5px !important;
          opacity: 0.22 !important;
        }

        .apexcharts-xaxis-borderColor,
        .apexcharts-yaxis-borderColor {
          stroke: #111827 !important;
          stroke-width: 3px !important;
          opacity: 1 !important;
        }

        .apexcharts-canvas line[line-type="ticks"],
        .apexcharts-canvas .apexcharts-xaxis-tick,
        .apexcharts-canvas .apexcharts-yaxis-tick {
          display: none !important;
        }

        .apexcharts-datalabel,
        .apexcharts-datalabel-label,
        .apexcharts-datalabels-text {
          fill: #111827 !important;
          font-weight: 900 !important;
        }

        .dark .apexcharts-yaxis-label,
        .dark .apexcharts-xaxis-label {
          fill: #ffffff !important;
        }

        .dark .apexcharts-gridline {
          stroke: #ffffff !important;
          opacity: 0.22 !important;
        }

        .dark .apexcharts-xaxis-borderColor,
        .dark .apexcharts-yaxis-borderColor {
          stroke: #ffffff !important;
        }

        .dark .apexcharts-datalabel,
        .dark .apexcharts-datalabel-label,
        .dark .apexcharts-datalabels-text {
          fill: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
