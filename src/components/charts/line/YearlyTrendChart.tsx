"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { fetchJson } from "@/lib/fetchJson";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface YearlyCount {
  year: number;
  count: number;
}

interface MonthlyCount {
  month: number;
  count: number;
}

interface DailyCount {
  day: number;
  count: number;
}

interface TimelineResponse {
  timeline?: {
    yearlyCounts: YearlyCount[];
    monthlyCounts: Record<string, MonthlyCount[]>;
    dailyCounts?: Record<string, DailyCount[]>;
  };
}

interface ChartFilterProps {
  year?: string;
  month?: string;
  day?: string;
  topic?: string;
}

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
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

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
const parseNumberList = (value: string) => (value === "all" ? [] : value.split(",").map((item) => Number(item)).filter(Number.isFinite));

export default function YearlyTrendChart({ year = "all", month = "all", day = "all", topic = "all" }: ChartFilterProps) {
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const data = await fetchJson<TimelineResponse>(buildStatsUrl({ year, month, day, topic }));
        if (isMounted) setTimeline(data);
      } catch (error) {
        console.error("Gagal mengambil data tren waktu:", error);
        if (isMounted) setTimeline(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimeline();
    return () => {
      isMounted = false;
    };
  }, [year, month, day, topic]);

  const selectedYears = useMemo(() => parseNumberList(year), [year]);
  const selectedMonths = useMemo(() => parseNumberList(month), [month]);
  const selectedDays = useMemo(() => parseNumberList(day), [day]);

  const chartContent = useMemo(() => {
    const emptyResult = {
      categories: [] as string[],
      series: [] as Array<{ name: string; data: number[] }>,
      label: "Semua Periode - 0 Video",
      mode: "year",
    };

    if (!timeline?.timeline) return emptyResult;

    if (selectedYears.length > 0 && selectedMonths.length > 0 && selectedDays.length > 0) {
      const categories = selectedDays.map(String);
      const series = selectedYears.flatMap((yearValue) =>
        selectedMonths.map((monthValue) => {
          const key = `${yearValue}-${monthValue}`;
          const dailyData = timeline.timeline?.dailyCounts?.[key] || [];

          return {
            name: `${MONTH_LABELS[monthValue - 1]} ${yearValue}`,
            data: selectedDays.map((dayValue) => dailyData.find((item) => item.day === dayValue)?.count ?? 0),
          };
        })
      );
      const total = series.reduce((sum, item) => sum + item.data.reduce((itemSum, value) => itemSum + value, 0), 0);

      return {
        categories,
        series,
        label: `${selectedDays.length} Tanggal - ${total} Video`,
        mode: "day",
      };
    }

    if (selectedYears.length > 0 && selectedMonths.length === 1) {
      const monthValue = selectedMonths[0];
      const maxDay = Math.max(...selectedYears.map((yearValue) => daysInMonth(yearValue, monthValue)));
      const categories = Array.from({ length: maxDay }, (_, index) => String(index + 1));
      const series = selectedYears.map((yearValue) => {
        const key = `${yearValue}-${monthValue}`;
        const dailyData = timeline.timeline?.dailyCounts?.[key] || [];

        return {
          name: `${MONTH_LABELS[monthValue - 1]} ${yearValue}`,
          data: categories.map((dayValue) => dailyData.find((item) => item.day === Number(dayValue))?.count ?? 0),
        };
      });
      const total = series.reduce((sum, item) => sum + item.data.reduce((itemSum, value) => itemSum + value, 0), 0);

      return {
        categories,
        series,
        label: `${MONTH_LABELS[monthValue - 1]} - ${total} Video`,
        mode: "date",
      };
    }

    if (selectedYears.length > 0) {
      const monthIndexes = selectedMonths.length > 0 ? selectedMonths : MONTH_LABELS.map((_, index) => index + 1);
      const categories = monthIndexes.map((monthValue) => MONTH_LABELS[monthValue - 1]);
      const series = selectedYears.map((yearValue) => {
        const monthlyData = timeline.timeline?.monthlyCounts[String(yearValue)] || [];

        return {
          name: `Tahun ${yearValue}`,
          data: monthIndexes.map((monthValue) => monthlyData.find((item) => item.month === monthValue)?.count ?? 0),
        };
      });
      const total = series.reduce((sum, item) => sum + item.data.reduce((itemSum, value) => itemSum + value, 0), 0);

      return {
        categories,
        series,
        label: `${selectedYears.length} Tahun - ${total} Video`,
        mode: "month",
      };
    }

    const yearlyCounts = timeline.timeline.yearlyCounts || [];
    const total = yearlyCounts.reduce((sum, item) => sum + item.count, 0);

    return {
      categories: yearlyCounts.map((item) => String(item.year)),
      series: [{ name: "Publikasi per tahun", data: yearlyCounts.map((item) => item.count) }],
      label: `Semua Tahun - ${total} Video`,
      mode: "year",
    };
  }, [timeline, selectedYears, selectedMonths, selectedDays]);

  const series = chartContent.series;

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 650,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    dataLabels: { enabled: false },
    markers: {
      size: chartContent.mode === "day" ? 7 : 5,
      strokeWidth: 2,
      strokeColors: "#ffffff",
      hover: { size: 7 },
    },
    stroke: { curve: "smooth", width: 3.5, lineCap: "round" },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.01,
        stops: [0, 85, 100],
      },
    },
    colors: ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"],
    xaxis: {
      categories: chartContent.categories,
      axisBorder: { show: true },
      axisTicks: { show: false },
      labels: {
        show: true,
        hideOverlappingLabels: true,
        rotate: chartContent.mode === "date" ? -45 : 0,
        trim: false,
        style: { colors: "#000000", fontSize: "11px", fontWeight: 700 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: ["#000000"], fontSize: "11px", fontWeight: 700 },
        formatter: (value) => String(Math.round(value)),
      },
      title: {
        text: "Jumlah video terpublish",
        style: {
          fontSize: "11px",
          fontWeight: 900,
          color: undefined,
        },
      },
      axisBorder: { show: true },
    },
    legend: {
      show: series.length > 1,
      position: "top",
      horizontalAlign: "right",
      fontFamily: "inherit",
      fontSize: "11px",
      fontWeight: 800,
    },
    tooltip: {
      theme: "dark",
      x: { show: true },
      y: { formatter: (value) => `${value} video` },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 10, right: 20, bottom: 0, left: 10 },
    },
  };

  if (loading) return (
    <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-emerald-900/10 bg-white shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04]">
      <p className="text-gray-500 animate-pulse font-sans font-bold uppercase text-[10px] tracking-widest text-center">Memuat grafik timeline...</p>
    </div>
  );

  return (
    <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.03] transition-all duration-300 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">Timeline Video</p>
          <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
            Visualisasi Tren Waktu Publikasi Video
          </h3>
        </div>
        <div className="self-start rounded-2xl bg-green-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-green-700 dark:bg-green-500/10 dark:text-green-300 sm:self-center">
          {chartContent.label}
        </div>
      </div>

      <div className="min-h-[360px] rounded-3xl border border-emerald-900/10 bg-gradient-to-b from-green-50/40 via-white to-white p-4 dark:border-white/[0.07] dark:from-green-500/5 dark:via-transparent dark:to-transparent">
        {series.length === 0 || series.every((item) => item.data.length === 0) ? (
          <div className="flex h-[380px] items-center justify-center text-center text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            Data publikasi belum tersedia
          </div>
        ) : (
          <ReactApexChart options={chartOptions} series={series} type="area" height={380} />
        )}
      </div>

      <style jsx global>{`
        .apexcharts-xaxis-borderColor, .apexcharts-yaxis-borderColor,
        line.apexcharts-xaxis-borderColor, line.apexcharts-yaxis-borderColor {
          stroke: #000000 !important;
          stroke-width: 3px !important;
          opacity: 1 !important;
        }
        .apexcharts-xaxis-label, .apexcharts-yaxis-label,
        .apexcharts-xaxis-label text, .apexcharts-yaxis-label text,
        g.apexcharts-xaxis-texts text, g.apexcharts-yaxis-texts text {
          fill: #000000 !important;
          font-weight: 800 !important;
          display: block !important;
        }
        .apexcharts-yaxis-title-text, text.apexcharts-yaxis-title-text {
          fill: #000000 !important;
          font-weight: 900 !important;
        }
        .apexcharts-legend-text {
          color: #000000 !important;
          font-weight: 800 !important;
        }

        .dark .apexcharts-xaxis-borderColor, .dark .apexcharts-yaxis-borderColor,
        .dark line.apexcharts-xaxis-borderColor, .dark line.apexcharts-yaxis-borderColor {
          stroke: #ffffff !important;
          stroke-width: 3px !important;
        }
        .dark .apexcharts-xaxis-label, .dark .apexcharts-yaxis-label,
        .dark .apexcharts-xaxis-label text, .dark .apexcharts-yaxis-label text,
        .dark g.apexcharts-xaxis-texts text, .dark g.apexcharts-yaxis-texts text {
          fill: #ffffff !important;
          font-weight: 800 !important;
          display: block !important;
        }
        .dark .apexcharts-yaxis-title-text, .dark text.apexcharts-yaxis-title-text {
          fill: #ffffff !important;
          font-weight: 900 !important;
        }
        .dark .apexcharts-legend-text {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
