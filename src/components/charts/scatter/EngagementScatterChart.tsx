"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartFilterProps {
  year?: string;
  topic?: string;
}

interface SeriesData {
  name: string;
  data: Array<{ x: number; y: number; title: string }>;
}

const buildScatterUrl = ({ year = "all", topic = "all" }: ChartFilterProps) => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (topic !== "all") params.set("topic", topic);
  const query = params.toString();
  return query ? `/api/stats/scatter?${query}` : "/api/stats/scatter";
};

export default function EngagementScatterChart({ year = "all", topic = "all" }: ChartFilterProps) {
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(buildScatterUrl({ year, topic }));
        const json = await res.json();
        if (isMounted && json.series) {
          setSeries(json.series);
        }
      } catch (error) {
        console.error("Gagal mengambil scatter chart data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [year, topic]);

  const options: ApexOptions = {
    chart: {
      type: "scatter",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 650,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      toolbar: { show: true },
    },
    xaxis: {
      type: "numeric",
      title: {
        text: "Jumlah Views",
        style: { fontSize: "12px", fontWeight: 700 },
      },
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: {
      title: {
        text: "Engagement Ratio (%)",
        style: { fontSize: "12px", fontWeight: 700 },
      },
      labels: { style: { fontSize: "11px" } },
    },
    colors: ["#16A34A", "#0EA5E9", "#F59E0B", "#F97316", "#8B5CF6"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    tooltip: {
      theme: "dark",
      x: { formatter: (value: number) => `${value.toLocaleString()} views` },
      y: { formatter: (value: number) => `${value.toFixed(2)}%` },
    },
    markers: {
      size: 6,
    },
    grid: {
      show: true,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      strokeDashArray: 4,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 400 },
          xaxis: { labels: { style: { fontSize: "10px" } } },
          yaxis: { labels: { style: { fontSize: "10px" } } },
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">
            Engagement Analytics
          </p>
          <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
            Views vs Engagement Ratio
          </h3>
          <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Setiap titik merepresentasikan video. Warna menunjukkan topik BERT yang berbeda.
          </p>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        {series.length > 0 ? (
          <ReactApexChart options={options} series={series} type="scatter" height={390} width="100%" />
        ) : (
          <div className="flex h-[390px] items-center justify-center text-sm text-gray-500">
            Tidak ada data untuk ditampilkan
          </div>
        )}
      </div>

      <style jsx global>{`
        .apexcharts-yaxis-label text,
        .apexcharts-xaxis-label text,
        .apexcharts-yaxis-label,
        .apexcharts-xaxis-label {
          fill: #000000 !important;
          font-weight: 700 !important;
        }

        .dark .apexcharts-yaxis-label text,
        .dark .apexcharts-xaxis-label text,
        .dark .apexcharts-yaxis-label,
        .dark .apexcharts-xaxis-label {
          fill: #ffffff !important;
          font-weight: 700 !important;
        }

        .apexcharts-gridline {
          stroke: #000000 !important;
          opacity: 0.1 !important;
        }

        .dark .apexcharts-gridline {
          stroke: #ffffff !important;
          opacity: 0.15 !important;
        }
      `}</style>
    </div>
  );
}
